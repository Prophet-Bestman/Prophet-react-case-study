import { create } from 'zustand';
import { Issue, FilterState, UndoAction } from '../types';
import { mockFetchIssues, mockUpdateIssue } from '../utils/api';
import { sortIssuesByPriority } from '../utils/sortIssues';
import { showUndoToast } from '../utils/toastHelpers';
import { toast } from 'react-toastify';

interface IssueStore {
  // State
  issues: Issue[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  lastSyncTime: Date | null;
  undoAction: UndoAction | null;
  undoTimeoutId: NodeJS.Timeout | null;

  // Actions
  fetchIssues: () => Promise<void>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  undo: () => void;
  clearUndo: () => void;
  getFilteredAndSortedIssues: () => Issue[];
}

export const useIssueStore = create<IssueStore>((set, get) => ({
  // Initial state
  issues: [],
  loading: false,
  error: null,
  filters: {
    searchTerm: '',
    assignee: null,
    severity: null,
  },
  lastSyncTime: null,
  undoAction: null,
  undoTimeoutId: null,

  // Fetch issues from API
  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      const issues = await mockFetchIssues();
      set({ issues, loading: false, lastSyncTime: new Date() });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch issues',
        loading: false,
      });
      toast.error('Failed to load issues');
    }
  },

  // Update issue with optimistic update and undo support
  updateIssue: async (issueId: string, updates: Partial<Issue>) => {
    const { issues, undoTimeoutId } = get();

    // Clear any existing undo timeout
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    // Find the issue to update
    const issueIndex = issues.findIndex((issue) => issue.id === issueId);
    if (issueIndex === -1) return;

    const previousState = issues[issueIndex];

    // Optimistic update
    const updatedIssues = [...issues];
    updatedIssues[issueIndex] = { ...previousState, ...updates };
    set({ issues: updatedIssues });

    // Set up undo action with 5-second timeout
    const timeoutId = setTimeout(() => {
      set({ undoAction: null, undoTimeoutId: null });
    }, 5000);

    set({
      undoAction: { issueId, previousState, timestamp: Date.now() },
      undoTimeoutId: timeoutId,
    });

    // Show undo toast
    showUndoToast(() => get().undo());

    // Make API call
    try {
      await mockUpdateIssue(issueId, updates);
      set({ lastSyncTime: new Date() });
    } catch (err) {
      // Rollback on failure
      set({ issues });
      set({ undoAction: null });
      if (get().undoTimeoutId) {
        clearTimeout(get().undoTimeoutId!);
        set({ undoTimeoutId: null });
      }
      toast.error('Failed to update issue. Changes reverted.');
    }
  },

  // Undo last action
  undo: () => {
    const { undoAction, issues, undoTimeoutId } = get();

    if (!undoAction) return;

    // Clear timeout
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    // Revert to previous state
    const issueIndex = issues.findIndex((issue) => issue.id === undoAction.issueId);
    if (issueIndex !== -1) {
      const revertedIssues = [...issues];
      revertedIssues[issueIndex] = undoAction.previousState as Issue;
      set({
        issues: revertedIssues,
        undoAction: null,
        undoTimeoutId: null,
      });
      toast.success('Changes undone');
    }
  },

  // Clear undo action
  clearUndo: () => {
    const { undoTimeoutId } = get();
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }
    set({ undoAction: null, undoTimeoutId: null });
  },

  // Set filters
  setFilters: (newFilters: Partial<FilterState>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Reset all filters
  resetFilters: () => {
    set({
      filters: {
        searchTerm: '',
        assignee: null,
        severity: null,
      },
    });
  },

  // Get filtered and sorted issues
  getFilteredAndSortedIssues: () => {
    const { issues, filters } = get();

    // Apply filters
    let filtered = issues;

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.assignee) {
      filtered = filtered.filter((issue) => issue.assignee === filters.assignee);
    }

    if (filters.severity !== null) {
      filtered = filtered.filter((issue) => issue.severity === filters.severity);
    }

    // Sort by priority
    return sortIssuesByPriority(filtered);
  },
}));
