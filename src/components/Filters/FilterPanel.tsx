import React from 'react';
import { useIssueStore } from '../../store/issueStore';
import './FilterPanel.css';

export const FilterPanel: React.FC = () => {
  const { filters, setFilters, resetFilters, issues } = useIssueStore();

  // Get unique assignees from all issues
  const uniqueAssignees = Array.from(
    new Set(issues.map((issue) => issue.assignee))
  ).sort();

  const hasActiveFilters = filters.assignee !== null || filters.severity !== null;

  return (
    <div className="filter-panel">
      <div className="filter-panel__group">
        <label htmlFor="assignee-filter" className="filter-panel__label">
          Assignee:
        </label>
        <select
          id="assignee-filter"
          className="filter-panel__select"
          value={filters.assignee || ''}
          onChange={(e) =>
            setFilters({ assignee: e.target.value || null })
          }
        >
          <option value="">All</option>
          {uniqueAssignees.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__group">
        <label htmlFor="severity-filter" className="filter-panel__label">
          Severity:
        </label>
        <select
          id="severity-filter"
          className="filter-panel__select"
          value={filters.severity !== null ? filters.severity : ''}
          onChange={(e) =>
            setFilters({
              severity: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">All</option>
          <option value="1">1 - Low</option>
          <option value="2">2 - Medium</option>
          <option value="3">3 - High</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="filter-panel__reset" onClick={resetFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};
