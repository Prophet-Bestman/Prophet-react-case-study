import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import dayjs from 'dayjs';
import { useIssueStore } from '../../store/issueStore';
import { usePolling } from '../../hooks/usePolling';
import { useSettings } from '../../hooks/useSettings';
import { currentUser } from '../../constants/currentUser';
import { Column } from './Column';
import { IssueCard } from './IssueCard';
import { SearchBar } from '../Filters/SearchBar';
import { FilterPanel } from '../Filters/FilterPanel';
import { RecentlySidebar } from '../RecentlySidebar';
import { Issue, IssueStatus } from '../../types';
import './Board.css';

export const Board: React.FC = () => {
  const {
    issues,
    loading,
    error,
    lastSyncTime,
    fetchIssues,
    updateIssue,
    getFilteredAndSortedIssues,
  } = useIssueStore();

  const { settings } = useSettings();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Initialize - fetch issues on mount
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Set up polling with configurable interval
  usePolling(
    () => {
      fetchIssues();
    },
    settings.pollingInterval,
    true
  );

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Get filtered and sorted issues
  const filteredIssues = getFilteredAndSortedIssues();

  // Group issues by status
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      Backlog: [],
      'In Progress': [],
      Done: [],
    };

    filteredIssues.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      }
    });

    return grouped;
  }, [filteredIssues]);

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    // Check if user has permission to move issues
    if (currentUser.role !== 'admin') {
      return;
    }

    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    // Only update if status changed
    if (issue.status !== newStatus) {
      updateIssue(issueId, { status: newStatus });
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return dayjs(date).format('HH:mm:ss');
  };

  const isAdmin = currentUser.role === 'admin';

  if (error) {
    return (
      <div className="board__error">
        <p>Error loading issues: {error}</p>
        <button onClick={fetchIssues} className="board__retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board__header">
        <div className="board__header-top">
          <h1 className="board__title">Issue Board</h1>
          <div className="board__user-info">
            <span className="board__user-name">{settings.userName}</span>
            <span
              className={`board__user-role ${
                isAdmin ? 'board__user-role--admin' : 'board__user-role--contributor'
              }`}
            >
              {settings.userRole}
            </span>
          </div>
        </div>

        <div className="board__controls">
          <SearchBar />
          <FilterPanel />
        </div>

        <div className="board__sync-info">
          Last synced: <strong>{formatLastSync(lastSyncTime)}</strong>
          {loading && <span className="board__sync-loading">Syncing...</span>}
        </div>

        {!isAdmin && (
          <div className="board__read-only-notice">
            You are in read-only mode. Only admins can move or edit issues.
          </div>
        )}
      </div>

      <div className="board__content">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="board__columns">
            <Column status="Backlog" issues={issuesByStatus['Backlog']} />
            <Column status="In Progress" issues={issuesByStatus['In Progress']} />
            <Column status="Done" issues={issuesByStatus['Done']} />
          </div>

          <DragOverlay>
            {activeIssue ? <IssueCard issue={activeIssue} isDragging /> : null}
          </DragOverlay>
        </DndContext>

        <RecentlySidebar />
      </div>
    </div>
  );
};
