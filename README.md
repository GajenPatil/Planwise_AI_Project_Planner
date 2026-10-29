# Planwise — AI Project Planner

Planwise turns a plain-language project brief into a structured roadmap. Describe what you want to build, and it generates a project title, chronological milestones, actionable tasks, task dependencies, and estimated effort.

The application has a React interface, a FastAPI backend, and a LangGraph workflow that uses a Groq chat model to produce a schema-validated plan.

## Demonstration

[Watch the Planwise demonstration](demostration.mp4) to see the project planning workflow in action.

## Features

- Generate a roadmap from project requirements
- Organize work into milestones and actionable tasks
- Include task descriptions, prerequisite dependencies, and hour estimates
- View task counts, milestone counts, and total estimated effort
- Use the responsive web interface on desktop or mobile
- Explore the API through FastAPI's interactive documentation

## Technology

| Area | Tools |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI, Pydantic |
| Planning workflow | LangGraph, LangChain |
| Language model | Groq Chat API |

## Requirements

- Python 3.10 or newer
- Node.js 20.19+ or 22.12+
- npm
- A Groq API key for generating plans

## Getting started

Run the frontend and backend in separate terminals.

### 1. Configure and start the backend

Create `backend/.env` with your Groq credentials:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

`GROQ_MODEL` is optional; when omitted, the backend uses `openai/gpt-oss-120b`.

From the repository root, create a virtual environment, install the dependencies, and launch the API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

On macOS or Linux, activate the environment with `source .venv/bin/activate` instead. Keep the terminal open while using the app.

The API is available at `http://127.0.0.1:8001`. Check `http://127.0.0.1:8001/` for its health response, or open `http://127.0.0.1:8001/docs` for the interactive API reference.

### 2. Install and start the frontend

In a second terminal, from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend uses `http://127.0.0.1:8001` as its API by default. To use a different backend URL, create `frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8001
```

Restart the Vite development server after changing environment variables.

## How it works

1. Enter a project brief in the Planwise interface.
2. The frontend sends it to the FastAPI endpoint.
3. A LangGraph workflow passes the brief and planning instructions to the configured Groq model.
4. The model returns data in the `ProjectPlan` schema, and the interface displays the resulting roadmap.

The model is initialized when a plan is requested. The API can start without a key, but plan generation requires a valid `GROQ_API_KEY` and access to the configured model.

## API reference

### `POST /api/generate-plan`

Request JSON:

```json
{
  "requirements": "Build a task management app for teams, with projects, due dates, and task dependencies."
}
```

`requirements` must contain 1–20,000 characters. A successful response follows this structure:

```json
{
  "project_title": "Team Task Management App",
  "milestones": [
    {
      "milestone_name": "Project foundation",
      "tasks": [
        {
          "task_name": "Set up the application",
          "description": "Create the frontend and backend project structure.",
          "effort_hours": 6,
          "dependencies": []
        }
      ]
    }
  ],
  "total_estimated_hours": 6
}
```

Each milestone must contain at least one task. Task estimates are whole hours with a minimum of one hour. The total is intended to equal the sum of task estimates.

Common error responses include `422` for invalid or blank requirements, `503` when the API key is missing or the backend cannot connect to Groq, and `502` when Groq rejects the credentials/model or plan generation fails.

## Project layout

```text
.
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── core/         # LangGraph workflow, model client, and prompt
│   │   ├── schemas/      # Request and response models
│   │   └── main.py       # FastAPI app and health endpoint
│   ├── tests/            # API tests
│   └── requirements.txt
└── frontend/
    ├── src/              # React application and styles
    ├── public/           # Static assets
    └── package.json
```

## Development commands

Run these from `frontend/`:

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the production frontend into dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

Run the backend API from `backend/` with `uvicorn app.main:app --reload --port 8001` while developing.

## Troubleshooting

- **The frontend cannot reach the API:** Confirm the backend is running on port `8001` and that `VITE_API_URL` points to the correct base URL.
- **The API reports a missing key:** Add `GROQ_API_KEY` to `backend/.env`, then restart Uvicorn.
- **Groq rejects the key:** Check that the key is active and copied correctly; do not commit `.env` files.
- **The configured model is unavailable:** Verify `GROQ_MODEL` and confirm the Groq account can access it.
- **The backend cannot connect to Groq:** Check network, VPN, proxy, and firewall settings.

## Security note

Keep API keys in local environment files or a secret manager. Do not put Groq credentials in frontend environment variables: variables prefixed with `VITE_` are exposed to the browser. The repository's `.gitignore` excludes `.env` files.
