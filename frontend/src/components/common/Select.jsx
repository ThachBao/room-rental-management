import React from 'react';

export default function Select({ label, name, value, onChange, options = [], required, error, disabled, placeholder }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>}
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="form-control"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
}
