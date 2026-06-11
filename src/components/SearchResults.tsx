import type { Category, Command } from '../types';
import type { SearchResult } from '../hooks/useSearch';
import CommandItem from './CommandItem';
import './SearchResults.css';

interface Props {
  results: SearchResult[];
  categories: Category[];
  selectedIndex: number;
  pinnedIds: Set<string>;
  copiedId: string | null;
  onHighlight: (index: number) => void;
  onOpenDetail: (command: Command) => void;
  onTogglePin: (id: string) => void;
  onCopy: (command: Command) => void;
  onDelete?: (id: string) => void;
}

const SearchResults: React.FC<Props> = ({
  results,
  categories,
  selectedIndex,
  pinnedIds,
  copiedId,
  onHighlight,
  onOpenDetail,
  onTogglePin,
  onCopy,
  onDelete,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (results.length === 0) {
    return (
      <div className="search-results-empty">
        <span className="empty-icon">🔍</span>
        <p>没有找到匹配的指令</p>
        <p className="empty-hint">试试其他关键词</p>
      </div>
    );
  }

  return (
    <div className="search-results" role="listbox">
      {results.map((cmd, i) => (
        <CommandItem
          key={cmd.id}
          command={cmd}
          category={categoryMap.get(cmd.categoryId)}
          isPinned={pinnedIds.has(cmd.id)}
          isSelected={i === selectedIndex}
          isCopied={copiedId === cmd.id}
          index={i}
          onHighlight={onHighlight}
          onOpenDetail={onOpenDetail}
          onTogglePin={onTogglePin}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default SearchResults;
