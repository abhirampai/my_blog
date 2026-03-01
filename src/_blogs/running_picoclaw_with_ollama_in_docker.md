This weekend I tried setting up **PicoClaw** with **Ollama**, running both in **separate Docker containers**.

The goal was simple:

- Run Ollama locally with Docker (optionally with NVIDIA GPU support)
- Configure PicoClaw to use Ollama as its LLM provider
- Connect PicoClaw to a Telegram bot
- Make everything talk to each other cleanly using Docker networking

This post walks through the complete setup step by step.


## Setting up Ollama with docker

### What is Ollama?

Ollama is a platform and toolchain for running **large language models (LLMs)** locally.  
It makes it easy to download, run, and integrate open-source models without relying on external cloud APIs.


We can pull [models](https://ollama.com/search) listed and run them locally in your machine.

### NVIDIA GPU Setup (Linux – Optional but Recommended)

If you plan to run Ollama using your GPU, ensure your NVIDIA driver is detected:

```bash
nvidia-smi
```

If it’s not detected, reinstall the drivers:

```bash
sudo apt-get remove --purge '^nvidia-.*'
sudo apt-get autoremove

sudo ubuntu-drivers autoinstall
```

Then install the NVIDIA Container Toolkit:
https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#with-apt-ubuntu-debian

## Running Ollama in Docker

We’ll follow the official Docker instructions from:
https://docs.ollama.com/docker

Run the Ollama container:

```bash
docker run -d \
--name ollama \
-p 11434:11434 \
-e OLLAMA_CONTEXT_LENGTH=64000 \
--gpus=all \
--runtime=nvidia \
-v ollama:/root/.ollama \
ollama/ollama
```
### Why set the context length to 64k?

PicoClaw may require a large context window depending on user input.
Without this, you may run into context overflow errors and unnecessary context compression.

### Pulling a Model

Start the container and pull a model.
You can choose any model supported by your CPU/GPU.

```bash
docker start ollama
docker exec -it ollama ollama pull gpt-oss-safeguard
```

## Setting up picoclaw

[PicoClaw](https://github.com/sipeed/picoclaw) is an ultra-lightweight personal AI Assistant. When compared to OpenClaw it focuses only on essential core functionality.

### Clone the Repository

```bash
git clone https://github.com/sipeed/picoclaw.git
cd picoclaw
```

### Copy and Edit Configuration

Create your working configuration file:

```bash
cp config/config.example.json config/config.json
```

### Configure Ollama as the Model Provider

Edit `config/config.json` and update the `model_list`:

```json
"model_list": [
    {
      "model_name": "gpt-oss-safeguard",
      "model": "ollama/gpt-oss-safeguard",
      "api_base": "http://ollama:11434/v1"
    }
  ]
```
### Set Default Model and Token Limits

Update the agent defaults:

```json
"agents": {
    "defaults": {
      "workspace": "~/.picoclaw/workspace",
      "restrict_to_workspace": true,
      "model_name": "gpt-oss-safeguard",
      "max_tokens": 64000,
      "temperature": 0.7,
      "max_tool_iterations": 20
    }
  }
```

## Setting up Telegram Bot

### Create the Bot
1. Open Telegram.
2. Search for @BotFather or visit: https://t.me/botfather
3. Create a new bot.
4. Copy the bot token.

### Restrict Access (Recommended)

To ensure only specific users can interact with the bot:
1. Create a Telegram username (Settings → Username)
2. Find your Telegram ID at: https://tg-user.id/

Example:
- Bot token: 123467890:AABCDEFGHIJKLMNOPQRSTUUVWXYZXZABCDE
- Telegram ID: 0987256412
- Username: hello_world

Update the configuration:

```json
"channels": {
    "telegram": {
      "enabled": true,
      "token": "123467890:AABCDEFGHIJKLMNOPQRSTUUVWXYZXZABCDE",
      "allow_from": ["0987256412|hello_world"]
    }
  }
```

## Running PicoClaw with Docker

Start PicoClaw:

```bash
docker compose --profile gateway up
```

At this point, you’ll likely see an error indicating that PicoClaw **cannot reach Ollama**.
This happens because they are running in **separate Docker networks**.

## Connecting Ollama and PicoClaw via Docker Network

Create a shared Docker network:

```bash
docker network create ollama
```

Attach both containers to the same network:

```bash
docker network connect ollama ollama

docker network connect ollama picoclaw-gateway
```

Once connected, PicoClaw will be able to reach Ollama using: http://ollama:11434

## Conclusion
- Ollama runs locally in Docker
- PicoClaw uses Ollama as its LLM backend
- Telegram bot is connected and access-restricted
- Containers communicate cleanly via Docker networking

You can now test everything directly from your Telegram bot.

