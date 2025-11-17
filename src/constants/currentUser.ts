const SETTINGS_KEY = 'app_settings';

const getSettings = () => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                name: parsed.userName || 'Alice',
                role: parsed.userRole || 'admin'
            };
        }
    } catch {
        // fallback
    }
    return {
        name: 'Alice',
        role: 'admin' as const
    };
};

export const currentUser = getSettings();
