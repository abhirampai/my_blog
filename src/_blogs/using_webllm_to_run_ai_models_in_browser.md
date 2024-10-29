When I built [CodeBoost](https://github.com/abhirampai/CodeBoost), I had added ChatGPT support to it for refactoring the code. But as time passed the api key expired and I was checking for other options. Then I came across [WebLlm](https://github.com/mlc-ai/web-llm) that runs models in browser.

WebLlm is a high performance in-browser LLM inference engine that brings language model inference directly onto web browsers with hardware acceleration. Everything runs inside the browser with no server support and is accelerated with WebGPU.

It downloads models into the cache of your browser and runs it with the help of WebGPU, so make sure you are running a browser that supports [WebGPU](https://caniuse.com/?search=WebGPU).

To add WebLlm to your application you can use

```console
yarn add @mlc-ai/web-llm
```

You can also use CDN if you want,

```javascript
import * as webllm from "https://esm.run/@mlc-ai/web-llm";
```

### Initializing MlcEngine
The operations that can be done on a WebLlm model are through `MlcEngine` interface. To create an instance of `MlcEngine` we can do the following:

```javascript
// main.js
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Callback function to update model loading progress
const initProgressCallback = (initProgress) => {
  console.log(initProgress);
}
const selectedModel = "Phi-3.5-mini-instruct-q4f16_1-MLC-1k";

const engine = await CreateMLCEngine(
  selectedModel,
  { initProgressCallback }, // engineConfig
);
```

Here `CreateMLCEngine` generates the an instance of the MlcEngine.

`selectedModel` is the available [webllm models](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts#L293), I would suggest to use any of the phi models since it is light weight.

`initProgressCallback` tracks the progress of downloading the model to the browser cache. This needs to be handled properly because this could take so much time on initial load. Subsequent loads would be faster since the model would be preloaded in the cache.

Now we have a synchronous way of initializing the MlcEngine. The drawback of this approach is that it would block the user from performing any other task when the model is being downloaded.

#### Using worker to asynchronously initialize the engine
To resolve that we can asynchronously initialize the MlcEngine with the help of workers that would do this process in the background without blocking the user.

For this we first need to create a worker script.
```javascript
// worker.js
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// A handler that resides in the worker thread
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => {
  handler.onmessage(msg);
};
```

Then when creating the engine we need to use `CreateWebWorkerMLCEngine` instead of `CreateMLCEngine`. It create a WebWorkerMLCEngine that implements the same MLCEngineInterface. The rest of the logic remains the same.
```javascript
// main.js
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

async function main() {
  // Use a WebWorkerMLCEngine instead of MLCEngine here
  const engine = await CreateWebWorkerMLCEngine(
    new Worker(
      new URL("./worker.js", import.meta.url), 
      {
        type: "module",
      }
    ),
    selectedModel,
    { initProgressCallback }, // engineConfig
  );

  // everything else remains the same
}
```

Now lets see how we can using the chat completions api of WebLlm. So WebLlm is compactible with [OpenAI API](https://platform.openai.com/docs/api-reference/chat) i.e, you can use the same OpenAI API on any open source models locally, with functionalities including streaming, JSON-mode, etc.

### Chat Completion using WebLlm

Lets see how we can use the chat completion api to generate a response to refactor a python code.

```javascript
const messages = [
  { role: "system", content: "You are a chatbot that can refactor python code." },
  { role: "user", content: "Refactor code snippet ```def add(x,y):\n print(x+y)\n\nadd(1, 2)\n```" },
]

const reply = await engine.chat.completions.create({
  messages,
});
console.log(reply.choices[0].message);
```

To stream the output simply pass `stream: true`

```javascript
const messages = [
  { role: "system", content: "You are a chatbot that can refactor python code." },
  { role: "user", content: "Refactor code snippet ```def add(x,y):\n print(x+y)\n\nadd(1, 2)\n```" },
]

const chunks = await engine.chat.completions.create({
  messages,
  temperature: 1,
  stream: true // <-- Enable streaming
});

let reply = "";
for await (const chunk of chunks) {
  reply += chunk.choices[0]?.delta.content || "";
  console.log(reply);
}

const fullReply = await engine.getMessage();
console.log(fullReply);
```

You can check out more on how I implemented WebLlm in [CodeBoost](https://github.com/abhirampai/CodeBoost).

To handle the browsers without WebGPU I used google gemini.

There is also an option to store the WebLlm model to indexDb but for my use case cache was fine. There is an example on how to use indexDb instead of browser cache in WebLlm github repo https://github.com/mlc-ai/web-llm/tree/main/examples/cache-usage#webllm-cache-usage.

