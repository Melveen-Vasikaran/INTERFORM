import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchResources, fetchDepartments } from '../utils/api';
import ResourceCard from '../components/ResourceCard';
import ResourceDetailsModal from '../components/ResourceDetailsModal';
import RequestResourceModal from '../components/RequestResourceModal';
import AddResourceModal from '../components/AddResourceModal';
import { Search, Filter, Layers, X, Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';

export default function ResourceExplorerPage() {
  const { user, addToast } = useApp();
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [minCapacity, setMinCapacity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Modals
  const [viewResource, setViewResource] = useState(null);
  const [requestResource, setRequestResource] = useState(null);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  const categories = [
    'All',
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

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (searchQuery) params.append('search', searchQuery);
      if (minCapacity) params.append('minCapacity', minCapacity);
      if (selectedDate) params.append('date', selectedDate);
      if (selectedTime) params.append('time', selectedTime);

      const [resData, deptData] = await Promise.all([
        fetchResources(params.toString()),
        fetchDepartments()
      ]);

      setResources(resData);
      setDepartments(deptData);
    } catch (err) {
      addToast('Failed to load resource catalog.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, selectedDept, minCapacity, selectedDate, selectedTime]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCatalog();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDept('All');
    setMinCapacity('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const isHodOrAdmin = user?.role === 'admin' || user?.role === 'hod';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header with + Add Resource Button for HOD & Admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CAMPUS RESOURCE CATALOG
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            RESOURCE EXPLORER
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover, check availability, and request resources across the entire campus.
          </p>
        </div>

        {/* + Add Resource Button for HOD and Admin */}
        {isHodOrAdmin && (
          <button
            onClick={() => setShowAddResourceModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> + Add Resource
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="sunlit-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder='What are you looking for? (e.g. Computer Lab, Projector, Seminar Hall, Camera)'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '0.95rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 1.5rem' }}>
            Search
          </button>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: selectedCategory === cat ? 700 : 500,
                background: selectedCategory === cat ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--accent-blue)' : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </form>

      {/* Secondary Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '1rem 1.25rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <Filter size={16} /> Filter by:
        </div>

        {/* Department Filter */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px', fontSize: '0.85rem' }}
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        {/* Capacity Filter */}
        <input
          type="number"
          className="form-control"
          placeholder="Min Capacity (Seats)"
          style={{ width: '160px', fontSize: '0.85rem' }}
          value={minCapacity}
          onChange={e => setMinCapacity(e.target.value)}
        />

        {/* Date Filter */}
        <input
          type="date"
          className="form-control"
          style={{ width: '160px', fontSize: '0.85rem' }}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />

        {/* Time Filter */}
        <input
          type="time"
          className="form-control"
          style={{ width: '130px', fontSize: '0.85rem' }}
          value={selectedTime}
          onChange={e => setSelectedTime(e.target.value)}
        />

        {(selectedCategory !== 'All' || selectedDept !== 'All' || searchQuery || minCapacity || selectedDate || selectedTime) && (
          <button
            onClick={clearFilters}
            className="btn btn-outline btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Searching campus resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <Search size={36} color="var(--text-muted)" />
          <h3>No resources match your search criteria</h3>
          <p>Try adjusting your category, department, or minimum capacity filters.</p>
          <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {resources.map(res => (
            <ResourceCard
              key={res.id}
              resource={res}
              onViewDetails={r => setViewResource(r)}
              onRequestResource={r => setRequestResource(r)}
            />
          ))}
        </div>
      )}

      {/* Add Resource Modal for HOD / Admin */}
      {showAddResourceModal && (
        <AddResourceModal
          onClose={() => setShowAddResourceModal(false)}
          onSuccess={() => loadCatalog()}
          departments={departments}
        />
      )}

      {/* Details Modal */}
      {viewResource && (
        <ResourceDetailsModal
          resource={viewResource}
          onClose={() => setViewResource(null)}
          onRequest={r => setRequestResource(r)}
        />
      )}

      {/* Request Modal */}
      {requestResource && (
        <RequestResourceModal
          resource={requestResource}
          onClose={() => setRequestResource(null)}
          onSuccess={(req, altResource) => {
            if (altResource) {
              setRequestResource(altResource);
            }
          }}
        />
      )}
    </div>
  );
}
