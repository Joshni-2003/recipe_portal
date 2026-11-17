
import './AdminSettings.css';
import { useEffect, useState } from 'react';

const defaultSettings = {
    recipeSubmissions: true,
    reviewsEnabled: true,
    reviewReports: true,
    automaticApproval: false
};

const settingItems = [
    {
        id: 'recipeSubmissions',
        icon: '🍲',
        number: '01',
        title: 'Recipe Submissions',
        description: 'Allow registered users to submit new recipes.'
    },
    {
        id: 'reviewsEnabled',
        icon: '⭐',
        number: '02',
        title: 'Enable Reviews',
        description: 'Allow users to write reviews and ratings on recipes.'
    },
    {
        id: 'reviewReports',
        icon: '🚩',
        number: '03',
        title: 'Review Reporting',
        description: 'Allow users to report inappropriate reviews.'
    },
    {
        id: 'automaticApproval',
        icon: '🛡️',
        number: '04',
        title: 'Automatic Recipe Approval',
        description: 'Automatically approve submitted recipes without moderator review.'
    }
];

function AdminSettings() {

    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('recipe-admin-settings');

            return saved
                ? { ...defaultSettings, ...JSON.parse(saved) }
                : { ...defaultSettings };
        } catch {
            return { ...defaultSettings };
        }
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        localStorage.setItem(
            'recipe-admin-settings',
            JSON.stringify(settings)
        );

        window.dispatchEvent(new Event('admin-settings-updated'));
    }, [settings]);

    function handleToggle(settingName) {
        setSettings(previous => ({
            ...previous,
            [settingName]: !previous[settingName]
        }));

        setMessage('Settings updated successfully!');
    }

    function handleReset() {
        setSettings({ ...defaultSettings });
        setMessage('Settings restored to default values!');
    }

    const enabledCount = Object.values(settings).filter(Boolean).length;

    return (
        <div className="admin-settings-page">

            {/* HERO BANNER */}
            <section className="settings-hero">

                {/* LEFT CONTENT */}
                <div className="settings-hero-content">

                    <span className="settings-hero-label">
                        ⚙ ADMIN CONTROL PANEL
                    </span>

                    <h1>Admin Settings</h1>

                    <p>
                        Customize your recipe portal preferences and
                        manage community moderation.
                    </p>

                    <div className="settings-hero-line"></div>

                </div>

                {/* RIGHT SIDE FOOD IMAGE */}
                <div className="settings-hero-image">

                    <img
                        src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=85"
                        alt="Delicious Indian biryani"
                    />

                </div>

                

            </section>

            {/* MAIN SETTINGS CONTAINER */}
            <section className="settings-content">

                {/* HEADING */}
                <div className="settings-heading">

                    <div>
                        <span className="settings-section-label">
                            PREFERENCES
                        </span>

                        <h2>Moderation Settings</h2>

                        <p>
                            Manage how your recipe community interacts with the portal.
                        </p>
                    </div>

                    <span className="settings-count">
                        04 SETTINGS
                    </span>

                </div>

                {/* OVERVIEW CARDS */}
                <div className="settings-overview">

                    <div className="settings-overview-item">

                        <div className="overview-icon">
                            👥
                        </div>

                        <div>
                            <strong>{enabledCount} / 4</strong>
                            <span>Active Settings</span>
                        </div>

                    </div>

                    <div className="settings-overview-item">

                        <div className="overview-icon">
                            🛡️
                        </div>

                        <div>
                            <strong>Admin</strong>
                            <span>Control Panel</span>
                        </div>

                    </div>

                </div>

                {/* SETTINGS LIST */}
                <div className="settings-list">

                    {settingItems.map(item => (

                        <div className="setting-item" key={item.id}>

                            <div className="setting-item-left">

                                <div className="setting-icon">
                                    {item.icon}
                                </div>

                                <div className="setting-text">

                                    <span className="setting-number">
                                        SETTING {item.number}
                                    </span>

                                    <h3>{item.title}</h3>

                                    <p>{item.description}</p>

                                </div>

                            </div>

                            <div className="setting-item-right">

                                <span
                                    className={`setting-status ${
                                        settings[item.id]
                                            ? 'is-enabled'
                                            : 'is-disabled'
                                    }`}
                                >
                                    <span className="status-dot">✓</span>

                                    {settings[item.id]
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </span>

                                <label className="setting-switch">

                                    <input
                                        type="checkbox"
                                        checked={settings[item.id]}
                                        onChange={() => handleToggle(item.id)}
                                        aria-label={`Toggle ${item.title}`}
                                    />

                                    <span className="setting-slider"></span>

                                </label>

                            </div>

                        </div>

                    ))}

                </div>

                {/* BOTTOM ACTION */}
                <div className="settings-bottom">

                    <div className="settings-bottom-left">

                        <div className="settings-bottom-icon">
                            ↻
                        </div>

                        <div className="settings-bottom-text">

                            <h3>Manage Your Preferences</h3>

                            <p>
                                Changes are automatically saved in your browser.
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="reset-settings-btn"
                        onClick={handleReset}
                    >
                        ↻ &nbsp; Reset Default Settings
                    </button>

                </div>

                {/* SUCCESS MESSAGE */}
                {message && (
                    <p className="settings-success" role="status">
                        ✓ &nbsp; {message}
                    </p>
                )}

                {/* INFORMATION NOTE */}
                <div className="settings-note">

                    <span className="note-icon">ℹ</span>

                    <p>
                        These are frontend demo settings saved in your browser.
                        They do not yet control backend permissions or moderation.
                    </p>

                </div>

            </section>

        </div>
    );
}

export default AdminSettings;
