# 📱 Social Media Application

## 📌 Overview

This is a full-stack Social Media Application developed during the **Full Stack Development Training at ROI Academy**.

The application allows users to register, log in, create posts (text and image), like posts, and manage their own content.  
It follows a RESTful architecture with a clear separation between frontend and backend.

---

## 🛠 Tech Stack

### 🔹 Frontend

- React (Functional Components)
- React Hooks (useState, useEffect)
- Context API (Authentication state)
- Axios (API communication),
- Pagination Component
- Conditional Rendering

### 🔹 Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication (Access Token)
- Multer (Image Upload Handling)
- ImageKit (Cloud Image Storage)

---

## 🗄 Database Structure

The application uses **MongoDB** with the following collections:

- **Users**
- **Posts**
- **PostLikes**

### Relationships

- One User → Many Posts
- One Post → One User
- One Post → Many Likes
- Each user can like a post only once (unique logic implemented)

---

## 🔐 Authentication & Security

- JWT-based authentication
- Access token returned on login
- Token stored in localStorage
- Protected routes via middleware
- Only post owner can edit or delete posts
- Soft delete using `isActive` flag

---

## 🚀 Main Features

- User registration & login
- JWT authentication
- Create post (text + image)
- Image upload with Multer
- Cloud image storage in ImageKit
- Like / Unlike system
- Real-time like counter
- Pagination in feed
- Edit post (owner only)
- User profile page

---

## 📡 Main API Endpoints

### Auth Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Post Routes

- `GET /posts` (supports pagination)
- `POST /posts`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/like`

---

## 📂 Project Structure

### Backend

```
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 └── config/
```

### Frontend

```
frontend/
 ├── pages/
 ├── components/
 ├── context/
 └── services/
```

---

## 🎯 Purpose of the Project

This project demonstrates:

- Full Stack architecture understanding
- REST API development
- JWT authentication
- Database modeling with MongoDB
- Frontend-backend integration
- State management in React
- File upload and cloud storage integration

---

## 🧑‍💻 Author

**Getuar Jakupi**  
Full Stack Development – ROI Academy
