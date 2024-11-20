During my exploration with ruby on rails, I stumbled upon rails engine and how we can use it to encapsulate or make a ruby on rails application modular by splitting some functionality into smaller manageable sizes. So to learn more about rails engine I started off with creating a mountable rails engine.

```
rails plugin test_rails_engine --mountable
```

Now we have the basic rails engine layout in place which looks similar to the rails application but without the javascript side of things.

Now to add stimulus to the rails engine we can go ahead and create a javascripts/test_rails_engine folder under assets folder.

Inside the javascripts/test_rails_engine folder we will add the application.js file with the following content:

```
//= require ./stimulus/init  
//= require ./controllers/hello\_controller
```

Now create a folder stimulus inside the javascripts/test_rails_engine folder and an init.js file inside of stimulus folder with the following content:

```
import {  
  Application,  
  Controller,  
} from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";  
window.Stimulus = Application.start();
```

Now lets have a hello_controller.js file inside of controllers folder inside of javascripts/test_rails_engine folder with the following content:

```
Stimulus.register(  
  "hello",  
  class extends Controller {  
    connect () {  
      console.log("hello")  
    }  
);
```

Now we have to add the application.js to the manifest so lets add the following to test_rails_engine.manifest.js:

```
  
//= link_directory ../stylesheets/test_rails_engine .css  
//= link_directory ../javascripts/test_rails_engine .js
```

Now lets add the javascript tag into the application.html.erb file under views/layouts/test_rails_engine:

```
<!DOCTYPE html>  
<html>  
<head>  
  <title>Test rails engine</title>  
  <%= csrf_meta_tags %>  
  <%= csp_meta_tag %>  
  
  <%= stylesheet_link_tag    "test_rails_engine/application", media: "all" %>  
  <%= javascript_include_tag "test_rails_engine/application", "data-turoblinks-track": "reload", type: "module" %>  
</head>  
<body>  
  
<%= yield %>  
  
</body>  
</html>
```

Now lets create a root route by adding the following to the routes.rb:

```
TestRailsEngine::Engine.routes.draw do  
  resource :hello, only: :show  
  root "hello#show"  
end
```

Then lets create hello\_controller.rb inside of controller:

```
module TestRailsEngine  
  class HelloController < ApplicationController  
    def show; end  
  end  
end
```

Then a simple view under views/test_rails_engine/hello/show.html.erb:

```
<p data-controller="hello">hello</p>
```

Now lets go ahead and test if its working as expected by connecting the engine with rails application, add the following to the rails application gemfile:

```
gem "test_rails_engine", path: "path to the gem"
```

Then mount the rails engine in routes.rb

```
mount TestRailsEngine::Engine => "/test_rails_engine"
```

Then we have to add the javascript and css files into the main application’s manifest file:

```
//= link test_rails_engine/application.css  
//= link test_rails_engine/application.js
```

And once we visit localhost:3000/test_rails_engine in the console we will see the hello world printed.

And thats how we can use stimulus inside of rails engine, see the full implementation in this [github repo](https://github.com/abhirampai/test_stimulus_rails_engine).
