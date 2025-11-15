export type IssueStatus = 'Backlog' | 'In Progress' | 'Done';
export type IssuePriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'contributor';

export interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: number;
  createdAt: string;
  assignee: string;
  tags: string[];
  userDefinedRank: number;
}

export interface User {
  name: string;
  role: UserRole;
}

export interface FilterState {
  searchTerm: string;
  assignee: string | null;
  severity: number | null;
}

export interface UndoAction {
  issueId: string;
  previousState: Partial<Issue>;
  timestamp: number;
}
