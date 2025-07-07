Last weekend, while immersed in Euro Truck Simulator 2, a flurry of GitHub notifications pulled me back to reality.
This sparked an idea: why not build a simple code reviewer bot powered by AI? Given its accessibility,
I decided to go with Gemini.

My journey began with a direct query to Gemini itself, asking for guidance on how to get started. It promptly provided me with the initial steps for creating a GitHub App and connecting it to a server—which I'd build later.

## Setting Up Your GitHub App
The first crucial step is to set up a dedicated GitHub App.

### Creating the Application
To begin, navigate to your GitHub profile. From the dropdown menu, select <b>Settings</b>. On the left-hand sidebar, you'll find <b>Developer settings</b>. Within Developer settings, proceed to create a new GitHub App.

![New github app settings](/assets/developer-settings.png "New github app settings")

## Configuring the Webhook
For local development, you'll need a way to receive webhook events from GitHub. I used [smee.io](https://smee.io) to obtain a temporary webhook URL, but `ngrok` is another excellent alternative.

For enhanced security, it's essential to provide a <b>webhook secret</b>. This secret will be used to verify the authenticity of incoming requests. You can generate a strong secret directly from your command-line interface. For instance, using Ruby:
```sh
ruby -rsecurerandom -e 'puts SecureRandom.hex(32)'
```

## Granting Permissions
Your GitHub App requires specific permissions to interact with your repositories and pull requests effectively. Configure the following permissions:

| Permission | Access |
| - | - |
| Check status | Read & Write |
| Metadata | Read only ( will be selected automatically ) |
| Pull request | Read & Write |
| Commit status | Read & Write |
| Contents | Read only |

## Subscribing to Events
Next, you need to subscribe your GitHub App to specific events that will trigger your reviewer bot. Ensure your app subscribes to these events:

| Events |
| - |
| Pull request |
| Pull request review |
| Pull request review comment |

Once your application is successfully configured, make sure to generate the private key. This `.pem` file will be automatically downloaded and is crucial for authenticating your server with GitHub.

## Building the FastAPI Server
With the GitHub App configured, it's time to build the backend server using FastAPI.

### Installing Dependencies
I prefer `uv` for package management, but you can certainly use `pip` and a `requirements.txt` file if that's your preference.

Install the necessary packages using `uv add`:
| Packages | Description |
| - | - |
| fastapi[standard] | The standard FastAPI package with core components |
| google-geniai | For interacting with the Gemini AI models |
| pydantic-settings | For managing environment variables securely | 
| pygithub | A Python wrapper for the GitHub Octokit API |
| ruff | A fast code linter and formatter |

### Setting Up Configuration
Let's start by creating a `config.py` file to handle reading sensitive information from your `.env` file:
```py
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GITHUB_APP_ID: str
    GITHUB_PRIVATE_KEY: str
    WEBHOOK_SECRET: str
    GEMINI_API_KEY: str
    REVIEW_LIMIT: int = 50

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()
```

This `config.py` utilizes `pydantic-settings` to load environment variables from a `.env` file. The `lru_cache` decorator on `get_settings()` ensures that the settings are loaded only once and then cached for faster access.

### Building the Main Application
Next, we'll build the core FastAPI application logic in `main.py`:
```py
from fastapi import FastAPI

from config import get_settings
from routers import webhook


app = FastAPI(
    title="Gemini Code Reviewer",
    description="A tool to review code using Gemini",
    version="0.1.0",
    contact={
        "name": "Gemini Code Reviewer",
        "url": "https://github.com/abhirampai/gemini_code_reviewer",
    },
)

app.include_router(webhook.router) # We are using routers to handle webhook related routes.

APP_ID = get_settings().GITHUB_APP_ID
PRIVATE_KEY = get_settings().GITHUB_PRIVATE_KEY
WEBHOOK_SECRET = get_settings().WEBHOOK_SECRET
GEMINI_API_KEY = get_settings().GEMINI_API_KEY

# If none of these values exist then we raise value error.
if not all([APP_ID, PRIVATE_KEY, WEBHOOK_SECRET, GEMINI_API_KEY]):
    raise ValueError(
        "Missing one or more required environment variables: "
        "GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET, GEMINI_API_KEY"
    )


@app.get("/")
def read_root():
    return {"Hello": "World"}

```
This `main.py` sets up the FastAPI application, includes the webhook router, and performs essential environment variable checks to ensure all necessary credentials are present.

