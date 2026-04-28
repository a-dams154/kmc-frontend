import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  Trophy, Users, Calendar, TrendingUp, Search, Filter,
  ChevronRight, Crown, Medal, Plus, List, LogOut
} from 'lucide-react';
import './Dashboard.css';
//import poster from '../../../frontend/public/poster.jpg';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [rankings, setRankings] = useState({ overall: [] });
  const [batchAverages, setBatchAverages] = useState([]);
  const [eventWinners, setEventWinners] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [typeFilter, setTypeFilter] = useState('All Types');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresRes, rankingsRes, averagesRes, eventWinnersRes] = await Promise.all([
          api.get('/scores'),
          api.get('/rankings/batch'),
          api.get('/rankings/batch-averages'),
          api.get('/rankings/event-winners')
        ]);
        setScores(scoresRes.data.results || []);
        setRankings(rankingsRes.data);
        setBatchAverages(averagesRes.data);
        setEventWinners(eventWinnersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalEvents = scores.length;
    const uniqueStudents = new Set(scores.map(s => s.studentName)).size;
    const goldMedals = scores.filter(s => s.prize?.toLowerCase() === 'gold').length;
    const avgPoints = scores.length > 0
      ? (scores.reduce((acc, curr) => acc + curr.point, 0) / scores.length).toFixed(1)
      : 0;

    return { totalEvents, uniqueStudents, goldMedals, avgPoints };
  }, [scores]);

  // Chart data calculations


  const prizeData = useMemo(() => {
    const pData = {};
    scores.forEach(s => {
      const prize = s.prize || 'Other';
      pData[prize] = (pData[prize] || 0) + 1;
    });
    return Object.keys(pData).map(name => ({ name, value: pData[name] }));
  }, [scores]);

  const typeData = useMemo(() => {
    const tData = {};
    scores.forEach(s => {
      const type = s.eventType || 'Unknown';
      tData[type] = (tData[type] || 0) + 1;
    });
    return Object.keys(tData).map(name => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: tData[name]
    }));
  }, [scores]);

  const filteredEventWinners = useMemo(() => {
    return eventWinners.filter(event => {
      const eName = event.eventName || '';
      const eCat = event.category || '';
      return eName.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        eCat.toLowerCase().includes(eventSearchTerm.toLowerCase());
    });
  }, [eventWinners, eventSearchTerm]);

  const filteredScores = useMemo(() => {
    return scores.filter(s => {
      const studentName = s.studentName || '';
      const eventName = s.eventName || '';
      const eventType = s.eventType || '';

      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBatch = batchFilter === 'All Batches' || s.batch === batchFilter;
      const matchesType = typeFilter === 'All Types' || eventType.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesBatch && matchesType;
    });
  }, [scores, searchTerm, batchFilter, typeFilter]);

  const batches = useMemo(() => {
    return ['All Batches', ...new Set(scores.map(s => s.batch))];
  }, [scores]);

  const PIE_COLORS = ['#c5a059', '#8b5cf6', '#f59e0b', '#10b981'];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dashboard-title">Arts Program Dashboard</h1>
          <p className="dashboard-subtitle">Event Scores & Analytics</p>
        </div>
        {user && (
          <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="list-scores-btn-fancy"
              onClick={() => navigate('/admin')}
            >
              <List size={20} />
              <span>Manage Scores</span>
            </button>
            <button
              className="add-score-btn-fancy"
              onClick={() => navigate('/add-score')}
            >
              <Plus size={20} />
              <span>Add Score</span>
            </button>
            <button
              className="add-score-btn-fancy"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Poster Image */}
      <div style={{ marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'flex', justifyContent: 'center', background: 'var(--bg-card)' }}>
        <img src="/poster.jpg.jpeg" alt="Irambam Interbatch Arts Fest" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: '500px' }} />
      </div>

      {/* Leaderboard Section */}
      <div className="glass-card leaderboard-card">
        <div className="leaderboard-header">
          <Trophy size={24} />
          <span>Points Leaderboard</span>
        </div>
        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Batch</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {rankings.overall.slice(0, 3).map((row, index) => (
                <tr key={row.batch} style={{ backgroundColor: index === 0 ? '#1f1a0a' : index === 1 ? '#0f172a' : '#1a0f05' }}>
                  <td>
                    <div className="rank-badge">
                      {index === 0 ? <Crown size={18} className="text-accent-orange" /> :
                        index === 1 ? <Medal size={18} className="text-slate-400" /> :
                          <Medal size={18} className="text-orange-600" />}
                      <span style={{ color: index === 0 ? '#fcd34d' : index === 1 ? '#cbd5e1' : '#f97316' }}>{row.rank}</span>
                    </div>
                  </td>
                  <td className="font-semibold">{row.batch}</td>
                  <td>
                    <span className="points-pill">{row.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Winners Section */}
      <div className="event-winners-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Trophy size={20} className="text-accent-orange" />
            Event Explorers
          </h2>
          <div className="search-container" style={{ maxWidth: '300px', flex: '1 1 auto' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search events or categories..."
              className="input-field search-input"
              value={eventSearchTerm}
              onChange={(e) => setEventSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="event-explorer-grid">
          {filteredEventWinners && filteredEventWinners.map((event, idx) => (
            <div
              key={idx}
              className={`glass-card event-card ${selectedEvent?.eventName === event.eventName && selectedEvent?.category === event.category ? 'active' : ''}`}
              onClick={() => setSelectedEvent(selectedEvent?.eventName === event.eventName && selectedEvent?.category === event.category ? null : event)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p className="event-name">{event.eventName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="event-category">{event.category}</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>
                    View Results
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted" style={{ transform: selectedEvent?.eventName === event.eventName && selectedEvent?.category === event.category ? 'rotate(90deg)' : '', transition: '0.2s' }} />
            </div>
          ))}
        </div>

        {selectedEvent && (
          <div className="glass-card event-winners-overlay">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="event-name" style={{ fontSize: '1.25rem' }}>{selectedEvent.eventName}</h3>
                <p className="event-category">{selectedEvent.category} - Top Performers</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-text-muted hover:text-primary">Close</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Batch</th>
                    <th>Points</th>
                    <th>Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvent.topThree.map((winner, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="winner-rank">
                          {idx === 0 ? <Crown size={18} className="text-accent-orange" /> :
                            idx === 1 ? <Medal size={18} className="text-slate-400" /> :
                              <Medal size={18} className="text-orange-600" />}
                        </div>
                      </td>
                      <td className="font-semibold">{winner.studentName}</td>
                      <td>{winner.batch}</td>
                      <td className="font-bold text-primary">{winner.point}</td>
                      <td>
                        <span className={`prize-badge ${winner.prize.toLowerCase() === 'gold' ? 'prize-gold' :
                          winner.prize.toLowerCase() === 'silver' ? 'prize-silver' :
                            winner.prize.toLowerCase() === 'bronze' ? 'prize-bronze' : 'prize-part'
                          }`}>
                          {winner.prize}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search students or events..."
            className="input-field search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field filter-select"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          {batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          className="input-field filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>All Types</option>
          <option>Individual</option>
          <option>Group</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="glass-card chart-card">
          <h3 className="chart-title">Batch Average Points</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchAverages}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="batch" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avg" fill="#c5a059" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* <div className="glass-card chart-card">
          <h3 className="chart-title">Prize Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prizeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {prizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      <div className="charts-grid">
        {/* <div className="glass-card chart-card">
          <h3 className="chart-title">Event Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* <div className="glass-card scores-table-card">
          <h3 className="chart-title">Event Scores</h3>
          <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Prize</th>
                  <th>Batch</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((s, i) => (
                  <tr key={s._id || i}>
                    <td className="font-medium">{s.studentName}</td>
                    <td>{s.eventName}</td>
                    <td>
                      <span className={`type-icon ${s.eventType === 'individual' ? 'type-i' : 'type-g'}`}>
                        {s.eventType === 'individual' ? 'I' : 'G'}
                      </span>
                    </td>
                    <td className="font-semibold text-primary">{s.point}</td>
                    <td>
                      <span className={`prize-badge ${s.prize.toLowerCase() === 'gold' ? 'prize-gold' :
                        s.prize.toLowerCase() === 'silver' ? 'prize-silver' :
                          s.prize.toLowerCase() === 'bronze' ? 'prize-bronze' : 'prize-part'
                        }`}>
                        {s.prize}
                      </span>
                    </td>
                    <td>{s.batch}</td>
                    <td className="text-text-muted">{new Date(s.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
