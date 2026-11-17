
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { recipes } from '../data/recipes';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const featuredRecipes = recipes.slice(0, 6);

    const categories = [
        { name: 'Biryani', icon: '🍛' },
        { name: 'Starters', icon: '🍢' },
        { name: 'Main Course', icon: '🍲' },
        { name: 'South Indian', icon: '🥞' },
        { name: 'Chinese', icon: '🍜' },
        { name: 'Dessert', icon: '🍰' }
    ];

    const handleSearch = (event) => {
        event.preventDefault();
        navigate('/recipes');
    };

    return (
        <main className="home-page">

            {/* Hero Section */}
            <section className="home-hero">

                <div className="home-hero-overlay"></div>

                {/* Left Side Content */}
                <div className="home-hero-content">

                    <span className="home-eyebrow">
                        ✨ GOOD FOOD, GOOD MOOD
                    </span>

                    <h1>
                        Discover the joy
                        <br />
                        of <span>homemade cooking.</span>
                    </h1>

                    <p>
                        Explore delicious recipes, discover new flavours
                        and bring happiness to your kitchen.
                    </p>

                    <form className="home-search" onSubmit={handleSearch}>

                        <span className="home-search-icon">⌕</span>

                        <input
                            type="text"
                            placeholder="Search your favourite recipes..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search recipes"
                        />

                        <button type="submit">
                            Explore Now →
                        </button>

                    </form>

                    <div className="home-hero-note">
                        <span>🍽️</span>
                        <span>Made with love. Served with happiness.</span>
                    </div>

                </div>

                {/* Right Side Vegetable Biryani Image */}
                <div className="home-hero-image">

                    <img
                        src={recipes[0]?.image}
                        alt="Delicious Vegetable Biryani"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.style.display = 'none';
                        }}
                    />

                </div>

                {/* Chef's Special Label */}
                <div className="home-hero-label">
                    <span>CHEF'S SPECIAL</span>
                    <strong>Delicious moments start here.</strong>
                </div>

            </section>

            {/* Welcome Section */}
            <section className="home-welcome">

                <div>
                    <span className="home-section-tag">
                        WELCOME TO OUR KITCHEN
                    </span>

                    <h2>
                        Cooking is an art. <span>Let's create!</span>
                    </h2>

                    <p>
                        From traditional favourites to exciting new dishes,
                        find something wonderful to cook today.
                    </p>
                </div>

                <div className="home-welcome-stats">

                    <div>
                        <strong>{recipes.length}+</strong>
                        <span>Recipes</span>
                    </div>

                    <div>
                        <strong>6</strong>
                        <span>Food Categories</span>
                    </div>

                </div>

            </section>

            {/* Categories */}
            <section className="home-categories">

                <div className="home-section-heading">

                    <div>
                        <span className="home-section-tag">
                            EXPLORE BY TASTE
                        </span>

                        <h2>What are you craving?</h2>
                    </div>

                    <Link to="/recipes" className="home-text-link">
                        View all recipes →
                    </Link>

                </div>

                <div className="home-category-list">

                    {categories.map((category) => (
                        <Link
                            to="/recipes"
                            className="home-category-item"
                            key={category.name}
                        >
                            <span>{category.icon}</span>
                            <strong>{category.name}</strong>
                            <small>Explore dishes →</small>
                        </Link>
                    ))}

                </div>

            </section>

            {/* Featured Recipes */}
            <section className="home-featured" id="recipes">

                <div className="home-section-heading">

                    <div>
                        <span className="home-section-tag">
                            HANDPICKED FOR YOU
                        </span>

                        <h2>Our delicious favourites</h2>

                        <p>Recipes that make every meal special.</p>
                    </div>

                    <Link to="/recipes" className="home-view-all">
                        Explore all recipes <span>→</span>
                    </Link>

                </div>

                {featuredRecipes.length > 0 ? (

                    <div className="home-featured-grid">

                        {featuredRecipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                            />
                        ))}

                    </div>

                ) : (

                    <div className="home-empty">
                        <span>🍲</span>
                        <h3>No recipes available yet</h3>
                        <p>Come back soon to discover delicious dishes.</p>
                    </div>

                )}

            </section>

            {/* Cooking Banner */}
            <section className="home-bottom-banner">

                <div>
                    <span>❤️ A LITTLE LOVE IN EVERY RECIPE</span>

                    <h2>Your next favourite meal is waiting.</h2>

                    <p>
                        Discover something delicious and make today memorable.
                    </p>

                    <Link to="/recipes" className="home-banner-button">
                        Find Your Recipe →
                    </Link>
                </div>

                <div className="home-banner-decoration">
                    🍽️
                </div>

            </section>

        </main>
    );
}

export default Home;
