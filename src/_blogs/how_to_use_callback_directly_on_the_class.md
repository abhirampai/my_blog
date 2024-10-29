Last week, I worked on a feature requiring the result of an `ActiveJob` to perform some processing. The job resided within a gem, and I needed to modify the gem to call a method on the class in the host application. This situation necessitated a class-level callback, as the result had to be processed independently of any class instances.

Understanding Callbacks in Rails
================================

**Callbacks** are methods that get called at certain points of an object’s lifecycle. They are widely used in Rails to run code automatically during the creation, updating, and deletion of objects. To learn more about callbacks, you can refer to the [Rails Guide on Callbacks](https://guides.rubyonrails.org/active_record_callbacks.html).

ActiveJob in the Gem
--------------------

Here is the job in the gem that needs to call a method on the host application’s class:

```ruby
\# ActiveJob in the gem  
class MyJob < ActiveJob::Base  
  def perform  
    result = # perform the job and get the result  
    if ModelName.respond\_to?(:after\_result, true)  
      ModelName.after\_result { result }  
    end  
  end  
end
```

In this snippet, we check if the class `ModelName` in the host application has a class method `after_result`. If it does, we pass the job result to this method using a block.

Host Application Class Method
-----------------------------

In the host application, we define the `after_result` method on the class:

```ruby
\# Class in host application  
class ModelName  
  def self.after\_result  
    result = yield if block\_given?  
    process(result) if result.present?  
  end  
  
  def self.process(result)  
    # process the result  
  end  
end
```

Here, `yield` passes the job result to the `after_result` method, which then processes it if it's present.

Instance Method Callbacks
-------------------------

If we were to use instance methods and Rails callbacks, it would look slightly different. Callbacks can be defined on class instances using `define_callbacks` and `set_callback`.

```ruby
\# Class in host application  
class ModelName  
  define\_callbacks :result  
  set\_callback :result, :after, :after\_result, if: -> { respond\_to?(:after\_result, true) }  
  
  def after\_result  
    result = yield if block\_given?  
    process(result) if result.present?  
  end  
  
  def process(result)  
    # process the result  
  end  
end
```

In this example, `after_result` is an instance method. We define a `:result` callback and specify that the `after_result`method should run after the `:result` callback is triggered.

Modified ActiveJob in the Gem
-----------------------------

To use instance method callbacks, modify the job as follows:

```ruby
\# ActiveJob in the gem  
class MyJob < ActiveJob::Base  
  def perform(instance)  
    result = # perform the job and get the result  
    if instance.respond\_to?(:after\_result, true)  
      instance.run\_callbacks(:result) { result }  
    end  
  end  
end
```

Here, `instance` is an instance of `ModelName` from the host application. We check if it responds to `after_result` and run the `:result` callbacks.

Conclusion
==========

We’ve covered how to use a class method as a callback and how to utilize Rails’ `set_callback` for instance methods. Depending on whether your use case requires class-level or instance-level methods, you can implement the appropriate callback mechanism.
