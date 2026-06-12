import type { Category, Command } from '../types';
import type { SearchResult, SortBy } from '../hooks/useSearch';
import CategoryBadge from './CategoryBadge';
import './CommandItem.css';

interface Props {
  command: SearchResult;
  category: Category | undefined;
  isPinned: boolean;
  isSelected: boolean;
  isCopied: boolean;
  index: number;
  onHighlight: (index: number) => void;
  onOpenDetail: (command: Command) => void;
  onTogglePin: (id: string) => void;
  onCopy: (command: Command) => void;
  onDelete?: (id: string) => void;
  sortBy: SortBy;
}

const CommandItem: React.FC<Props> = ({
  command,
  category,
  isPinned,
  isSelected,
  isCopied,
  index,
  onHighlight,
  onOpenDetail,
  onTogglePin,
  onCopy,
  onDelete,
  sortBy,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      // SQLite CURRENT_TIMESTAMP 输出 UTC 不含时区标记，显式加 Z 避免歧义
      const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays}天前`;
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`command-item ${isSelected ? 'selected' : ''} ${isCopied ? 'copied' : ''}`}
      onClick={() => {
        onHighlight(index);
      }}
      role="option"
      aria-selected={isSelected}
    >
      <div className="command-item-left">
        <div className="command-item-text">
          <div className="command-item-header">
            <span className="command-item-name">
              {command.name}
            </span>
            <CategoryBadge category={category ?? { id: '', name: '?', color: '#999', icon: '?' }} />
            {command.matchReason && (
              <span className="match-reason-badge">
                {command.matchReason}
              </span>
            )}
            {sortBy === 'createdAt' && command.createdAt && (
              <span className="command-item-date">{formatDate(command.createdAt)}</span>
            )}
          </div>
          <div className="command-item-sub">
            <code className="command-item-cmd">{command.command}</code>
            {command.copyCount > 0 && (
              <span className="copy-count-badge" title={`已复制 ${command.copyCount} 次`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {command.copyCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="command-item-right">
        <button
          className="detail-btn-mini"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(command);
          }}
          title="查看详情"
          aria-label="查看详情"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
        <button
          className={`pin-btn ${isPinned ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(command.id);
          }}
          title={isPinned ? '取消置顶' : '置顶'}
          aria-label={isPinned ? '取消置顶' : '置顶'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2a2 2 0 0 0 1 1.73L11 16.3V21a1 1 0 0 0 2 0v-4.7l7-4.57A2 2 0 0 0 21 10z"/>
          </svg>
        </button>
        {onDelete && (
          <button
            className="delete-btn-mini"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(command.id);
            }}
            title="删除指令"
            aria-label="删除指令"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
        <button
          className="copy-btn-mini"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(command);
          }}
          title="复制命令"
          aria-label="复制命令"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCopied ? (
              <polyline points="20 6 9 17 4 12" stroke="var(--copied-bg)" />
            ) : (
              <>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CommandItem;
