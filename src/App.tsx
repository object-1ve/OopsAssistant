import { useState, useEffect, useCallback } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import './App.css';
import TitleBar from './components/TitleBar';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import CommandDetail from './components/CommandDetail';
import AddCommandModal from './components/AddCommandModal';
import HistoryModal from './components/HistoryModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { useSearch } from './hooks/useSearch';
import { usePinnedCommands } from './hooks/usePinnedCommands';
import { useCommands } from './hooks/useCommands';
import { useHistory } from './hooks/useHistory';
import type { Command } from './types/index';
import type { SortBy } from './hooks/useSearch';

function App() {
  const { commands, categories, addCommand, updateCommand, deleteCommand, incrementCopyCount, loading } = useCommands();
  const { pinnedIds, togglePin } = usePinnedCommands();
  const { history, addHistory, clearHistory } = useHistory();

  const [sortBy, setSortBy] = useState<SortBy>('copyCount');

  const { query, results, selectedIndex, setSelectedIndex, updateQuery, handleKeyDown } =
    useSearch(commands, pinnedIds, sortBy);

  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [lastCopyTime, setLastCopyTime] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setLastCopyTime(Date.now());
  }, []);

  // On mount, show window
  useEffect(() => {
    const showWindow = async () => {
      const window = getCurrentWebviewWindow();
      await window.show();
      await window.setFocus();
    };
    showWindow().catch(console.error);
  }, []);

  const handleOpenDetail = useCallback(
    (cmd: Command) => {
      setSelectedCommand(cmd);
    },
    []
  );

  const handleCopy = useCallback(async (cmd: Command) => {
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopiedId(cmd.id);
      showToast('已复制到剪贴板');
      incrementCopyCount(cmd.id);
      addHistory(cmd);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [incrementCopyCount, addHistory, showToast]);

  const handleAddCustom = useCallback(
    async (cmd: Omit<Command, 'id' | 'isCustom'>) => {
      const success = await addCommand(cmd);
      if (success) {
        setShowModal(false);
        showToast('指令已添加');
      } else {
        showToast('添加失败，请重试');
      }
    },
    [addCommand, showToast]
  );

  const handleUpdateCustom = useCallback(
    async (id: string, cmd: Partial<Omit<Command, 'id' | 'isCustom'>>) => {
      const success = await updateCommand(id, cmd);
      if (success) {
        setEditingCommand(null);
        // 如果当前选中的正是被编辑的指令，需要更新选中状态
        if (selectedCommand?.id === id) {
          setSelectedCommand(prev => prev ? { ...prev, ...cmd } : null);
        }
        showToast('指令已更新');
      } else {
        showToast('更新失败，请重试');
      }
    },
    [updateCommand, selectedCommand, showToast]
  );

  const handleEdit = useCallback((cmd: Command) => {
    setEditingCommand(cmd);
  }, []);

  const handleHistoryCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [showToast]);

  const handleDelete = useCallback(
    (id: string) => {
      setConfirmConfig({
        title: '删除确认',
        message: '确定要删除这条指令吗？删除后无法恢复。',
        danger: true,
        onConfirm: () => {
          deleteCommand(id);
          setSelectedCommand((prev) => (prev?.id === id ? null : prev));
          showToast('指令已删除');
          setConfirmConfig(null);
        },
      });
    },
    [deleteCommand, showToast]
  );

  const handleClearHistory = useCallback(() => {
    setConfirmConfig({
      title: '清空确认',
      message: '确定要清空所有复制历史吗？此操作无法撤销。',
      danger: true,
      onConfirm: () => {
        clearHistory();
        showToast('历史记录已清空');
        setConfirmConfig(null);
      },
    });
  }, [clearHistory, showToast]);

  // Keyboard global handler
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const handled = handleKeyDown(e);
      if (handled) {
        handleCopy(handled);
      }
    },
    [handleKeyDown, handleCopy]
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="app-container">
      <TitleBar 
        onShowHistory={() => setShowHistory(true)} 
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <main className="main-content">
          <div className="launcher">
            <SearchBox
              query={query}
              onChange={updateQuery}
              onKeyDown={onKeyDown}
              resultCount={results.length}
            />

            <div className="launcher-body">
              <SearchResults
                results={results}
                categories={categories}
                selectedIndex={selectedIndex}
                pinnedIds={pinnedIds}
                copiedId={copiedId}
                onHighlight={setSelectedIndex}
                onOpenDetail={handleOpenDetail}
                onTogglePin={togglePin}
                onCopy={handleCopy}
                onDelete={handleDelete}
                sortBy={sortBy}
              />
            </div>

            {selectedCommand && (
              <CommandDetail
                key={selectedCommand.id}
                command={selectedCommand}
                category={categoryMap.get(selectedCommand.categoryId)}
                onCopy={handleCopy}
                onClose={() => setSelectedCommand(null)}
                onDelete={handleDelete}
                onEdit={handleEdit}
                copied={copiedId === selectedCommand.id}
              />
            )}

            <div className="launcher-footer">
              <span className="footer-hint">
                ↑↓ 导航 &nbsp;·&nbsp; Enter 复制 &nbsp;·&nbsp; Esc 清空
              </span>
              <button
                className="add-custom-btn"
                onClick={() => setShowModal(true)}
              >
                ＋ 添加指令
              </button>
            </div>
          </div>
        </main>
      )}

      {(showModal || editingCommand) && (
        <AddCommandModal
          categories={categories}
          initialData={editingCommand ?? undefined}
          onAdd={handleAddCustom}
          onUpdate={handleUpdateCustom}
          onClose={() => {
            setShowModal(false);
            setEditingCommand(null);
          }}
          showToast={showToast}
        />
      )}

      {showHistory && (
        <HistoryModal
          history={history}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
          onCopy={handleHistoryCopy}
        />
      )}

      {confirmConfig && (
        <ConfirmModal
          title={confirmConfig.title}
          message={confirmConfig.message}
          danger={confirmConfig.danger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      <Toast
        key={lastCopyTime}
        message={toastMessage}
        visible={toastVisible}
        onDone={() => setToastVisible(false)}
      />
    </div>
  );
}

export default App;
