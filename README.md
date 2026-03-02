📱 Social Media Application
📌 Overview

This is a full-stack Social Media Application developed during the Full Stack Development training at ROI Academy.

The application allows users to register, log in, create posts (with text and images), like posts, and manage their own content. The project follows a RESTful architecture with a clear separation between frontend and backend.

🛠 Tech Stack
🔹 Frontend

React (Functional Components)

React Hooks (useState, useEffect)

Context API (Authentication state management)

Axios (API communication)

Pagination Component

Conditional Rendering

🔹 Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication (Access Token)

Multer (Image upload handling)

ImageKit (Cloud image storage)

🗄 Database Structure

The application uses MongoDB with the following main collections:

Users

Posts

PostLikes

Relationships:

A User can create multiple Posts.

A Post belongs to one User.

A Post can have multiple Likes.

Each user can like a post only once (unique constraint logic).

🔐 Authentication & Security

JWT-based authentication

Access token returned on login

Token stored in localStorage

Protected routes using middleware

Only post owner can edit or delete their posts

Soft delete implementation (isActive flag)

🚀 Main Features

User registration and login

JWT authentication

Create post (text + image)

Image upload with Multer

Cloud image storage via ImageKit

Like / Unlike system

Real-time like counter

Pagination in feed

Edit post (owner only)

Soft delete post (owner only)

User profile page with personal posts

📂 Project Structure
Backend Structure

controllers

models

routes

middleware

config

Frontend Structure

pages

components

context

services

📡 API Endpoints (Main)
Auth

POST /auth/register

POST /auth/login

GET /auth/me

Posts

GET /posts (with pagination)

POST /posts

PATCH /posts/:id

DELETE /posts/:id

POST /posts/:id/like

⚙️ Key Implementation Details

Posts are filtered by isActive = true

Soft delete prevents permanent data loss

Like system ensures one like per user per post

Pagination improves performance

Middleware verifies JWT before protected actions

🎯 Purpose of the Project

The goal of this project was to demonstrate:

Full Stack architecture understanding

REST API development

Authentication & authorization

Database modeling

Frontend-backend integration

State management in React

File upload and cloud storage integration

🧑‍💻 Author

Getuar Jakupi
Full Stack Development – ROI Academy