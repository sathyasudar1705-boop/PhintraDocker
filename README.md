# Phintra Platform

Phintra is a premium AI-powered cybersecurity awareness and simulation platform designed to help organizations monitor, simulate, and mitigate phishing threats.

## Architecture

This repository contains two main components:
- **[Phintra_frontend-main](./Phintra_frontend-main/)**: A React web application built with Vite and Tailwind CSS.
- **[Phintra_Backend-main](./Phintra_Backend-main/)**: A FastAPI REST API service built with SQLAlchemy, Pydantic, and PostgreSQL.

## Features

- **SOC Threat Intelligence Dashboard**: Real-time security metrics and risk indicators.
- **Spear Phishing Simulation Engine**: Create and dispatch authorized educational simulations.
- **Predefined Simulation Templates**: Easily deploy template drills (e.g., password reset warnings).
- **Gamified Training Modules**: Educational courses with custom interactive quizzes and XP points.
- **Microsoft SSO Integration**: Enterprise authentication ready.

## Local Setup

### 1. Backend API Server
1. Navigate to `Phintra_Backend-main`.
2. Initialize virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables in `.env` (refer to `.env.example`).
5. Seed database:
   ```bash
   python seed.py
   ```
6. Start backend:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

### 2. Frontend Web App
1. Navigate to `Phintra_frontend-main`.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`.
4. Start development server:
   ```bash
   npm run dev
   ```
