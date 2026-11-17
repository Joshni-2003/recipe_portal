
import './MyDrafts.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const defaultDrafts = [
    {
        id: 1,
        name: 'Chocolate Brownie',
        category: 'Dessert',
        description: 'A delicious homemade chocolate brownie.',
        ingredients: 'Chocolate, flour, sugar, butter',
        instructions: 'Mix ingredients and bake for 30 minutes.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85'
    },
    {
        id: 2,
        name: 'Vegetable Fried Rice',
        category: 'Chinese',
        description: 'Healthy vegetable fried rice.',
        ingredients: 'Rice, carrot, beans, capsicum',
        instructions: 'Cook vegetables and mix with cooked rice.',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85'
    },
    {
        id: 3,
        name: 'Mango Milkshake',
        category: 'Drinks',
        description: 'Fresh mango milkshake.',
        ingredients: '',
        instructions: '',
        image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1000&q=85'
    }
];

function loadDrafts() {
    try {
        const savedDrafts = localStorage.getItem('my-drafts');

        if (savedDrafts !== null) {
            const parsedDrafts = JSON.parse(savedDrafts);

            return Array.isArray(parsedDrafts)
                ? parsedDrafts.map((draft) => ({
                    ...draft,
                    name: draft.name || '',
                    category: draft.category || '',
                    description: draft.description || '',
                    ingredients: draft.ingredients || '',
                    instructions: draft.instructions || '',
                    image: draft.image || ''
                }))
                : defaultDrafts;
        }

        return defaultDrafts;
    } catch (error) {
        console.error('Unable to load drafts:', error);
        return defaultDrafts;
    }
}

