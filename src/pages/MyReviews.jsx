
import './MyReviews.css';
import { useState, useEffect } from 'react';
import { recipes } from '../data/recipes';

const STORAGE_KEY = 'my-reviews-data';

const defaultReviews = [
    {
        id: 1,
        recipeName: 'Vegetable Biryani',
        rating: 5,
        comment: 'Very tasty and easy to prepare!'
    },
    {
        id: 2,
        recipeName: 'Chocolate Cake',
        rating: 4,
        comment: 'The cake was delicious. I really enjoyed it.'
    },
    {
        id: 3,
        recipeName: 'Masala Dosa',
        rating: 3,
        comment: 'Good recipe, but the instructions could be clearer.'
    }
];

// Load reviews safely
function loadReviews() {
    try {
        const savedReviews = localStorage.getItem(STORAGE_KEY);

        if (savedReviews === null) {
            return defaultReviews;
        }

        const parsedReviews = JSON.parse(savedReviews);

        return Array.isArray(parsedReviews)
            ? parsedReviews.filter(
                review =>
                    review &&
                    typeof review === 'object' &&
                    review.id !== undefined
            )
            : defaultReviews;

    } catch (error) {
        console.error('Unable to load reviews:', error);
        return defaultReviews;
    }
}

// Find the matching recipe image
function getReviewImage(review) {
    const matchedRecipe = recipes.find(
        recipe =>
            recipe.name?.trim().toLowerCase() ===
            String(review.recipeName || '').trim().toLowerCase()
    );

    return (
        review.recipeImage ||
        review.image ||
        review.imageUrl ||
        review.recipeImageUrl ||
        review.recipe?.image ||
        review.recipe?.imageUrl ||
        matchedRecipe?.image ||
        ''
    );
}

