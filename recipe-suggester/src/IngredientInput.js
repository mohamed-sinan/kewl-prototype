import React, { useState, useEffect } from 'react';

function IngredientInput() {
  const [ingredient, setIngredient] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleChange = (e) => {
    setIngredient(e.target.value);
  };

  const handleExpiryDateChange = (e) => {
    setExpiryDate(e.target.value);
  };

  // Fetch ingredients from the backend
  const fetchIngredients = async () => {
    try {
      const res = await fetch('http://localhost:5000/ingredients');
      const data = await res.json();
      setIngredientList(data.ingredients);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  };

  // Handle form submission to add ingredient
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredient) return;

    try {
      const response = await fetch('http://localhost:5000/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: ingredient, expiryDate }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Ingredient added successfully!');
        setIngredient('');
        setExpiryDate('');
        fetchIngredients(); // Refresh the list
      } else {
        console.error('Error adding ingredient:', data.message);
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  // Handle ingredient deletion
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/ingredients/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Ingredient deleted:', data.message);
        fetchIngredients();
      } else {
        console.error('Delete failed:', data.message);
      }
    } catch (err) {
      console.error('Error deleting ingredient:', err);
    }
  };

  // Fetch recipes based on the ingredients
  const fetchRecipes = async () => {
    try {
      const res = await fetch('http://localhost:5000/recipes');
      const data = await res.json();

      if (res.ok) {
        setRecipes(data.recipes);
      } else {
        console.error('Error fetching recipes:', data.message);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  // Fetch details of the selected recipe
  const fetchRecipeDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/recipes/${id}`);
      const data = await res.json();

      if (res.ok) {
        setSelectedRecipe(data.recipeDetails);
      } else {
        console.error('Error fetching recipe details:', data.message);
      }
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div>
      <h2>Enter an Ingredient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ingredient}
          onChange={handleChange}
          placeholder="e.g., Milk"
        />
        <input
          type="date"
          value={expiryDate}
          onChange={handleExpiryDateChange}
          placeholder="Expiry Date"
        />
        <button type="submit">Add Ingredient</button>
      </form>

      <h3>Ingredients in Your Fridge:</h3>
      <ul>
        {ingredientList.map((item) => (
          <li key={item._id}>
            {item.name} (Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}){' '}
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={fetchRecipes}>Suggest Recipes</button>

      {recipes.length > 0 && (
        <div>
          <h3>Recipe Suggestions:</h3>
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <h4 onClick={() => fetchRecipeDetails(recipe.id)} style={{ cursor: 'pointer' }}>
                  {recipe.title}
                </h4>
                <img src={recipe.image} alt={recipe.title} width={100} />
                <p>Used Ingredients: {recipe.usedIngredients.join(', ')}</p>
                <p>Missing Ingredients: {recipe.missedIngredients.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedRecipe && (
        <div>
          <h3>{selectedRecipe.title}</h3>
          <img src={selectedRecipe.image} alt={selectedRecipe.title} width={200} />
          <p><strong>Servings:</strong> {selectedRecipe.servings}</p>
          <h4>Ingredients:</h4>
          <ul>
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h4>Instructions:</h4>
          <p>{selectedRecipe.instructions}</p>
          {selectedRecipe.nutrition.length > 0 && (
            <div>
              <h4>Nutrition:</h4>
              <ul>
                {selectedRecipe.nutrition.map((nutrient, index) => (
                  <li key={index}>
                    {nutrient.title}: {nutrient.amount} {nutrient.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IngredientInput;
