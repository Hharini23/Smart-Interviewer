import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Briefcase, Code, User, Rocket, LogOut, Award } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    role: '',
    experienceLevel: 'Entry Level',
    type: 'Technical'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim()) {
      setError("Please enter a role (e.g., Frontend Developer).");
      return;
    }
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews/generate`, formData);
      const interviewId = response.data._id;
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate interview. Check backend connection and API key.");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <div className="dashboard grid-layout">
      
      {/* LEFT COLUMN: Massive Profile Hub */}
      <div className="profile-column">
        <GlassCard className="massive-profile-card">
          <div className="profile-avatar">
            {firstName.charAt(0)}
          </div>
          <h1 className="welcome-text text-gradient">Welcome, {firstName}!</h1>
          <p className="profile-email">{user.email}</p>
          
          <div className="profile-stats">
             <div className="stat-badge">
                <Award size={24} className="accent" />
                <span>Ready to Ace IT!</span>
             </div>
          </div>

          <button className="massive-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Log Out Securely
          </button>
        </GlassCard>
      </div>

      {/* RIGHT COLUMN: The Action Hub */}
      <div className="action-column">
        <div className="dashboard-header">
          <h2 className="title-secondary">Launch New Mock Interview</h2>
          <p className="subtitle">AI-powered interviews tailored to your exact role.</p>
        </div>

        <GlassCard className="setup-card interactive">
          {error && <div className="error-message">{error}</div>}
          
          <form className="setup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Role / Position</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="" disabled>Select a Role</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                  <option value="Blockchain Developer">Blockchain Developer</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Experience Level</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <select 
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  >
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (5+ years)</option>
                  </select>
                </div>
              </div>

              <div className="form-group flex-1">
                <label>Interview Type</label>
                <div className="input-with-icon">
                  <Code size={18} className="input-icon" />
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR / Behavioral">HR / Behavioral</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              fullWidth 
              isLoading={isLoading} 
              className="mt-4 setup-launch-btn"
            >
              <Rocket size={20} />
              {isLoading ? 'Generating Context...' : 'Start Interview Now'}
            </Button>
          </form>
        </GlassCard>
      </div>

    </div>
  );
};

export default Dashboard;
