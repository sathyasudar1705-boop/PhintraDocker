# Project Analysis - Phintra Platform

## 1. Application Type and Architecture
Phintra is a multi-service cybersecurity awareness and training application composed of two primary components:
- **Backend Service (`Phintra_Backend-main`)**: An API built on **FastAPI** (Python 3.10+ compatible).
- **Frontend Service (`Phintra_frontend-main`)**: A modern SPA built with **React 19** and **Vite 8**, utilizing **Tailwind CSS v4** for styling.

---

## 2. Entry Points
- **Backend**: `app/main.py` is the application entry point. It bootstraps the FastAPI app, manages database schema updates (via automated raw SQL migration triggers), registers exception handlers, configures CORS, and includes the application routing modules.
- **Frontend**: `index.html` (root) loads `src/main.jsx` which renders the `App` component (`src/App.jsx`), serving as the React entry point orchestrating context providers and `react-router-dom` routes.

---

## 3. Complete Dependency Tree
### Backend Dependencies (`requirements.txt`)
- `fastapi==0.111.0` - Web framework.
- `uvicorn==0.30.1` - ASGI server.
- `sqlalchemy==2.0.30` - Database ORM.
- `psycopg2-binary==2.9.9` - PostgreSQL database adapter.
- `pydantic==2.7.2` - Data validation and settings management.
- `pydantic-settings==2.2.1` - Configuration management.
- `python-jose[cryptography]==3.3.0` - JWT signature generation/verification.
- `passlib[bcrypt]==1.7.4` - Password hashing utilities.
- `python-dotenv==1.0.1` - Parsing `.env` files.
- `alembic==1.13.1` - Database migration controller.
- `python-multipart==0.0.9` - Form data/file parsing support.

### Frontend Dependencies (`package.json`)
- **Production**:
  - `react^19.2.6`, `react-dom^19.2.6` - Frontend framework.
  - `@tailwindcss/vite^4.3.0`, `tailwindcss^4.3.0` - Styling engine.
  - `axios^1.16.1` - API client.
  - `framer-motion^12.40.0` - Interactive UI animations.
  - `lucide-react^1.17.0`, `react-icons^5.6.0` - Icon packs.
  - `react-router-dom^7.15.1` - Application routing.
  - `recharts^3.8.1` - Metrics visualization charts.
- **Development**:
  - `vite^8.0.12` - Bundler and dev server.
  - `@vitejs/plugin-react^6.0.1` - Vite React integration.
  - `eslint^10.3.0`, `@eslint/js^10.0.1`, `eslint-plugin-react-hooks^7.1.1`, `eslint-plugin-react-refresh^0.5.2` - Linting engine.
  - `@types/react^19.2.14`, `@types/react-dom^19.2.3` - Types declarations.

---

## 4. Runtime and Build Requirements
- **Backend**:
  - Runtime: Python 3.10 or 3.11.
  - Dev Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`
- **Frontend**:
  - Runtime: Node.js v18+.
  - Build Command: `npm run build` (outputs optimized static files in `dist/` directory via Vite).
  - Dev Run Command: `npm run dev` (starts development server on port 5173).

---

## 5. Required Environment Variables
### Backend environment variables (`.env`)
- `DATABASE_URL`: Connection string for PostgreSQL (e.g. `postgresql://user:password@host:5432/dbname`).
- `SECRET_KEY`: Secret string used for signing JWT tokens.
- `ALGORITHM`: Hashing algorithm for tokens (default: `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration window for access tokens (default: `60`).
- `FRONTEND_URL`: CORS origin validation target (default: `http://localhost:5173`).
- `GEMINI_API_KEY`: API Key for Google Gemini integrations.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: SMTP service configurations for outgoing notification/awareness training emails.

### Frontend environment variables (`.env`)
- `VITE_API_BASE_URL`: Endpoint of the running FastAPI backend (e.g. `http://localhost:8001`).
- `VITE_HF_API_TOKEN`: Hugging Face Inference API token.

---

## 6. Database Schema and Dependencies
The application targets **PostgreSQL** in production. The DB ORM models define the following table relations:
- `users`: Core login credentials (email, hashed password, role like Admin/Manager/Employee).
- `companies`: Scopes tenant isolation; links back to an `admin_id` (User).
- `departments`: Managed departments associated with a company.
- `employees`: Core workforce metadata (linked to `users` or mock users, containing risk scores, status, department_id, and creator `admin_id`).
- `campaigns`: Phishing drill configurations (name, status, dates, sender profile ID).
- `campaign_recipients`: Tracks individual employee engagement metrics per campaign (sent, delivered, opened, clicked, reported, quiz completed, training completed).
- `email_templates`: Formatted mock phishing templates.
- `email_logs`: Dispatched drill tracking records.
- `reported_emails`: Tracks emails flagged by employees, containing calculated threat scores and risk assessments.
- `quizzes`, `quiz_questions`: Employee training verification quizzes.
- `certificates`: Generated certification of completion records.
- `training_modules`, `training_assignments`, `training_completions`: Track course compliance.
- `employee_activity_events`: Action history trigger records for scoring.
- `messages`: In-app support system for messaging between admins and employees.
- `sender_profiles`: Spoofed domains and profiles used during simulations.

---

## 7. Third-Party Integrations and APIs
- **Google Gemini API**: Utilized on the backend for administrator metrics analysis (`app/routes/ai_assistant.py` and `app/services/ai_assistant.py`). Calls `gemini-2.5-flash` to process admin summary contexts.
- **Hugging Face Inference API**: Integrated directly on the frontend (`src/services/huggingFaceService.js`). Queries `mistralai/Mistral-7B-Instruct-v0.2` (primary) and `google/gemma-2-2b-it` (fallback) to assist users on security topics in the chat sidebar interface.
- **SMTP**: Email transmission gateway to trigger phishing emails.
