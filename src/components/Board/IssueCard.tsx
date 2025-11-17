import { useNavigate } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { currentUser } from '../../constants/currentUser';
import { Issue } from '../../types';
import classNames from 'classnames';
import './IssueCard.css';

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, isDragging }) => {
  const navigate = useNavigate();
  const isAdmin = currentUser.role === 'admin';

  // Only enable dragging for admin users
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: issue.id,
    disabled: !isAdmin,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = () => {
    navigate(`/issue/${issue.id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 3:
        return 'High';
      case 2:
        return 'Medium';
      case 1:
        return 'Low';
      default:
        return `Severity ${severity}`;
    }
  };

  const allTags = [`Severity: ${getSeverityLabel(issue.severity)}`, ...issue.tags];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames('issue-card', {
        'issue-card--dragging': isDragging,
        'issue-card--draggable': isAdmin,
      })}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <div className="issue-card__header">
        <span className="issue-card__id">#{issue.id}</span>
        <span className={classNames('issue-card__priority', getPriorityColor(issue.priority))}>
          {issue.priority}
        </span>
      </div>

      <h3 className="issue-card__title">{issue.title}</h3>

      <div className="issue-card__assignee">{issue.assignee}</div>

      {allTags.length > 0 && (
        <div className="issue-card__tags">
          {allTags.map((tag, index) => (
            <span key={tag + index} className="issue-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
