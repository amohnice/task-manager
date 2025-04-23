import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import TaskDetails from './pages/TaskDetails';
import TeamList from './pages/TeamList';
import TeamForm from './pages/TeamForm';
import TeamDetails from './pages/TeamDetails';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo?.token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks">
            <Route index element={<TaskList />} />
            <Route path="create" element={<TaskForm />} />
            <Route path=":id" element={<TaskDetails />} />
            <Route path=":id/edit" element={<TaskForm />} />
          </Route>
          <Route path="teams">
            <Route index element={<TeamList />} />
            <Route path="create" element={<TeamForm />} />
            <Route path=":id" element={<TeamDetails />} />
            <Route path=":id/edit" element={<TeamForm />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
