In the previous blog [Integrating swagger with rails](/integrating_swagger_with_rails) we saw how we can generate swagger.yaml and use it with swagger ui package.
In this blog we will be looking into integrating the same swagger.yaml with Scalar. Scalar has a few features of which the one I liked the most is it shows how we can use the api with different clients like node.js, curl, etc.

<img width="1129" alt="A create user api documentation" src="https://github.com/user-attachments/assets/e6f76181-74c9-402c-a61a-c74e20c4cfdc">

Here as you can see we can select the client that we want to run the api on and copy paste the code that makes life easier. Now if we try to test the api end point we should see a ui similar to below.

<img width="1393" alt="Test create user api endpoint" src="https://github.com/user-attachments/assets/87ecb40f-56e4-4946-933c-40bcacf837ad">

Here you can set the request headers, cookies, form body, query params and send the request and in the response you can see the headers, cookies, and body separated which makes it more readable.

Now if you want to switch to another api endpoint you just need to click the sidebar on the same modal and you will get all the api endpoints there.

<img width="1393" alt="Sidebar endpoints" src="https://github.com/user-attachments/assets/7f57de84-ede3-4c42-8ef1-4758ad2f507f">

Now without further adieu lets start integrating scalar with stimulus. 

### Using package manager
```
yarn add @scalar/api-reference
```

Read the [previous blog](/integrating_swagger_with_rails) if you haven't because the next part is compared with the code from that blog.

In the previous blog we had a `views/swagger_ui/index.html.slim` like this:
```slim
ruby:
  js_controller="swagger-ui--index"
  #swagger-ui data-controller=js_controller
```

But for scalar we can have the configuration in our html.slim file itself so `views/swagger_ui/index.html.slim` would look like:

```slim
ruby:
  js_controller="swagger-ui--index"
  configuration = { spec: { url: "/v1/swagger.yaml" } }.to_json
#swagger-ui data-controller=js_controller data-configuration=configuration
```

Now in the `controllers/swagger-ui/index_controller.js` file
```javascript
import { Controller } from 'stimulus'
import { createScalarReferences } from '@scalar/api-reference'

export default class extends Controller {
  connect() {
    createScalarReferences(this.element, JSON.parse(this.element.dataset.configuration))
  }
}
```
Now if we visit /swagger_ui we should have the scalar ui loaded with the openapi specification that we have provided.

### Without package manager
You can use the cdn for scalar https://cdn.jsdelivr.net/npm/@scalar/api-reference.

Now our `views/swagger_ui/index.html.slim` would look like:
```slim
#api-reference data-url="/v1/swagger.yaml"
script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
```

Now we have setup scalar without a package manager.
