In this blog post, we'll explore how to execute code using Ruby and Docker, and extend support to multiple languages such as Python, Go, C, C++, C#, Java, and Rust.

## Setting Up Docker
To start, you'll need Docker installed on your system. Please follow the comprehensive installation guide provided [here](https://docs.docker.com/engine/install/).

## Installing the docker-api Gem

To connect Docker with Ruby, we'll use the docker-api gem. Install it by running:
```sh
gem install docker-api
```

## Running ruby program using docker
Let's begin with a simple "Hello, World!" program in Ruby.

```ruby
puts "hello world"
```

### Pulling ruby docker image
First, pull the Ruby Docker image:
```sh
docker pull ruby
```

### Creating the Executor Script
Next, create an executor.rb file with the following logic:

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

### Running the Executor Script
Run the Ruby program by executing:
```sh
ruby executor.rb hello_world.rb
```

If everything is set up correctly, you should see the output:
```sh
hello world
```

## Adding Support for Other Languages
To extend support for other languages, pull the necessary Docker images:

```sh
docker pull python
docker pull golang
docker pull gcc
docker pull openjdk
docker pull mono
docker pull rust
```

### Generalizing the Setup
Create a method to determine the command and image based on file extensions:

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

With this setup, you can now execute programs written in Ruby, Python, C, C++, Java, C#, and Rust using Docker containers.

## Conclusion
In this blog post, we demonstrated how to create a simple code executor using Ruby and Docker.

For the complete code visit the [Github Repo](https://github.com/abhirampai/code-executor-ruby).
