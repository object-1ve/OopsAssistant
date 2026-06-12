import React, { useState, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { SortBy } from '../hooks/useSearch';
import './TitleBar.css';

interface TitleBarProps {
  onShowHistory?: () => void;
  sortBy?: SortBy;
  onSortChange?: (sortBy: SortBy) => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onShowHistory, sortBy, onSortChange }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  const minimize = async () => {
    await appWindow.minimize();
  };

  const toggleMaximize = async () => {
    await appWindow.toggleMaximize();
    const maximized = await appWindow.isMaximized();
    setIsMaximized(maximized);
  };

  const close = async () => {
    await appWindow.close();
  };

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };

    checkMaximized();

    // Listen for resize events to update the maximize icon
    const unlistenPromise = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [appWindow]);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-content" data-tauri-drag-region>
        <div className="app-title" data-tauri-drag-region>OopsAssistant</div>
      </div>

      <div className="titlebar-controls" data-tauri-drag-region>
        <div className="sort-container" ref={sortMenuRef}>
          <div 
            className={`titlebar-button sort ${showSortMenu ? 'active' : ''}`} 
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="排序设置"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5h10M11 9h10M11 13h10M11 17h10M3 7l3-3 3 3M6 4v16" />
            </svg>
          </div>
          {showSortMenu && (
            <div className="sort-menu">
              <div 
                className={`sort-item ${sortBy === 'copyCount' ? 'active' : ''}`}
                onClick={() => {
                  onSortChange?.('copyCount');
                  setShowSortMenu(false);
                }}
              >
                <span>按复制次数排序</span>
              </div>
              <div 
                className={`sort-item ${sortBy === 'createdAt' ? 'active' : ''}`}
                onClick={() => {
                  onSortChange?.('createdAt');
                  setShowSortMenu(false);
                }}
              >
                <span>按创建时间排序</span>
              </div>
            </div>
          )}
        </div>
        <div className="titlebar-button history" onClick={onShowHistory} title="历史记录">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="titlebar-button" onClick={minimize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1" x="1" y="6" />
          </svg>
        </div>
        <div className="titlebar-button" onClick={toggleMaximize}>
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M2.1,0v2H0v10h10v-2h2V0H2.1z M9,11H1V3h8V11z M11,9H10V2h-7V1h8V9z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect fill="none" stroke="currentColor" strokeWidth="1" width="9" height="9" x="1.5" y="1.5" />
            </svg>
          )}
        </div>
        <div className="titlebar-button close" onClick={close}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path fill="currentColor" d="M11,1.57L10.43,1,6,5.43,1.57,1,1,1.57,5.43,6,1,10.43,1.57,11,6,6.57,10.43,11,11,10.43,6.57,6Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
