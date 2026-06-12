import { useState, useCallback, useEffect } from 'react';
import type { Command, Category } from '../types';
import { getDb } from '../utils/db';

export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const db = await getDb();
      
      // Fetch categories
      const catResult = await db.select<Category[]>('SELECT * FROM categories');
      setCategories(catResult);

      // Fetch all commands
      const cmdResult = await db.select<any[]>('SELECT * FROM commands');
      const mapped = cmdResult.map(row => ({
        ...row,
        categoryId: row.categoryId ?? row.categoryid ?? '',
        tags: row.tags ? JSON.parse(row.tags) : [],
        params: row.params ? JSON.parse(row.params) : [],
        copyCount: row.copy_count ?? row.copyCount ?? 0,
        createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? row.updatedAt ?? row.created_at ?? new Date().toISOString(),
        isCustom: (row.is_builtin ?? row.isbuiltin ?? 0) === 0
      }));
      setCommands(mapped);
    } catch (err) {
      console.error('Failed to fetch data from SQLite:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCommand = useCallback(
    async (cmd: Omit<Command, 'id' | 'isCustom'>) => {
      try {
        const db = await getDb();
        const id = `custom-${Date.now()}`;
        await db.execute(
          'INSERT INTO commands (id, name, command, description, categoryId, tags, params, is_builtin, copy_count, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $8)',
          [
            id,
            cmd.name,
            cmd.command,
            cmd.description,
            cmd.categoryId,
            JSON.stringify(cmd.tags || []),
            JSON.stringify(cmd.params || []),
            new Date().toISOString()
          ]
        );
        await fetchData();
        return true;
      } catch (err) {
        console.error('Failed to add command:', err);
        return false;
      }
    },
    [fetchData]
  );
  
  const updateCommand = useCallback(
    async (id: string, cmd: Partial<Omit<Command, 'id' | 'isCustom'>>) => {
      try {
        const db = await getDb();
        const updates: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (cmd.name !== undefined) {
          updates.push(`name = $${index++}`);
          values.push(cmd.name);
        }
        if (cmd.command !== undefined) {
          updates.push(`command = $${index++}`);
          values.push(cmd.command);
        }
        if (cmd.description !== undefined) {
          updates.push(`description = $${index++}`);
          values.push(cmd.description);
        }
        if (cmd.categoryId !== undefined) {
          updates.push(`categoryId = $${index++}`);
          values.push(cmd.categoryId);
        }
        if (cmd.tags !== undefined) {
          updates.push(`tags = $${index++}`);
          values.push(JSON.stringify(cmd.tags));
        }
        if (cmd.params !== undefined) {
          updates.push(`params = $${index++}`);
          values.push(JSON.stringify(cmd.params));
        }

        if (updates.length === 0) return true;

        values.push(id);
        await db.execute(
          `UPDATE commands SET ${updates.join(', ')} WHERE id = $${index}`,
          values
        );
        await fetchData();
        return true;
      } catch (err) {
        console.error('Failed to update command:', err);
        return false;
      }
    },
    [fetchData]
  );

  const deleteCommand = useCallback(
    async (id: string) => {
      try {
        const db = await getDb();
        await db.execute('DELETE FROM commands WHERE id = $1', [id]);
        // 同时清理置顶状态
        await db.execute('DELETE FROM pinned_commands WHERE command_id = $1', [id]);
        await fetchData();
      } catch (err) {
        console.error('Failed to delete command:', err);
      }
    },
    [fetchData]
  );

  const incrementCopyCount = useCallback(
    async (id: string) => {
      try {
        const db = await getDb();
        await db.execute(
          'UPDATE commands SET copy_count = copy_count + 1 WHERE id = $1',
          [id]
        );
        await fetchData();
      } catch (err) {
        console.error('Failed to increment copy count:', err);
      }
    },
    [fetchData]
  );

  return { commands, categories, loading, addCommand, updateCommand, deleteCommand, incrementCopyCount, refresh: fetchData };
}
