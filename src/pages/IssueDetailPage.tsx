import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useIssueStore } from '../store/issueStore';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';
import { currentUser } from '../constants/currentUser';
import { calculatePriorityScore } from '../utils/priorityScore';
import './IssueDetailPage.css';

export const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateIssue, fetchIssues } = useIssueStore();
  const { addRecentIssue } = useRecentlyAccessed();

  const issue = issues.find((i) => i.id === id);

  // Fetch issues if not loaded and track visit
  useEffect(() => {
    if (issues.length === 0) {
      fetchIssues();
    }
    if (id) {
      addRecentIssue(id);
    }
  }, [id, issues.length, fetchIssues, addRecentIssue]);

  const handleMarkAsResolved = () => {
    if (id && currentUser.role === 'admin') {
      updateIssue(id, { status: 'Done' });
    }
  };

  const handleGoBack = () => {
    navigate('/board');
  };

  if (!issue) {
    return (
      <div className="issue-detail__not-found">
        <h2>Issue not found</h2>
        <p>The issue #{id} could not be found.</p>
        <button onClick={handleGoBack} className="issue-detail__back-button">
          Go back to board
        </button>
      </div>
    );
  }

  const priorityScore = calculatePriorityScore(issue);
  const createdDate = dayjs(issue.createdAt);
  const daysAgo = dayjs().diff(createdDate, 'day');
  const isAdmin = currentUser.role === 'admin';
  const canResolve = isAdmin && issue.status !== 'Done';

  return (
    <div className="issue-detail">
      <div className="issue-detail__header">
        <button onClick={handleGoBack} className="issue-detail__back-button">
          ← Back to Board
        </button>
      </div>

      <div className="issue-detail__content">
        <div className="issue-detail__main">
          <div className="issue-detail__title-section">
            <span className="issue-detail__id">#{issue.id}</span>
            <h1 className="issue-detail__title">{issue.title}</h1>
          </div>

          <div className="issue-detail__metadata-grid">
            <div className="issue-detail__metadata-item">
              <label>Status</label>
              <span className={`issue-detail__status issue-detail__status--${issue.status.toLowerCase().replace(' ', '-')}`}>
                {issue.status}
              </span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>Priority</label>
              <span className={`issue-detail__priority issue-detail__priority--${issue.priority}`}>
                {issue.priority}
              </span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>Severity</label>
              <span className="issue-detail__value">{issue.severity}</span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>Priority Score</label>
              <span className="issue-detail__value">{priorityScore}</span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>Assignee</label>
              <span className="issue-detail__value">{issue.assignee}</span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>User Defined Rank</label>
              <span className="issue-detail__value">{issue.userDefinedRank}</span>
            </div>

            <div className="issue-detail__metadata-item">
              <label>Created</label>
              <span className="issue-detail__value">
                {createdDate.format('MMM D, YYYY')} ({daysAgo} days ago)
              </span>
            </div>
          </div>

          {issue.tags.length > 0 && (
            <div className="issue-detail__tags-section">
              <label>Tags</label>
              <div className="issue-detail__tags">
                {issue.tags.map((tag) => (
                  <span key={tag} className="issue-detail__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {canResolve && (
            <div className="issue-detail__actions">
              <button
                onClick={handleMarkAsResolved}
                className="issue-detail__resolve-button"
              >
                ✓ Mark as Resolved
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="issue-detail__read-only">
              You are viewing in read-only mode. Only admins can make changes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
