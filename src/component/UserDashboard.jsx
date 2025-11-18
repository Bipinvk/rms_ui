import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, apiCall } from '../utils/auth';
import API_BASE_URL from '../config';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, [navigate]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projs = await apiCall(`${API_BASE_URL}/user/projects`);
      setProjects(projs);
      if (projs.length === 0) {
        toast.info('No projects assigned yet');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (id) => {
    setLoadingProject(true);
    try {
      const proj = await apiCall(`${API_BASE_URL}/user/project/${id}`);
      const summ = await apiCall(`${API_BASE_URL}/user/project/${id}/summary`);
      setSelectedProject(proj);
      setSummary(summ);
      toast.success(`Loaded details for ${proj.name}`);
    } catch (err) {
      toast.error(err.message || 'Failed to load project details');
    } finally {
      setLoadingProject(false);
    }
  };

  const clearSelectedProject = () => {
    setSelectedProject(null);
    setSummary(null);
  };

  const Spinner = () => (
    <div style={{ 
      width: '16px', 
      height: '16px', 
      border: '2px solid #fff', 
      borderTop: '2px solid transparent', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
  );

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>User Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
          disabled={loading}
        >
          Logout
        </button>
      </div>

      {/* Assigned Projects Section */}
      <section style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Assigned Projects</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <Spinner />
            <p>Loading projects...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Start Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>End Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.description}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(p.start_date).toDateString()}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(p.end_date).toDateString()}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button 
                        onClick={() => loadProject(p._id)} 
                        disabled={loadingProject}
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: loadingProject ? '#ccc' : '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: loadingProject ? 'not-allowed' : 'pointer' 
                        }}
                      >
                        {loadingProject ? <Spinner /> : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      No projects assigned yet. Check back later!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Selected Project Details */}
      {selectedProject && (
        <section style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>Project Details: {selectedProject.name}</h2>
            <button 
              onClick={clearSelectedProject} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              Back to Projects
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <p><strong>Description:</strong> {selectedProject.description}</p>
              <p><strong>Start Date:</strong> {new Date(selectedProject.start_date).toDateString()}</p>
              <p><strong>End Date:</strong> {new Date(selectedProject.end_date).toDateString()}</p>
            </div>
            {summary && (
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '6px' 
              }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Workload Summary</h3>
                <p><strong>Total Allocation:</strong> {summary.totalAlloc}%</p>
                <p><strong>Remaining Availability:</strong> {summary.availability}%</p>
                <p><strong>Duration:</strong> {summary.duration} days</p>
              </div>
            )}
          </div>
          {!summary && loadingProject && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
              <Spinner />
              <p>Loading summary...</p>
            </div>
          )}

          {/* Documents Display */}
          {selectedProject.documents && selectedProject.documents.length > 0 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px' 
            }}>
              <h4 style={{ marginTop: 0, color: '#333' }}>Project Documents</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedProject.documents.map((doc, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>
                    <a 
                      href={doc} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      📄 Document {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!selectedProject.documents?.length && selectedProject && (
            <p style={{ color: '#6c757d', fontStyle: 'italic', marginTop: '10px' }}>
              No documents available for this project.
            </p>
          )}
        </section>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        table th, table td { font-size: 14px; }
        button:hover:not(:disabled) { opacity: 0.9; }
        p { margin: '5px 0'; }
      `}</style>
    </div>
  );
};

export default UserDashboard;