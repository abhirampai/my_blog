In my free time, I wanted to learn to create something that would benefit not only my productivity but also help in my work so I decided to create a gem that can list all deprecated methods in a ruby on rails application. And that is how I approached ChatGPT to create a gem.

Initially I went on and asked ChatGPT on how to create a rails gem and its reply contained the steps to setup the ruby gem repo and also tips document, license, install and publish the gem.

After setting up the gem repo I went over and asked it how to parse over all the rb files in a host application and return methods that are not used in the application any more.

It suggested using the parser gem to parse the files to ast(Abstract Syntax Tree) format and traverse the tree and initially find the defined methods and then find the invoked methods.

Finally we just have to remove invoked methods from defined methods.

ChatGPT initially didn’t return the code on how to traverse the ast tree and find the methods, then I had to specifically ask it to return the logic for it.

And finally it was time to do some final adjustments like adding a cli class to run the gem in cli.

Also added a file that would list the methods that are deprecated and also show the exact line number in the file in which the method is defined.

The gem is still in very early stage and doesn’t look into all the edge cases.

Here is the link to the gem in Github -> [https://github.com/abhirampai/unused_methods](https://github.com/abhirampai/unused_methods)