### Implementing the Webhook Router
Now, let's create the `routers/webhook.py` file to handle incoming GitHub webhook requests:
```py
from fastapi import APIRouter, Request

from utils.webhook import verify_signature, parse_webhook_payload, get_event_type
from models.pull_request import PullRequest

router = APIRouter(tags=["webhook"])


@router.post("/webhook")
async def webhook(request: Request):
    """
    Receives GitHub webhook events.
    Verifies the signature.
    Parses the payload.
    Identifies the event type.
    Runs the code review only if the payload action is opened or synchronize.
    """
    body = await request.body()
    await verify_signature(request, body)
    payload = parse_webhook_payload(body)
    event_type = get_event_type(request)
    if event_type == "pull_request":
        pull_request = PullRequest.from_github_event(payload)
        if (
            payload.get("action") == "opened"
            or payload.get("action") == "synchronize"
        ):
            print(f'Executing gemini review on pull request: {pull_request.repository["full_name"]}#{pull_request.number} ')
            commit_sha = payload.get("after")
            if commit_sha:
                print(f'Executing only on files under the commit: {commit_sha}')
            pull_request.gemini_review_request(commit_sha)
    elif event_type == "ping":
        return {"message": "pong"}
    else:
        return {"message": f"Event type '{event_type}' received but not handled."}

    return {"message": "Webhook received"}

```
This router defines the `/webhook` endpoint, which is the entry point for GitHub events. It orchestrates signature verification, payload parsing, and triggers the Gemini review process specifically for opened or synchronize pull request actions.

### Create Webhook Utilities
To support the webhook router, we'll create utility functions in `utils/webhook.py`:
```py
import hmac
import hashlib
import json

from fastapi import HTTPException, Request, status

from config import get_settings


async def verify_signature(request: Request, body: bytes):
    """
    Verifies the signature of the webhook request.
    """
    signature_header = request.headers.get("X-Hub-Signature-256")
    if not signature_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Hub-Signature-256 header missing.",
        )

    try:
        secret_bytes = get_settings().WEBHOOK_SECRET.encode("utf-8")
        mac = hmac.new(secret_bytes, body, hashlib.sha256)
        expected_signature = "sha256=" + mac.hexdigest()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate signature.",
        )

    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Webhook signature verification failed.",
        )


def parse_webhook_payload(body: bytes):
    """
    Parses the webhook payload.
    """
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload."
        )


def get_event_type(request: Request):
    """
    Returns the event type of the webhook request.
    """
    event_type = request.headers.get("X-GitHub-Event")
    if not event_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-GitHub-Event header missing.",
        )

    return event_type
```
These utilities handle the crucial aspects of webhook security (signature verification) and payload processing, ensuring the integrity and correct interpretation of incoming GitHub events.

