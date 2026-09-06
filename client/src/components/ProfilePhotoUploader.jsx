import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, Upload, Trash2, X, Check } from 'lucide-react';
import { uploadProfilePhoto, removeProfilePhoto } from '../utils/api';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';

export default function ProfilePhotoUploader() {
  const { user, setUser, addToast } = useApp();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        addToast('Invalid file type. Please upload JPG, PNG or WEBP.', 'warning');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image is too large. Max size is 5MB.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Create a square canvas
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      size,
      size,
      0,
      0,
      size,
      size
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      const res = await uploadProfilePhoto(croppedBase64);
      
      // Update global user context immediately
      const updatedUser = { ...user, profilePhotoUrl: res.profilePhotoUrl };
      setUser(updatedUser);
      localStorage.setItem('interform_user', JSON.stringify(updatedUser));
      
      addToast('Profile photo updated successfully!', 'success');
      setIsModalOpen(false);
      setImageSrc(null);
    } catch (err) {
      addToast(err.message || 'Failed to upload photo.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    try {
      setLoading(true);
      await removeProfilePhoto();
      
      const updatedUser = { ...user, profilePhotoUrl: null };
      setUser(updatedUser);
      localStorage.setItem('interform_user', JSON.stringify(updatedUser));
      
      addToast('Profile photo removed.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to remove photo.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      
      {/* Avatar Container with Hover Overlay */}
      <div 
        style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', overflow: 'hidden' }}
        className="avatar-upload-container"
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar user={user} size="xl" />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.2s',
          color: 'white'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
        >
          <Camera size={32} />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          <Upload size={14} /> {user?.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}
        </button>
        {user?.profilePhotoUrl && (
          <button 
            onClick={handleRemove} 
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--status-rejected-text)', borderColor: 'var(--status-rejected-text)' }}
            disabled={loading}
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      <input 
        type="file" 
        accept="image/jpeg,image/png,image/webp" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Cropper Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 4000 }}>
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Adjust Profile Photo</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: '350px', background: '#333' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={loading}>
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : <><Check size={16} /> Save Photo</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
