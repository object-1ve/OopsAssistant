export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ParamHint {
  name: string;
  example: string;
}

export interface Command {
  id: string;
  name: string;
  command: string;
  description: string;
  categoryId: string;
  tags: string[];
  params: ParamHint[];
  copyCount: number;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface HistoryItem {
  id: number;
  commandId: string;
  commandName: string;
  commandText: string;
  timestamp: string;
}
