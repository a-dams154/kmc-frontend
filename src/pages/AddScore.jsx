import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import './AddScore.css';

const EVENT_NAMES = [
  "CARNATIC MUSIC- MALE/ FEMALE", "LIGHT MUSIC- MALE/FEMALE", "MAPPILAPAATTU- MALE/FEMALE", "WESTERN SOLO- MALE/FEMALE", "GHAZAL- MALE/FEMALE", "WHISTLING A SONG", "STRING- EASTERN/WESTERN", "WIND- EASTERN/WESTERN", "PERCUSSION- EASTERN/WESTERN", "KEYBOARD", "DUET", "GROUP SONG EASTERN", "NADANPAATTU", "JUGALBANDHI", "UNPLUGGED", "EASTERN BAND", "WESTERN BAND", "DUFFMUTT", "VATTAPATU", "VANCHIPAATTU", "ARABANAMUTTU", "BHARATHANATYAM", "KUCHIPUDI", "MOHINIYATTAM", "KERALANADANAM", "FOLK DANCE", "SOLO DANCE-MALE/FEMALE", "SYNC DANCE -MALE/FEMALE", "DUET DANCE", "SPOT DANCE- MALE/FEMALE", "OPPANA", "MARGAMKALI", "THIRUVATHIRA", "VIDEO CHOREOGRAPHY", "NOSTALGIA", "CHOREONIGHT", "POORAKKALI", "OTTANTHULLAL", "CHAKYARKOOTH", "KOLKALI", "PENCIL DRAWING", "WATER COLOURING", "OIL PAINTING", "CARTOONING", "CARICATURE", "POSTER MAKING", "COLLAGE", "SOAP CARVING", "FRUIT/ VEGETABLE CARVING", "CLAY MODELING", "ORIGAMI", "EMBROIDERY", "FACE PAINTING", "JAM SKETCHING", "RANGOLI", "MEHANDI", "DIGITAL PAINTING", "INSTALLATION", "DIGITAL POSTER", "MONOACT", "ACTING ON SPOT", "MIMICRY", "FANCY DRESS", "KADHAPRASANGAM", "DUMB CHARADES - E/M", "MIME", "MEDI SKIT", "MOVIE SPOOF", "SONG SPOOF", "ADZAP", "FILMI FUNDA", "POTPOURI", "STREETPLAY", "DRAMA", "RECITATION - E/M H", "ELOCUTION - E/M/H", "EXTEMPORE - E/M/H", "DEBATE - E/M", "AM - E/M", "PROS & CONS - E/M", "MOCK THE PRESS", "TOM, DICK & HARRY", "Mr. & Ms. SP", "DECLAMATION", "AKSHARASLOKAM", "ESSAY WRITING - E/ M/ H/S/A", "STORY WRITING - E/M/H/S/A", "VERSIFICATION - E/M/H/S/A", "CREATIVE WRITING - E/M/H/S/A", "QUIZ", "FASHION SHOW", "PHOTOGRAPHY", "TRAILER MAKING", "SHORT FILM"
];

const AddScore = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    eventName: '',
    eventType: 'Individual',
    category: '',
    point: 0,
    prize: '',
    batch: '',
    eventDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prize || formData.prize === 'Select Prize') {
      toast.error('Please select a prize');
      return;
    }
    if (!formData.batch || formData.batch === 'Select Batch') {
      toast.error('Please select a batch');
      return;
    }

    setLoading(true);
    try {
      await api.post('/scores', {
        ...formData,
        eventType: formData.eventType.toLowerCase()
      });
      toast.success('Score added successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-score-wrapper">
      <div className="add-score-modal">
        <div className="modal-header">
          <div className="header-left">
            <Plus size={24} />
            <h2>Add New Score</h2>
          </div>
          <button className="close-btn" onClick={() => navigate(-1)}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group full-width">
            <label>Student Name <span className="required">*</span></label>
            <input
              type="text"
              name="studentName"
              placeholder="Enter student name"
              value={formData.studentName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Event Name <span className="required">*</span></label>
            <input
              type="text"
              name="eventName"
              list="eventNamesList"
              placeholder="Select or type event name"
              value={formData.eventName}
              onChange={handleInputChange}
              required
            />
            <datalist id="eventNamesList">
              {EVENT_NAMES.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type <span className="required">*</span></label>
              <select name="eventType" value={formData.eventType} onChange={handleInputChange}>
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Points <span className="required">*</span></label>
              <input
                type="number"
                name="point"
                value={formData.point}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Prize <span className="required">*</span></label>
              <select name="prize" value={formData.prize} onChange={handleInputChange} required>
                <option value="">Select Prize</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Batch <span className="required">*</span></label>
              <select name="batch" value={formData.batch} onChange={handleInputChange} required>
                <option value="">Select Batch</option>
                <option value="2024-A">2024-A</option>
                <option value="2024-B">2024-B</option>
                <option value="2023-C">2023-C</option>
              </select>
            </div>

            <div className="form-group">
              <label>Event Date <span className="required">*</span></label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScore;
