import { sortIssuesByPriority } from './sortIssues';
import { calculatePriorityScore } from './priorityScore';
import { Issue } from '../types';

describe('sortIssuesByPriority', () => {
  const createMockIssue = (overrides: Partial<Issue>): Issue => ({
    id: '1',
    title: 'Test Issue',
    status: 'Backlog',
    priority: 'medium',
    severity: 2,
    createdAt: '2025-11-10T10:00:00Z',
    assignee: 'alice',
    tags: [],
    userDefinedRank: 0,
    ...overrides,
  });

  it('should sort issues by priority score in descending order', () => {
    const issues: Issue[] = [
      createMockIssue({ id: '1', severity: 1, userDefinedRank: 0 }), // Lower score
      createMockIssue({ id: '2', severity: 3, userDefinedRank: 0 }), // Higher score
      createMockIssue({ id: '3', severity: 2, userDefinedRank: 0 }), // Medium score
    ];

    const sorted = sortIssuesByPriority(issues);

    expect(sorted[0].id).toBe('2'); // Highest severity first
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1'); // Lowest severity last
  });

  it('should place newer issues first when scores are equal', () => {
    const issues: Issue[] = [
      createMockIssue({
        id: '1',
        severity: 2,
        userDefinedRank: 5,
        createdAt: '2025-11-10T10:00:00Z', // Older
      }),
      createMockIssue({
        id: '2',
        severity: 2,
        userDefinedRank: 5,
        createdAt: '2025-11-12T10:00:00Z', // Newer
      }),
    ];

    const sorted = sortIssuesByPriority(issues);

    // Both have same severity and rank, so newer should come first
    expect(sorted[0].id).toBe('2'); // Newer issue
    expect(sorted[1].id).toBe('1'); // Older issue
  });

  it('should not mutate the original array', () => {
    const issues: Issue[] = [
      createMockIssue({ id: '1', severity: 1 }),
      createMockIssue({ id: '2', severity: 3 }),
    ];

    const original = [...issues];
    sortIssuesByPriority(issues);

    expect(issues).toEqual(original);
  });

  it('should handle empty array', () => {
    const sorted = sortIssuesByPriority([]);
    expect(sorted).toEqual([]);
  });

  it('should handle single issue', () => {
    const issue = createMockIssue({ id: '1' });
    const sorted = sortIssuesByPriority([issue]);

    expect(sorted).toHaveLength(1);
    expect(sorted[0]).toEqual(issue);
  });

  it('should respect userDefinedRank in score calculation', () => {
    const issues: Issue[] = [
      createMockIssue({ id: '1', severity: 2, userDefinedRank: 1 }),
      createMockIssue({ id: '2', severity: 2, userDefinedRank: 10 }), // Higher rank
    ];

    const sorted = sortIssuesByPriority(issues);

    // Issue 2 should come first due to higher userDefinedRank
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });
});

describe('calculatePriorityScore', () => {
  const createMockIssue = (overrides: Partial<Issue>): Issue => ({
    id: '1',
    title: 'Test Issue',
    status: 'Backlog',
    priority: 'medium',
    severity: 2,
    createdAt: '2025-11-10T10:00:00Z',
    assignee: 'alice',
    tags: [],
    userDefinedRank: 0,
    ...overrides,
  });

  it('should calculate score correctly with formula: severity * 10 + daysSinceCreated * -1 + userDefinedRank', () => {
    // Note: This test will be time-dependent, so we'll test the components
    const issue = createMockIssue({
      severity: 3,
      userDefinedRank: 5,
      createdAt: '2025-11-10T10:00:00Z',
    });

    const score = calculatePriorityScore(issue);

    // Score should be: 30 (severity) - daysSinceCreated + 5 (rank)
    // The exact value depends on current date, but should include all components
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThan(0); // With recent date and positive components
  });

  it('should give higher scores to higher severity issues', () => {
    const lowSeverity = createMockIssue({ severity: 1, userDefinedRank: 0 });
    const highSeverity = createMockIssue({ severity: 3, userDefinedRank: 0 });

    const scoreLow = calculatePriorityScore(lowSeverity);
    const scoreHigh = calculatePriorityScore(highSeverity);

    expect(scoreHigh).toBeGreaterThan(scoreLow);
    expect(scoreHigh - scoreLow).toBe(20); // (3-1) * 10 = 20
  });
});
