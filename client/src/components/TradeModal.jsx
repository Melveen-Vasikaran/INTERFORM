import React, { useState } from 'react';
import { X, RefreshCw, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createTrade } from '../utils/api';

export default function TradeModal({ onClose, onSuccess }) {
  const { activeDept, addToast, refreshData } = useApp();

  const [offeringItem, setOfferingItem] = useState('');
  const [requestedItem, setRequestedItem] = useState('');
  const [creditValue, setCreditValue] = useState(250);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeringItem || !description) {
      addToast('Please fill out all required trade details.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await createTrade({
        offeringDepartmentId: activeDept?.id || 'dept-eng',
        offeringDepartmentName: activeDept?.name || 'Engineering',
        offeringItem,
        requestedItem: requestedItem || 'Inter-Departmental Assistance',
        creditValue: Number(creditValue) || 200,
        description
      });

      addToast('Mutual Aid offer posted to the exchange board!', 'success');
      refreshData();
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      addToast('Failed to post trade offer.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Post Mutual Aid / Trade Offer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Offering Dept: {activeDept?.name || 'Engineering'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">What Resource/Service are you offering?</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. 20 Hours Motion Graphics Editing / Cleanroom Slot"
                value={offeringItem}
                onChange={(e) => setOfferingItem(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">What are you seeking in return? (Optional)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. 15 Hours GPU Compute / DevOps Assistance"
                value={requestedItem}
                onChange={(e) => setRequestedItem(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Equivalent Inter-Dept Credit Value</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-input"
                  value={creditValue}
                  onChange={(e) => setCreditValue(e.target.value)}
                  min="10"
                />
                <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Coins size={16} /> Credits
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Barter Terms & Description</label>
              <textarea 
                className="form-textarea"
                rows="3"
                placeholder="Explain the scope of work or equipment handover terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Trade Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
