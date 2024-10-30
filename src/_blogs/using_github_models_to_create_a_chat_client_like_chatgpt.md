Recently, Github announced that they are bringing out Github Models that are hosted in Azure and I had signed up for their beta program. Last month I got a chance to play around with the models and I was pleasfully surprised by how much they can do. I've been using the models for a few weeks now and I'm really enjoying it.

I created a simple chat client that uses various models provided by Github and generate responses based on the user's input.
The user can select which model they want to use and the client will generate a response based on the model. In this blog we will just look into how we can start of with just one model.

So before diving into the code lets checkout what all models are available.

## Available Github Models

To get the available models lets make an API call to Github market place model endpoint as a json.

```javascript
const res = await fetch('https://github.com/marketplace/models.json')
const models = res.payload.models
models.map(model => console.log(model.name))
```

The response will look something like this.
```json
[
    "gpt-4o",
    "gpt-4o-mini",
    "o1-mini",
    "o1-preview",
    "text-embedding-3-large",
    "text-embedding-3-small",
    "Phi-3-5-MoE-instruct",
    "Phi-3-5-mini-instruct",
    "Phi-3-5-vision-instruct",
    "Phi-3-medium-128k-instruct",
    "Phi-3-medium-4k-instruct",
    "Phi-3-mini-128k-instruct",
    "Phi-3-mini-4k-instruct",
    "Phi-3-small-128k-instruct",
    "Phi-3-small-8k-instruct",
    "AI21-Jamba-1-5-Large",
    "AI21-Jamba-1-5-Mini",
    "Cohere-command-r",
    "Cohere-command-r-08-2024",
    "Cohere-command-r-plus",
    "Cohere-command-r-plus-08-2024",
    "Cohere-embed-v3-english",
    "Cohere-embed-v3-multilingual",
    "Llama-3-2-11B-Vision-Instruct",
    "Llama-3-2-90B-Vision-Instruct",
    "Meta-Llama-3-1-405B-Instruct",
    "Meta-Llama-3-1-70B-Instruct",
    "Meta-Llama-3-1-8B-Instruct",
    "Meta-Llama-3-70B-Instruct",
    "Meta-Llama-3-8B-Instruct",
    "Ministral-3B",
    "Mistral-Nemo",
    "Mistral-large",
    "Mistral-large-2407",
    "Mistral-small"
]
```

Now lets check how we can use these models in the chat application.

## Chat Application

Lets create a simple react application with the command:
```bash
npx create-react-app chat-app
```

Now, to use the models we first need to create a personal access token in github https://github.com/settings/tokens.

After creating the token create a file called `.env` in the root of the project and add the following:

```bash
REACT_APP_GITHUB_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Now lets add the dependencies to the project.

```bash
yarn add @azure-rest/ai-inference @azure/core-auth @azure/core-sse
```

### Generating responses

In order to generate the responses lets add the following code to `app.js`:

```js
import {useState} from "react";
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["REACT_APP_GITHUB_ACCESS_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o"; // any github model name we want to use from the list above

export const app = async() => {
  const [output, setOutput] = useState([]);
  const client = new ModelClient(endpoint, new AzureKeyCredential(token))

  const generateResponse = async (prompt) => {
    const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role:"system", content: "You are a helpful assistant." },
            { role:"user", content: prompt }
          ],
          temperature: 1.0,
          top_p: 1.0,
          max_tokens: 1000,
          model: modelName
        }
      })

    if (response.status !== "200") {
      throw response.body.error;
    }
    console.log(response.body.choices[0].message.content);
    setOutput((prev) => [...prev, response.body.choices[0].message.content]);
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <input
        type="text"
        placeholder="Enter your prompt here"
        onChange={(e) => generateResponse(e.target.value)}
      />
      {output.map((response)=> (
        <div key={response}>
          {response}
        </div>
      ))}
    </div>
  );
}
```

Here we have a basic chat application that uses the gpt-4o model. The user can enter a prompt and the application will generate a response based on the prompt. The response can be better viewed with help of a markdown preview package liket (react-markdow-preview)[https://www.npmjs.com/package/@uiw/react-markdown-preview]

### Steaming the responses

Now lets see how we can stream the output, I use preact to handle the state instead of useState.

```bash
yarn add @preact/signals-react
yarn add preact-observables // to handle Deep observable objects with preact-signals
```

```js
import { useSignals } from "@preact/signals-react/runtime";
import { useState } from "react";
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { createSseStream } from "@azure/core-sse";

const token = process.env["REACT_APP_GITHUB_ACCESS_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o"; // any github model name we want to use from the list above

export const app = async() => {
  useSignals()
  const output = observable([]);
  const client = new ModelClient(endpoint, new AzureKeyCredential(token))

  const generateResponse = async (prompt) => {
    const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role:"system", content: "You are a helpful assistant." },
            { role:"user", content: prompt }
          ],
          model: modelName,
          stream: true
        }
      }).asNodeStream()

    const stream = response.body;
    if (!stream) {
      throw new Error("The response stream is undefined");
    }

    if (response.status !== "200") {
      stream.destroy();
      throw new Error(`Failed to get chat completions, http operation failed with ${response.status} code`);
    }

    const sseStream = createSseStream(stream);

    const currentOutputLength = output.length > 1 ? output.length - 1 : 0
    for await (const event of sseStream) {
      if (event.data === "[DONE]") {
        return;
      }
      for (const choice of (JSON.parse(event.data)).choices) {
        output[currentOutputLength] += choice.delta?.content ?? ``);
      }
    }
  }

  return (
    <div className="App">
      <h1>Chat App</h1>
      <input
        type="text"
        placeholder="Enter your prompt here"
        onChange={(e) => generateResponse(e.target.value)}
      />
      {output.map((response)=> (
        <div key={response}>
          {response}
        </div>
      ))}
    </div>
  );
}
```

### Adding previous context to the model

To add the previous chat context to the model you can maintain a chatHistory state and push all the assistant user interaction into it eg,

```js
const [chatHistory, setChatHistory] = useState([{
  role: "system", content: "You are a helpful assistant. That assists user based on their inputs."
}]);
const generateResponse = async(prompt) => {
  const userPrompt = { role: "user", content: prompt};
  const response = await client.path("/chat/completions").post({
      body: {
        messages: [...chatHistory, userPrompt],
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 1000,
        model: modelName
      }
    })
  
  if (response.status !== "200") {
    throw response.body.error;
  }
  console.log(response.body.choices[0].message.content);
  setOutput((prev) => [...prev, response.body.choices[0].message.content]);
  
  const assistantPrompt = { role: "assistant", content: response.body.choices[0].message.content};
  setChatHistory((prev) => [...prev, userPrompt, assistantPrompt]);
}
```

Now we have the chatHistory being feeded back to the model so it can generate response based on previous interactions.

You can check more on how I have implemented the chat application using github models [here](https://github.com/abhirampai/github_models_chat).
