
import './ModeratorDashboard.css';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../utils/notificationUtils';
import { recipes as recipeImageLibrary } from '../data/recipes';

// Normalize recipe names for reliable matching.
function normalizeName(name) {
    return String(name || '').trim().toLowerCase();
}

// Create a list of recipes that actually exist in RecipeCard's library.
const availableRecipeNames = new Set(
    recipeImageLibrary.map(recipe => normalizeName(recipe.name))
);

// Check whether a submitted recipe exists in the recipe library.
function isAvailableRecipe(recipe) {
    return availableRecipeNames.has(normalizeName(recipe.name));
}

// Match the image from the shared recipe library.
function getRecipeImage(recipe) {
    const matchingRecipe = recipeImageLibrary.find(
        item =>
            normalizeName(item.name) === normalizeName(recipe.name)
    );

    return (
        matchingRecipe?.image ||
        recipe.image ||
        '/images/recipe-placeholder.jpg'
    );
}

// Remove recipes that do not exist in the shared recipe library.
function filterAvailableRecipes(recipes) {
    if (!Array.isArray(recipes)) return [];

    return recipes.filter(isAvailableRecipe);
}

// Use an existing recipe image for the hero section.
const heroRecipe = recipeImageLibrary.find(
    recipe => recipe?.image
);

