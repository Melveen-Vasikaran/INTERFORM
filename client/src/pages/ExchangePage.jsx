import React, { useState, useEffect } from 'react';
import { fetchTrades, acceptTrade } from '../utils/api';
import { useApp } from '../context/AppContext';
import TradeModal from '../components/TradeModal';
import { RefreshCw, Plus, Coins, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function ExchangePage() {
  const { activeDept, addToast, refreshData } = useApp();

  const [trades, setTrades] = useState([]);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const loadTrades = async () => {
    try {
      const data = await fetchTrades();
      setTrades(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleAcceptTrade = async (tradeId) => {
    try {
      await acceptTrade(tradeId, activeDept?.id || 'dept-eng', activeDept?.name || 'Engineering');
      addToast('Mutual Aid deal accepted! Credits transferred.', 'success');
      loadTrades();
      refreshData();
    } catch (err) {
      addToast('Failed to accept trade.', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <RefreshCw size={24} color="var(--accent-pink)" /> Mutual Aid & Resource Exchange Hub
          </h2>
          <p className="page-subtitle">Barter unused capacity, swap specialized talent hours, and transfer inter-dept credits.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowTradeModal(true)}>
          <Plus size={16} /> Post Barter Offer
        </button>
      </div>

      {/* Trade Listings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {trades.map(t => {
          const isOwner = t.offeringDepartmentId === activeDept?.id;
          const isCompleted = t.status === 'Completed';

          return (
            <div key={t.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="dept-tag">
                      Offering: {t.offeringDepartmentName}
                    </span>
                    <span className={`status-pill ${isCompleted ? 'completed' : 'pending'}`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                    Offering: {t.offeringItem}
                  </h3>

                  {t.requestedItem && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ArrowRightLeft size={14} /> Seeking in Return: {t.requestedItem}
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                    {t.description}
                  </p>

                  {isCompleted && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={14} /> Partnered with <strong>{t.requestingDepartmentName}</strong>
                    </div>
                  )}
                </div>

                {/* Right side: Credit Valuation & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Coins size={16} />
                    {t.creditValue} Inter-Dept Credits
                  </div>

                  {!isCompleted && !isOwner && (
                    <button 
                      className="btn-primary" 
                      onClick={() => handleAcceptTrade(t.id)}
                    >
                      Accept Barter Deal
                    </button>
                  )}

                  {isOwner && !isCompleted && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Your Active Listing
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {showTradeModal && (
        <TradeModal 
          onClose={() => setShowTradeModal(false)}
          onSuccess={loadTrades}
        />
      )}

    </div>
  );
}
