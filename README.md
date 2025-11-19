# E-Commerce Web Application

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A full-stack e-commerce platform built during my Summer Internship at **Mantis Bilişim**. The application provides a complete solution for product management, user authentication, and order processing.

## 📂 Project Structure

This repository is organized as a monorepo:

* **`/frontend`**: A React.js Single Page Application (SPA) using Vite.
* **`/backend`**: A high-performance REST API built with Python FastAPI.
* **`/docs`**: Database schemas (ERD), architectural diagrams, and screenshots.

## 🛠 Tech Stack

### Backend
* **Framework:** FastAPI (Python)
* **Database:** PostgreSQL / SQLAlchemy ORM
* **Migrations:** Alembic
* **Auth:** JWT (JSON Web Tokens) & OAuth2
* **Validation:** Pydantic

### Frontend
* **Framework:** React.js (Vite)
* **State Management:** React Hooks
* **Styling:** CSS Modules
* **HTTP Client:** Axios with Interceptors

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
uvicorn main:app --reload
```