function ModeratorDashboard() {
    const { user } = useAuth();

    // Load saved submissions and remove recipes not in RecipeCard's library.
    const [submittedRecipes, setSubmittedRecipes] = useState(() => {
        try {
            const savedRecipes = localStorage.getItem('moderatorRecipes');

            if (savedRecipes) {
                const parsedRecipes = JSON.parse(savedRecipes);
                return filterAvailableRecipes(parsedRecipes);
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
        }

        return [];
    });

    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Save only valid recipes.
    useEffect(() => {
        const validRecipes = filterAvailableRecipes(submittedRecipes);

        localStorage.setItem(
            'moderatorRecipes',
            JSON.stringify(validRecipes)
        );

        window.dispatchEvent(
            new Event('moderator-recipes-updated')
        );
    }, [submittedRecipes]);

    // Dashboard statistics.
    const pendingCount = submittedRecipes.filter(
        recipe => recipe.status === 'Pending'
    ).length;

    const approvedCount = submittedRecipes.filter(
        recipe => recipe.status === 'Approved'
    ).length;

    const rejectedCount = submittedRecipes.filter(
        recipe => recipe.status === 'Rejected'
    ).length;

    const totalCount = submittedRecipes.length;
    const readCount = approvedCount + rejectedCount;

    // Moderator information.
    const moderatorName =
        user?.name || user?.username || 'Moderator';

    function getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    function getModeratorEmail() {
        return user?.email?.trim().toLowerCase() || '';
    }

    function getRecipeRecipientEmail(recipe) {
        return String(
            recipe?.submittedByEmail ||
            recipe?.submittedById ||
            ''
        ).trim().toLowerCase();
    }

    // Format dates.
    function formatDate(value) {
        if (!value) return 'Not available';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return 'Not available';
        }

        return date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Approve recipe.
    function approveRecipe(id) {
        const confirmed = window.confirm(
            'Are you sure you want to approve this recipe?'
        );

        if (!confirmed) return;

        const recipeToApprove = submittedRecipes.find(
            recipe =>
                recipe.id === id &&
                recipe.status === 'Pending'
        );

        if (!recipeToApprove) return;

        setSubmittedRecipes(previous =>
            previous.map(recipe =>
                recipe.id === id && recipe.status === 'Pending'
                    ? {
                        ...recipe,
                        status: 'Approved',
                        reason: '',
                        reviewedAt: getCurrentDate(),
                        reviewedBy: 'Moderator'
                    }
                    : recipe
            )
        );

        const recipientEmail =
            getRecipeRecipientEmail(recipeToApprove);

        if (recipientEmail) {
            addNotification({
                recipientEmail,
                actorEmail: getModeratorEmail(),
                type: 'recipe-approved',
                title: 'Recipe Approved',
                message: `Your recipe "${recipeToApprove.name}" has been approved by the moderator.`,
                recipeId: recipeToApprove.id,
                recipeName: recipeToApprove.name
            });
        }

        alert('Recipe approved successfully!');
    }

    // Open rejection form.
    function openRejectForm(id) {
        setSelectedRecipe(id);
        setRejectionReason('');
    }

    // Reject recipe.
    function rejectRecipe() {
        if (!rejectionReason.trim()) {
            alert('Please enter a rejection reason.');
            return;
        }

        const recipeToReject = submittedRecipes.find(
            recipe =>
                recipe.id === selectedRecipe &&
                recipe.status === 'Pending'
        );

        if (!recipeToReject) {
            alert('This recipe is no longer pending.');
            setSelectedRecipe(null);
            setRejectionReason('');
            return;
        }

        setSubmittedRecipes(previous =>
            previous.map(recipe =>
                recipe.id === selectedRecipe &&
                recipe.status === 'Pending'
                    ? {
                        ...recipe,
                        status: 'Rejected',
                        reason: rejectionReason.trim(),
                        reviewedAt: getCurrentDate(),
                        reviewedBy: 'Moderator'
                    }
                    : recipe
            )
        );

        const recipientEmail =
            getRecipeRecipientEmail(recipeToReject);

        if (recipientEmail) {
            addNotification({
                recipientEmail,
                actorEmail: getModeratorEmail(),
                type: 'recipe-rejected',
                title: 'Recipe Rejected',
                message: `Your recipe "${recipeToReject.name}" was rejected. Reason: ${rejectionReason.trim()}`,
                recipeId: recipeToReject.id,
                recipeName: recipeToReject.name
            });
        }

        setSelectedRecipe(null);
        setRejectionReason('');

        alert('Recipe rejected successfully!');
    }

    function cancelRejection() {
        setSelectedRecipe(null);
        setRejectionReason('');
    }

    // Search and filter recipes.
    const filteredRecipes = submittedRecipes.filter(recipe => {
        const matchesFilter =
            filter === 'All' || recipe.status === filter;

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            (recipe.name || '').toLowerCase().includes(search) ||
            (recipe.category || '').toLowerCase().includes(search) ||
            (
                recipe.submittedBy ||
                recipe.createdBy ||
                ''
            ).toLowerCase().includes(search);

        return matchesFilter && matchesSearch;
    });

    // Moderation history.
    const moderationHistory = submittedRecipes
        .filter(recipe =>
            recipe.status === 'Approved' ||
            recipe.status === 'Rejected'
        )
        .sort((a, b) =>
            (b.reviewedAt || '').localeCompare(a.reviewedAt || '')
        );

    const filterOptions = [
        { label: 'All Recipes', value: 'All', count: totalCount },
        { label: 'Pending', value: 'Pending', count: pendingCount },
        { label: 'Approved', value: 'Approved', count: approvedCount },
        { label: 'Rejected', value: 'Rejected', count: rejectedCount }
    ];

    return (
        <main className="moderator-dashboard">
            <div className="moderator-container">

                {/* HERO SECTION */}
                <section className="moderator-hero">
                    <div className="hero-pattern">✦</div>
                    <div className="hero-pattern pattern-two">✧</div>

                    <div className="hero-left">
                        <span className="hero-tag">
                            RECIPE PORTAL ADMINISTRATION
                        </span>

                        <h1>
                            Welcome Back,
                            <br />
                            <span>{moderatorName}!</span>
                        </h1>

                        <p>
                            Every great recipe deserves a place at the table.
                            Review submissions and help our cooking community grow.
                        </p>

                        <div className="hero-status">
                            <span className="hero-status-dot"></span>

                            {pendingCount > 0
                                ? `${pendingCount} recipes waiting for your review`
                                : "You're all caught up on recipe reviews"}
                        </div>

                        <button
                            className="hero-action"
                            type="button"
                            onClick={() => {
                                setFilter('Pending');

                                document
                                    .getElementById('recipe-management')
                                    ?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Review Submissions <span>→</span>
                        </button>
                    </div>

                    {/* HERO IMAGE - USES EXISTING RECIPE IMAGE */}
                    <div className="hero-art">

                        <div className="hero-art-circle">
                            {heroRecipe?.image && (
                                <img
                                    src={heroRecipe.image}
                                    alt={heroRecipe.name || 'Featured recipe'}
                                    onError={e => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>

                        <span className="art-sparkle art-sparkle-one">
                            ✦
                        </span>

                        <span className="art-sparkle art-sparkle-two">
                            ✧
                        </span>

                        <div className="hero-floating-card">
                            <div>
                                <strong>{totalCount} Recipes</strong>
                                <small>Community submissions</small>
                            </div>
                        </div>

                        <div className="hero-mini-badge">
                            Trusted Moderator
                        </div>
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="moderator-stats">

                    <button
                        type="button"
                        className="moderator-stat-card total-stat"
                        onClick={() => setFilter('All')}
                    >
                        <div className="stat-card-top">
                            <span className="stat-icon">▤</span>
                            <span className="stat-arrow">↗</span>
                        </div>

                        <span className="stat-label">TOTAL SUBMISSIONS</span>
                        <strong>{totalCount}</strong>
                        <p>All submitted recipes</p>

                        <div className="stat-progress">
                            <span style={{
                                width: totalCount ? '100%' : '0%'
                            }}></span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="moderator-stat-card pending-stat"
                        onClick={() => setFilter('Pending')}
                    >
                        <div className="stat-card-top">
                            <span className="stat-icon">◷</span>
                            <span className="stat-arrow">↗</span>
                        </div>

                        <span className="stat-label">AWAITING REVIEW</span>
                        <strong>{pendingCount}</strong>
                        <p>Recipes need your attention</p>

                        <div className="stat-progress">
                            <span style={{
                                width: `${totalCount ? pendingCount / totalCount * 100 : 0}%`
                            }}></span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="moderator-stat-card approved-stat"
                        onClick={() => setFilter('Approved')}
                    >
                        <div className="stat-card-top">
                            <span className="stat-icon">✓</span>
                            <span className="stat-arrow">↗</span>
                        </div>

                        <span className="stat-label">APPROVED RECIPES</span>
                        <strong>{approvedCount}</strong>
                        <p>Successfully published</p>

                        <div className="stat-progress">
                            <span style={{
                                width: `${totalCount ? approvedCount / totalCount * 100 : 0}%`
                            }}></span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="moderator-stat-card rejected-stat"
                        onClick={() => setFilter('Rejected')}
                    >
                        <div className="stat-card-top">
                            <span className="stat-icon">✕</span>
                            <span className="stat-arrow">↗</span>
                        </div>

                        <span className="stat-label">REJECTED RECIPES</span>
                        <strong>{rejectedCount}</strong>
                        <p>Submissions not approved</p>

                        <div className="stat-progress">
                            <span style={{
                                width: `${totalCount ? rejectedCount / totalCount * 100 : 0}%`
                            }}></span>
                        </div>
                    </button>
                </section>

                {/* QUICK OVERVIEW */}
                <section className="moderator-overview">

                    <div className="overview-message">
                        <span className="overview-icon">i</span>

                        <div>
                            <strong>Your moderation overview</strong>

                            <p>
                                {pendingCount > 0
                                    ? `You have ${pendingCount} recipes waiting for review. Help creators share their delicious recipes with the community!`
                                    : 'Wonderful! All submitted recipes have been reviewed. Keep encouraging your cooking community!'}
                            </p>
                        </div>
                    </div>

                    <div className="overview-completion">
                        <div className="completion-heading">
                            <span>Review completion</span>

                            <strong>
                                {totalCount
                                    ? Math.round(readCount / totalCount * 100)
                                    : 0}%
                            </strong>
                        </div>

                        <div className="completion-track">
                            <span style={{
                                width: `${totalCount ? readCount / totalCount * 100 : 0}%`
                            }}></span>
                        </div>

                        <small>
                            {readCount} of {totalCount} recipes reviewed
                        </small>
                    </div>
                </section>

                {/* RECIPE MANAGEMENT */}
                <section
                    className="moderator-recipes"
                    id="recipe-management"
                >

                    <div className="management-heading">
                        <div>
                            <span className="section-eyebrow">
                                YOUR COMMUNITY
                            </span>

                            <h2>Manage Recipes</h2>

                            <p>
                                Review, approve and manage community submissions.
                            </p>
                        </div>

                        <div className="management-total">
                            {totalCount} Total
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="moderator-toolbar">

                        <div className="recipe-search">
                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search recipes, categories or creators..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <span className="results-count">
                            Showing <strong>{filteredRecipes.length}</strong> recipes
                        </span>
                    </div>

                    {/* FILTER TABS */}
                    <div className="moderator-filters">

                        {filterOptions.map(option => (
                            <button
                                type="button"
                                key={option.value}
                                className={`filter-tab ${
                                    filter === option.value ? 'active' : ''
                                }`}
                                onClick={() => setFilter(option.value)}
                            >
                                {option.label}
                                <span>{option.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* RECIPE CARDS */}
                    {filteredRecipes.length === 0 ? (

                        <div className="moderator-empty">
                            <h3>No recipes found</h3>

                            <p>
                                There are no matching recipes in the recipe library.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setFilter('All');
                                    setSearchTerm('');
                                }}
                            >
                                Show All Recipes
                            </button>
                        </div>

                    ) : (

                        <div className="moderator-recipe-list">

                            {filteredRecipes.map(recipe => (

                                <article
                                    className={`moderator-recipe-card ${(
                                        recipe.status || 'Pending'
                                    ).toLowerCase()}-card`}
                                    key={recipe.id}
                                >

                                    {/* RECIPE IMAGE */}
                                    <div className="recipe-food-image">

                                        <img
                                            src={getRecipeImage(recipe)}
                                            alt={recipe.name || 'Recipe'}
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    '/images/recipe-placeholder.jpg';
                                            }}
                                        />

                                        <span className={`recipe-status ${(recipe.status || 'Pending').toLowerCase()}`}>
                                            <span></span>
                                            {recipe.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* RECIPE TEXT */}
                                    <div className="recipe-card-content">

                                        <span className="recipe-category">
                                            {recipe.category || 'General'}
                                        </span>

                                        <h3>{recipe.name}</h3>

                                        <p className="recipe-description">
                                            {recipe.description ||
                                                'No description provided.'}
                                        </p>
                                    </div>

                                    {/* RECIPE META */}
                                    <div className="recipe-meta">

                                        <div className="recipe-meta-item">
                                            <span>CREATED BY</span>

                                            <strong>
                                                {recipe.createdBy ||
                                                    recipe.submittedBy ||
                                                    'User'}
                                            </strong>
                                        </div>

                                        <div className="recipe-meta-item">
                                            <span>SUBMITTED ON</span>

                                            <strong>
                                                {formatDate(recipe.submittedAt)}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* APPROVE AND REJECT BUTTONS */}
                                    {recipe.status === 'Pending' && (
                                        <div className="moderator-actions">

                                            <button
                                                type="button"
                                                className="approve-btn"
                                                onClick={() => approveRecipe(recipe.id)}
                                            >
                                                ✓ Approve Recipe
                                            </button>

                                            <button
                                                type="button"
                                                className="reject-btn"
                                                onClick={() => openRejectForm(recipe.id)}
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* REJECTION REASON */}
                                    {recipe.status === 'Rejected' && recipe.reason && (
                                        <div className="recipe-rejection-reason">
                                            <strong>Reason for rejection</strong>
                                            <p>{recipe.reason}</p>
                                        </div>
                                    )}

                                    {/* REVIEW INFORMATION */}
                                    {recipe.status !== 'Pending' && (
                                        <div className="recipe-review-info">
                                            <span>
                                                Reviewed by {recipe.reviewedBy || 'Moderator'}
                                            </span>

                                            <span>
                                                {formatDate(recipe.reviewedAt)}
                                            </span>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}

                    {/* REJECTION FORM */}
                    {selectedRecipe !== null && (
                        <div className="rejection-overlay">

                            <div className="rejection-form">

                                <button
                                    type="button"
                                    className="close-rejection"
                                    onClick={cancelRejection}
                                    aria-label="Close"
                                >
                                    ×
                                </button>

                                <div className="rejection-icon">✕</div>

                                <span className="section-eyebrow">
                                    MODERATION ACTION
                                </span>

                                <h2>Reject Recipe</h2>

                                <p>
                                    Please provide a clear reason so the recipe
                                    creator understands what needs improvement.
                                </p>

                                <label htmlFor="rejectionReason">
                                    Reason for rejection
                                </label>

                                <textarea
                                    id="rejectionReason"
                                    rows="5"
                                    value={rejectionReason}
                                    onChange={e =>
                                        setRejectionReason(e.target.value)
                                    }
                                    placeholder="Explain why this recipe cannot be approved..."
                                    autoFocus
                                />

                                <div className="rejection-actions">

                                    <button
                                        type="button"
                                        className="confirm-reject-btn"
                                        onClick={rejectRecipe}
                                    >
                                        Confirm Rejection
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-reject-btn"
                                        onClick={cancelRejection}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* MODERATION HISTORY */}
                <section className="moderation-history">

                    <div className="history-heading">
                        <div>
                            <span className="section-eyebrow">
                                YOUR DECISIONS
                            </span>

                            <h2>Moderation History</h2>

                            <p>
                                A record of recently reviewed recipes.
                            </p>
                        </div>
                    </div>

                    {moderationHistory.length === 0 ? (

                        <div className="history-empty">
                            <p>
                                Your moderation activity will appear here.
                            </p>
                        </div>

                    ) : (

                        <div className="history-list">

                            {moderationHistory.map(recipe => (

                                <div className="history-item" key={recipe.id}>

                                    <div className={`history-status-icon ${recipe.status.toLowerCase()}`}>
                                        {recipe.status === 'Approved' ? '✓' : '✕'}
                                    </div>

                                    <div className="history-details">
                                        <strong>{recipe.name}</strong>

                                        <span>
                                            Submitted by {
                                                recipe.createdBy ||
                                                recipe.submittedBy ||
                                                'User'
                                            }
                                        </span>
                                    </div>

                                    <span className={`history-badge ${recipe.status.toLowerCase()}`}>
                                        {recipe.status}
                                    </span>

                                    <span className="history-date">
                                        {formatDate(recipe.reviewedAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* FOOTER */}
                <div className="moderator-footer">
                    Made with love for your cooking community.
                </div>

            </div>
        </main>
    );
}

export default ModeratorDashboard;
