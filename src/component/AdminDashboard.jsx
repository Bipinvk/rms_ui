import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, apiCall } from "../utils/auth";
import API_BASE_URL from "../config";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' or 'projects'
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0], // Default to today
    end_date: "",
  });
  const [selectedProject, setSelectedProject] = useState(null); // Change to full project object
  const [newResource, setNewResource] = useState({
    user_id: "",
    designation: "",
    allocation_percentage: "",
  });
  const [loading, setLoading] = useState(false); // Global loading for actions

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    loadUsers();
    loadProjects();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setUsers(await apiCall(`${API_BASE_URL}/admin/users`));
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  const loadProjects = async () => {
    try {
      setProjects(await apiCall(`${API_BASE_URL}/admin/projects`));
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all user fields");
      return;
    }
    setLoading(true);
    try {
      await apiCall(`${API_BASE_URL}/admin/user`, {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      toast.success("User added successfully!");
      setNewUser({ name: "", email: "", password: "", role: "user" });
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      await apiCall(`${API_BASE_URL}/admin/user/${id}`, { method: "DELETE" });
      toast.success("User deleted successfully!");
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (
      !newProject.name ||
      !newProject.description ||
      !newProject.start_date ||
      !newProject.end_date
    ) {
      toast.error("Please fill all project fields");
      return;
    }
    if (new Date(newProject.start_date) > new Date(newProject.end_date)) {
      toast.error("Start date must be before end date");
      return;
    }
    setLoading(true);
    try {
      await apiCall(`${API_BASE_URL}/admin/project`, {
        method: "POST",
        body: JSON.stringify(newProject),
      });
      toast.success("Project added successfully!");
      setNewProject({
        ...newProject,
        name: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
      loadProjects();
    } catch (err) {
      toast.error(err.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      await loadProjectResources(projectId);
    }
  };

  const loadProjectResources = async (id) => {
    try {
      const res = await apiCall(
        `${API_BASE_URL}/admin/project/${id}/resources`
      );
      setResources(res);
    } catch (err) {
      toast.error("Failed to load resources");
    }
  };

  const assignResource = async () => {
    if (
      !newResource.user_id ||
      !newResource.designation ||
      !newResource.allocation_percentage
    ) {
      toast.error("Please fill all resource fields");
      return;
    }
    if (
      parseInt(newResource.allocation_percentage) < 0 ||
      parseInt(newResource.allocation_percentage) > 100
    ) {
      toast.error("Allocation percentage must be between 0 and 100");
      return;
    }
    setLoading(true);
    try {
      await apiCall(
        `${API_BASE_URL}/admin/project/${selectedProject._id}/resource`,
        {
          method: "POST",
          body: JSON.stringify(newResource),
        }
      );
      toast.success(
        `Resource assigned to ${selectedProject.name} successfully!`
      );
      setNewResource({
        user_id: "",
        designation: "",
        allocation_percentage: "",
      });
      loadProjectResources(selectedProject._id);
    } catch (err) {
      toast.error(err.message || "Failed to assign resource");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.warn("Please select a file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File too large (max 5MB)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await apiCall(
        `${API_BASE_URL}/admin/project/${selectedProject._id}/documents`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const updatedProj = response.project; // Extract from response
      setSelectedProject(updatedProj); // Update state with new documents array
      toast.success(`Document uploaded to ${selectedProject.name}!`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset input
    }
  };
  const clearSelectedProject = () => {
    setSelectedProject(null);
    setResources([]);
  };

  const Spinner = () => (
    <div
      style={{
        width: "16px",
        height: "16px",
        border: "2px solid #fff",
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0, color: "#333" }}>Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          Logout
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #dee2e6",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("employees")}
          style={{
            padding: "12px 24px",
            backgroundColor:
              activeTab === "employees" ? "#007bff" : "transparent",
            color: activeTab === "employees" ? "white" : "#333",
            border: "none",
            borderBottom:
              activeTab === "employees" ? "2px solid #007bff" : "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Employees Management
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            padding: "12px 24px",
            backgroundColor:
              activeTab === "projects" ? "#007bff" : "transparent",
            color: activeTab === "projects" ? "white" : "#333",
            border: "none",
            borderBottom:
              activeTab === "projects" ? "2px solid #007bff" : "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Project Management
        </button>
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <section
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Employees</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={addUser}
              disabled={loading}
              style={{
                padding: "10px",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? <Spinner /> : null}
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {u.name}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {u.role}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <button
                        onClick={() => deleteUser(u._id)}
                        disabled={loading}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <section
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Projects</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <input
              placeholder="Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <input
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <input
              type="date"
              value={newProject.start_date}
              onChange={(e) =>
                setNewProject({ ...newProject, start_date: e.target.value })
              }
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <input
              type="date"
              value={newProject.end_date}
              onChange={(e) =>
                setNewProject({ ...newProject, end_date: e.target.value })
              }
              min={newProject.start_date}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
            />
            <button
              onClick={addProject}
              disabled={loading}
              style={{
                padding: "10px",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? <Spinner /> : null}
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Start Date
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    End Date
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {p.name}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {p.description}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {new Date(p.start_date).toDateString()}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {new Date(p.end_date).toDateString()}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <button
                        onClick={() => selectProject(p._id)}
                        disabled={loading}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          marginRight: "5px",
                        }}
                      >
                        View Resources
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resources Assignment Section (only if project selected) */}
          {selectedProject && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0, color: "#333" }}>
                  Resources for {selectedProject.name}
                </h3>
                <button
                  onClick={clearSelectedProject}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Back to Projects
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <select
                  value={newResource.user_id}
                  onChange={(e) =>
                    setNewResource({ ...newResource, user_id: e.target.value })
                  }
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  disabled={loading}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Designation"
                  value={newResource.designation}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      designation: e.target.value,
                    })
                  }
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  disabled={loading}
                />
                <input
                  type="number"
                  placeholder="Allocation %"
                  value={newResource.allocation_percentage}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      allocation_percentage: e.target.value,
                    })
                  }
                  min="0"
                  max="100"
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  disabled={loading}
                />
                <button
                  onClick={assignResource}
                  disabled={loading}
                  style={{
                    padding: "10px",
                    backgroundColor: loading ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? <Spinner /> : null}
                  {loading ? "Assigning..." : "Assign Resource"}
                </button>
              </div>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>
                Assigned Resources
              </h4>
              <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e9ecef" }}>
                      <th
                        style={{
                          padding: "10px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        User
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        Designation
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        Allocation %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((r) => (
                      <tr key={r._id}>
                        <td
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          {r.user_id?.name || "N/A"}
                        </td>
                        <td
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          {r.designation}
                        </td>
                        <td
                          style={{ padding: "10px", border: "1px solid #ddd" }}
                        >
                          {r.allocation_percentage}%
                        </td>
                      </tr>
                    ))}
                    {resources.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#6c757d",
                          }}
                        >
                          No resources assigned yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Document Upload Section */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "6px",
                }}
              >
                <h4 style={{ margin: 0, marginBottom: "15px", color: "#333" }}>
                  Upload Document for {selectedProject.name}
                </h4>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png" // Limit file types
                    onChange={uploadDocument}
                    disabled={loading}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <button
                    onClick={() => {
                      document.querySelector('input[type="file"]').value = "";
                    }}
                    disabled={loading}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: loading ? "#ccc" : "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Project Documents List */}
              <h4
                style={{
                  marginBottom: "10px",
                  color: "#333",
                  marginTop: "20px",
                }}
              >
                Project Documents
              </h4>
              {selectedProject.documents &&
              selectedProject.documents.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {selectedProject.documents.map((doc, idx) => (
                    <li key={idx} style={{ marginBottom: "5px" }}>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", textDecoration: "none" }}
                      >
                        📄 Document {idx + 1} ({doc.split("/").pop()})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#6c757d", fontStyle: "italic" }}>
                  No documents uploaded yet.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        table th, table td { font-size: 14px; }
        input:focus, select:focus { outline: none; border-color: #007bff; }
        button:hover:not(:disabled) { opacity: 0.9; }
        p { margin: '5px 0'; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
