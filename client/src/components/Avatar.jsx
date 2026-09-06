import React, { useState } from 'react';

export default function Avatar({ user, size = 'md', style = {}, onClick, className = '' }) {
  const [imgError, setImgError] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '0.85rem' },
    md: { width: '48px', height: '48px', fontSize: '1.2rem' },
    lg: { width: '80px', height: '80px', fontSize: '2rem' },
    xl: { width: '120px', height: '120px', fontSize: '3rem' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBackgroundColor = (name) => {
    if (!name) return 'var(--accent-blue)';
    const colors = ['#1E3A8A', '#0F766E', '#B45309', '#6D28D9', '#BE185D', '#0369A1', '#4D7C0F'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const baseStyle = {
    ...currentSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#FFFFFF',
    backgroundColor: getBackgroundColor(user?.name),
    flexShrink: 0,
    objectFit: 'cover',
    cursor: onClick ? 'pointer' : 'default',
    border: '2px solid #FFFFFF',
    boxShadow: 'var(--shadow-sm)',
    ...style
  };

  if (user?.profilePhotoUrl && !imgError) {
    const imgUrl = user.profilePhotoUrl.startsWith('http') || user.profilePhotoUrl.startsWith('data:') 
      ? user.profilePhotoUrl 
      : `http://localhost:5000${user.profilePhotoUrl}`;

    return (
      <img
        src={imgUrl}
        alt={`${user?.name || 'User'}'s profile`}
        style={baseStyle}
        onClick={onClick}
        onError={() => setImgError(true)}
        className={`avatar ${className}`}
      />
    );
  }

  return (
    <div style={baseStyle} onClick={onClick} className={`avatar ${className}`}>
      {getInitials(user?.name)}
    </div>
  );
}
