import { useState, useCallback, useEffect } from 'react';
import { getDb } from '../utils/db';
import type { HistoryItem, Command } from '../types/index';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const db = await getDb();
      const result = await db.select<any[]>(
        'SELECT id, command_id as commandId, command_name as commandName, command_text as commandText, timestamp FROM copy_history ORDER BY timestamp DESC LIMIT 50'
      );
      setHistory(result);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addHistory = useCallback(async (cmd: Command) => {
    try {
      const db = await getDb();
      await db.execute(
        'INSERT INTO copy_history (command_id, command_name, command_text) VALUES ($1, $2, $3)',
        [cmd.id, cmd.name, cmd.command]
      );
      await fetchHistory();
    } catch (err) {
      console.error('Failed to add history:', err);
    }
  }, [fetchHistory]);

  const clearHistory = useCallback(async () => {
    try {
      const db = await getDb();
      await db.execute('DELETE FROM copy_history');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, []);

  return { history, addHistory, clearHistory, fetchHistory };
}