// Get review date
function getReviewDate(review) {
    const date = review.reviewDate || review.createdAt || review.date;

    if (!date) return 'Date not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return parsedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Update original recipe review list
function updateRecipeReview(review, action) {
    if (!review.recipeId) return;

    const recipeStorageKey = `recipe-reviews-${review.recipeId}`;

    try {
        const savedReviews = JSON.parse(
            localStorage.getItem(recipeStorageKey) || '[]'
        );

        if (!Array.isArray(savedReviews)) return;

        let updatedReviews;

        if (action === 'update') {
            updatedReviews = savedReviews.map(item =>
                String(item.id) === String(review.id)
                    ? {
                        ...item,
                        rating: review.rating,
                        comment: review.comment
                    }
                    : item
            );
        } else {
            updatedReviews = savedReviews.filter(
                item => String(item.id) !== String(review.id)
            );
        }

        localStorage.setItem(
            recipeStorageKey,
            JSON.stringify(updatedReviews)
        );

    } catch (error) {
        console.error('Unable to update recipe review:', error);
    }
}

function MyReviews() {

    const [reviews, setReviews] = useState(loadReviews);
    const [filter, setFilter] = useState('All');
    const [editingReview, setEditingReview] = useState(null);
    const [message, setMessage] = useState('');

    // Save reviews
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(reviews)
            );
        } catch (error) {
            console.error('Unable to save reviews:', error);
        }
    }, [reviews]);

    // Refresh reviews when other components update them
    useEffect(() => {

        function refreshReviews() {
            setReviews(loadReviews());
        }

        window.addEventListener('my-reviews-updated', refreshReviews);
        window.addEventListener('storage', refreshReviews);

        return () => {
            window.removeEventListener('my-reviews-updated', refreshReviews);
            window.removeEventListener('storage', refreshReviews);
        };

    }, []);

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
        if (filter === 'All') return true;

        return Number(review.rating) === Number(filter);
    });

    // Edit review
    function editReview(review) {
        setEditingReview({ ...review });
        setMessage('');
    }

    // Handle form changes
    function handleChange(e) {
        const { name, value } = e.target;

        setEditingReview(previousReview => ({
            ...previousReview,
            [name]: name === 'rating' ? Number(value) : value
        }));
    }

    // Save updated review
    function saveReview(e) {
        e.preventDefault();

        if (!editingReview.comment?.trim()) {
            setMessage('Please enter your review.');
            return;
        }

        const updatedReview = {
            ...editingReview,
            comment: editingReview.comment.trim()
        };

        setReviews(previousReviews =>
            previousReviews.map(review =>
                String(review.id) === String(updatedReview.id)
                    ? updatedReview
                    : review
            )
        );

        updateRecipeReview(updatedReview, 'update');

        setEditingReview(null);
        setMessage('Review updated successfully!');
    }

    // Delete review
    function deleteReview(id) {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this review?'
        );

        if (!confirmDelete) return;

        const reviewToDelete = reviews.find(
            review => String(review.id) === String(id)
        );

        if (reviewToDelete) {
            updateRecipeReview(reviewToDelete, 'delete');
        }

        setReviews(previousReviews =>
            previousReviews.filter(
                review => String(review.id) !== String(id)
            )
        );

        if (String(editingReview?.id) === String(id)) {
            setEditingReview(null);
        }

        setMessage('Review deleted successfully!');
    }

    // Filter options
    const filterOptions = [
        { label: 'All Reviews', value: 'All' },
        { label: '5 Stars', value: '5' },
        { label: '4 Stars', value: '4' },
        { label: '3 Stars', value: '3' },
        { label: '2 Stars', value: '2' },
        { label: '1 Star', value: '1' }
    ];

    return (
        <div className="my-reviews-page">

            {/* Hero Section */}
            <section className="my-reviews-hero">

                <div className="reviews-hero-content">

                    <span className="reviews-hero-label">
                        YOUR FOOD EXPERIENCES
                    </span>

                    <h1>My Reviews</h1>

                    <p>
                        Every recipe has a story. See and manage
                        all the recipes you have reviewed.
                    </p>

                </div>

                <div className="reviews-hero-decoration">

                    <span className="hero-star">★★★★★</span>

                    <span className="hero-decoration-icon">♡</span>

                    <span className="hero-decoration-text">
                        Your feedback matters!
                    </span>

                </div>

            </section>

            {/* Success Message */}
            {message && (
                <p className="my-reviews-message" role="status">
                    {message}
                </p>
            )}

            {/* Review Filters */}
            <section className="reviews-filter-section">

                <div className="reviews-filter-heading">

                    <h2>My Recipe Reviews</h2>

                    <span className="review-count">
                        {reviews.length}{' '}
                        {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </span>

                </div>

                <div className="reviews-filter-tabs">

                    {filterOptions.map(option => (
                        <button
                            type="button"
                            key={option.value}
                            className={`review-filter-btn ${
                                filter === option.value ? 'active' : ''
                            }`}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}

                </div>

            </section>

            {/* Edit Review Form */}
            {editingReview && (

                <form
                    className="edit-review-form"
                    onSubmit={saveReview}
                >

                    <div className="edit-review-heading">

                        <div>
                            <span>UPDATE YOUR EXPERIENCE</span>
                            <h2>Edit Your Review</h2>
                        </div>

                        <button
                            type="button"
                            className="close-edit-btn"
                            onClick={() => setEditingReview(null)}
                            aria-label="Close edit form"
                        >
                            ×
                        </button>

                    </div>

                    <label>Recipe Name</label>

                    <input
                        type="text"
                        value={editingReview.recipeName || ''}
                        disabled
                    />

                    <label>Rating</label>

                    <select
                        name="rating"
                        value={editingReview.rating}
                        onChange={handleChange}
                    >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>

                    <label>Your Review</label>

                    <textarea
                        name="comment"
                        value={editingReview.comment || ''}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Write your review..."
                    />

                    <div className="review-form-actions">

                        <button type="submit">
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditingReview(null)}
                        >
                            Cancel
                        </button>

                    </div>

                </form>
            )}

            {/* Reviews List */}
            <section className="my-reviews-list">

                {filteredReviews.length === 0 ? (

                    <div className="no-reviews">

                        <div className="empty-review-icon">♡</div>

                        <h2>
                            {reviews.length === 0
                                ? 'No Reviews Yet!'
                                : 'No Reviews Found'}
                        </h2>

                        <p>
                            {reviews.length === 0
                                ? 'Start reviewing your favourite recipes and share your thoughts.'
                                : 'No reviews are available for this rating.'}
                        </p>

                        {reviews.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setFilter('All')}
                            >
                                Show All Reviews
                            </button>
                        )}

                    </div>

                ) : (

                    filteredReviews.map(review => {

                        const safeRating = Math.min(
                            5,
                            Math.max(0, Number(review.rating) || 0)
                        );

                        const image = getReviewImage(review);

                        return (

                            <article
                                className="my-review-card"
                                key={review.id}
                            >

                                {/* Recipe Image */}
                                <div className="review-recipe-image">

                                    {image ? (
                                        <img
                                            src={image}
                                            alt={review.recipeName || 'Recipe'}
                                            onError={e => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="review-image-placeholder">
                                            🍽️
                                        </div>
                                    )}

                                </div>

                                {/* Review Details */}
                                <div className="review-card-content">

                                    <div className="review-card-top">

                                        <span className="review-category">
                                            RECIPE REVIEW
                                        </span>

                                        <span className="review-number">
                                            REVIEW
                                        </span>

                                    </div>

                                    <h2>
                                        {review.recipeName || 'Untitled Recipe'}
                                    </h2>

                                    <div className="review-rating-row">

                                        <span className="review-stars">
                                            {'★'.repeat(safeRating)}
                                            {'☆'.repeat(5 - safeRating)}
                                        </span>

                                        <span className="rating-number">
                                            {safeRating.toFixed(1)} / 5
                                        </span>

                                    </div>

                                    <p className="review-comment">
                                        {review.comment || 'No comment added.'}
                                    </p>

                                    <div className="review-date">
                                        <span>▦</span>
                                        Reviewed on: {getReviewDate(review)}
                                    </div>

                                    {/* Actions */}
                                    <div className="my-review-actions">

                                        <button
                                            type="button"
                                            className="edit-review-btn"
                                            onClick={() => editReview(review)}
                                        >
                                            ✎ Edit Review
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-review-btn"
                                            onClick={() => deleteReview(review.id)}
                                        >
                                            ▤ Delete
                                        </button>

                                    </div>

                                </div>

                            </article>

                        );

                    })

                )}

            </section>

            {/* Bottom Message */}
            {reviews.length > 0 && (

                <div className="reviews-bottom-message">

                    <span>♡</span>

                    <p>
                        Keep cooking, keep reviewing!
                        Your feedback helps others discover great recipes.
                    </p>

                </div>

            )}

        </div>
    );
}

export default MyReviews;
