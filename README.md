# E-Commerce Web Application

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A full-stack e-commerce platform built during my Summer Internship at **Mantis Bilişim**. The application provides a complete solution for product management, user authentication, shopping cart logic, and order processing.

## 📂 Project Structure

This repository is organized as a monorepo to maintain separation of concerns:

* **`/frontend`**: A React.js Single Page Application (SPA) built with Vite.
* **`/backend`**: A high-performance REST API built with Python FastAPI.
* **`/docs`**: Database schemas (ERD), architectural diagrams, and UI screenshots.

## 🏗️ Technical Architecture

### ⚙️ Backend (FastAPI)
The API is powered by **FastAPI**, chosen for its asynchronous capabilities, type safety, and automatic documentation.
* **Security:** Implemented **OAuth2 with Password Flow** and **JWT** (JSON Web Tokens) for stateless authentication. User passwords are hashed using `bcrypt` before storage.
* **Database Modeling:** Utilized **SQLAlchemy** ORM to manage complex relationships (e.g., One-to-Many between Users and Orders, Cascading deletes).
* **Data Validation:** Strict **Pydantic** schemas ensure that invalid data never reaches the database layer, providing robust error handling.
* **Migrations:** Database schema changes are managed and version-controlled using **Alembic**.

### 🖥️ Frontend (React)
The frontend is built with **React 18 (Vite)**, focusing on performance, component reusability, and a responsive user experience.
* **State Management:** Custom hooks (e.g., `useAuth`, `useCart`) were implemented to manage user sessions and shopping cart state globally without the overhead of external libraries like Redux.
* **API Integration:** Configured **Axios** with response interceptors to automatically inject `Authorization: Bearer <token>` headers and handle token expiration gracefully.
* **Styling:** Modular CSS architecture ensures no style leakage between components.

## ✨ Key Features
* **User Authentication:** Secure Login, Registration, and Session management.
* **Product Catalog:** Features pagination, search functionality, and category filtering.
* **Shopping Cart:** Persistent cart state management with real-time price calculation.
* **Admin Dashboard:** A protected route for administrators to create, update, and delete products.
* **Order Management:** Users can view past orders; Admins can view all system orders.

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
