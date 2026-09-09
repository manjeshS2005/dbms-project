# 🎬 Film Festival Management System (DBMS Project)

A full-stack Film Festival Database Management System built with **Node.js + Express + MySQL** (backend) and **HTML/CSS/JS** (frontend). Manage movies, directors, festivals, actors, and awards with full CRUD operations and a dashboard.

## ✨ Features
- Dashboard with counts + recent movies
- CRUD for Movies, Directors, Festivals, Actors, Awards
- MySQL joins (movie ↔ director ↔ festival ↔ awards)
- REST API (`/api/movies`, `/api/directors`, `/api/festivals`, `/api/actors`, `/api/awards`)
- Single-page frontend in `public/index.html`

## 🚀 Run locally
```bash
npm install
# create database film_festival in MySQL, update credentials in server.js / .env
npm start
# visit http://localhost:3000
```

## 📁 Project Structure
```
dbms-project/
├── server.js             → Express server + MySQL connection + all REST APIs
├── public/
│   └── index.html        → Frontend UI (dashboard + CRUD forms, ~1888 lines)
├── pgm1.css              → Extra stylesheet
├── package.json          → Dependencies (express, mysql2, cors) + scripts
├── package-lock.json     → Locked dependency versions
├── .env                  → Local DB config (not for sharing — see .env.example)
└── README.md             → Project docs
```

## 🗄️ Database
Database: `film_festival`
Tables: `Movie`, `Director`, `Festival`, `Actor`, `Award`

## 🔌 API Endpoints
```
GET/POST   /api/movies, /api/directors, /api/festivals, /api/actors, /api/awards
PUT/DELETE /api/movies/:id, /api/directors/:id, ...
GET        /api/dashboard, /api/dashboard/data
```
