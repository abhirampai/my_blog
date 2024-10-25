`Swagger` is an api documentation UI that helps users that don’t require access to the application directly but require access to only apis can use. 
In many of the frameworks for example fastapi has swagger capabilities in build in it. 
However rails doesn’t have any dsl directly integrated to it that can generate swagger documentation. 
But we could make use of gems like swagger- blocks or rswag that would help us better generate swagger documentation.

The major difference between swagger-blocks and rswag is that swagger-blocks gem allows user to generate documentation without requiring to write any tests or so but rswag requires the user to have the request spec so that the documentation can be generated using the test.

Which one you should use depends upon your decision on whether you need to write the test or directly write the api requirement.

## swagger-blocks

Swagger::Blocks is a DSL for pure Ruby code blocks that can be turned into JSON.
It helps you write API docs in the Swagger style in Ruby and then automatically build JSON that is compatible with Swagger UI.

To add swagger-blocks to your application ->
```
gem `swagger-blocks`
```
Next add the swagger blocks concern to the controller / model. It is similar to how we define openapi documentation in yaml / json.

In controller ->
```
include Swagger::Blocks

swagger_path '/pets/{id}' do
    operation :get do
      key :summary, 'Find Pet by ID'
      key :description, 'Returns a single pet if the user has access'
      key :operationId, 'findPetById'
      key :tags, [
        'pet'
      ]
      parameter do
        key :name, :id
        key :in, :path
        key :description, 'ID of pet to fetch'
        key :required, true
        key :type, :integer
        key :format, :int64
      end
      response 200 do
        key :description, 'pet response'
        schema do
          key :'$ref', :Pet
        end
      end
      response :default do
        key :description, 'unexpected error'
        schema do
          key :'$ref', :ErrorModel
        end
      end
    end
  end
```

Similarly in model ->
```
include Swagger::Blocks

swagger_schema :Pet do
    key :required, [:id, :name]
    property :id do
      key :type, :integer
      key :format, :int64
    end
    property :name do
      key :type, :string
    end
    property :tag do
      key :type, :string
    end
  end

  swagger_schema :PetInput do
    allOf do
      schema do
        key :'$ref', :Pet
      end
      schema do
        key :required, [:name]
        property :id do
          key :type, :integer
          key :format, :int64
        end
      end
    end
  end
```

Finally we have to create a controller to serve the json.
```
include Swagger::Blocks

  swagger_root do
    key :swagger, '2.0'
    info do
      key :version, '1.0.0'
      key :title, 'Swagger Petstore'
      key :description, 'A sample API that uses a petstore as an example to ' \
                        'demonstrate features in the swagger-2.0 specification'
      key :termsOfService, 'http://helloreverb.com/terms/'
      contact do
        key :name, 'Wordnik API Team'
      end
      license do
        key :name, 'MIT'
      end
    end
    tag do
      key :name, 'pet'
      key :description, 'Pets operations'
      externalDocs do
        key :description, 'Find more info here'
        key :url, 'https://swagger.io'
      end
    end
    key :host, 'petstore.swagger.wordnik.com'
    key :basePath, '/api'
    key :consumes, ['application/json']
    key :produces, ['application/json']
  end

  # A list of all classes that have swagger_* declarations.
  SWAGGERED_CLASSES = [
    PetsController,
    Pet,
    self,
  ].freeze

  def index
    render json: Swagger::Blocks.build_root_json(SWAGGERED_CLASSES)
  end
```

Replace the swaggered_classes with your defined clases.

Finally this endpoint would return the swagger.json output.

The drawback of using this gem is it is not maintained anymore and supports till 3.0 openapi version.

Click -> [swagger-blocks](https://github.com/fotinakis/swagger-blocks), to know more.

### Rswag
Rswag extends rspec-rails "request specs" with a Swagger-based DSL for describing and testing API operations. You describe your API operations with a succinct, intuitive syntax, and it automatically runs the tests. Once you have green tests, run a rake task to auto-generate corresponding Swagger files and expose them as YAML or JSON endpoints.

Since in this blog we are mainly focusing on using swagger ui we only need rswag-api / rswag-specs.

Once we add those to the rswag-api / rswag-specs to gemfile and installed we need to run `rails g rswag:api:install` to initialize rswag api that helps in generating the swagger.yaml / json file.

Requests spec needs to be added to `requests` folder under `spec`.

Sample spec file ->
```
require 'swagger_helper'

describe 'Blogs API' do

  path '/blogs' do

    post 'Creates a blog' do
      tags 'Blogs'
      consumes 'application/json'
      parameter name: :blog, in: :body, schema: {
        type: :object,
        properties: {
          title: { type: :string },
          content: { type: :string }
        },
        required: [ 'title', 'content' ]
      }

      response '201', 'blog created' do
        let(:blog) { { title: 'foo', content: 'bar' } }
        run_test!
      end

      response '422', 'invalid request' do
        let(:blog) { { title: 'foo' } }
        run_test!
      end
    end
  end
end
```

Once we have all the specs and they are green we can use the swaggerize rake task to generate the yaml
```
rake rswag:specs:swaggerize
```

The generated swagger.yaml or json file is served to the url /v1/swagger.yaml.
To configure the extension of swagger file you can change it in the rswag api initializer, and to change the default url where it is served can be changed by adding the following in routes.rb
```
mount Rswag::Api::Engine => 'your-custom-prefix'
```

One of the disadvantage of this gem is that we have to handle the creation of component schema by directly editing swagger_helper file wheras the swagger-blocks added it when defining the swagger-blocks for the model.

Click -> [rswag](https://github.com/rswag/rswag) to know more.

### Swagger UI
Now that we have the swagger file we need to show it in the ui and [swagger ui](https://github.com/swagger-api/swagger-ui) is the package that we are focusing in this blog.

```
yarn add swagger-ui
```

If you are not using webpacker you can add it via cdn.

Next we can add a route to handle the ui

```
resource :swager_ui, only: :index
```

Now we can add the controller for the same.

```
class SwaggerUiController < ApplicationControlelr
  layout "swagger"

  def index; end
end
```

Now we can add the layout in `views/layout/swagger.html.slim` or erb, here I am showing code samples with slim
```
doctype html
html
  head
    title = "Swagger UI"
    = stylesheet_include_tag "application"
    = javascript_include_tag "application"
  body#swagger
    = yield
```

Now in `swagger_ui/index.html.slim`
```
ruby:
  js_controller="swagger-ui--index"
  #swagger-ui data-controller=js_controller
```

Now we have the slim file lets setup the javascript part, `app/javascript/controllers/swagger-ui/index_controller.js`
```
import { Controller } from 'stimulus'
import SwaggerUI from 'swagger-ui'

export default class extends Controller {
  connect() {
    const configParams = { dom_id: "#swagger-ui", url: "/v1/swagger.yaml" }

    SwaggerUI(configParams)
  }
}

```

Now if we visit `/swagger_ui` we should have the swagger ui loaded with the openapi specification that we have provided.

If you are not using webpacker you can follow this [docs](https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/installation.md#plain-old-htmlcssjs-standalone) to have swagger ui setup.
