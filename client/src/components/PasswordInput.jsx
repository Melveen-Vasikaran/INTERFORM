import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  required = false,
  autoFocus = false,
  id,
  name,
  'aria-label': ariaLabel,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={visible ? 'text' : 'password'}
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        id={id}
        name={name}
        aria-label={ariaLabel || placeholder}
        style={{ paddingRight: '2.8rem' }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible(prev => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '0.65rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          lineHeight: 1
        }}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
