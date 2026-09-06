import React, { useState, useEffect } from 'react';
import { fetchResources, createResource } from '../utils/api';
import { useApp } from '../context/AppContext';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';
import { Search, Plus, Filter, Layers, X } from 'lucide-react';

export default function ResourcesPage() {
  const { departments, activeDept, addToast, refreshData } = useApp();

  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  // New Resource Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Equipment');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [hourlyCreditCost, setHourlyCreditCost] = useState(25);
  const [specifications, setSpecifications] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadResources = async () => {
    try {
      const data = await fetchResources({
        category: selectedCategory,
        department: selectedDept,
        search: searchQuery
      });
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedCategory, selectedDept, searchQuery]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!name || !specifications) {
      addToast('Please enter resource name and specifications.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await createResource({
        name,
        category,
        type: type || category,
        ownerDepartmentId: activeDept?.id || 'dept-eng',
        ownerDepartmentName: activeDept?.name || 'Engineering',
        location: location || 'HQ Facility',
        hourlyCreditCost: Number(hourlyCreditCost) || 20,
        specifications,
        image: category === 'Facilities' ? 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80' :
               category === 'Talent' ? 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80' :
               'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      });

      addToast(`Added "${name}" to shared catalog!`, 'success');
      setShowAddModal(false);
      setName('');
      setSpecifications('');
      loadResources();
      refreshData();
    } catch (err) {
      addToast('Failed to add resource.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Equipment', 'Facilities', 'Talent', 'Licenses'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <Layers size={24} color="var(--accent-blue)" /> Shared Resource Catalog
          </h2>
          <p className="page-subtitle">Browse and reserve hardware, cleanrooms, talent hours, and software seats.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Shared Asset
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by keyword, spec, or location..."
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedCategory === cat ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: selectedCategory === cat ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Owner Department Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select 
            className="form-select" 
            style={{ width: '180px', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Resource Grid */}
      <div className="grid-3">
        {resources.map(res => (
          <ResourceCard 
            key={res.id} 
            resource={res} 
            onBook={(r) => setSelectedResource(r)} 
          />
        ))}
      </div>

      {resources.length === 0 && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No resources found matching the selected filters.
        </div>
      )}

      {/* Booking Modal */}
      {selectedResource && (
        <BookingModal 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
          onSuccess={loadResources}
        />
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register Shared Asset</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddResource}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input type="text" className="form-input" placeholder="e.g. 5-Axis CNC Milling Machine" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Equipment">Equipment</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Talent">Talent / Workforce</option>
                      <option value="Licenses">Software Licenses</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hourly Credit Cost</label>
                    <input type="number" className="form-input" value={hourlyCreditCost} onChange={(e) => setHourlyCreditCost(e.target.value)} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Subtype / Tag</label>
                    <input type="text" className="form-input" placeholder="e.g. Precision Tooling" value={type} onChange={(e) => setType(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Physical Location</label>
                    <input type="text" className="form-input" placeholder="e.g. Building 2 - Bay 4" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Specifications & Operating Requirements</label>
                  <textarea className="form-textarea" rows="3" placeholder="Detail power specs, software constraints, or safety clearances..." value={specifications} onChange={(e) => setSpecifications(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
