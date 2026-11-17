import './RecipeCard.css';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

function RecipeCard({ recipe }) {

    const { toggleFavorite, isFavorite } = useFavorites();

    const favorite = isFavorite(recipe.id);

    // Check whether the recipe has an actual image URL or Base64 image
    const imageSource =
        typeof recipe.image === 'string' &&
        (
            recipe.image.startsWith('data:image/') ||
            recipe.image.startsWith('http://') ||
            recipe.image.startsWith('https://')
        )
            ? recipe.image
            : '';

    // Display the recipe emoji when an actual image is unavailable
    const imageEmoji =
        !imageSource &&
        typeof recipe.image === 'string' &&
        recipe.image.trim() !== ''
            ? recipe.image
            : '🍲';

    return (
        <div className="recipe-card">

            <div className="recipe-image-container">

                {imageSource ? (
                    <img
                        src={imageSource}
                        alt={recipe.name || 'Recipe'}
                        className="recipe-image"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="recipe-image">
                        {imageEmoji}
                    </div>
                )}

                <button
                    type="button"
                    className="favorite-btn"
                    onClick={() => toggleFavorite(recipe.id)}
                    aria-label={
                        favorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                    }
                >
                    {favorite ? '❤️' : '🤍'}
                </button>

            </div>

            <div className="recipe-card-content">

                <h3>{recipe.name}</h3>

                <p>Category: {recipe.category}</p>

                <p>
                    Cooking Time: {
                        recipe.cookingTime ||
                        recipe.time ||
                        'Not specified'
                    }
                </p>

                <Link
                    to={`/recipes/${recipe.routeId || recipe.id}`}
                    className="view-recipe-btn"
                >
                    View Recipe
                </Link>

            </div>

        </div>
    );
}

export default RecipeCard;
