# News Portal Monorepo

A modern full-stack News Portal web application, organized as a monorepo workspace powered by [Bun](https://bun.sh/).

## Project Structure

This project uses Bun Workspaces to maintain a clean modular codebase:

```
├── backend/             # Express.js REST API server (TypeScript)
├── frontend/            # React + Vite web client (TypeScript & TailwindCSS)
├── shared/              # Common packages & schemas (Zod validators) shared by both apps
├── package.json         # Workspace root package.json configuration
└── README.md            # Project setup & usage instructions (this file)
```

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

1. **Bun**: The fast all-in-one JavaScript runtime & package manager.
   - Install command: `curl -fsSL https://bun.sh/install | bash`
2. **MongoDB**: A running MongoDB instance (either local community edition or MongoDB Atlas cloud database).

---

## Setup & Installation

Follow these steps to set up the project locally:

### 1. Clone & Install Dependencies
Run the installation command from the root of the workspace. Bun will automatically link the workspaces (including the `@news-portal/shared` package):

```bash
bun install
```

### 2. Configure Environment Variables
You need to create environment configuration files for both the `backend` and `frontend` folders. Templates are provided as `.env.example`.

#### Backend Setup
Copy the backend environment template:
```bash
cp backend/.env.example backend/.env
```
Inside `backend/.env`, you can customize:
- `PORT`: The API server port (default: `5000`)
- `MONGODB_URI`: Connection string to your MongoDB server (default: `mongodb://localhost:27017/news-portal`)
- `JWT_SECRET`: Secret key used for signing JWT tokens.

#### Frontend Setup
Copy the frontend environment template:
```bash
cp frontend/.env.example frontend/.env
```
Inside `frontend/.env`, configure:
- `VITE_API_URL`: The URL pointing to the backend Express server (default: `http://localhost:5000/api`)

---

## Running the Application

You can run both the frontend and backend simultaneously or individually using Bun.

### Option A: Run Both (Recommended)
You can start both projects using `bun --filter` from the root workspace directory.

Start the Backend development server (hot-reloaded):
```bash
bun --filter backend dev
```

Start the Frontend development server:
```bash
bun --filter frontend dev
```

### Option B: Run Individually
Navigate to the desired subdirectory:

#### To run the Backend:
```bash
cd backend
bun run dev
```

#### To run the Frontend:
```bash
cd frontend
bun run dev
```

---

## Shared Schema Architecture

This monorepo utilizes Zod schemas placed in the `shared` directory to run validation on both the client (frontend) and server (backend) sides.

- The validation logic resides in `shared/schemas/user.schema.ts`.
- They are imported directly in either component using TypeScript Path Mapping (`@shared/schemas/*`) or the workspace package name (`@news-portal/shared`):
  
  ```ts
  import { registerSchema } from "@news-portal/shared";
  ```
