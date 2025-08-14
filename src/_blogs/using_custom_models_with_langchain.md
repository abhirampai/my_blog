If you’ve ever wanted to let LangChain talk to your own “black‑box” LLM endpoint (whether it’s a private deployment, a SaaS that 
exposes many models under one roof, or a custom wrapper you built), the good news is you can do it with **one small wrapper 
class**.  

Below is a complete, recipe that shows you how to:

1. **Wrap a custom API** in a LangChain‑compatible class.  
2. **Transform LangChain’s `BaseMessage` objects** into the payload your endpoint expects.  
3. **Implement streaming, retries, and authentication** so the wrapper behaves like any other LLM.  
4. **Bind tools** so the agent can call out to your endpoint in the same way it calls OpenAI tools.  
5. **Plug the wrapper into an agent** that can do *agentic search* (search‑as‑a‑service, retrieve‑then‑generate, etc.).  

Feel free to copy, paste, and tweak the snippets below for your own project.

---

## 1. Why a Custom LLM Wrapper?

| Problem | Solution |
|--------|---------|
| Multiple models live behind a single URL | Pass a `model` parameter in the request. |
| You need token‑level auth or custom headers | Expose an `auth_token` field in the class. |
| You want the same interface as OpenAI/Anthropic | Inherit from `BaseChatModel` (or `BaseLLM` for non‑chat). |

By writing a thin wrapper, you can **reuse all of LangChain’s agents, tools, chains, and prompt templates** without touching the 
core framework.

---

## 2. Building the Wrapper Class

### 2.1 Imports & Base Class

```python
# custom_llm.py
import json
import httpx
from typing import List, Dict, Optional, Any
from langchain.schema import BaseMessage, AIMessage, HumanMessage, SystemMessage, ChatResult, ChatMessage
from langchain.chat_models import BaseChatModel
from langchain.callbacks.manager import CallbackManagerForLLMRun
```

> **Why `BaseChatModel`?**  
> If your API supports multi‑turn chat, inherit from `BaseChatModel`.  
> If it only does single‑shot completions, inherit from `BaseLLM`.

### 2.2 The Wrapper Class Skeleton

```python
class CustomChatModel(BaseChatModel):
    """
    A LangChain LLM that forwards chat requests to a custom AI API.
    """
    # -----------------------------------------------------------
    #  Configuration parameters
    # -----------------------------------------------------------

    base_url: str                      # e.g. "https://api.myorg.com/v1/chat"
    auth_token: Optional[str] = None   # bearer token or API key
    timeout: int = 30                  # seconds
    max_retries: int = 3               # retry count for transient errors

    # Optional: you can expose a list of supported models
    supported_models: List[str] = []

    # -----------------------------------------------------------
    #  Helper methods
    # -----------------------------------------------------------

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers

    def _convert_messages(self, messages: List[BaseMessage]) -> List[Dict]:
        """
        Convert LangChain BaseMessage objects into the JSON payload format expected
        by the custom endpoint.  Adjust this mapping to match your API schema.
        """
        payload = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                role = "user"
                content = msg.content
            elif isinstance(msg, AIMessage):
                role = "assistant"
                content = msg.content
            elif isinstance(msg, SystemMessage):
                role = "system"
                content = msg.content
            else:
                raise ValueError(f"Unsupported message type: {type(msg)}")

            payload.append({"role": role, "content": content})
        return payload

    # -----------------------------------------------------------
    #  Core LLM interface
    # -----------------------------------------------------------

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        callbacks: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any
    ) -> ChatResult:
        """
        Send a chat request to the custom endpoint and return a ChatResult.
        """
        # 1️⃣ Build the request payload
        payload = {
            "messages": self._convert_messages(messages),
            "stop": stop,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 512),
        }

        # 2️⃣ Optionally pick a model if the endpoint supports many
        if "model" in kwargs:
            payload["model"] = kwargs["model"]
        elif self.supported_models:
            payload["model"] = self.supported_models[0]  # default

        # 3️⃣ Make the HTTP request with retries
        for attempt in range(self.max_retries + 1):
            try:
                resp = httpx.post(
                    self.base_url,
                    headers=self._get_headers(),
                    json=payload,
                    timeout=self.timeout,
                )
                resp.raise_for_status()
                break
            except httpx.HTTPError as exc:
                if attempt == self.max_retries:
                    raise RuntimeError(f"API call failed after {self.max_retries} attempts: {exc}") from exc

        # 4️⃣ Parse the response
        data = resp.json()
        # Expecting { "choices": [ {"message": {"role":"assistant","content":"..."} } ] }
        choices = data.get("choices")
        if not choices:
            raise ValueError("No 'choices' in API response")

        # Build LangChain ChatResult
        messages_out = []
        for choice in choices:
            msg_dict = choice.get("message", {})
            role = msg_dict.get("role", "assistant")
            content = msg_dict.get("content", "")
            if role == "assistant":
                messages_out.append(AIMessage(content=content))
            else:
                # some endpoints might return a different role; handle as needed
                messages_out.append(ChatMessage(role=role, content=content))

        return ChatResult(
            generations=messages_out,
            llm_output=data.get("usage", {}),  # optionally include token counts
        )

    # -----------------------------------------------------------
    #  Tool binding support (optional but handy)
    # -----------------------------------------------------------

    def _bind_tools(
        self,
        tools: List[Any],
        tool_choice: Optional[str] = None,
        **kwargs: Any,
    ) -> "CustomChatModel":
        """
        Accepts a list of LangChain tools and converts them to the format your
        endpoint expects (e.g. OpenAI tool format).  Returns a new instance
        of the wrapper that knows about the bound tools.
        """
        # 1️⃣ Convert each tool into the OpenAI format
        formatted_tools = [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.get_params_schema(),
                },
            }
            for tool in tools
        ]

        # 2️⃣ Merge into kwargs
        kwargs["tools"] = formatted_tools
        kwargs["tool_choice"] = tool_choice

        # 3️⃣ Return a new bound instance
        return self.__class__(**{**self.__dict__, **kwargs})
```

