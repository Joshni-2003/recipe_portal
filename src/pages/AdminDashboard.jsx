import './AdminDashboard.css';
import { useEffect, useState } from 'react';

const initialRecipes = [
    { id: 1, name: 'Vegetable Biryani', category: 'Indian', submittedBy: 'Rahul', status: 'Approved' },
    { id: 2, name: 'Chocolate Cake', category: 'Dessert', submittedBy: 'Priya', status: 'Pending' },
    { id: 3, name: 'Masala Dosa', category: 'South Indian', submittedBy: 'Arun', status: 'Approved' },
    { id: 4, name: 'Fruit Salad', category: 'Dessert', submittedBy: 'Sneha', status: 'Pending' }
];

function readStorage(key, fallback) {
    try {
        const value = JSON.parse(
            localStorage.getItem(key) || JSON.stringify(fallback)
        );
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function AdminDashboard() {
    const [users, setUsers] = useState(() => {
        const saved = readStorage('recipe-demo-users', []);
        return Array.isArray(saved) ? saved : [];
    });

    const [recipes, setRecipes] = useState(initialRecipes);
    const [activeTab, setActiveTab] = useState('users');

    const [searchUser, setSearchUser] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [recipeSearch, setRecipeSearch] = useState('');
    const [recipeFilter, setRecipeFilter] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 5;
    const currentUser = readStorage('portalUser', null);

    useEffect(() => {
        localStorage.setItem(
            'recipe-demo-users',
            JSON.stringify(users)
        );
    }, [users]);

    const pendingCount = recipes.filter(
        recipe => recipe.status === 'Pending'
    ).length;

    const approvedCount = recipes.filter(
        recipe => recipe.status === 'Approved'
    ).length;

    function isCurrentAdmin(user) {
        return (
            user.email?.toLowerCase() ===
            currentUser?.email?.toLowerCase()
        );
    }

    // FILTER USERS
    const filteredUsers = users.filter(user => {
        const search = searchUser.toLowerCase();

        const matchesSearch =
            (user.name || '').toLowerCase().includes(search) ||
            (user.email || '').toLowerCase().includes(search);

        const matchesRole =
            roleFilter === 'All' ||
            (user.role || 'user').toLowerCase() ===
            roleFilter.toLowerCase();

        const matchesStatus =
            statusFilter === 'All' ||
            (user.status || 'Active') === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // PAGINATION
    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / usersPerPage)
    );

    const displayedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchUser, roleFilter, statusFilter]);

    // FILTER RECIPES
    const filteredRecipes = recipes.filter(recipe => {
        const search = recipeSearch.toLowerCase();

        const matchesSearch =
            recipe.name.toLowerCase().includes(search) ||
            recipe.submittedBy.toLowerCase().includes(search);

        const matchesStatus =
            recipeFilter === 'All' ||
            recipe.status === recipeFilter;

        return matchesSearch && matchesStatus;
    });

    // ACTIVATE / DEACTIVATE USER
    function toggleUserStatus(id) {
        const selectedUser = users.find(
            user => user.id === id
        );

        if (!selectedUser) return;

        if (isCurrentAdmin(selectedUser)) {
            window.alert(
                'You cannot deactivate your own Admin account.'
            );
            return;
        }

        setUsers(previous =>
            previous.map(user =>
                user.id === id
                    ? {
                        ...user,
                        status:
                            (user.status || 'Active') === 'Active'
                                ? 'Inactive'
                                : 'Active'
                    }
                    : user
            )
        );
    }

    // DELETE USER
    function deleteUser(id) {
        const selectedUser = users.find(
            user => user.id === id
        );

        if (!selectedUser) return;

        if (isCurrentAdmin(selectedUser)) {
            window.alert(
                'You cannot delete your own Admin account.'
            );
            return;
        }

        if (
            window.confirm(
                'Are you sure you want to delete this user?'
            )
        ) {
            setUsers(previous =>
                previous.filter(user => user.id !== id)
            );
        }
    }

    // DELETE RECIPE
    function deleteRecipe(id) {
        if (
            window.confirm(
                'Are you sure you want to delete this recipe?'
            )
        ) {
            setRecipes(previous =>
                previous.filter(recipe => recipe.id !== id)
            );
        }
    }

    // UPDATE RECIPE STATUS
    function updateRecipeStatus(id, newStatus) {
        setRecipes(previous =>
            previous.map(recipe =>
                recipe.id === id
                    ? { ...recipe, status: newStatus }
                    : recipe
            )
        );
    }

    return (
        <main className="admin-dashboard">

            {/* HERO BANNER */}

            <section className="admin-hero">

                <div className="hero-content">

                    <span className="hero-label">
                        <span>🛡️</span> ADMIN PANEL
                    </span>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Welcome, Admin! Manage users and recipes,
                        review submissions, and keep your community
                        engaged.
                    </p>

                    <div className="hero-line"></div>

                </div>

                <div
                    className="hero-food-decoration"
                    aria-hidden="true"
                >
                    <img
                        src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1400&q=90"
                        alt=""
                        onError={event => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.parentElement.classList.add(
                                'image-unavailable'
                            );
                        }}
                    />
                </div>

                <span className="hero-leaf hero-leaf-one">
                    🌿
                </span>

                <span className="hero-leaf hero-leaf-two">
                    ✦
                </span>

                <span className="hero-chef-decoration">
                    ♨
                </span>

            </section>

            {/* STATISTICS */}

            <section className="admin-stats">

                <article className="admin-stat-card users-card">

                    <div className="stat-icon">👥</div>

                    <div className="stat-info">
                        <h2>{users.length}</h2>
                        <p>Total Users</p>
                        <span>Registered platform users</span>
                    </div>

                    <span className="stat-arrow">›</span>

                </article>

                <article className="admin-stat-card recipes-card">

                    <div className="stat-icon">🍲</div>

                    <div className="stat-info">
                        <h2>{recipes.length}</h2>
                        <p>Total Recipes</p>
                        <span>All submitted recipes</span>
                    </div>

                    <span className="stat-arrow">›</span>

                </article>

                <article className="admin-stat-card pending-card">

                    <div className="stat-icon">⏳</div>

                    <div className="stat-info">
                        <h2>{pendingCount}</h2>
                        <p>Pending Recipes</p>
                        <span>Awaiting approval</span>
                    </div>

                    <span className="stat-arrow">›</span>

                </article>

                <article className="admin-stat-card approved-card">

                    <div className="stat-icon">✅</div>

                    <div className="stat-info">
                        <h2>{approvedCount}</h2>
                        <p>Approved Recipes</p>
                        <span>Live on platform</span>
                    </div>

                    <span className="stat-arrow">›</span>

                </article>

            </section>

            {/* MANAGEMENT PANEL */}

            <section className="admin-management">

                {/* TABS */}

                <div className="admin-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === 'users'
                                ? 'active-tab'
                                : ''
                        }
                        onClick={() => setActiveTab('users')}
                    >
                        <span>👥</span> Manage Users
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab === 'recipes'
                                ? 'active-tab'
                                : ''
                        }
                        onClick={() => setActiveTab('recipes')}
                    >
                        <span>🍲</span> Manage Recipes
                    </button>

                    <span className="tabs-decoration">
                        🌿
                    </span>

                </div>

                {/* USER MANAGEMENT */}

                {activeTab === 'users' && (

                    <div className="admin-table-section">

                        <div className="section-toolbar">

                            <div className="section-heading">

                                <span className="heading-icon">
                                    👤
                                </span>

                                <div>
                                    <h2>Registered Users</h2>
                                    <p>
                                        Search, filter and manage user accounts
                                    </p>
                                </div>

                            </div>

                            <div className="admin-user-filters">

                                <label className="admin-search-box">

                                    <span>⌕</span>

                                    <input
                                        type="search"
                                        placeholder="Search by name or email..."
                                        value={searchUser}
                                        onChange={event =>
                                            setSearchUser(event.target.value)
                                        }
                                    />

                                </label>

                                <select
                                    value={roleFilter}
                                    onChange={event =>
                                        setRoleFilter(event.target.value)
                                    }
                                >
                                    <option value="All">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={event =>
                                        setStatusFilter(event.target.value)
                                    }
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>

                            </div>

                        </div>

                        {/* USERS TABLE */}

                        <div className="admin-table-wrapper">

                            <table className="admin-table">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th className="actions-column">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {displayedUsers.map((user, index) => {

                                        const status =
                                            user.status || 'Active';

                                        const role =
                                            user.role || 'user';

                                        const isAdmin =
                                            isCurrentAdmin(user);

                                        return (
                                            <tr key={user.id}>

                                                <td>
                                                    {(currentPage - 1) *
                                                        usersPerPage +
                                                        index + 1}
                                                </td>

                                                <td>
                                                    <div className="user-name-cell">

                                                        <span className="user-avatar">
                                                            {(user.name || 'U')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>

                                                        <span>
                                                            {user.name || 'Unnamed user'}
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>{user.email}</td>

                                                <td>
                                                    <span
                                                        className={`role-badge ${role.toLowerCase()}`}
                                                    >
                                                        {role.charAt(0).toUpperCase() +
                                                            role.slice(1)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`admin-status ${status.toLowerCase()}`}
                                                    >
                                                        <span className="status-dot"></span>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="actions-cell">

                                                    <div className="admin-action-buttons">

                                                        <button
                                                            type="button"
                                                            className="toggle-user-btn"
                                                            onClick={() =>
                                                                toggleUserStatus(user.id)
                                                            }
                                                            disabled={isAdmin}
                                                            title={
                                                                isAdmin
                                                                    ? 'You cannot change your own Admin status'
                                                                    : ''
                                                            }
                                                        >
                                                            {status === 'Active'
                                                                ? 'Ⅱ Deactivate'
                                                                : '▶ Activate'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-admin-btn"
                                                            onClick={() =>
                                                                deleteUser(user.id)
                                                            }
                                                            disabled={isAdmin}
                                                            title={
                                                                isAdmin
                                                                    ? 'You cannot delete your own Admin account'
                                                                    : ''
                                                            }
                                                        >
                                                            ▤ Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                            {filteredUsers.length === 0 && (
                                <p className="admin-empty">
                                    👥 No users found. Try another search.
                                </p>
                            )}

                        </div>

                        {/* PAGINATION */}

                        <div className="admin-pagination">

                            <p>
                                Showing{' '}
                                {filteredUsers.length === 0
                                    ? 0
                                    : (currentPage - 1) * usersPerPage + 1}
                                {'–'}
                                {Math.min(
                                    currentPage * usersPerPage,
                                    filteredUsers.length
                                )}
                                {' '}of {filteredUsers.length} users
                            </p>

                            <div className="pagination-buttons">

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(page => page - 1)
                                    }
                                >
                                    ‹
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map(page => (
                                    <button
                                        type="button"
                                        key={page}
                                        className={
                                            currentPage === page
                                                ? 'current-page'
                                                : ''
                                        }
                                        onClick={() =>
                                            setCurrentPage(page)
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(page => page + 1)
                                    }
                                >
                                    ›
                                </button>

                            </div>

                        </div>

                    </div>

                )}

                {/* RECIPE MANAGEMENT */}

                {activeTab === 'recipes' && (

                    <div className="admin-table-section">

                        <div className="section-toolbar">

                            <div className="section-heading">

                                <span className="heading-icon">
                                    🍲
                                </span>

                                <div>
                                    <h2>Manage Recipes</h2>
                                    <p>
                                        Review, approve and manage submitted recipes
                                    </p>
                                </div>

                            </div>

                            <div className="admin-user-filters recipe-filters">

                                <label className="admin-search-box">

                                    <span>⌕</span>

                                    <input
                                        type="search"
                                        placeholder="Search recipes..."
                                        value={recipeSearch}
                                        onChange={event =>
                                            setRecipeSearch(event.target.value)
                                        }
                                    />

                                </label>

                                <select
                                    value={recipeFilter}
                                    onChange={event =>
                                        setRecipeFilter(event.target.value)
                                    }
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                            </div>

                        </div>

                        {/* RECIPES TABLE */}

                        <div className="admin-table-wrapper">

                            <table className="admin-table recipe-admin-table">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Recipe Name</th>
                                        <th>Category</th>
                                        <th>Submitted By</th>
                                        <th>Status</th>
                                        <th className="actions-column">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredRecipes.map(recipe => (

                                        <tr key={recipe.id}>

                                            <td>{recipe.id}</td>

                                            <td>
                                                <strong className="recipe-name">
                                                    🍽️ {recipe.name}
                                                </strong>
                                            </td>

                                            <td>{recipe.category}</td>

                                            <td>{recipe.submittedBy}</td>

                                            <td>
                                                <span
                                                    className={`admin-status ${recipe.status.toLowerCase()}`}
                                                >
                                                    <span className="status-dot"></span>
                                                    {recipe.status}
                                                </span>
                                            </td>

                                            <td className="actions-cell">

                                                <div className="admin-action-buttons">

                                                    {recipe.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="approve-admin-btn"
                                                                onClick={() =>
                                                                    updateRecipeStatus(
                                                                        recipe.id,
                                                                        'Approved'
                                                                    )
                                                                }
                                                            >
                                                                ✓ Approve
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="reject-admin-btn"
                                                                onClick={() =>
                                                                    updateRecipeStatus(
                                                                        recipe.id,
                                                                        'Rejected'
                                                                    )
                                                                }
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="delete-admin-btn"
                                                        onClick={() =>
                                                            deleteRecipe(recipe.id)
                                                        }
                                                    >
                                                        ▤ Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            {filteredRecipes.length === 0 && (
                                <p className="admin-empty">
                                    🍲 No recipes found.
                                </p>
                            )}

                        </div>

                    </div>

                )}

            </section>

        </main>
    );
}

export default AdminDashboard;