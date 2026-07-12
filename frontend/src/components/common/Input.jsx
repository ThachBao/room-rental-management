import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, type = 'text', name, value, onChange, placeholder, required, error, disabled, min, max, step }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={inputType}
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
          style={{ paddingRight: isPasswordType ? '40px' : '14px' }}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="password-toggle-btn"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
}
