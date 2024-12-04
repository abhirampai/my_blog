In this blog we will be looking into how to execute code using ruby and docker. We will be adding support for ruby, python, go, c, cpp, c#, java and rust languages.

So lets first setup docker. You can follow the instructions provided [here](https://docs.docker.com/engine/install/) to setup docker.

Now lets add `docker-api` gem that helps to connect docker with ruby.

```sh
gem install docker-api
```

## Running ruby program
First lets start of by trying to run a simple hello world program in ruby.

```ruby
puts "hello world"
```

Now lets pull the docker image for ruby.

```sh
docker pull ruby
```

Next lets add the logic to `executor.rb`:

```ruby
# requiring docker-api gem to connect with docker container
require "docker-api"

# Checking if the argument length is 1
if ARGV.length != 1
  puts 'Usage: executor.rb <file_path>'
  exit(1)
end

# Reading the file
file_name = ARGV[0]
file = File.open(file_name)

# Creating a container
container = Docker::Container.create(
  Cmd: ["ruby", file.path],
  image: "ruby:latest",
  'HostConfig': { 'Binds': ["#{Dir.pwd}:/workspace"] }, # mounts the current working directory to the container's workspace directory
  'WorkingDir' => "/workspace") # sets current working directory as workspace
  
# starting the container
container.start
  
# Attaching stdout and stderr
stdout, stderr = container.attach(stdout: true, stderr: true)

# Printing out stdout, also stderr if its present
puts stdout.join
puts stderr.join unless stderr.empty?

# Cleanup container and file
container.delete(force: true)
file.close
```

Now lets run the program
```sh
ruby executor.rb hello_world.rb
```

We should now get the output as
```sh
hello world
```

## Add support for other languages
Now lets add support for other languages as well.

First lets install all the docker images
```sh
docker pull python
docker pull golang
docker pull gcc
docker pull openjdk
docker pull mono
docker pull rust
```

Now lets generalize the setup for creating the container

```ruby
def command_image_binding(file)
  case File.extname(file.path).gsub(".", "")
  when "rb"
    {
      Cmd: ["ruby", file.path], image: "ruby:latest"
    }
  when "py"
    {
      Cmd: ["python3", file.path], image: "python:latest"
    }
  when "go"
    {
      Cmd: ["go", "run", file.path], image: "golang:latest"
    }
  when "java"
    {
      Cmd: ["bash", "-c", "javac #{file.path} && java #{file.path}"],
      image: "openjdk:latest"
    }
  when "c"
    {
      Cmd: ["bash", "-c", "gcc #{file.path} -o /tmp/a.out && /tmp/a.out"],
      image: "gcc:latest"
    }
  when "cpp"
    {
      Cmd: ["bash", "-c", "g++ #{file.path} -o /tmp/a.out && /tmp/a.out"],
      image: "gcc:latest"
    }
  when "cs"
    {
      Cmd: ["bash", "-c", "mcs -out:/workspace/a.exe #{file.path} && mono /workspace/a.exe"],
      image: "mono:latest"
    }
  when "rs"
    {
      Cmd: ["bash", "-c", "rustc #{file.path} -o /tmp/a.out && /tmp/a.out"],
      image: "rust:latest"
    }
  else
    puts "Unknown extension"
    exit(0)
  end
end

docker_args = command_image_binding(file)

container = Docker::Container.create(
  **docker_args,
  'HostConfig': { 'Binds': ["#{Dir.pwd}:/workspace"] },
  'WorkingDir' => "/workspace"
)
```

Now we have the setup that can run program in ruby, python, c, cpp, java, c# and rust.

## Conclusion
In this blog we saw how to create a simple code executor using ruby and docker.

For the complete code head over to this [Github Repo](https://github.com/abhirampai/code-executor-ruby)
