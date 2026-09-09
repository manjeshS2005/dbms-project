# 🎬 Film Festival Management System (DBMS Project)

A full-stack Film Festival Database Management System built with **Node.js + Express + MySQL** (backend) and **HTML/CSS/JS** (frontend). Manage movies, directors, festivals, actors, and awards with full CRUD operations and a dashboard.

## 📖 Project Explanation
This project is a **DBMS mini-project** that demonstrates how a real-world database application works:

- **Problem:** Film festivals need to track movies, who directed/acted in them, which festival screened them, and which awards they won — all linked together.
- **Solution:** A centralized MySQL database (`film_festival`) with 5 related tables, plus a web app to view/add/edit/delete records without writing SQL.
- **How it works:**
  1. `server.js` connects to MySQL and exposes REST APIs (e.g. `GET /api/movies` runs a JOIN query across Movie + Director + Festival).
  2. `public/index.html` calls those APIs with fetch() and shows a dashboard, tables, and forms.
  3. Users do CRUD in the browser — the backend validates (e.g. can't delete a director who still has movies) and runs parameterized SQL queries.
- **DBMS concepts used:** primary/foreign keys, JOINs, aggregation (`COUNT(*)` for dashboard), referential integrity checks, CRUD via SQL (`SELECT/INSERT/UPDATE/DELETE`).
- **Tech stack:** Express (API server), mysql2 (DB driver), vanilla JS + CSS (UI, no framework needed).

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
