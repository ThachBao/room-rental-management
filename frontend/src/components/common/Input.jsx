import React from 'react';

export default function Input({ label, type = 'text', name, value, onChange, placeholder, required, error, disabled, min, max, step }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>}
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="form-control"
      />
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
}
