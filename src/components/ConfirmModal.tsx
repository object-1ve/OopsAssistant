import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="confirm-modal-message">{message}</div>
        <div className="modal-actions">
          <button type="button" className="modal-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`modal-btn primary ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
