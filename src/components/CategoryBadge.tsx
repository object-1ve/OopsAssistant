import type { Category } from '../types';
import './CategoryBadge.css';

interface Props {
  category: Category;
  compact?: boolean;
}

const CategoryBadge: React.FC<Props> = ({ category, compact }) => {
  return (
    <span
      className={`category-badge ${compact ? 'compact' : ''}`}
      style={{ backgroundColor: category.color }}
    >
      {compact ? category.icon : `${category.icon} ${category.name}`}
    </span>
  );
};

export default CategoryBadge;
