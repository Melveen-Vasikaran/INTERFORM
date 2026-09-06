import React from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import { BarChart3, TrendingUp, Download, PieChart, Building2, Coins, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { analytics, addToast } = useApp();

  const handleExportCSV = () => {
    if (!analytics || !analytics.deptUtilization) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Department Code,Department Name,Resource Count,Avg Utilization %,Credit Balance,Allocated Budget ($)\n";

    analytics.deptUtilization.forEach(row => {
      csvContent += `"${row.code}","${row.departmentName}",${row.resourceCount},${row.avgUtilization},${row.credits},${row.budget}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inter_departmental_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Exported inter-departmental analytics report (CSV)!', 'success');
  };

  const summary = analytics?.summary || {
    totalResources: 7,
    totalBookings: 4,
    activeConflicts: 1,
    totalProjects: 2,
    totalCreditsExchanged: 8450,
    savedCostEstimateDollars: 142000
  };

  const deptUtilization = analytics?.deptUtilization || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header & Export Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <BarChart3 size={24} color="var(--accent-blue)" /> Executive Synergy & ROI Analytics
          </h2>
          <p className="page-subtitle">Track resource utilization efficiency, saved capital, and departmental credit balance velocity.</p>
        </div>

        <button className="btn-primary" onClick={handleExportCSV}>
          <Download size={16} /> Export Audit Report (CSV)
        </button>
      </div>

      {/* Metrics Cards Row */}
      <div className="grid-4">
        <StatsCard title="Total Saved Capital" value={`$${summary.savedCostEstimateDollars.toLocaleString()}`} subtitle="Avoided duplicate hardware purchase" icon={TrendingUp} color="#10b981" />
        <StatsCard title="Circulating Credit Volume" value={`${summary.totalCreditsExchanged.toLocaleString()} pts`} subtitle="Inter-dept mutual exchange" icon={Coins} color="#f59e0b" />
        <StatsCard title="Active Joint Initiatives" value={summary.totalProjects} subtitle="Cross-boundary roadmaps" icon={PieChart} color="#8b5cf6" />
        <StatsCard title="Sharing Efficiency Index" value="94.2%" subtitle="Enterprise asset optimization" icon={ShieldCheck} color="#3b82f6" />
      </div>

      {/* Department Resource Utilization Chart Breakdown */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--accent-blue)" /> Resource Utilization Rate & Credits by Department
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {deptUtilization.map(dept => (
            <div key={dept.departmentId} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="dept-dot" style={{ background: dept.color }}></span>
                  {dept.departmentName} ({dept.code})
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {dept.avgUtilization}% Avg Utilization • <span style={{ color: '#fbbf24' }}>{dept.credits} Credits</span>
                </span>
              </div>

              {/* Utilization Bar */}
              <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${dept.avgUtilization}%`,
                  background: `linear-gradient(90deg, ${dept.color} 0%, #3b82f6 100%)`,
                  borderRadius: '5px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution Grid */}
      <div className="grid-2">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Resource Category Allocations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.categoryBreakdown?.map(cat => (
              <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.category}</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{cat.count} Shared Assets</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Inter-Departmental Synergy Score</h3>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              A+ (94/100)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '360px', margin: '0.5rem auto 0 auto' }}>
              High cross-departmental reciprocity detected between Engineering, R&D, Operations, and Marketing.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
