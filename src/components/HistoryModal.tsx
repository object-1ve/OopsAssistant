import React from 'react';
import type { HistoryItem } from '../types/index';
import './HistoryModal.css';

interface HistoryModalProps {
  history: HistoryItem[];
  onClose: () => void;
  onClear: () => void;
  onCopy: (text: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear, onCopy }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>复制历史</h3>
          <div className="header-actions">
            <button className="clear-btn" onClick={onClear} disabled={history.length === 0}>
              清空历史
            </button>
            <button className="close-icon-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="modal-body history-list">
          {history.length === 0 ? (
            <div className="empty-history">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              暂无复制历史
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-info">
                  <div className="history-item-main">
                    <div className="history-item-text">{item.commandText}</div>
                    <button 
                      className="history-copy-btn" 
                      onClick={() => onCopy(item.commandText)}
                      title="再次复制"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                  </div>
                  <div className="history-item-header">
                    <span className="history-item-name">{item.commandName}</span>
                    <span className="history-item-time">{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
