# Secure Node.js Authentication System

## 📖 Project Description
A robust, production-ready backend authentication and authorization API. This system handles secure user registration, token-based login (using JSON Web Tokens), and Role-Based Access Control (RBAC). Built with Node.js, Express, and MongoDB, it is designed with essential security practices—protecting against brute-force attacks, XSS vulnerabilities, and ensuring passwords are securely hashed using bcrypt before storage.

## ⚙️ Requirements
To run and test this project on your machine, you must have the following tools installed:
- **Node.js**: (v14 or higher recommended) The runtime environment.
- **npm**: (Node Package Manager) To install package dependencies.
- **MongoDB**: Either running locally on the default port `27017` or accessible via a MongoDB Atlas cloud URI.
- **API Client**: A tool like **Postman**, **Insomnia**, or **cURL** to interact with the API backend.

## 🚀 Steps to Start the Project

Follow these step-by-step instructions to get the API running locally.

### 1. Set Up the Project Folder
Open your terminal, navigate to your project directory, and ensure you are inside the `secure_auth_system` folder.

### 2. Install Dependencies
Install all the necessary Node.js packages (like Express, Mongoose, JWT, and Bcrypt) by running:
```bash
npm install
```

### 3. Configure the Environment Variables
Make sure there is a file named `.env` in the root folder of the project. If not, create one and paste the following configuration inside:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/secure_auth
JWT_SECRET=super_secret_jwt_key_that_should_be_long_in_production
```
*(Note: If you use a cloud database, replace the `MONGO_URI` value with your connection string).*

### 4. Ensure MongoDB is Running
Make sure your MongoDB background service is actively running on your machine.

### 5. Run the Server
You have two options for starting the Node server depending on your needs:

- **Development Mode** (Auto-restarts when you edit files. Best for coding):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

If everything is configured correctly, your terminal should display:
```text
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

---

## 📚 API Endpoints Reference

Once your server is running, use an API tool (like Postman) to test these endpoints via `http://localhost:5000`.

### 1. Authentication
- **`POST /api/auth/register`**
  - **Body (JSON):** `{"username": "johndoe", "email": "john@example.com", "password": "Password123!", "role": "user"}`
  - **Description:** Registers a new user and securely hashes their password.

- **`POST /api/auth/login`**
  - **Body (JSON):** `{"email": "john@example.com", "password": "Password123!"}`
  - **Description:** Authenticates the user and returns a strict session token (JWT).

- **`POST /api/auth/logout`**
  - **Headers:** `Authorization: Bearer <Your_JWT_Token>`
  - **Description:** Safely logs out the user session.

### 2. Protected Data Routes
You MUST include your JWT token in the request headers (as a **Bearer Token**) to access these endpoints.

- **`GET /api/dashboard`**
  - **Description:** General dashboard data accessible to **any logged-in user**.

- **`GET /api/admin`**
  - **Description:** Highly restricted system data. Only accessible if the user was registered with the `"role": "admin"`.
