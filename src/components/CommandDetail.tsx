import { useState } from 'react';
import type { Command, Category } from '../types';
import { resolveCommand } from '../utils/placeholder';
import CategoryBadge from './CategoryBadge';
import './CommandDetail.css';

interface Props {
  command: Command;
  category: Category | undefined;
  onCopy: (command: Command) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (command: Command) => void;
  copied: boolean;
}

const CommandDetail: React.FC<Props> = ({ command, category, onCopy, onClose, onDelete, onEdit, copied }) => {
  const [filledParams, setFilledParams] = useState<Record<string, string>>({});

  const getResolvedCommand = () => {
    return resolveCommand(command.command, filledParams);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="command-detail">
      <div className="detail-header">
        <div className="detail-header-left">
          <span className="detail-name">{command.name}</span>
          {category && <CategoryBadge category={category} />}
          {command.copyCount > 0 && (
            <span className="detail-copy-count" title={`累计复制 ${command.copyCount} 次`}>
              已复制 {command.copyCount} 次
            </span>
          )}
          {command.createdAt && (
            <span className="detail-created-at" title="创建时间">
                {formatDate(command.createdAt)}
            </span>
          )}
        </div>
        <div className="detail-header-right">
          <button className="detail-edit-btn" onClick={() => onEdit(command)} title="编辑">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="detail-close-btn" onClick={onClose} title="关闭">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="detail-section">
        <span className="section-label">原指令</span>
        <div className="original-command-box">
          <code className="original-text">{command.command}</code>
        </div>
      </div>

      <div className="detail-section">
        <span className="section-label">解析后</span>
        <div className="detail-command-box">
          <code className="detail-command-text">{getResolvedCommand()}</code>
          <button
            className={`detail-copy-btn ${copied ? 'copied' : ''}`}
            onClick={() => onCopy({ ...command, command: getResolvedCommand() })}
          >
            {copied ? '✓ 已复制' : '复制'}
          </button>
        </div>
      </div>

      <p className="detail-desc">{command.description}</p>

      {command.params.length > 0 && (
        <div className="detail-params">
          <span className="params-label">参数</span>
          {command.params.map((p) => (
            <div key={p.name} className="param-row">
              <label className="param-name">{p.name}</label>
              <input
                className="param-input"
                type="text"
                placeholder={p.example}
                value={filledParams[p.name] ?? ''}
                onChange={(e) =>
                  setFilledParams((prev) => ({ ...prev, [p.name]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      )}

      {command.tags.length > 0 && (
        <div className="detail-tags">
          {command.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {command.isCustom && (
        <div className="detail-delete">
          <button
            className="detail-delete-btn"
            onClick={() => onDelete(command.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            删除指令
          </button>
        </div>
      )}
    </div>
  );
};

export default CommandDetail;
