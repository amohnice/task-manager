**Final Project Submission: Collaborative Task Management Web App**  
*(For Kenyan University Students)*  

---

### **1. Project Overview**  
**Objective:** Build a web app where users can:  
- Log in securely (with JWT or Google).  
- Create, assign, and track tasks with deadlines.  
- Chat with team members in real time.  
- Receive deadline notifications.  
- Host the app online for everyone to use.  

**Target Users:** Students, lecturers, or project teams needing a simple task manager.  

---

### **2. Tools Used**  
| **Category**       | **Tools**                                                                 |  
|---------------------|---------------------------------------------------------------------------|  
| Backend (Server)    | Node.js, Express.js, PostgreSQL                                          |  
| Frontend (Design)   | React.js, Bootstrap                                                      |  
| Authentication      | JWT (JSON Web Tokens)                                                    |  
| Real-Time Features  | Socket.io (for chat)                                                     |  
| Deployment          | Heroku (free hosting)                                                    |  

---

### **3. Step-by-Step Implementation**  

#### **Step 1: Backend Setup**  
1. **Install Node.js**  
   - Download from [nodejs.org](https://nodejs.org/).  
2. **Create a Backend Folder**  
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express pg jsonwebtoken bcrypt socket.io
   ```  
3. **Create a Simple Server**  
   ```javascript
   // backend/server.js
   const express = require("express");
   const app = express();
   app.use(express.json());

   // Basic route
   app.get("/", (req, res) => {
     res.send("Task Manager Backend!");
   });

   // Start server
   app.listen(5000, () => console.log("Server running on port 5000"));
   ```  

#### **Step 2: User Authentication (JWT)**  
1. **Login Route**  
   ```javascript
   // backend/routes/auth.js
   const jwt = require("jsonwebtoken");
   const router = require("express").Router();

   router.post("/login", (req, res) => {
     const { email, password } = req.body;
     // Check password (simplified example)
     if (email === "test@example.com" && password === "123") {
       const token = jwt.sign({ email }, "yourSecretKey"); // Create token
       res.json({ token });
     } else {
       res.status(401).send("Invalid email/password");
     }
   });
   ```  

#### **Step 3: Task Management**  
1. **Task Creation Route**  
   ```javascript
   // backend/routes/tasks.js
   const router = require("express").Router();
   let tasks = []; // Temporary storage (use a database later)

   router.post("/tasks", (req, res) => {
     const { title, deadline } = req.body;
     tasks.push({ title, deadline });
     res.send("Task added!");
   });
   ```  

#### **Step 4: Frontend (React.js)**  
1. **Create React App**  
   ```bash
   npx create-react-app frontend
   cd frontend
   npm install react-bootstrap axios socket.io-client
   ```  
2. **Login Component**  
   ```javascript
   // frontend/src/Login.js
   import React, { useState } from "react";
   import { Button, Form } from "react-bootstrap";
   import axios from "axios";

   function Login() {
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");

     const handleLogin = async () => {
       try {
         const res = await axios.post("http://localhost:5000/login", { email, password });
         localStorage.setItem("token", res.data.token); // Save token
         alert("Logged in!");
       } catch (err) {
         alert("Login failed!");
       }
     };

     return (
       <Form>
         <Form.Group>
           <Form.Label>Email</Form.Label>
           <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
         </Form.Group>
         <Form.Group>
           <Form.Label>Password</Form.Label>
           <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
         </Form.Group>
         <Button onClick={handleLogin}>Login</Button>
       </Form>
     );
   }
   ```  

#### **Step 5: Real-Time Chat (Socket.io)**  
1. **Backend Socket Setup**  
   ```javascript
   // backend/server.js
   const http = require("http");
   const { Server } = require("socket.io");
   const app = require("./app");
   const server = http.createServer(app);
   const io = new Server(server);

   io.on("connection", (socket) => {
     socket.on("message", (msg) => {
       io.emit("message", msg); // Broadcast message to all users
     });
   });
   ```  
2. **Frontend Chat Component**  
   ```javascript
   // frontend/src/Chat.js
   import React, { useState, useEffect } from "react";
   import { Form, Button } from "react-bootstrap";
   import io from "socket.io-client";

   const socket = io("http://localhost:5000");

   function Chat() {
     const [message, setMessage] = useState("");
     const [messages, setMessages] = useState([]);

     useEffect(() => {
       socket.on("message", (msg) => {
         setMessages([...messages, msg]);
       });
     }, [messages]);

     const sendMessage = () => {
       socket.emit("message", message);
       setMessage("");
     };

     return (
       <div>
         <div>
           {messages.map((msg, index) => (
             <p key={index}>{msg}</p>
           ))}
         </div>
         <Form>
           <Form.Control value={message} onChange={(e) => setMessage(e.target.value)} />
           <Button onClick={sendMessage}>Send</Button>
         </Form>
       </div>
     );
   }
   ```  

---

### **4. Deployment (Heroku)**  
1. **Create a Heroku Account**  
   - Sign up at [heroku.com](https://www.heroku.com/).  
2. **Deploy Backend**  
   ```bash
   cd backend
   heroku create
   git push heroku master
   ```  
3. **Deploy Frontend**  
   - Build React app: `npm run build`.  
   - Use Netlify (free) or Heroku to host the `build` folder.  

---

### **5. Testing**  
1. **Manual Testing**  
   - Test login, task creation, and chat functionality.  
2. **Automated Testing (Optional)**  
   ```javascript
   // Example test for login
   test("Login with valid credentials returns token", async () => {
     const res = await axios.post("/login", { email: "test@example.com", password: "123" });
     expect(res.data.token).toBeDefined();
   });
   ```  

---

### **6. Challenges & Solutions**  
| **Challenge**               | **Solution**                                      |  
|------------------------------|---------------------------------------------------|  
| Real-time chat not working   | Use Socket.io for instant messaging.              |  
| Login fails                  | Check JWT token generation and storage.          |  
| Tasks not saving             | Replace temporary task array with a database.     |  

---

### **7. Grading Checklist**  
**Core Features (70 Marks)**  
- [ ] Login/Logout functionality (JWT).  
- [ ] Task creation and display.  
- [ ] Real-time chat between users.  
- [ ] App hosted online (Heroku/Netlify).  

**Advanced Features (30 Bonus Marks)**  
- [ ] Google Login integration.  
- [ ] Email notifications (e.g., Nodemailer).  
- [ ] Tasks can be edited/deleted.  

---

### **8. Submission Files**  
1. **Code Files**  
   - Backend (Node.js): `server.js`, `auth.js`, `tasks.js`.  
   - Frontend (React.js): `Login.js`, `TaskList.js`, `Chat.js`.  
2. **Documentation**  
   - This report.  
   - Screenshots of working features.  
3. **Deployment Link**  
   - Example: `https://your-task-manager.herokuapp.com`.  

---

**Student Declaration:**  
*I confirm that this project is my own work and has not been copied from any other source.*  
**Name:** __________________________  
**Registration Number:** ___________  
**Date:** __________________________  

--- 

**Lecturer’s Feedback:**  
- **Strengths:** ________________________________  
- **Areas for Improvement:** ______________________  
- **Marks Awarded:** ______/100  

--- 

**Need Help?**  
- Watch tutorials on YouTube:  
  - "Node.js + React.js Full Course for Beginners"  
  - "Deploy React App to Heroku"  
- Ask your lecturer or classmates!  

**Good Luck!** 🌟
