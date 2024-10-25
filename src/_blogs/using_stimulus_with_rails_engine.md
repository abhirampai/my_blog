During my exploration with ruby on rails, I stumbled upon rails engine and how we can use it to encapsulate or make a ruby on rails application modular by splitting some functionality into smaller manageable sizes. So to learn more about rails engine I started off with creating a mountable rails engine.

```
rails plugin test\_rails\_engine --mountable
```

Now we have the basic rails engine layout in place which looks similar to the rails application but without the javascript side of things.

Now to add stimulus to the rails engine we can go ahead and create a javascripts/test\_rails\_engine folder under assets folder.

Inside the javascripts/test\_rails\_engine folder we will add the application.js file with the following content:

```
//= require ./stimulus/init  
//= require ./controllers/hello\_controller
```

Now create a folder stimulus inside the javascripts/test\_rails\_engine folder and an init.js file inside of stimulus folder with the following content:

```
import {  
  Application,  
  Controller,  
} from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";  
window.Stimulus = Application.start();
```

Now lets have a hello\_controller.js file inside of controllers folder inside of javascripts/test\_rails\_engine folder with the following content:

```
Stimulus.register(  
  "hello",  
  class extends Controller {  
    connect () {  
      console.log("hello")  
    }  
);
```

Now we have to add the application.js to the manifest so lets add the following to test\_rails\_engine.manifest.js:

```
  
//= link\_directory ../stylesheets/test\_rails\_engine .css  
//= link\_directory ../javascripts/test\_rails\_engine .js
```

Now lets add the javascript tag into the application.html.erb file under views/layouts/test\_rails\_engine:

```
<!DOCTYPE html>  
<html>  
<head>  
  <title>Test rails engine</title>  
  <%= csrf\_meta\_tags %>  
  <%= csp\_meta\_tag %>  
  
  <%= stylesheet\_link\_tag    "test\_rails\_engine/application", media: "all" %>  
  <%= javascript\_include\_tag "test\_rails\_engine/application", "data-turoblinks-track": "reload", type: "module" %>  
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

Then a simple view under views/test\_rails\_engine/hello/show.html.erb:

```
<p data-controller="hello">hello</p>
```

Now lets go ahead and test if its working as expected by connecting the engine with rails application, add the following to the rails application gemfile:

```
gem "test\_rails\_engine", path: "path to the gem"
```

Then mount the rails engine in routes.rb

```
mount TestRailsEngine::Engine => "/test\_rails\_engine"
```

Then we have to add the javascript and css files into the main application’s manifest file:

```
//= link test\_rails\_engine/application.css  
//= link test\_rails\_engine/application.js
```

And once we visit localhost:3000/test\_rails\_engine in the console we will see the hello world printed.

And thats how we can use stimulus inside of rails engine, attaching the github repo for the rails engine example shown above [https://github.com/abhirampai/test\_stimulus\_rails\_engine](https://github.com/abhirampai/test_stimulus_rails_engine).
