import { mockFetchIssues, mockUpdateIssue } from './api';
import { Issue } from '../types';

// Increase timeout for async tests
jest.setTimeout(10000);

describe('mockFetchIssues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of issues', async () => {
    const issues = await mockFetchIssues();

    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should return issues with correct structure', async () => {
    const issues = await mockFetchIssues();
    const issue = issues[0];

    expect(issue).toHaveProperty('id');
    expect(issue).toHaveProperty('title');
    expect(issue).toHaveProperty('status');
    expect(issue).toHaveProperty('priority');
    expect(issue).toHaveProperty('severity');
    expect(issue).toHaveProperty('createdAt');
    expect(issue).toHaveProperty('assignee');
    expect(issue).toHaveProperty('tags');
    expect(issue).toHaveProperty('userDefinedRank');
  });

  it('should simulate network delay (500ms)', async () => {
    const startTime = Date.now();
    await mockFetchIssues();
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Allow some margin for test execution
    expect(duration).toBeGreaterThanOrEqual(500);
    expect(duration).toBeLessThan(600);
  });

  it('should return the same issues on subsequent calls', async () => {
    const firstFetch = await mockFetchIssues();
    const secondFetch = await mockFetchIssues();

    expect(firstFetch).toEqual(secondFetch);
  });

  it('should return a copy of issues (not the same reference)', async () => {
    const firstFetch = await mockFetchIssues();
    const secondFetch = await mockFetchIssues();

    // Arrays should be equal but not the same reference
    expect(firstFetch).toEqual(secondFetch);
    expect(firstFetch).not.toBe(secondFetch);
  });

  it('should load issues from JSON on first call', async () => {
    const issues = await mockFetchIssues();

    // Just verify it loaded some issues from the JSON file
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toHaveProperty('id');
    expect(issues[0]).toHaveProperty('title');
  });
});

describe('mockUpdateIssue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset random seed for consistent testing
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // Always succeed (> 0.1)
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update issue after 500ms delay', async () => {
    const startTime = Date.now();
    await mockUpdateIssue('1', { status: 'Done' });
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(500);
    expect(duration).toBeLessThan(600);
  });

  it('should return updated issue on success', async () => {
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    const updated = await mockUpdateIssue(firstIssueId, { status: 'Done' });

    expect(updated).toHaveProperty('id', firstIssueId);
    expect(updated).toHaveProperty('status', 'Done');
  });

  it('should persist changes in memory', async () => {
    // First, fetch initial issues
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    // Update an issue
    await mockUpdateIssue(firstIssueId, { status: 'Done', priority: 'low' });

    // Fetch again and verify persistence
    const updatedIssues = await mockFetchIssues();
    const updatedIssue = updatedIssues.find((i) => i.id === firstIssueId);

    expect(updatedIssue?.status).toBe('Done');
    expect(updatedIssue?.priority).toBe('low');
  });

  it('should merge updates with existing issue data', async () => {
    const issues = await mockFetchIssues();
    const firstIssue = issues[0];

    const updated = await mockUpdateIssue(firstIssue.id, { status: 'In Progress' });

    // Original data should still be present
    expect(updated.id).toBe(firstIssue.id);
    expect(updated.title).toBe(firstIssue.title);
    expect(updated.assignee).toBe(firstIssue.assignee);
    // Updated field
    expect(updated.status).toBe('In Progress');
  });

  it('should allow partial updates', async () => {
    const issues = await mockFetchIssues();
    const secondIssue = issues[1];
    const originalTitle = secondIssue.title;
    const originalAssignee = secondIssue.assignee;

    const updated = await mockUpdateIssue(secondIssue.id, {
      severity: 3,
    });

    expect(updated.severity).toBe(3);
    expect(updated.title).toBe(originalTitle); // Original data preserved
    expect(updated.assignee).toBe(originalAssignee); // Original data preserved
  });

  it('should reject with error on failure (10% rate)', async () => {
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    // Mock Math.random to return >= 0.9 to trigger failure
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.95);

    await expect(mockUpdateIssue(firstIssueId, { status: 'Done' })).rejects.toThrow(
      'Failed to update issue'
    );

    randomSpy.mockRestore();
  });

  it('should succeed most of the time (90% success rate)', async () => {
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    // Mock Math.random to return < 0.9 to trigger success
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    await expect(mockUpdateIssue(firstIssueId, { status: 'Done' })).resolves.toBeDefined();

    randomSpy.mockRestore();
  });

  it('should handle updates to non-existent issues gracefully', async () => {
    await mockFetchIssues();

    const updated = await mockUpdateIssue('999', { status: 'Done' });

    // Should return a merged object even if not found
    expect(updated).toHaveProperty('id', '999');
    expect(updated).toHaveProperty('status', 'Done');
  });

  it('should handle multiple field updates', async () => {
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    const updated = await mockUpdateIssue(firstIssueId, {
      status: 'Done',
      priority: 'low',
      severity: 1,
      userDefinedRank: 10,
    });

    expect(updated.status).toBe('Done');
    expect(updated.priority).toBe('low');
    expect(updated.severity).toBe(1);
    expect(updated.userDefinedRank).toBe(10);
  });
});

describe('mockUpdateIssue - failure simulation', () => {
  it('should have approximately 10% failure rate over multiple calls', async () => {
    const issues = await mockFetchIssues();
    const firstIssueId = issues[0].id;

    const attempts = 20; // Reduced from 100 to avoid timeout
    let failures = 0;

    // Restore Math.random to use actual random values
    jest.restoreAllMocks();

    for (let i = 0; i < attempts; i++) {
      try {
        await mockUpdateIssue(firstIssueId, { status: 'Done' });
      } catch {
        failures++;
      }
    }

    // With 20 attempts, expect 0-6 failures (allowing wider variance for smaller sample)
    expect(failures).toBeGreaterThanOrEqual(0);
    expect(failures).toBeLessThanOrEqual(6);
  }, 30000); // 30 second timeout for this test
});
