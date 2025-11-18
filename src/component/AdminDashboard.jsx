import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, apiCall } from '../utils/auth';
import API_BASE_URL from '../config';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newProject, setNewProject] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [selectedProject, setSelectedProject] = useState('');
  const [newResource, setNewResource] = useState({ user_id: '', designation: '', allocation_percentage: '' });

  useEffect(() => {
    if (!getToken()) navigate(`/login`);
    loadUsers();
    loadProjects();
  }, []);

  const loadUsers = async () => setUsers(await apiCall(`${API_BASE_URL}/admin/users`));
  const loadProjects = async () => setProjects(await apiCall(`${API_BASE_URL}/admin/projects`));

  const addUser = async () => {
    await apiCall(`${API_BASE_URL}/admin/user`, { method: 'POST', body: JSON.stringify(newUser) });
    loadUsers();
  };

  const deleteUser = async (id) => {
    await apiCall(`${API_BASE_URL}/admin/user/${id}`, { method: 'DELETE' });
    loadUsers();
  };

  const addProject = async () => {
    await apiCall(`${API_BASE_URL}/admin/project`, { method: 'POST', body: JSON.stringify(newProject) });
    loadProjects();
  };

  const assignResource = async () => {
    await apiCall(`${API_BASE_URL}/admin/project/${selectedProject}/resource`, { method: 'POST', body: JSON.stringify(newResource) });
    loadProjectResources(selectedProject);
  };

  const loadProjectResources = async (id) => {
    const resources = await apiCall(`${API_BASE_URL}/admin/project/${id}/resources`);
    console.log(resources); // Display in table
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</button>

      {/* Employee CRUD */}
      <section>
        <h2>Employees</h2>
        <input placeholder="Name" onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <select onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="user">User</option>
        </select>
        <button onClick={addUser}>Add User</button>
        <ul>{users.map(u => <li key={u._id}>{u.name} ({u.email}) <button onClick={() => deleteUser(u._id)}>Delete</button></li>)}</ul>
      </section>

      {/* Project CRUD & Resources */}
      <section>
        <h2>Projects</h2>
        <input placeholder="Name" onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
        <input placeholder="Description" onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
        <input type="date" onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })} />
        <input type="date" onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })} />
        <button onClick={addProject}>Add Project</button>
        <ul>{projects.map(p => <li key={p._id}>{p.name} <button onClick={() => setSelectedProject(p._id)}>View Resources</button></li>)}</ul>

        {selectedProject && (
          <>
            <h3>Assign Resource to Project {selectedProject}</h3>
            <select onChange={(e) => setNewResource({ ...newResource, user_id: e.target.value })}>
              <option>Select User</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input placeholder="Designation" onChange={(e) => setNewResource({ ...newResource, designation: e.target.value })} />
            <input type="number" placeholder="Allocation %" onChange={(e) => setNewResource({ ...newResource, allocation_percentage: e.target.value })} />
            <button onClick={assignResource}>Assign</button>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;