### Defining the Pull Request Model and Review Logic
Finally, let's create the `models/pull_request.py` file to encapsulate the pull request-related logic, including the interaction with Gemini and posting review comments:
```py
from pydantic import BaseModel
from typing import Dict, Any
from github import Auth, GithubIntegration
from config import get_settings
from google import genai
from utils.diff_checker import find_line_info

auth = Auth.AppAuth(get_settings().GITHUB_APP_ID, get_settings().GITHUB_PRIVATE_KEY)
gi = GithubIntegration(auth=auth)
installation = gi.get_installations()[0]
g = installation.get_github_for_installation()

gemini_client: genai.Client = genai.Client(api_key=get_settings().GEMINI_API_KEY)


class ReviewComment(BaseModel):
    path: str
    body: str
    line: str


class PullRequest(BaseModel):
    id: int
    number: int
    repository: Dict[str, Any]

    @classmethod
    def from_github_event(cls, event: Dict[str, Any]):
        """
        Reads the github event and stores the attributes in pull request object.
        """
        payload = event.get("pull_request")
        return cls(
            id=payload["id"],
            number=payload["number"],
            repository=event.get("repository"),
        )

    def gemini_review_request(self, commit_ref: str = None):
        """
        Identifies the files to be reviewed and invokes create review.
        """
        repo = g.get_repo(self.repository["full_name"])
        pull_request = repo.get_pull(self.number)
        files = []
        if commit_ref:
            files = self.get_commit_files(repo, commit_ref)
        else:
            files = pull_request.get_files()
        
        self.create_review(files, pull_request)

    def create_review(self, files, pull_request):
        """
        Invokes the gemini client to review the file and sends the review as comments to github.
        """
        review_comments = []
        for file_data in files:
            review_comments_for_the_file: list[ReviewComment] = self.generate_review(
                file_data.patch
            )
            for review_comment in review_comments_for_the_file:
                line_changed = review_comment.line
                review_comment_dict = review_comment.model_dump()
                review_comment_dict.pop("line")
                review_comments.append(
                    {
                        **review_comment_dict,
                        "path": file_data.filename,
                        **find_line_info(file_data.patch, line_changed),
                    }
                )
            if len(review_comments) >= get_settings().REVIEW_LIMIT:
                break

        self.post_review_comments(pull_request, review_comments)

    def post_review_comments(self, pull_request, review_comments: list[dict]):
        """
        Submit review comments as comment to github.
        """
        pull_request.create_review(
            body="Please review the following suggestions",
            event="COMMENT",
            comments=review_comments,
        )

    def generate_review(self, file_content):
        """
        Generate gemini review and return a list of ReviewComment objects.
        """
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""
                You are a helpful assistant that reviews code and comments on a pull request.
                Please review the file patch from the github api:
                {file_content}

                Special Instruction:
                Pull request review thread line must be part of the diff, Pull request review thread start line must be part of the same hunk as the line, and Pull request review thread diff hunk can't be blank.

                The output must contain the following keys:
                body: The text of the review comment.
                line: The contents of the line where the change needs to be applied
                """,
            config={
                "response_mime_type": "application/json",
                "response_schema": list[ReviewComment],
            },
        )
        return response.parsed
    
    def get_commit_files(self, repo, commit_ref: str):
        """
        Get commit files from commit details.
        """
        commit = repo.get_commit(commit_ref)
        return commit.files
```
This model handles initializing the GitHub and Gemini clients, fetching the relevant files for review (either the full PR diff or changes from a specific commit during a `synchronize` event), generating reviews using Gemini, and then posting those reviews as comments to GitHub.

### Adding the Diff Checker Utility
For precise line comments, we need a utility to parse diffs. Create `utils/diff_checker.py`:
```py
import re


def find_line_info(diff_text, target_line):
    """
    Identifies the line, start_line, start_side & side given the diff_text and the target line to be searched for.
    """
    lines = diff_text.splitlines()
    old_lineno = new_lineno = 0
    hunk_old_start = hunk_new_start = 0

    for line in lines:
        if line.startswith("@@"):
            match = re.match(r"^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@", line)
            if match:
                hunk_old_start = old_lineno = int(match.group(1))
                hunk_new_start = new_lineno = int(match.group(2))
            continue

        content = line[1:] if line else ""
        if line.startswith(" "):
            if content == target_line:
                return {
                    "line": new_lineno,
                    "start_line": hunk_new_start,
                    "start_side": "RIGHT",
                    "side": "RIGHT"
                }
            old_lineno += 1
            new_lineno += 1
        elif line.startswith("-"):
            if content == target_line:
                return {
                    "line": old_lineno,
                    "start_line": hunk_old_start,
                    "start_side": "LEFT",
                    "side": "LEFT",
                }
            old_lineno += 1
        elif line.startswith("+"):
            if content == target_line:
                return {
                    "line": new_lineno,
                    "start_line": hunk_new_start,
                    "start_side": "RIGHT",
                    "side": "RIGHT",
                }
            new_lineno += 1
    return {"line": 1}
```
This utility helps determine the correct line numbers and sides within a diff hunk, which is essential for accurately placing comments on GitHub.

## Running Your Server
With all the files in place, you can now run your FastAPI server.
```sh
fastapi dev main.py
```
To enable GitHub to send webhook requests to your local development server, you'll need a tunneling tool. Install smee-client globally:
```sh
npm install --global smee-client
```
Then, forward your webhook URL to your local port:
```sh
smee -u <webhook-url> -P /webhook -p <port-number>
```
Remember to replace <webhook-url> with the URL you obtained from smee.io and <port-number> with the port your FastAPI application is running on (usually 8000).

## Snapshot of reviews
![Gemini Code Review (1)](/assets/code-review-1.png "Gemini Code Review (1)")

![Gemini Code Review (2)](/assets/code-review-2.png "Gemini Code Review (2)")

## Conclusion
In this blog post, we've walked through the process of creating a GitHub pull request reviewer bot. By leveraging FastAPI for the server, Gemini for AI-powered code review, and a webhook client like smee.io, you can automate a significant part of your code review workflow. The full GitHub code for this project is available [here](https://github.com/abhirampai/gemini_code_reviewer).
