import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Xác nhận hành động', message, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger' }) {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
      <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="dialog-content">
        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{message}</p>
      </div>
    </Modal>
  );
}
