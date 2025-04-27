# Collaborative Task Manager App

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

# GROUP 4

## Members:

1. BITCO1/2043/2022 - Gavin Maleche 
2. C023/401257/2023 - Ulira Dieudonne 
3. CO23/401208 /2023 - Natasha Wambui 
4. C023/401196/2023 - Richard Muhinda               
5. C023/401268/2023 - Vincent Ngisa
6. C023/401239/2023 - Amos Korir 
7. C023/401227/2023 - Kiama Charles

![Dashboard](image/dashboard.png)

## Features

- User Authentication (Login/Register)
- Task Management
  - Create, read, update, and delete tasks
  - Assign tasks to team members
  - Set task priorities and due dates
  - Track task status
- Team Management
  - Create and manage teams
  - Add/remove team members
  - Assign roles (Admin, Member)
- Dashboard with task overview
- Responsive design with Material-UI

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Material-UI for UI components
- Axios for API requests
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
task-manager/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── features/    # Redux slices
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main component
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- PUT /api/auth/profile - Update user profile

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- GET /api/tasks/:id - Get task by ID
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Teams
- GET /api/teams - Get all teams
- POST /api/teams - Create a new team
- GET /api/teams/:id - Get team by ID
- PUT /api/teams/:id - Update team
- DELETE /api/teams/:id - Delete team

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.