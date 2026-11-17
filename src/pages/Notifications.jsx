
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadNotifications } from '../utils/notificationUtils';
import './Notifications.css';

const NOTIFICATION_KEY = 'recipe-notifications';

function getUserNotifications(email) {
    if (!email) return [];

    return loadNotifications()
        .filter(
            (notification) =>
                notification.recipientEmail?.trim().toLowerCase() ===
                email.trim().toLowerCase()
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }

    return date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'recipe-approved':
            return '✓';
        case 'recipe-rejected':
            return '×';
        case 'new-review':
            return '★';
        default:
            return '♧';
    }
}

function getNotificationClass(type) {
    switch (type) {
        case 'recipe-approved':
            return 'approved';
        case 'recipe-rejected':
            return 'rejected';
        case 'new-review':
            return 'review';
        default:
            return 'general';
    }
}

function Notifications() {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState(() =>
        getUserNotifications(user?.email)
    );

    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        function refreshNotifications() {
            setNotifications(getUserNotifications(user?.email));
        }

        refreshNotifications();

        window.addEventListener(
            'notifications-updated',
            refreshNotifications
        );
        window.addEventListener('storage', refreshNotifications);

        return () => {
            window.removeEventListener(
                'notifications-updated',
                refreshNotifications
            );
            window.removeEventListener('storage', refreshNotifications);
        };
    }, [user?.email]);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const readCount = notifications.length - unreadCount;

    const filteredNotifications = notifications.filter((notification) => {
        if (activeFilter === 'unread') return !notification.isRead;
        if (activeFilter === 'read') return notification.isRead;
        return true;
    });

    function saveNotifications(updatedNotifications) {
        const allNotifications = loadNotifications();

        const updatedById = new Map(
            updatedNotifications.map((notification) => [
                notification.id,
                notification
            ])
        );

        const updatedAll = allNotifications.map((notification) =>
            updatedById.has(notification.id)
                ? updatedById.get(notification.id)
                : notification
        );

        localStorage.setItem(
            NOTIFICATION_KEY,
            JSON.stringify(updatedAll)
        );

        setNotifications(getUserNotifications(user?.email));

        window.dispatchEvent(new Event('notifications-updated'));
    }

    function markAsRead(id) {
        saveNotifications(
            notifications.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }

    function markAllAsRead() {
        saveNotifications(
            notifications.map((notification) => ({
                ...notification,
                isRead: true
            }))
        );
    }

    return (
        <main className="notifications-page">
            <div className="notifications-container">

                {/* HERO */}
                <section className="notification-hero">
                    <div className="hero-decoration hero-decoration-one">✦</div>
                    <div className="hero-decoration hero-decoration-two">✧</div>

                    <div className="hero-content">
                        <span className="notifications-eyebrow">
                            YOUR RECIPE JOURNEY
                        </span>

                        <h1>
                            Notifications<span className="hero-star">.</span>
                        </h1>

                        <p>
                            Every update, every review, every little achievement.
                            <br />
                            Stay connected with your cooking community.
                        </p>

                        <div className="hero-bottom">
                            <span className="hero-status">
                                <span className="status-dot"></span>
                                {unreadCount > 0
                                    ? `${unreadCount} unread updates waiting for you`
                                    : "You're all caught up on your activity"}
                            </span>
                        </div>
                    </div>

                    <div className="hero-illustration" aria-hidden="true">
                        <div className="hero-circle">
                            <span className="hero-bell">♧</span>
                            <span className="bell-sparkle sparkle-one">✦</span>
                            <span className="bell-sparkle sparkle-two">✧</span>
                        </div>

                        <div className="hero-floating-card">
                            <span className="floating-icon">✦</span>
                            <div>
                                <strong>{unreadCount} New</strong>
                                <small>Updates waiting</small>
                            </div>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            className="mark-all-btn"
                            type="button"
                            onClick={markAllAsRead}
                        >
                            ✓ Mark all as read
                        </button>
                    )}
                </section>

                {/* STATISTICS */}
                <section className="notification-stats">
                    <article className="notification-stat stat-total">
                        <div className="stat-icon">▤</div>
                        <div className="stat-info">
                            <span className="stat-label">ALL ACTIVITY</span>
                            <strong>{notifications.length}</strong>
                            <p>Total Notifications</p>
                        </div>
                    </article>

                    <article className="notification-stat stat-unread">
                        <div className="stat-icon">✧</div>
                        <div className="stat-info">
                            <span className="stat-label">NEW UPDATES</span>
                            <strong>{unreadCount}</strong>
                            <p>Unread Notifications</p>
                        </div>
                    </article>

                    <article className="notification-stat stat-read">
                        <div className="stat-icon">✓</div>
                        <div className="stat-info">
                            <span className="stat-label">COMPLETED</span>
                            <strong>{readCount}</strong>
                            <p>Read Notifications</p>
                        </div>
                    </article>
                </section>

                {/* ACTIVITY */}
                <section className="activity-section">
                    <div className="activity-heading">
                        <div>
                            <span className="section-eyebrow">
                                WHAT'S HAPPENING
                            </span>
                            <h2>Recent Activity</h2>
                            <p>
                                All your latest recipe and community updates.
                            </p>
                        </div>

                        <span className="activity-count">
                            {filteredNotifications.length} shown
                        </span>
                    </div>

                    {/* FILTERS */}
                    <div className="notification-toolbar">
                        <div className="filter-heading">
                            <span>☷</span>
                            Filter:
                        </div>

                        <div className="notification-filters">
                            {[
                                {
                                    id: 'all',
                                    label: 'All',
                                    count: notifications.length
                                },
                                {
                                    id: 'unread',
                                    label: 'Unread',
                                    count: unreadCount
                                },
                                {
                                    id: 'read',
                                    label: 'Read',
                                    count: readCount
                                }
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    className={`filter-btn ${
                                        activeFilter === filter.id ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveFilter(filter.id)}
                                >
                                    {filter.label}
                                    <span>{filter.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NO NOTIFICATIONS */}
                    {notifications.length === 0 ? (
                        <div className="notifications-empty">
                            <div className="empty-illustration">♧</div>
                            <span className="section-eyebrow">NOTHING NEW</span>
                            <h2>You're All Caught Up!</h2>
                            <p>
                                Your notification space is waiting for exciting
                                updates. Recipe approvals, reviews and community
                                activities will appear here.
                            </p>
                            <Link
                                to="/recipes"
                                className="explore-notifications-btn"
                            >
                                Explore Recipes <span>→</span>
                            </Link>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="filter-empty">
                            <span className="filter-empty-icon">✧</span>
                            <h3>No {activeFilter} notifications</h3>
                            <p>
                                Try selecting another filter to see your updates.
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveFilter('all')}
                            >
                                View all notifications →
                            </button>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {filteredNotifications.map((notification) => (
                                <article
                                    key={notification.id}
                                    className={`notification-card ${
                                        notification.isRead ? 'read' : 'unread'
                                    }`}
                                >
                                    <div
                                        className={`notification-icon ${getNotificationClass(
                                            notification.type
                                        )}`}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-title-row">
                                            <div>
                                                <span className="notification-category">
                                                    {notification.type?.replace(
                                                        /-/g,
                                                        ' '
                                                    ) || 'General Update'}
                                                </span>

                                                <h3>
                                                    {notification.title ||
                                                        'Recipe Portal Update'}
                                                </h3>
                                            </div>

                                            {!notification.isRead && (
                                                <span className="new-label">
                                                    <span></span>
                                                    NEW
                                                </span>
                                            )}
                                        </div>

                                        <p>{notification.message}</p>

                                        <div className="notification-footer">
                                            <span className="notification-date">
                                                ◷ {formatDate(notification.createdAt)}
                                            </span>

                                            <div className="notification-actions">
                                                {notification.recipeId && (
                                                    <Link
                                                        to={`/recipes/${notification.recipeId}`}
                                                        className="view-recipe-link"
                                                    >
                                                        View Recipe →
                                                    </Link>
                                                )}

                                                {!notification.isRead && (
                                                    <button
                                                        type="button"
                                                        className="mark-read-btn"
                                                        onClick={() =>
                                                            markAsRead(notification.id)
                                                        }
                                                    >
                                                        ✓ Mark as Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <div className="notification-bottom-note">
                    <span>✦</span>
                    Made with love for your cooking journey.
                    <span>✦</span>
                </div>
            </div>
        </main>
    );
}

export default Notifications;
