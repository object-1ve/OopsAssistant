import { useState } from 'react';
import type { Command, Category } from '../types';
import { extractParams } from '../utils/placeholder';
import './AddCommandModal.css';

interface Props {
  categories: Category[];
  initialData?: Command;
  onAdd: (cmd: Omit<Command, 'id' | 'isCustom'>) => void;
  onUpdate?: (id: string, cmd: Partial<Omit<Command, 'id' | 'isCustom'>>) => void;
  onClose: () => void;
}

const AddCommandModal: React.FC<Props> = ({ categories, initialData, onAdd, onUpdate, onClose }) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [command, setCommand] = useState(initialData?.command ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? categories[0]?.id ?? '');
  const [tags, setTags] = useState(initialData?.tags.join(', ') ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;

    // 自动提取参数
    const extracted = extractParams(command);
    const params = extracted.map(p => ({
      name: p.name,
      example: initialData?.params.find(ip => ip.name === p.name)?.example ?? '' 
    }));

    const cmdData = {
      name: name.trim(),
      command: command.trim(),
      description: description.trim() || name.trim(),
      categoryId,
      tags: tags
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean),
      params,
      copyCount: initialData?.copyCount ?? 0,
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, cmdData);
    } else {
      onAdd(cmdData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{initialData ? '编辑指令' : '添加自定义指令'}</div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-tips">
              <div className="tips-title">💡 编写建议</div>
              <ul className="tips-list">
                <li>使用 <code>&lt;参数&gt;</code> 定义<b>必填参数</b></li>
                <li>使用 <code>[参数]</code> 定义<b>可选参数</b></li>
                <li>使用 <code>&#123;&#123;变量&#125;&#125;</code> 定义<b>替换变量</b></li>
                <li>系统会自动提取变量并在执行时提示输入</li>
              </ul>
            </div>

            <div className="modal-field">
              <label className="modal-label">命令</label>
              <textarea
                className="modal-input"
                placeholder="例如: export http_proxy=http://127.0.0.1:7890"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={2}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">名称</label>
              <input
                className="modal-input"
                type="text"
                placeholder="例如: 开启代理"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">描述（可选）</label>
              <input
                className="modal-input"
                type="text"
                placeholder="指令说明"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">分类</label>
              <select
                className="modal-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">标签（可选, 用逗号分隔）</label>
              <input
                className="modal-input"
                type="text"
                placeholder="例如: 代理, 网络, 环境变量"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="modal-btn primary"
              disabled={!name.trim() || !command.trim()}
            >
              {initialData ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommandModal;
