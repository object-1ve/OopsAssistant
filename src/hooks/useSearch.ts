import { useState, useMemo, useCallback } from 'react';
import type { Command } from '../types';

function fuzzyMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();

  // 完全匹配
  if (lower === q) return 100;
  // 开头匹配
  if (lower.startsWith(q)) return 80;
  // 包含匹配
  if (lower.includes(q)) return 60;

  // 模糊匹配：查询字符按顺序出现在文本中
  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < lower.length && qi < q.length; ti++) {
    if (lower[ti] === q[qi]) {
      score += 10;
      // 连续匹配加分
      if (qi > 0 && ti > 0 && lower[ti - 1] === q[qi - 1]) {
        score += 5;
      }
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export interface SearchResult extends Command {
  matchReason?: string;
}

function scoreCommand(cmd: Command, query: string): { score: number; reason?: string } {
  let maxScore = 0;
  let reason = '';

  // 名称权重最高
  const nameScore = fuzzyMatch(cmd.name, query) * 1.5;
  if (nameScore > maxScore) {
    maxScore = nameScore;
    reason = '名称匹配';
  }

  // 命令本身
  const cmdScore = fuzzyMatch(cmd.command, query) * 1.2;
  if (cmdScore > maxScore) {
    maxScore = cmdScore;
    reason = '指令匹配';
  }

  // 描述
  const descScore = fuzzyMatch(cmd.description, query);
  if (descScore > maxScore) {
    maxScore = descScore;
    reason = '描述匹配';
  }

  // 标签
  for (const tag of cmd.tags) {
    const tagScore = fuzzyMatch(tag, query);
    if (tagScore > maxScore) {
      maxScore = tagScore;
      reason = `标签匹配: ${tag}`;
    }
  }

  return { score: maxScore, reason };
}

export type SortBy = 'copyCount' | 'createdAt';

export function useSearch(commands: Command[], pinnedIds: Set<string>, sortBy: SortBy = 'copyCount') {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    let filtered = commands;

    if (!query.trim()) {
      // 空查询：置顶 → 按排序规则降序 → 最后按分类排序
      const sorted = [...filtered].sort((a, b) => {
        // 首先按置顶
        const aPinned = pinnedIds.has(a.id) ? 0 : 1;
        const bPinned = pinnedIds.has(b.id) ? 0 : 1;
        if (aPinned !== bPinned) return aPinned - bPinned;

        // 根据排序规则排序
        if (sortBy === 'copyCount') {
          if (a.copyCount !== b.copyCount) return b.copyCount - a.copyCount;
        } else {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          if (aTime !== bTime) return bTime - aTime;
        }
        
        // 最后按分类排序
        return (a.categoryId || '').localeCompare(b.categoryId || '');
      });
      return sorted as SearchResult[];
    }

    // 有查询：按匹配分数排序，相同分数下应用排序规则和置顶
    const scored = filtered
      .map((cmd) => {
        const { score, reason } = scoreCommand(cmd, query);
        return { cmd: { ...cmd, matchReason: reason } as SearchResult, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        
        const aPinned = pinnedIds.has(a.cmd.id) ? 0 : 1;
        const bPinned = pinnedIds.has(b.cmd.id) ? 0 : 1;
        if (aPinned !== bPinned) return aPinned - bPinned;

        if (sortBy === 'copyCount') {
          return b.cmd.copyCount - a.cmd.copyCount;
        } else {
          return new Date(b.cmd.createdAt).getTime() - new Date(a.cmd.createdAt).getTime();
        }
      })
      .map((item) => item.cmd);
    return scored;
  }, [commands, query, pinnedIds, sortBy]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            return results[selectedIndex];
          }
          break;
        case 'Escape':
          setQuery('');
          setSelectedIndex(0);
          break;
      }
      return null;
    },
    [results, selectedIndex]
  );

  const updateQuery = useCallback((val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  }, []);

  return {
    query,
    results,
    selectedIndex,
    setSelectedIndex,
    updateQuery,
    handleKeyDown,
  };
}
