import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createResource } from '../utils/api';
import { X, Plus, Building2, MapPin, Users, Layers, Wrench } from 'lucide-react';

export default function AddResourceModal({ onClose, onSuccess, departments = [], initialCategory = 'Laboratories' }) {
  const { user, addToast } = useApp();

  const categories = [
    'Classrooms',
    'Laboratories',
    'Seminar Halls',
    'Auditoriums',
    'Projectors',
    'Laptops',
    'Cameras',
    'Technical Equipment',
    'Sports Facilities',
    'Other Resources'
  ];

  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [department, setDepartment] = useState(user?.role === 'hod' ? user.department : (departments[0]?.name || 'Computer Science'));
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [description, setDescription] = useState('');
  const [equipmentStr, setEquipmentStr] = useState('');
  const [availability, setAvailability] = useState('Mon - Fri, 08:00 - 18:00');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !location) {
      addToast('Please fill in all required fields.', 'danger');
      return;
    }

    setLoading(true);
    try {
      const equipmentArray = equipmentStr ? equipmentStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newRes = await createResource({
        name,
        category,
        department,
        location,
        capacity: parseInt(capacity, 10),
        description,
        equipment: equipmentArray,
        availability,
        status
      });

      addToast(`Resource "${name}" added to catalog successfully.`, 'success');
      if (onSuccess) onSuccess(newRes.resource);
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to add resource.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
              RESOURCE CATALOG MANAGEMENT
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              + Add New Resource
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resource Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AI Robotics Lab 03 or Sony Cinema Camera #02"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Resource Category *</label>
              <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Managing Department *</label>
              {user?.role === 'hod' ? (
                <input
                  type="text"
                  className="form-control"
                  value={user.department}
                  disabled
                  style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                />
              ) : (
                <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required>
                  {departments.length > 0 ? (
                    departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))
                  ) : (
                    <option value="Computer Science">Computer Science</option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Location (Building / Room) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Block A - Room 302"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity (Seats / Units) *</label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Resource Description & Usage Notes</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detailed explanation of specs, suitable use cases, and rules..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Equipment & Facilities (Comma Separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. RTX 4090 GPUs, 4K Projector, Surround Sound, AC"
              value={equipmentStr}
              onChange={e => setEquipmentStr(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Availability Schedule</label>
              <input
                type="text"
                className="form-control"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved / Allotted</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Plus size={18} /> {loading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