> **Key points**  
> * `_convert_messages` – adapt this mapping to match your API’s message format.  
> * `_generate` – the main entry point LangChain will call.  
> * `_bind_tools` – optional, but lets you use the same wrapper for function‑calling agents.

---

## 3. Using the Wrapper in a LangChain Project

### 3.1 Instantiate the Custom LLM

```python
# main.py
from custom_llm import CustomChatModel

llm = CustomChatModel(
    base_url="https://api.myorg.com/v1/chat",
    auth_token="sk-<YOUR-API-KEY>",
    supported_models=["gpt-4o", "text-davinci-003", "search-model"],
)
```

### 3.2 Build a Simple Retrieval‑Then‑Generate Flow

Below is a minimal “agentic search” pipeline:

```python
from langchain.agents import initialize_agent, AgentExecutor, AgentType
from langchain.tools import Tool
from langchain.llms import BaseLLM

# 1️⃣ Create a tool that queries the custom endpoint directly
class CustomSearchTool(Tool):
    name = "custom_search"
    description = "Perform a web‑like search using the custom AI API."
    func = llm  # reuse the same LLM; you can customize the prompt here

# 2️⃣ Bind the tool to the LLM
bound_llm = llm._bind_tools(tools=[CustomSearchTool])

# 3️⃣ Set up the agent
agent = initialize_agent(
    tools=[CustomSearchTool],
    llm=bound_llm,
    agent=AgentType.OPENAI_FUNCTIONS,  # or AgentType.ZERO_SHOT_REACT_DESCRIPTION
    verbose=True,
)

# 4️⃣ Run a query
response = agent.run("What are the latest developments in quantum cryptography?")
print("\n=== Final Answer ===")
print(response)
```

**What happens?**  
1. The planner LLM (`bound_llm`) reads the user query.  
2. It decides to call `custom_search`.  
3. The tool’s `func` (our custom LLM) sends the request to the endpoint.  
4. The agent combines the search result and writes the final answer.

---

## 4. Advanced Topics

### 4.1 Streaming Support

If your endpoint supports streaming (e.g., `/v1/chat/stream` that emits chunks), override `stream`:

```python
def stream(
    self,
    messages: List[BaseMessage],
    stop: Optional[List[str]] = None,
    **kwargs: Any
) -> Iterator[str]:
    payload = {"messages": self._convert_messages(messages), "stream": True, **kwargs}
    resp = httpx.stream("POST", self.base_url, headers=self._get_headers(), json=payload, timeout=self.timeout)
    for chunk in resp.iter_lines():
        data = json.loads(chunk)
        # Usually data = {"delta": {"content": "..."}}
        content = data.get("delta", {}).get("content", "")
        yield content
```

### 4.2 Retry & Circuit Breaker

Use `tenacity` or `httpx`’s retry policy:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

class CustomChatModel(...):
    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
    def _generate(...):
        ...
```

### 4.3 Handling Token Limits & Pagination

If the endpoint caps `max_tokens`, you can:

* Pass `max_tokens` from `kwargs`.  
* If the response indicates truncation, you can call again with `continue_from=last_token_id`.

---

## 5. Testing the Wrapper Locally

Create a minimal test harness:

```python
if __name__ == "__main__":
    # Quick sanity check
    test_llm = CustomChatModel(
        base_url="http://localhost:8000/v1/chat",
        auth_token="test-key",
    )

    test_messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content="Say hi!"),
    ]

    result = test_llm._generate(test_messages)
    print(result)
```

Run your local API or use a mock server (e.g., `httpx.MockTransport`) to validate the JSON round‑trip.

---

## 6. Final Thoughts

* **One wrapper, infinite possibilities.**  
  Once you have the `CustomChatModel`, you can plug it into any LangChain component—agents, chains, loops, or even the new 
`AgentExecutor` API.

* **Consistency is key.**  
  Make sure your endpoint’s request/response schema is stable; any change forces you to update the wrapper.

* **Leverage LangChain’s tools.**  
  If your endpoint supports function‑calling semantics, use `_bind_tools` to expose those functions to the agent.

* **Keep the wrapper lean.**  
  Put all heavy logic (retry, auth, streaming) in the wrapper; the rest of the code stays agnostic of the underlying provider.

## Resources
Here are the resources that I followed
| Link | What it covers |
|------|----------------|
| LangChain Docs – Custom LLM | https://python.langchain.com/docs/how_to/custom_llm/ |
| LlamaCpp example (community repo) | https://github.com/langchain-ai/langchain-community/blob/main/libs/community/langchain_community/chat_models/llamacpp.py |

Happy building!
