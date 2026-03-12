# 📱 Social Media Application

> A full-stack social media app built during the Full Stack Development Training at **ROI Academy**.

🔗 **Repository:** [github.com/getuar04/social_media_app](https://github.com/getuar04/social_media_app)

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### 1️⃣ Clone the repository

```bash
git clone https://github.com/getuar04/social_media_app.git
cd social_media_app
```

### 2️⃣ Install dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/social_media_app

FRONTEND_ORIGIN=http://localhost:3000

SALT_ROUNDS=10

SECRET_KEY=your_jwt_secret_key
TOKEN_EXPIRES_IN=15m

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_app_password
```

---

## ▶️ Running the Application

### Start Backend

From the `backend` folder:

```bash
npm start
```

> Runs the backend server using `nodemon`.

```json
"scripts": {
  "seed": "node scripts/seed.js",
  "start": "nodemon index.js"
}
```

### Start Frontend

From the `frontend` folder:

```bash
npm start
```

> The React application will start and connect to the backend API.

---

## 🌱 Seed Script (Generate Demo Data)

The project includes a seed script that automatically generates demo data for testing.

From the `backend` folder:

```bash
npm run seed
```

The seed script will:

- Create multiple random users
- Create sample posts
- Upload sample images
- Populate the database with demo content

### 🔐 Default Password

All users created by the seed script share the same password:

```
12345678
```

Hashed using `bcrypt` in the seed script:

```js
const hashed = await bcrypt.hash("12345678", 10);
```

> Makes it easy to log in with any generated user during testing.

---

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
- Axios (API communication)
- Pagination Component
- Conditional Rendering
- Bootstrap for UI

### 🔹 Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication (Access Token)
- Multer (Image Upload Handling)
- ImageKit (Cloud Image Storage)
- Nodemailer (Email sending)
- bcrypt (Password hashing)

---

## 🗄 Database Structure

The application uses **MongoDB** with the following collections:

- **Users**
- **Posts**
- **PostLikes**
- **Tokens** (for password reset)
- **TwoFactorCodes** (for 2FA verification)

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
- Password hashing using bcrypt
- Two-Factor Authentication (2FA) via email
- Password reset via email link

---

## 🚀 Main Features

- User registration & login
- JWT authentication
- Two-Factor Authentication (2FA)
- Forgot password
- Reset password via email
- Create post (text + image)
- Image upload with Multer
- Cloud image storage in ImageKit
- Like / Unlike system
- Real-time like counter
- Pagination in feed
- Edit post (owner only)
- User profile page

---

## 🔐 Two-Factor Authentication (2FA)

After a successful login attempt:

1. The system verifies the user email and password.
2. If 2FA is enabled, a 6-digit verification code is generated.
3. The code is saved in the database with an expiration time.
4. The code is sent to the user via email.
5. The user must enter the code to complete authentication.
6. Only after verification the JWT token is issued.

This adds an additional security layer to the login process.

---

## 🔄 Password Reset Flow

The application supports secure password recovery.

### Forgot Password

1. The user enters their email address.
2. The backend checks if the account exists.
3. A reset token is generated and saved in the database.
4. A reset link is sent to the user's email.

Example reset link:

```
http://localhost:3000/reset-password?token=TOKEN
```

### Reset Password

1. The user opens the reset link.
2. The frontend extracts the token from the URL.
3. The user enters a new password.
4. The backend verifies the token.
5. The password is hashed using bcrypt.
6. The new password is saved in the database.

---

## 📡 Main API Endpoints

### Auth Routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-2fa`
- `GET /auth/me`

### Password Routes

- `POST /password/forgot-password`
- `POST /password/reset-password`

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
 ├── templates/
 ├── util/
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
- Email-based verification and password recovery
- Security best practices

---

## 🧑‍💻 Author

**Getuar Jakupi**  
Full Stack Development – ROI Academy
