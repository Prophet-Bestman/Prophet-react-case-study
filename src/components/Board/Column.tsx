import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Issue, IssueStatus } from '../../types';
import { IssueCard } from './IssueCard';
import './Column.css';

interface ColumnProps {
  status: IssueStatus;
  issues: Issue[];
  isOver?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ status, issues }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const getColumnHeader = (status: IssueStatus) => {
    switch (status) {
      case 'Backlog':
        return { title: 'Backlog', icon: '📋' };
      case 'In Progress':
        return { title: 'In Progress', icon: '⚙️' };
      case 'Done':
        return { title: 'Done', icon: '✅' };
      default:
        return { title: status, icon: '📄' };
    }
  };

  const header = getColumnHeader(status);

  return (
    <div className="column">
      <div className="column__header">
        <span className="column__icon">{header.icon}</span>
        <h2 className="column__title">{header.title}</h2>
        <span className="column__count">{issues.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`column__content ${isOver ? 'column__content--over' : ''}`}
      >
        {issues.length === 0 ? (
          <div className="column__empty">No issues</div>
        ) : (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
};
