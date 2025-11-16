import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';
import { useIssueStore } from '../store/issueStore';
import { Issue } from '../types';
import './RecentlySidebar.css';

export const RecentlySidebar: React.FC = () => {
  const { recentIssueIds } = useRecentlyAccessed();
  const { issues } = useIssueStore();
  const navigate = useNavigate();

  // Get the full issue data for recent IDs
  const recentIssues = recentIssueIds
    .map((id) => issues.find((issue) => issue.id === id))
    .filter((issue): issue is Issue => issue !== undefined);

  if (recentIssues.length === 0) {
    return null;
  }

  return (
    <div className="recently-sidebar">
      <h3 className="recently-sidebar__title">Recently Accessed</h3>
      <div className="recently-sidebar__list">
        {recentIssues.map((issue) => (
          <div
            key={issue.id}
            className="recently-sidebar__item"
            onClick={() => navigate(`/issue/${issue.id}`)}
          >
            <div className="recently-sidebar__item-id">#{issue.id}</div>
            <div className="recently-sidebar__item-title">{issue.title}</div>
            <div className="recently-sidebar__item-status">{issue.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
