import './SearchBox.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  resultCount: number;
}

const SearchBox: React.FC<Props> = ({
  query,
  onChange,
  onKeyDown,
  resultCount,
}) => {
  return (
    <div className="search-box">
      <svg
        className="search-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        className="search-input"
        type="text"
        placeholder="搜索指令…"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        spellCheck={false}
        aria-label="搜索指令"
      />
      <div className="search-actions">
        <span className="search-count">{resultCount} 条结果</span>
      </div>
    </div>
  );
};

export default SearchBox;
