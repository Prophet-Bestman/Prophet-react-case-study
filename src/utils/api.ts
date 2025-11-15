import { Issue } from '../types';

// In-memory store for simulating persistence
let inMemoryIssues: Issue[] | null = null;

/**
 * Fetch all issues from the mock API
 * Simulates 500ms network delay
 */
export const mockFetchIssues = async (): Promise<Issue[]> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            if (!inMemoryIssues) {
                const module = await import('../data/issues.json');
                inMemoryIssues = module.default as Issue[];
            }
            resolve([...inMemoryIssues]);
        }, 500);
    });
};

/**
 * Update an issue in the mock API
 * Simulates 500ms network delay and 10% failure rate
 */
export const mockUpdateIssue = async (
    issueId: string,
    updates: Partial<Issue>
): Promise<Issue> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 10% failure rate for error handling testing
            if (Math.random() < 0.9) {
                if (inMemoryIssues) {
                    const index = inMemoryIssues.findIndex((issue) => issue.id === issueId);
                    if (index !== -1) {
                        inMemoryIssues[index] = { ...inMemoryIssues[index], ...updates };
                        resolve(inMemoryIssues[index]);
                        return;
                    }
                }
                // If not found in memory, return merged object
                resolve({ id: issueId, ...updates } as Issue);
            } else {
                reject(new Error('Failed to update issue'));
            }
        }, 500);
    });
};
