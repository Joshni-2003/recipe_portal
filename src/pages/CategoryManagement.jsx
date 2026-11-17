

import './CategoryManagement.css';
import { useEffect, useState } from 'react';

const defaultCategories = [
    { id: 1, name: 'Indian', description: 'Traditional Indian recipes' },
    { id: 2, name: 'Chinese', description: 'Chinese food recipes' },
    { id: 3, name: 'Italian', description: 'Italian food recipes' },
    { id: 4, name: 'Desserts', description: 'Sweet dishes and desserts' }
];

const defaultTags = [
    { id: 1, name: 'Vegetarian' },
    { id: 2, name: 'Spicy' },
    { id: 3, name: 'Healthy' },
    { id: 4, name: 'Vegan' }
];

const categoryImages = {
    indian: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    chinese: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
    italian: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300',
    desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'
};

function loadSavedData(key, defaultData) {
    try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        return Array.isArray(saved) ? saved : defaultData;
    } catch {
        return defaultData;
    }
}

function CategoryManagement() {
    const [categories, setCategories] = useState(() =>
        loadSavedData('recipe-categories', defaultCategories)
    );

    const [tags, setTags] = useState(() =>
        loadSavedData('recipe-tags', defaultTags)
    );

    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [tagName, setTagName] = useState('');

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingTagId, setEditingTagId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        localStorage.setItem('recipe-categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('recipe-tags', JSON.stringify(tags));
    }, [tags]);

    function resetCategoryForm() {
        setCategoryName('');
        setCategoryDescription('');
        setEditingCategoryId(null);
    }

    function resetTagForm() {
        setTagName('');
        setEditingTagId(null);
    }

    function handleCategorySubmit(e) {
        e.preventDefault();

        if (!categoryName.trim() || !categoryDescription.trim()) {
            setMessage('Please enter category name and description.');
            return;
        }

        const duplicate = categories.some(
            category =>
                category.name.toLowerCase() === categoryName.trim().toLowerCase() &&
                category.id !== editingCategoryId
        );

        if (duplicate) {
            setMessage('This category already exists.');
            return;
        }

        if (editingCategoryId !== null) {
            setCategories(previous =>
                previous.map(category =>
                    category.id === editingCategoryId
                        ? {
                            ...category,
                            name: categoryName.trim(),
                            description: categoryDescription.trim()
                        }
                        : category
                )
            );
            setMessage('Category updated successfully!');
        } else {
            setCategories(previous => [
                ...previous,
                {
                    id: Date.now(),
                    name: categoryName.trim(),
                    description: categoryDescription.trim()
                }
            ]);
            setMessage('Category added successfully!');
        }

        resetCategoryForm();
    }

    function editCategory(category) {
        setEditingCategoryId(category.id);
        setCategoryName(category.name);
        setCategoryDescription(category.description);
        setMessage('');
        window.scrollTo({ top: 250, behavior: 'smooth' });
    }

    function deleteCategory(id) {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        setCategories(previous => previous.filter(category => category.id !== id));
        setMessage('Category deleted successfully!');

        if (editingCategoryId === id) resetCategoryForm();
    }

    function handleTagSubmit(e) {
        e.preventDefault();

        if (!tagName.trim()) {
            setMessage('Please enter a tag name.');
            return;
        }

        const duplicate = tags.some(
            tag =>
                tag.name.toLowerCase() === tagName.trim().toLowerCase() &&
                tag.id !== editingTagId
        );

        if (duplicate) {
            setMessage('This tag already exists.');
            return;
        }

        if (editingTagId !== null) {
            setTags(previous =>
                previous.map(tag =>
                    tag.id === editingTagId
                        ? { ...tag, name: tagName.trim() }
                        : tag
                )
            );
            setMessage('Tag updated successfully!');
        } else {
            setTags(previous => [
                ...previous,
                { id: Date.now(), name: tagName.trim() }
            ]);
            setMessage('Tag added successfully!');
        }

        resetTagForm();
    }

    function editTag(tag) {
        setEditingTagId(tag.id);
        setTagName(tag.name);
        setMessage('');
    }

    function deleteTag(id) {
        if (!window.confirm('Are you sure you want to delete this tag?')) return;

        setTags(previous => previous.filter(tag => tag.id !== id));
        setMessage('Tag deleted successfully!');

        if (editingTagId === id) resetTagForm();
    }

    return (
        <div className="category-management-page">

            {/* Hero Banner */}
            <section className="category-hero">
                <div className="category-hero-content">
                    <span className="category-hero-label">
                        RECIPE PORTAL / ADMINISTRATION
                    </span>

                    <h1>Category and Tag Management</h1>

                    <p>
                        Organize your culinary world. Manage recipe categories
                        and tags in one beautiful place.
                    </p>

                    <div className="category-hero-line"></div>
                </div>
            </section>

            {message && (
                <div className="category-management-message">
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage('')}
                        aria-label="Close message"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Category Form */}
            <section className="category-form-panel">

                <div className="category-panel-heading">
                    <div className="category-heading-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="2" />
                            <rect x="13" y="3" width="8" height="8" rx="2" />
                            <rect x="3" y="13" width="8" height="8" rx="2" />
                            <rect x="13" y="13" width="8" height="8" rx="2" />
                        </svg>
                    </div>
                    <div>
                        <h2>
                            {editingCategoryId !== null
                                ? 'Update Category'
                                : 'Manage Categories'}
                        </h2>
                        <p>Create and organize your recipe collections</p>
                    </div>
                </div>

                <form
                    className="category-management-form"
                    onSubmit={handleCategorySubmit}
                >
                    <div className="category-input-group">
                        <label htmlFor="category-name">Category Name</label>
                        <input
                            id="category-name"
                            type="text"
                            value={categoryName}
                            onChange={e => setCategoryName(e.target.value)}
                            placeholder="Enter category name"
                        />
                    </div>

                    <div className="category-input-group">
                        <label htmlFor="category-description">
                            Category Description
                        </label>
                        <textarea
                            id="category-description"
                            value={categoryDescription}
                            onChange={e => setCategoryDescription(e.target.value)}
                            placeholder="Enter category description"
                            rows="3"
                        />
                    </div>

                    <div className="category-form-actions">
                        <button type="submit" className="category-primary-btn">
                            <span>{editingCategoryId !== null ? '✓' : '+'}</span>
                            {editingCategoryId !== null
                                ? 'Update Category'
                                : 'Add Category'}
                        </button>

                        <button
                            type="button"
                            className="category-reset-btn"
                            onClick={resetCategoryForm}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </section>

            {/* Category List */}
            <section className="category-list-panel">

                <div className="category-panel-heading">
                    <div className="category-heading-icon list-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H21M9 12H21M9 19H21" />
                            <circle cx="4" cy="5" r="1.5" />
                            <circle cx="4" cy="12" r="1.5" />
                            <circle cx="4" cy="19" r="1.5" />
                        </svg>
                    </div>
                    <div>
                        <h2>Categories List</h2>
                        <p>{categories.length} categories available</p>
                    </div>
                </div>

                {categories.length > 0 ? (
                    <div className="category-list">
                        {categories.map(category => {
                            const image =
                                categoryImages[category.name.toLowerCase()] ||
                                'https://images.unsplash.com/photo-1547592180-85f173990554?w=300';

                            return (
                                <article className="category-item" key={category.id}>
                                    <img
                                        className="category-food-image"
                                        src={image}
                                        alt={category.name + ' food'}
                                        loading="lazy"
                                    />

                                    <div className="category-item-info">
                                        <h3>{category.name}</h3>
                                        <p>{category.description}</p>
                                    </div>

                                    <div className="category-item-actions">
                                        <button
                                            type="button"
                                            className="category-edit-btn"
                                            onClick={() => editCategory(category)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="category-delete-btn"
                                            onClick={() => deleteCategory(category.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="admin-empty">No categories available.</p>
                )}
            </section>

            {/* Tags Management */}
            <section className="tag-management-section">

                <div className="category-panel-heading">
                    <div className="category-heading-icon tag-heading-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 13L13 20L3 10V3H10L20 13Z" />
                            <circle cx="7" cy="7" r="1.5" />
                        </svg>
                    </div>
                    <div>
                        <h2>Manage Recipe Tags</h2>
                        <p>Organize recipes using useful tags</p>
                    </div>
                </div>

                <form className="tag-management-form" onSubmit={handleTagSubmit}>
                    <input
                        type="text"
                        value={tagName}
                        onChange={e => setTagName(e.target.value)}
                        placeholder="Enter a new recipe tag"
                    />

                    <button type="submit" className="category-primary-btn">
                        {editingTagId !== null ? 'Update Tag' : 'Add Tag'}
                    </button>

                    {editingTagId !== null && (
                        <button
                            type="button"
                            className="category-reset-btn"
                            onClick={resetTagForm}
                        >
                            Cancel
                        </button>
                    )}
                </form>

                {tags.length > 0 ? (
                    <div className="tag-list">
                        {tags.map(tag => (
                            <div className="tag-item" key={tag.id}>
                                <div className="tag-item-name">
                                    <span className="tag-dot"></span>
                                    {tag.name}
                                </div>

                                <div className="tag-item-actions">
                                    <button
                                        type="button"
                                        onClick={() => editTag(tag)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => deleteTag(tag.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="admin-empty">No tags available.</p>
                )}
            </section>

            <div className="category-bottom-note">
                <span>RECIPE PORTAL</span>
                <span>Organize • Create • Inspire</span>
            </div>
        </div>
    );
}

export default CategoryManagement;
