import React from 'react';

export default function Badge({ label, variant = 'secondary' }) {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  );
}
