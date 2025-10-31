import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExchangeSkill from './ExchangeSkill';
import TaskMarketplace from './TaskMarketplace';
import CampusCommunity from './CampusCommunity';

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
    <div className="header">
      <h1>Hi 👋</h1>
      <p>Ready to Learn, Teach, or Earn Today?</p>
    </div>

    <div className="main-options">
      <Link to="/teach" className="option-card dummy">
        <span role="img" aria-label="teach">🧑‍🏫</span>
        <p>Teach Skill</p>
      </Link>

      <Link to="/learn" className="option-card dummy">
        <span role="img" aria-label="learn">🎓</span>
        <p>Learn Skill</p>
      </Link>

      <Link to="/exchange" className="option-card main-func">
        <span role="img" aria-label="exchange">🤝</span>
        <p>Exchange Skill</p>
      </Link>

      <Link to="/tasks" className="option-card main-func">
        <span role="img" aria-label="tasks">💼</span>
        <p>Task Marketplace</p>
      </Link>

      <Link to="/community" className="option-card main-func">
        <span role="img" aria-label="community">🎓</span>
        <p>Campus Community</p>
      </Link>

      <Link to="/rewards" className="option-card dummy">
        <span role="img" aria-label="rewards">🏆</span>
        <p>Rewards</p>
      </Link>
    </div>

    <div className="bottom-nav">
      <Link to="/" className="nav-item active">Home</Link>
      <Link to="/tasks" className="nav-item">Tasks</Link>
      <Link to="/notes" className="nav-item">Notes</Link>
      <Link to="/rewards" className="nav-item">Rewards</Link>
      <Link to="/profile" className="nav-item">Profile</Link>
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
        <Route path="/teach" element={<DummyPage title="Teach a Skill" />} />
        <Route path="/learn" element={<DummyPage title="Learn a Skill" />} />
        <Route path="/community" element={<CampusCommunity />} />
        <Route path="/rewards" element={<DummyPage title="Rewards & Wallet" />} />
        <Route path="/profile" element={<DummyPage title="Profile Page" />} />
        <Route path="/notes" element={<DummyPage title="Notes" />} />
      </Routes>
    </Router>
  );
}

export default App;
