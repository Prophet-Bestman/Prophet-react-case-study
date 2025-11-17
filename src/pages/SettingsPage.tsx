import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { toast } from 'react-toastify';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const [userName, setUserName] = useState(settings.userName);
  const [pollingInterval, setPollingInterval] = useState(settings.pollingInterval / 1000);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      userName !== settings.userName ||
      pollingInterval !== settings.pollingInterval / 1000;
    setHasChanges(changed);
  }, [userName, pollingInterval, settings]);

  const handleSave = () => {
    updateSettings({
      userName,
      pollingInterval: pollingInterval * 1000,
    });
    setHasChanges(false);
    toast.success('Settings saved successfully');

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleReset = () => {
    setUserName(settings.userName);
    setPollingInterval(settings.pollingInterval / 1000);
    setHasChanges(false);
  };

  const getRoleDescription = () => {
    if (settings.userRole === 'admin') {
      return 'Full access to drag, update, and manage all issues';
    }
    return 'View-only access to the board';
  };

  return (
    <div className="settings">
      <div className="settings__container">
        <div className="settings__header">
          <h1 className="settings__title">Settings</h1>
          <p className="settings__subtitle">Manage your profile and application preferences</p>
        </div>

        <div className="settings__grid">
          <div className="settings__section">
            <div className="settings__section-header">
              <h2 className="settings__section-title">Profile</h2>
              <p className="settings__section-desc">Your personal information</p>
            </div>

            <div className="settings__card">
              <div className="settings__profile">
                <div className="settings__avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="settings__profile-info">
                  <div className="settings__profile-name">{userName}</div>
                  <div className="settings__profile-role">
                    <span className={`settings__badge settings__badge--${settings.userRole}`}>
                      {settings.userRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings__field">
                <label className="settings__label" htmlFor="username">
                  Display Name
                </label>
                <input
                  id="username"
                  type="text"
                  className="settings__input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="settings__field">
                <label className="settings__label">Role</label>
                <div className="settings__readonly">
                  <span className={`settings__badge settings__badge--${settings.userRole}`}>
                    {settings.userRole}
                  </span>
                  <p className="settings__help">{getRoleDescription()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="settings__section">
            <div className="settings__section-header">
              <h2 className="settings__section-title">Synchronization</h2>
              <p className="settings__section-desc">Configure data refresh behavior</p>
            </div>

            <div className="settings__card">
              <div className="settings__field">
                <label className="settings__label" htmlFor="polling">
                  Auto-Refresh Interval
                </label>
                <div className="settings__input-group">
                  <input
                    id="polling"
                    type="number"
                    className="settings__input settings__input--number"
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(Math.max(5, parseInt(e.target.value) || 5))}
                    min="5"
                    max="60"
                  />
                  <span className="settings__input-suffix">seconds</span>
                </div>
                <p className="settings__help">
                  How often the board refreshes data from the server (minimum 5s)
                </p>
              </div>

              <div className="settings__info-box">
                <div className="settings__info-icon">ℹ️</div>
                <div className="settings__info-content">
                  <strong>Current interval:</strong> {settings.pollingInterval / 1000}s
                  <br />
                  <span className="settings__info-detail">
                    Last sync updates all issues automatically
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="settings__actions">
            <button className="settings__button settings__button--secondary" onClick={handleReset}>
              Cancel
            </button>
            <button className="settings__button settings__button--primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};