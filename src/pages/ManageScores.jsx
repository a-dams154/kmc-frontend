import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Plus, Edit, Trash2, Search, Filter, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css'; // ensure styles like dashboard-title and filters-bar work

const EVENT_NAMES = [
  "CARNATIC MUSIC- MALE/ FEMALE", "LIGHT MUSIC", "MAPPILAPAATTU", "WESTERN SOLO", "GHAZAL", "WHISTLING A SONG", "STRING- EASTERN/WESTERN", "WIND- EASTERN/WESTERN", "PERCUSSION- EASTERN/WESTERN", "KEYBOARD", "DUET", "GROUP SONG EASTERN", "NADANPAATTU", "JUGALBANDHI", "UNPLUGGED", "EASTERN BAND", "WESTERN BAND", "DUFFMUTT", "VATTAPATU", "VANCHIPAATTU", "ARABANAMUTTU", "BHARATHANATYAM", "KUCHIPUDI", "MOHINIYATTAM", "KERALANADANAM", "FOLK DANCE", "SOLO DANCE", "SYNC DANCE", "DUET DANCE", "SPOT DANCE", "OPPANA", "MARGAMKALI", "THIRUVATHIRA", "VIDEO CHOREOGRAPHY", "NOSTALGIA", "CHOREONIGHT", "POORAKKALI", "OTTANTHULLAL", "CHAKYARKOOTH", "KOLKALI", "PENCIL DRAWING", "WATER COLOURING", "OIL PAINTING", "CARTOONING", "CARICATURE", "POSTER MAKING", "COLLAGE", "SOAP CARVING", "FRUIT/ VEGETABLE CARVING", "CLAY MODELING", "ORIGAMI", "EMBROIDERY", "FACE PAINTING", "JAM SKETCHING", "RANGOLI", "MEHANDI", "DIGITAL PAINTING", "INSTALLATION", "DIGITAL POSTER", "MONOACT", "ACTING ON SPOT", "MIMICRY", "FANCY DRESS", "KADHAPRASANGAM", "DUMB CHARADES - E/M", "MIME", "MEDI SKIT", "MOVIE SPOOF", "SONG SPOOF", "ADZAP", "FILMI FUNDA", "POTPOURI", "STREETPLAY", "DRAMA", "RECITATION - E/M H", "ELOCUTION - E/M/H", "EXTEMPORE - E/M/H", "DEBATE - E/M", "AM - E/M", "PROS & CONS - E/M", "MOCK THE PRESS", "TOM, DICK & HARRY", "Mr. & Ms. SP", "DECLAMATION", "AKSHARASLOKAM", "ESSAY WRITING - E/ M/ H/S/A", "STORY WRITING - E/M/H/S/A", "VERSIFICATION - E/M/H/S/A", "CREATIVE WRITING - E/M/H/S/A", "QUIZ", "FASHION SHOW", "PHOTOGRAPHY", "TRAILER MAKING", "SHORT FILM"
];

const ManageScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: '',
    eventName: '',
    eventType: 'individual',
    point: '',
    prize: '',
    batch: '',
    category: '',
    eventDate: new Date().toISOString().split('T')[0]
  });

  const fetchScores = async () => {
    try {
      const response = await api.get('/scores');
      setScores(response.data.results || []);
    } catch (error) {
      toast.error('Failed to fetch scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      eventName: '',
      eventType: 'individual',
      point: '',
      prize: '',
      batch: '',
      category: '',
      eventDate: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/scores/${editingId}`, formData);
        toast.success('Score updated successfully');
      } else {
        await api.post('/scores', formData);
        toast.success('Score added successfully');
      }
      fetchScores();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (score) => {
    setFormData({
      studentName: score.studentName,
      eventName: score.eventName,
      eventType: score.eventType,
      point: score.point,
      prize: score.prize,
      batch: score.batch,
      category: score.category || '',
      eventDate: score.eventDate ? score.eventDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(score._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score deleted');
      fetchScores();
    } catch (error) {
      toast.error('Failed to delete score');
    }
  };

  const filteredScores = scores.filter(s =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">Score Management</h1>
          <p className="dashboard-subtitle">Manage all student event scores in one place.</p>
        </div>
      </header>

      <div className="filters-bar" style={{ marginBottom: '2rem' }}>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search students, events, or batches..."
            className="input-field search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => navigate('/add-score')}
          className="btn-primary"
          style={{ height: '44px', padding: '0 1.5rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={20} />
          <span>Add Score</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Event</th>
                <th>Type</th>
                <th>Batch</th>
                <th>Points</th>
                <th>Prize</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => (
                <tr key={score._id}>
                  <td style={{ fontWeight: 600 }}>{score.studentName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{score.eventName}</td>
                  <td>
                    <span className={`type-icon ${score.eventType === 'individual' ? 'type-i' : 'type-g'}`}>
                      {score.eventType === 'individual' ? 'I' : 'G'}
                    </span>
                  </td>
                  <td>{score.batch}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 'bold' }}>{score.point}</td>
                  <td>
                    <span className={`prize-badge ${score.prize.toLowerCase() === 'gold' ? 'prize-gold' :
                      score.prize.toLowerCase() === 'silver' ? 'prize-silver' :
                        score.prize.toLowerCase() === 'bronze' ? 'prize-bronze' : 'prize-part'
                      }`}>
                      {score.prize}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(score.eventDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(score)} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(score._id)} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>No scores found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-main)' }}>{editingId ? 'Edit Score' : 'Add New Score'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Student Name</label>
                <input type="text" name="studentName" className="input-field" value={formData.studentName} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Event Name</label>
                <input type="text" name="eventName" list="eventNamesList" className="input-field" placeholder="Select or type event name" value={formData.eventName} onChange={handleInputChange} required />
                <datalist id="eventNamesList">
                  {EVENT_NAMES.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Event Type</label>
                <select name="eventType" className="input-field" value={formData.eventType} onChange={handleInputChange}>
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Points</label>
                <input type="number" name="point" className="input-field" value={formData.point} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Prize</label>
                <input type="text" name="prize" className="input-field" value={formData.prize} onChange={handleInputChange} placeholder="e.g. Gold" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Batch</label>
                <input type="text" name="batch" className="input-field" value={formData.batch} onChange={handleInputChange} placeholder="e.g. 2024-A" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Category</label>
                <select name="category" className="input-field" value={formData.category} onChange={handleInputChange} required>
                  <option value="" disabled>Select Category</option>
                  <option value="Music">Music</option>
                  <option value="Dance">Dance</option>
                  <option value="Fine Arts">Fine Arts</option>
                  <option value="Theatre">Theatre</option>
                  <option value="Oratory">Oratory</option>
                  <option value="Literary">Literary</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Event Date</label>
                <input type="date" name="eventDate" className="input-field" value={formData.eventDate} onChange={handleInputChange} required />
              </div>

              <div style={{ gridColumn: '1 / -1', paddingTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                  <Save size={20} />
                  {editingId ? 'Update Score' : 'Save Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageScores;
