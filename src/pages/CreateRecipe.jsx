
import { useState, useEffect } from 'react';
import IngredientEditor from '../components/IngredientEditor';
import InstructionEditor from '../components/InstructionEditor';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../utils/notificationUtils';
import './CreateRecipe.css';

const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Non-Vegetarian'
];

const allergenOptions = [
    'Milk',
    'Peanuts',
    'Tree Nuts',
    'Soy',
    'Wheat',
    'Eggs',
    'Fish',
    'Shellfish'
];

function convertImageToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 1200;
                const scale = Math.min(1, maxWidth / image.width);

                canvas.width = image.width * scale;
                canvas.height = image.height * scale;

                const context = canvas.getContext('2d');

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function CreateRecipe() {
    const { user } = useAuth();

    const [submissionsEnabled, setSubmissionsEnabled] = useState(() => {
        try {
            const settings = JSON.parse(
                localStorage.getItem('recipe-admin-settings')
            );

            return settings?.recipeSubmissions ?? true;
        } catch {
            return true;
        }
    });

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        cookingTime: '',
        description: '',
        image: null
    });

    const [dietaryTags, setDietaryTags] = useState([]);
    const [allergens, setAllergens] = useState([]);
    const [imagePreview, setImagePreview] = useState('');

    const [ingredients, setIngredients] = useState([
        { name: '', quantity: '', unit: 'cup' }
    ]);

    const [instructions, setInstructions] = useState(['']);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // CHECK ADMIN SUBMISSION SETTINGS
    useEffect(() => {
        function checkSubmissionSetting() {
            try {
                const settings = JSON.parse(
                    localStorage.getItem('recipe-admin-settings')
                );

                setSubmissionsEnabled(
                    settings?.recipeSubmissions ?? true
                );
            } catch {
                setSubmissionsEnabled(true);
            }
        }

        window.addEventListener(
            'admin-settings-updated',
            checkSubmissionSetting
        );

        window.addEventListener(
            'storage',
            checkSubmissionSetting
        );

        return () => {
            window.removeEventListener(
                'admin-settings-updated',
                checkSubmissionSetting
            );

            window.removeEventListener(
                'storage',
                checkSubmissionSetting
            );
        };
    }, []);

    // CLEANUP IMAGE PREVIEW URL
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // HANDLE INPUT CHANGES
    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ''
        }));

        setSuccess('');
    }

    // HANDLE DIETARY TAGS
    function handleDietaryChange(tag) {
        setDietaryTags((previous) =>
            previous.includes(tag)
                ? previous.filter((item) => item !== tag)
                : [...previous, tag]
        );

        setSuccess('');
    }

    // HANDLE ALLERGENS
    function handleAllergenChange(allergen) {
        setAllergens((previous) =>
            previous.includes(allergen)
                ? previous.filter((item) => item !== allergen)
                : [...previous, allergen]
        );

        setSuccess('');
    }

    // HANDLE IMAGE UPLOAD
    function handleImageChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((previous) => ({
                ...previous,
                image: 'Only JPG, JPEG, PNG and WEBP images are allowed.'
            }));

            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((previous) => ({
                ...previous,
                image: 'Image size must not exceed 5 MB.'
            }));

            e.target.value = '';
            return;
        }

        setFormData((previous) => ({
            ...previous,
            image: file
        }));

        setImagePreview(URL.createObjectURL(file));

        setErrors((previous) => ({
            ...previous,
            image: ''
        }));

        setSuccess('');
    }

    // REMOVE UPLOADED IMAGE
    function handleRemoveImage() {
        setFormData((previous) => ({
            ...previous,
            image: null
        }));

        setImagePreview('');

        const imageInput = document.getElementById('recipe-image');

        if (imageInput) {
            imageInput.value = '';
        }

        setErrors((previous) => ({
            ...previous,
            image: ''
        }));
    }

    // SUBMIT RECIPE
    async function handleSubmit(e) {
        e.preventDefault();

        if (!submissionsEnabled) {
            setSuccess('');

            setErrors({
                submission:
                    'Recipe submissions are currently disabled by the administrator.'
            });

            return;
        }

        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Recipe name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (
            !formData.cookingTime ||
            !Number.isFinite(Number(formData.cookingTime)) ||
            Number(formData.cookingTime) <= 0
        ) {
            newErrors.cookingTime = 'Enter a valid cooking time';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        const validIngredients = ingredients.filter(
            (item) =>
                item.name.trim() &&
                Number(item.quantity) > 0 &&
                item.unit
        );

        if (
            validIngredients.length === 0 ||
            validIngredients.length !== ingredients.length
        ) {
            newErrors.ingredients =
                'Please complete all ingredient fields.';
        }

        const validInstructions = instructions.filter(
            (step) => step.trim() !== ''
        );

        if (
            validInstructions.length === 0 ||
            validInstructions.length !== instructions.length
        ) {
            newErrors.instructions =
                'Please complete all cooking steps.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);
        setSuccess('');

        try {
            const savedSettings = JSON.parse(
                localStorage.getItem('recipe-admin-settings') || '{}'
            );

            const automaticApproval =
                savedSettings.automaticApproval ?? false;

            const savedRecipes = JSON.parse(
                localStorage.getItem('moderatorRecipes') || '[]'
            );

            if (!Array.isArray(savedRecipes)) {
                throw new Error('Saved recipe data is invalid.');
            }

            const imageData = formData.image
                ? await convertImageToDataURL(formData.image)
                : '';

            const currentDate = new Date()
                .toISOString()
                .split('T')[0];

            const newRecipe = {
                id: Date.now(),
                name: formData.name,
                category: formData.category,
                cookingTime: formData.cookingTime,
                description: formData.description,
                image: imageData,
                imageName: formData.image
                    ? formData.image.name
                    : '',
                dietaryTags: [...dietaryTags],
                allergens: [...allergens],
                ingredients,
                instructions,
                submittedBy: user?.name || user?.username || 'User',
                submittedByEmail:
                    user?.email?.trim().toLowerCase() || '',
                submittedById:
                    user?.email?.trim().toLowerCase() || '',
                status: automaticApproval ? 'Approved' : 'Pending',
                reason: '',
                submittedAt: currentDate,
                reviewedAt: automaticApproval ? currentDate : '',
                reviewedBy: automaticApproval
                    ? 'Automatic Approval'
                    : ''
            };

            const updatedRecipes = [
                ...savedRecipes,
                newRecipe
            ];

            localStorage.setItem(
                'moderatorRecipes',
                JSON.stringify(updatedRecipes)
            );

            if (automaticApproval && user?.email) {
                addNotification({
                    recipientEmail: user.email,
                    type: 'recipe-approved',
                    title: 'Recipe Approved',
                    message: `Your recipe "${newRecipe.name}" was automatically approved.`,
                    recipeId: newRecipe.id,
                    recipeName: newRecipe.name
                });
            }

            window.dispatchEvent(
                new Event('moderator-recipes-updated')
            );

            setSuccess(
                automaticApproval
                    ? 'Recipe submitted and automatically approved successfully!'
                    : 'Recipe submitted successfully! It is waiting for moderator approval.'
            );

            // RESET FORM
            setFormData({
                name: '',
                category: '',
                cookingTime: '',
                description: '',
                image: null
            });

            setDietaryTags([]);
            setAllergens([]);
            setImagePreview('');

            const imageInput = document.getElementById('recipe-image');

            if (imageInput) {
                imageInput.value = '';
            }

            setIngredients([
                { name: '', quantity: '', unit: 'cup' }
            ]);

            setInstructions(['']);
            setErrors({});

        } catch (error) {
            console.error('Error saving recipe:', error);

            setErrors({
                submission: 'Unable to save recipe. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="create-recipe-page">

            {/* CENTRED PAGE HEADING */}
            <section className="create-recipe-hero">

                <span className="create-hero-eyebrow">
                    SHARE YOUR RECIPE
                </span>

                <h1>
                    Create Your Own <span>Recipe</span>
                </h1>

                <p>
                    Share your culinary masterpiece with our community
                </p>

                <div className="create-hero-tagline">
                    Cook it. Share it. Inspire someone.
                </div>

            </section>

            <main className="create-recipe-main">

                {submissionsEnabled ? (

                    <form
                        className="create-recipe-form"
                        onSubmit={handleSubmit}
                    >

                        {errors.submission && (
                            <p className="create-form-error" role="alert">
                                {errors.submission}
                            </p>
                        )}

                        {/* PHOTO LEFT + DETAILS RIGHT */}
                        <div className="create-top-grid">

                            {/* PHOTO UPLOAD */}
                            <section className="create-photo-section">

                                <h3>Add a Photo</h3>

                                <p>
                                    Upload a delicious photo of your dish.
                                </p>

                                <label
                                    htmlFor="recipe-image"
                                    className="create-upload-area"
                                >

                                    {imagePreview ? (

                                        <img
                                            src={imagePreview}
                                            alt="Recipe preview"
                                            className="create-upload-preview"
                                        />

                                    ) : (

                                        <>
                                            <span className="create-camera-icon">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />

                                                    <circle
                                                        cx="12"
                                                        cy="13"
                                                        r="4"
                                                    />
                                                </svg>
                                            </span>

                                            <strong>
                                                Click to upload
                                            </strong>

                                            <span>
                                                JPG, PNG, WEBP · Max 5 MB
                                            </span>

                                            <span className="create-choose-image">
                                                Choose Image
                                            </span>
                                        </>

                                    )}

                                </label>

                                <input
                                    id="recipe-image"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                />

                                {imagePreview && (
                                    <button
                                        type="button"
                                        className="create-remove-image"
                                        onClick={handleRemoveImage}
                                    >
                                        Remove image
                                    </button>
                                )}

                                {errors.image && (
                                    <span className="create-field-error">
                                        {errors.image}
                                    </span>
                                )}

                            </section>

                            {/* RECIPE DETAILS */}
                            <section className="create-details-section">

                                {/* RECIPE NAME */}
                                <div className="create-field create-field-full">

                                    <label htmlFor="recipe-name">
                                        Recipe Name <span>*</span>
                                    </label>

                                    <input
                                        id="recipe-name"
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Creamy Tomato Pasta"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />

                                    {errors.name && (
                                        <span className="create-field-error">
                                            {errors.name}
                                        </span>
                                    )}

                                </div>

                                {/* CATEGORY + COOKING TIME */}
                                <div className="create-form-grid">

                                    <div className="create-field">

                                        <label htmlFor="recipe-category">
                                            Category <span>*</span>
                                        </label>

                                        <select
                                            id="recipe-category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select category
                                            </option>

                                            <option value="Indian">
                                                Indian
                                            </option>

                                            <option value="South Indian">
                                                South Indian
                                            </option>

                                            <option value="Dessert">
                                                Dessert
                                            </option>

                                            <option value="Chinese">
                                                Chinese
                                            </option>
                                        </select>

                                        {errors.category && (
                                            <span className="create-field-error">
                                                {errors.category}
                                            </span>
                                        )}

                                    </div>

                                    <div className="create-field">

                                        <label htmlFor="cooking-time">
                                            Cooking Time (minutes) <span>*</span>
                                        </label>

                                        <input
                                            id="cooking-time"
                                            type="number"
                                            name="cookingTime"
                                            min="1"
                                            placeholder="e.g. 30"
                                            value={formData.cookingTime}
                                            onChange={handleChange}
                                        />

                                        {errors.cookingTime && (
                                            <span className="create-field-error">
                                                {errors.cookingTime}
                                            </span>
                                        )}

                                    </div>

                                </div>

                                {/* DESCRIPTION */}
                                <div className="create-field create-field-full">

                                    <label htmlFor="recipe-description">
                                        Description <span>*</span>
                                    </label>

                                    <textarea
                                        id="recipe-description"
                                        name="description"
                                        rows="4"
                                        placeholder="Tell us what makes this dish special..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />

                                    {errors.description && (
                                        <span className="create-field-error">
                                            {errors.description}
                                        </span>
                                    )}

                                </div>

                                {/* DIETARY TAGS + ALLERGENS */}
                                <div className="create-details-options">

                                    <div className="create-option-group">

                                        <h4>Dietary Tags</h4>

                                        {dietaryOptions.map((tag) => (
                                            <label
                                                key={tag}
                                                className="create-checkbox-row"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={dietaryTags.includes(tag)}
                                                    onChange={() =>
                                                        handleDietaryChange(tag)
                                                    }
                                                />

                                                <span>{tag}</span>
                                            </label>
                                        ))}

                                    </div>

                                    <div className="create-option-group">

                                        <h4>Allergens</h4>

                                        {allergenOptions.map((allergen) => (
                                            <label
                                                key={allergen}
                                                className="create-checkbox-row"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={allergens.includes(allergen)}
                                                    onChange={() =>
                                                        handleAllergenChange(allergen)
                                                    }
                                                />

                                                <span>{allergen}</span>
                                            </label>
                                        ))}

                                    </div>

                                </div>

                            </section>

                        </div>

                        {/* INGREDIENTS + INSTRUCTIONS SIDE BY SIDE */}
                        <div className="create-editors-grid">

                            {/* INGREDIENTS */}
                            <section className="create-editor-section">

                                <div className="create-editor-heading">

                                    <div className="create-editor-icon">
                                        ♨
                                    </div>

                                    <div>
                                        <h3>Ingredients</h3>
                                        <p>List all ingredients</p>
                                    </div>

                                </div>

                                <IngredientEditor
                                    ingredients={ingredients}
                                    setIngredients={setIngredients}
                                />

                                {errors.ingredients && (
                                    <span className="create-field-error">
                                        {errors.ingredients}
                                    </span>
                                )}

                            </section>

                            {/* COOKING INSTRUCTIONS */}
                            <section className="create-editor-section">

                                <div className="create-editor-heading">

                                    <div className="create-editor-icon">
                                        ♨
                                    </div>

                                    <div>
                                        <h3>Cooking Instructions</h3>
                                        <p>Step-by-step instructions</p>
                                    </div>

                                </div>

                                <InstructionEditor
                                    instructions={instructions}
                                    setInstructions={setInstructions}
                                />

                                {errors.instructions && (
                                    <span className="create-field-error">
                                        {errors.instructions}
                                    </span>
                                )}

                            </section>

                        </div>

                        {/* SUCCESS MESSAGE */}
                        {success && (
                            <div
                                className="create-success-message"
                                role="status"
                            >
                                <span>✓</span>
                                {success}
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <div className="create-form-submit-area">

                            <p>
                                <span>*</span> Required fields
                            </p>

                            <button
                                type="submit"
                                className="create-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Submitting your recipe...'
                                    : 'Submit My Recipe  →'}
                            </button>

                            <small>
                                Your recipe will be reviewed according to
                                the community submission settings.
                            </small>

                        </div>

                    </form>

                ) : (

                    <div className="submission-disabled-message">

                        <h3>
                            Recipe Submissions Temporarily Unavailable
                        </h3>

                        <p>
                            The administrator has temporarily disabled
                            recipe submissions. Please try again later.
                        </p>

                    </div>

                )}

            </main>

        </div>
    );
}

export default CreateRecipe;
