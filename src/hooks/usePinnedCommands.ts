import { useState, useCallback, useEffect } from 'react';
import { getDb } from '../utils/db';

export function usePinnedCommands() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const fetchPinnedCommands = useCallback(async () => {
    try {
      const db = await getDb();
      const result = await db.select<{ command_id: string }[]>('SELECT command_id FROM pinned_commands');
      setPinnedIds(new Set(result.map(r => r.command_id)));
    } catch (err) {
      console.error('Failed to fetch pinned commands:', err);
    }
  }, []);

  useEffect(() => {
    fetchPinnedCommands();
  }, [fetchPinnedCommands]);

  const togglePin = useCallback(async (id: string) => {
    try {
      const db = await getDb();
      const isPinned = await db.select<any[]>('SELECT 1 FROM pinned_commands WHERE command_id = $1', [id]);
      
      if (isPinned.length > 0) {
        await db.execute('DELETE FROM pinned_commands WHERE command_id = $1', [id]);
      } else {
        await db.execute('INSERT INTO pinned_commands (command_id) VALUES ($1)', [id]);
      }
      await fetchPinnedCommands();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  }, [fetchPinnedCommands]);

  const isPinned = useCallback(
    (id: string) => pinnedIds.has(id),
    [pinnedIds]
  );

  return { pinnedIds, togglePin, isPinned };
}