function MyDrafts() {
    const [drafts, setDrafts] = useState(loadDrafts);
    const [editingDraft, setEditingDraft] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        try {
            localStorage.setItem('my-drafts', JSON.stringify(drafts));
        } catch (error) {
            console.error('Unable to save drafts:', error);
        }
    }, [drafts]);

    function showMessage(text, type = 'success') {
        setMessage(text);
        setMessageType(type);
    }

    function continueDraft(draft) {
        setEditingDraft({ ...draft });
        setMessage('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setEditingDraft((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function saveDraft(event) {
        event.preventDefault();

        if (
            !editingDraft.name.trim() ||
            !editingDraft.category.trim() ||
            !editingDraft.description.trim()
        ) {
            showMessage(
                'Please fill in the recipe name, category and description.',
                'error'
            );
            return;
        }

        setDrafts((previous) =>
            previous.map((draft) =>
                draft.id === editingDraft.id ? editingDraft : draft
            )
        );

        setEditingDraft(null);
        showMessage('Draft saved successfully!');
    }

    function submitDraft(id) {
        const selectedDraft = drafts.find(
            (draft) => draft.id === id
        );

        if (!selectedDraft) return;

        if (
            !selectedDraft.name.trim() ||
            !selectedDraft.category.trim() ||
            !selectedDraft.description.trim() ||
            !selectedDraft.ingredients.trim() ||
            !selectedDraft.instructions.trim()
        ) {
            showMessage(
                'Complete all recipe details before submitting for approval.',
                'error'
            );
            return;
        }

        if (
            window.confirm(
                'Submit this recipe for moderator approval?'
            )
        ) {
            setDrafts((previous) =>
                previous.filter((draft) => draft.id !== id)
            );

            showMessage(
                'Recipe submitted successfully for moderation!'
            );
        }
    }

    function deleteDraft(id) {
        if (
            window.confirm(
                'Are you sure you want to delete this draft?'
            )
        ) {
            setDrafts((previous) =>
                previous.filter((draft) => draft.id !== id)
            );

            if (editingDraft?.id === id) {
                setEditingDraft(null);
            }

            showMessage('Draft deleted successfully!');
        }
    }

    return (
        <main className="my-drafts-page">

            {/* Hero Section */}

            <section className="drafts-hero">
                <div className="drafts-hero-content">
                    <span className="drafts-eyebrow">
                        YOUR CREATIVE KITCHEN
                    </span>

                    <h1>My Drafts</h1>

                    <p>
                        Your recipe ideas are saved here.
                        <br />
                        Continue editing or submit them for approval.
                    </p>
                </div>
            </section>

            {/* Draft Information Strip */}

            <section className="drafts-info-strip">

                <div className="draft-info-item">
                    <span className="draft-info-icon">▤</span>
                    <div>
                        <h3>{drafts.length} Drafts</h3>
                        <p>Saved Recipes</p>
                    </div>
                </div>

                <div className="draft-info-divider"></div>

                <div className="draft-info-item">
                    <span className="draft-info-icon">♡</span>
                    <div>
                        <h3>Keep Cooking!</h3>
                        <p>Your ideas matter</p>
                    </div>
                </div>

            </section>

            <div className="drafts-content">

                {/* Messages */}

                {message && (
                    <div
                        className={`draft-message ${messageType}`}
                        role="status"
                    >
                        <span>
                            {messageType === 'success' ? '✓' : '!'}
                        </span>

                        {message}

                        <button
                            type="button"
                            className="message-close"
                            onClick={() => setMessage('')}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Edit Form */}

                {editingDraft && (
                    <form
                        className="draft-edit-form"
                        onSubmit={saveDraft}
                    >

                        <div className="edit-form-heading">
                            <div>
                                <span className="section-kicker">
                                    RECIPE WORKSPACE
                                </span>

                                <h2>Continue Your Recipe</h2>

                                <p>
                                    Update your recipe details and save
                                    your changes.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="close-edit-btn"
                                onClick={() => setEditingDraft(null)}
                                aria-label="Close edit form"
                            >
                                ×
                            </button>
                        </div>

                        <div className="draft-form-grid">

                            <div className="draft-field">
                                <label htmlFor="draft-name">
                                    Recipe Name
                                </label>

                                <input
                                    id="draft-name"
                                    type="text"
                                    name="name"
                                    value={editingDraft.name}
                                    onChange={handleChange}
                                    placeholder="Enter recipe name"
                                    required
                                />
                            </div>

                            <div className="draft-field">
                                <label htmlFor="draft-category">
                                    Category
                                </label>

                                <input
                                    id="draft-category"
                                    type="text"
                                    name="category"
                                    value={editingDraft.category}
                                    onChange={handleChange}
                                    placeholder="Enter category"
                                    required
                                />
                            </div>

                            <div className="draft-field draft-field-wide">
                                <label htmlFor="draft-description">
                                    Description
                                </label>

                                <textarea
                                    id="draft-description"
                                    name="description"
                                    value={editingDraft.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe your recipe..."
                                    required
                                />
                            </div>

                            <div className="draft-field">
                                <label htmlFor="draft-ingredients">
                                    Ingredients
                                </label>

                                <textarea
                                    id="draft-ingredients"
                                    name="ingredients"
                                    value={editingDraft.ingredients}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Enter ingredients..."
                                />
                            </div>

                            <div className="draft-field">
                                <label htmlFor="draft-instructions">
                                    Cooking Instructions
                                </label>

                                <textarea
                                    id="draft-instructions"
                                    name="instructions"
                                    value={editingDraft.instructions}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Enter cooking steps..."
                                />
                            </div>

                        </div>

                        <div className="draft-form-actions">
                            <button
                                type="submit"
                                className="save-draft-btn"
                            >
                                ✓ Save Changes
                            </button>

                            <button
                                type="button"
                                className="cancel-draft-btn"
                                onClick={() => setEditingDraft(null)}
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                )}

                {/* Recipe Cards Section */}

                <section className="drafts-collection">

                    <div className="drafts-section-heading">
                        <div>
                            <span className="section-kicker">
                                YOUR SAVED IDEAS
                            </span>

                            <h2>Recipe Collection</h2>

                            <p>
                                Pick a recipe and continue where you left off.
                            </p>
                        </div>

                        <span className="draft-count">
                            {drafts.length} SAVED
                        </span>
                    </div>

                    <div className="draft-list">

                        {/* Create Recipe Panel */}

                        <div className="create-draft-panel">
                            <div className="create-panel-art">
                                <span>♨</span>
                                <span>♡</span>
                            </div>

                            <h2>Start a New Recipe</h2>

                            <p>
                                Turn your ideas into delicious recipes!
                            </p>

                            <Link
                                to="/create-recipe"
                                className="create-recipe-btn"
                            >
                                + Create Recipe
                            </Link>
                        </div>

                        {/* Saved Draft Cards */}

                        {drafts.length === 0 ? (
                            <div className="no-drafts">
                                <div className="empty-drafts-icon">
                                    ♨
                                </div>

                                <h2>No Drafts Yet!</h2>

                                <p>
                                    Start creating your favourite recipes
                                    and save them here.
                                </p>

                                <Link
                                    to="/create-recipe"
                                    className="create-recipe-btn"
                                >
                                    + Create Your First Draft
                                </Link>
                            </div>
                        ) : (
                            drafts.map((draft) => (
                                <article
                                    className="draft-card"
                                    key={draft.id}
                                >

                                    <div className="draft-card-image-wrap">

                                        {draft.image ? (
                                            <img
                                                className="draft-card-image"
                                                src={draft.image}
                                                alt={draft.name}
                                                onError={(event) => {
                                                    event.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="draft-image-fallback">
                                                ♨
                                            </div>
                                        )}

                                        <span className="draft-status">
                                            Draft
                                        </span>

                                    </div>

                                    <div className="draft-card-body">

                                        <span className="draft-category">
                                            {draft.category || 'Uncategorized'}
                                        </span>

                                        <h3>{draft.name || 'Untitled Recipe'}</h3>

                                        <p className="draft-description">
                                            {draft.description || 'Add a description to your recipe.'}
                                        </p>

                                        <div className="draft-card-footer">

                                            <button
                                                type="button"
                                                className="continue-draft-btn"
                                                onClick={() => continueDraft(draft)}
                                            >
                                                <span>✎</span>
                                                Continue
                                            </button>

                                            <button
                                                type="button"
                                                className="submit-draft-btn"
                                                onClick={() => submitDraft(draft.id)}
                                            >
                                                <span>➤</span>
                                                Submit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-draft-btn"
                                                onClick={() => deleteDraft(draft.id)}
                                                aria-label={`Delete ${draft.name}`}
                                                title="Delete draft"
                                            >
                                                ♜
                                            </button>

                                        </div>

                                    </div>

                                </article>
                            ))
                        )}

                    </div>

                </section>

                {/* Bottom Message */}

                <section className="drafts-bottom-message">
                    <span>♡</span>
                    <p>
                        Every delicious recipe begins with a little inspiration.
                        Keep your culinary ideas alive!
                    </p>
                    <span>♡</span>
                </section>

            </div>

        </main>
    );
}

export default MyDrafts;
