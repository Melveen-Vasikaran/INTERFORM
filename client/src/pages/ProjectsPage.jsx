import React, { useState, useEffect } from 'react';
import { fetchProjects, createProject } from '../utils/api';
import { useApp } from '../context/AppContext';
import TimelineGantt from '../components/TimelineGantt';
import { Workflow, Plus, X, Calendar } from 'lucide-react';

export default function ProjectsPage() {
  const { departments, activeDept, addToast, refreshData } = useApp();

  const [projects, setProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [targetDate, setTargetDate] = useState('2026-11-15');
  const [budgetAllocated, setBudgetAllocated] = useState(150000);
  const [participatingDepts, setParticipatingDepts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter project title.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        name,
        leadDepartmentId: activeDept?.id || 'dept-eng',
        leadDepartmentName: activeDept?.name || 'Engineering',
        participatingDepartments: participatingDepts.length > 0 ? participatingDepts : [activeDept?.name || 'Engineering'],
        budgetAllocated: Number(budgetAllocated),
        startDate: new Date().toISOString().slice(0, 10),
        targetDate,
        milestones: [
          { id: 'm-new-1', title: 'Phase 1 Requirements & Architecture', dept: activeDept?.name || 'Lead Dept', dueDate: '2026-09-15', status: 'In Progress' },
          { id: 'm-new-2', title: 'Phase 2 Cross-Dept Execution', dept: 'Partner Depts', dueDate: targetDate, status: 'Pending', dependsOn: 'm-new-1' }
        ]
      });

      addToast(`Initiated joint project "${name}"!`, 'success');
      setShowAddModal(false);
      setName('');
      loadProjects();
      refreshData();
    } catch (err) {
      addToast('Failed to create project.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDept = (deptName) => {
    if (participatingDepts.includes(deptName)) {
      setParticipatingDepts(participatingDepts.filter(d => d !== deptName));
    } else {
      setParticipatingDepts([...participatingDepts, deptName]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <Workflow size={24} color="var(--accent-purple)" /> Inter-Departmental Joint Projects & Roadmaps
          </h2>
          <p className="page-subtitle">Align enterprise initiatives across engineering, design, marketing, and operations.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Launch Joint Initiative
        </button>
      </div>

      {/* Gantt Timeline */}
      <TimelineGantt projects={projects} />

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Launch Joint Initiative</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Initiative Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Project Orion: Autonomous Drone Prototyping" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Completion Date</label>
                    <input type="date" className="form-input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Allocated Budget ($)</label>
                    <input type="number" className="form-input" value={budgetAllocated} onChange={(e) => setBudgetAllocated(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Participating Departments</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {departments.map(d => {
                      const isSelected = participatingDepts.includes(d.name);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDept(d.name)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isSelected ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            border: isSelected ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)'
                          }}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Launching...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
