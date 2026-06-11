import React, { useState, useEffect } from 'react';
import { Window } from '@tauri-apps/api/window';
import './TitleBar.css';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = new Window('main');

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
    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then(u => u());
    };
  }, []);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-content">
        <div className="app-title">OopsAssistant</div>
      </div>

      <div className="titlebar-controls">
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
