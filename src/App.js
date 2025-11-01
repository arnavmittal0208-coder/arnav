import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExchangeSkill from './ExchangeSkill';
import TaskMarketplace from './TaskMarketplace';
import CampusCommunity from './CampusCommunity';
import Profile from './Profile';
import Rewards from './Rewards';
import TeachSkill from './TeachSkill';

// Dummy Component (used for links that are placeholders)
const DummyPage = ({ title }) => (
  <div className="page-container">
    <Link to="/" className="back-link">← Back</Link>
    <h1>{title}</h1>
    <p>This is a placeholder/dummy page to show navigation works.</p>
  </div>
);

const Home = () => (
  <div className="home-container">
    {/* Hero Section */}
    <div className="hero-section">
      <div className="hero-badge">🎓 College Skills Hub</div>
      <h1 className="hero-title">
        Your Campus<br/>
        <span className="gradient-text">Skill Exchange</span> Platform
      </h1>
      <p className="hero-subtitle">
        Connect, Learn, Teach, and Earn with your college community
      </p>
      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">200+</div>
          <div className="stat-label">Skills</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">1000+</div>
          <div className="stat-label">Exchanges</div>
        </div>
      </div>
    </div>

    {/* Featured Categories */}
    <div className="featured-section">
      <h2 className="section-title">What would you like to do?</h2>
      
      <div className="featured-grid">
        <Link to="/teach" className="featured-card teach">
          <div className="card-icon">🧑‍🏫</div>
          <h3>Teach a Skill</h3>
          <p>Share your expertise and help others learn</p>
          <div className="card-arrow">→</div>
        </Link>

        <Link to="/learn" className="featured-card learn">
          <div className="card-icon">📚</div>
          <h3>Learn Something New</h3>
          <p>Discover skills from your peers</p>
          <div className="card-arrow">→</div>
        </Link>

        <Link to="/exchange" className="featured-card exchange">
          <div className="card-icon">🤝</div>
          <h3>Exchange Skills</h3>
          <p>Trade knowledge in a skill swap</p>
          <div className="card-arrow">→</div>
        </Link>

        <Link to="/tasks" className="featured-card tasks">
          <div className="card-icon">💼</div>
          <h3>Task Marketplace</h3>
          <p>Earn by completing campus tasks</p>
          <div className="card-arrow">→</div>
        </Link>
      </div>
    </div>

    {/* Quick Access Section */}
    <div className="quick-access-section">
      <div className="quick-access-grid">
        <Link to="/community" className="quick-card">
          <span className="quick-icon">📖</span>
            <div className="quick-content">
            <div className="quick-title">Campus Community</div>
            <div className="quick-desc">Share resources & notes</div>
          </div>
        </Link>

        <Link to="/rewards" className="quick-card">
          <span className="quick-icon">🏆</span>
            <div className="quick-content">
            <div className="quick-title">Rewards</div>
            <div className="quick-desc">Track your achievements</div>
          </div>
        </Link>
      </div>
    </div>

    {/* Bottom Navigation */}
    <div className="bottom-nav">
      <Link to="/" className="nav-item active">
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </Link>
      <Link to="/tasks" className="nav-item">
        <span className="nav-icon">💼</span>
        <span className="nav-label">Tasks</span>
      </Link>
      <Link to="/community" className="nav-item">
        <span className="nav-icon">📖</span>
        <span className="nav-label">Community</span>
      </Link>
      <Link to="/rewards" className="nav-item">
        <span className="nav-icon">🏆</span>
        <span className="nav-label">Rewards</span>
      </Link>
      <Link to="/profile" className="nav-item">
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exchange" element={<ExchangeSkill />} />
        <Route path="/tasks" element={<TaskMarketplace />} />

        {/* Dummy routes */}
        <Route path="/teach" element={<TeachSkill />} />
        <Route path="/learn" element={<DummyPage title="Learn a Skill" />} />
        <Route path="/community" element={<CampusCommunity />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notes" element={<DummyPage title="Notes" />} />
      </Routes>
    </Router>
  );
}

export default App;
