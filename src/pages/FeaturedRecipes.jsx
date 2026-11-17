
import './FeaturedRecipes.css';
import { useState } from 'react';

function FeaturedRecipes() {
    const [recipes, setRecipes] = useState([
        {
            id: 1,
            name: 'Vegetable Biryani',
            category: 'Indian',
            description: 'A delicious and flavorful vegetable biryani.',
            image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700',
            featured: true
        },
        {
            id: 2,
            name: 'Masala Dosa',
            category: 'Indian',
            description: 'Crispy dosa served with chutney and sambar.',
            image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700',
            featured: false
        },
        {
            id: 3,
            name: 'Chocolate Cake',
            category: 'Dessert',
            description: 'A soft and rich chocolate cake.',
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700',
            featured: true
        },
        {
            id: 4,
            name: 'Paneer Butter Masala',
            category: 'Indian',
            description: 'Creamy paneer cooked in a rich tomato gravy.',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700',
            featured: false
        },
        {
            id: 5,
            name: 'Fruit Salad',
            category: 'Healthy',
            description: 'A refreshing mix of fresh fruits.',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700',
            featured: false
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [message, setMessage] = useState('');

    const featuredCount = recipes.filter(
        recipe => recipe.featured
    ).length;

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesFilter =
            filter === 'All' ||
            (filter === 'Featured' && recipe.featured) ||
            (filter === 'Not Featured' && !recipe.featured);

        return matchesSearch && matchesFilter;
    });

    function toggleFeatured(id) {
        const selectedRecipe = recipes.find(
            recipe => recipe.id === id
        );

        setRecipes(previousRecipes =>
            previousRecipes.map(recipe =>
                recipe.id === id
                    ? { ...recipe, featured: !recipe.featured }
                    : recipe
            )
        );

        setMessage(
            selectedRecipe.featured
                ? 'Recipe removed from featured list.'
                : 'Recipe added to featured list!'
        );
    }

    return (
        <div className="featured-recipes-page">

            {/* Hero Header */}
            <section className="featured-hero">

                <div className="featured-hero-content">
                    <span className="featured-eyebrow">
                        RECIPE COLLECTION
                    </span>

                    <h1>Featured Recipes</h1>

                    <p>
                        Highlight delicious recipes and showcase
                        your community's favourite dishes on the
                        home page.
                    </p>

                    <div className="featured-hero-line"></div>
                </div>

                <div className="featured-hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000"
                        alt="Delicious fresh food"
                    />
                </div>

            </section>

            {/* Statistics */}
            <section className="featured-stats">

                <div className="featured-count-card">
                    <div className="featured-count-icon">
                        <img
                            src="https://images.unsplash.com/photo-1547592180-85f173990554?w=120"
                            alt="Food"
                        />
                    </div>

                    <div>
                        <h2>{featuredCount}</h2>
                        <p>Total Featured Recipes</p>
                        <span>Recipes highlighted on home page</span>
                    </div>
                </div>

                <div className="featured-total-card">
                    <h2>{recipes.length}</h2>
                    <p>Total Recipes</p>
                    <span>Available in collection</span>
                </div>

            </section>

            {/* Notification */}
            {message && (
                <div className="featured-message">
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage('')}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Search and Filter */}
            <section className="featured-toolbar">

                <div className="featured-search">
                    <span>⌕</span>
                    <input
                        type="text"
                        placeholder="Search delicious recipes..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="All">All Recipes</option>
                    <option value="Featured">Featured</option>
                    <option value="Not Featured">Not Featured</option>
                </select>

            </section>

            {/* Section Heading */}
            <div className="featured-section-heading">
                <div>
                    <h2>Explore Recipes</h2>
                    <p>
                        Choose the recipes you want to highlight.
                    </p>
                </div>

                <span>
                    {filteredRecipes.length} Recipes Found
                </span>
            </div>

            {/* Recipe Cards */}
            <section className="featured-recipes-list">

                {filteredRecipes.length === 0 ? (

                    <div className="no-featured-recipes">
                        <h2>No Recipes Found</h2>
                        <p>Try another search or filter.</p>
                    </div>

                ) : (

                    filteredRecipes.map(recipe => (

                        <article
                            className="featured-recipe-card"
                            key={recipe.id}
                        >

                            <div className="featured-card-image">

                                <img
                                    src={recipe.image}
                                    alt={recipe.name}
                                    loading="lazy"
                                />

                                <span className={
                                    recipe.featured
                                        ? 'featured-image-badge active'
                                        : 'featured-image-badge inactive'
                                }>
                                    {recipe.featured
                                        ? 'Featured'
                                        : 'Not Featured'}
                                </span>

                            </div>

                            <div className="featured-recipe-info">

                                <span className="featured-category">
                                    {recipe.category}
                                </span>

                                <h2>{recipe.name}</h2>

                                <p>{recipe.description}</p>

                                <div className="featured-card-footer">

                                    <button
                                        type="button"
                                        className={
                                            recipe.featured
                                                ? 'remove-featured-btn'
                                                : 'make-featured-btn'
                                        }
                                        onClick={() =>
                                            toggleFeatured(recipe.id)
                                        }
                                    >
                                        {recipe.featured
                                            ? 'Remove from Featured'
                                            : 'Make Featured'}
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))

                )}

            </section>

            {/* Bottom Decoration */}
            <div className="featured-bottom">
                <span>Made with passion for food lovers</span>
            </div>

        </div>
    );
}

export default FeaturedRecipes;
