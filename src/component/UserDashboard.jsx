import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, apiCall } from "../utils/auth";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!getToken()) navigate("/login");
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const projs = await apiCall("/api/user/projects");
    setProjects(projs);
  };

  const loadProject = async (id) => {
    const proj = await apiCall(`/api/user/project/${id}`);
    const summ = await apiCall(`/api/user/project/${id}/summary`);
    setSelectedProject(proj);
    setSummary(summ);
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1>User Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>

        <section>
          <h2>Assigned Projects</h2>
          <ul>
            {projects.map((p) => (
              <li key={p._id}>
                {p.name}{" "}
                <button onClick={() => loadProject(p._id)}>View Details</button>
              </li>
            ))}
          </ul>
        </section>

        {selectedProject && (
          <section>
            <h2>Project Details: {selectedProject.name}</h2>
            <p>{selectedProject.description}</p>
            <p>Start: {new Date(selectedProject.start_date).toDateString()}</p>
            <p>End: {new Date(selectedProject.end_date).toDateString()}</p>
            {summary && (
              <div>
                <h3>Workload Summary</h3>
                <p>Total Allocation: {summary.totalAlloc}%</p>
                <p>Remaining Availability: {summary.availability}%</p>
                <p>Duration: {summary.duration} days</p>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
