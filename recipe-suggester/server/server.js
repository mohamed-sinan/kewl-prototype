const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// In-memory ingredient storage
let ingredients = [];

// Root route for test
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Get all ingredients
app.get('/ingredients', (req, res) => {
  res.status(200).json({ ingredients });
});

// Add a new ingredient
app.post('/ingredients', (req, res) => {
  const { ingredient } = req.body;
  if (ingredient && typeof ingredient === 'string') {
    ingredients.push(ingredient);
    res.status(200).json({ message: 'Ingredient added!' });
  } else {
    res.status(400).json({ message: 'Ingredient is required and must be a string.' });
  }
});

// Delete an ingredient by name (case-insensitive)
app.delete('/ingredients/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const originalLength = ingredients.length;

  ingredients = ingredients.filter(item => item.toLowerCase() !== name);

  if (ingredients.length < originalLength) {
    res.status(200).json({ message: 'Ingredient deleted!' });
  } else {
    res.status(404).json({ message: 'Ingredient not found.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


const axios = require('axios');

// Replace this with your actual Spoonacular API key
const SPOONACULAR_API_KEY = '4510937ea1214931b5f4454559560f9d';

// Get recipe suggestions based on current ingredients
app.get('/recipes', async (req, res) => {
  try {
    if (ingredients.length === 0) {
      return res.status(400).json({ message: 'No ingredients available to suggest recipes.' });
    }

    const ingredientString = ingredients.join(',');

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredientString,
        number: 5, // number of recipes to return
        apiKey: SPOONACULAR_API_KEY,
      },
    });

    const recipes = response.data.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients.map(i => i.name),
      missedIngredients: recipe.missedIngredients.map(i => i.name),
    }));

    res.status(200).json({ recipes });

  } catch (err) {
    console.error('Error fetching recipes:', err.message);
    res.status(500).json({ message: 'Failed to fetch recipes.' });
  }
});

// Get recipe details by ID
app.get('/recipes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
      },
    });

    const recipeDetails = {
      title: response.data.title,
      image: response.data.image,
      instructions: response.data.instructions,
      ingredients: response.data.extendedIngredients.map(i => i.original),
      servings: response.data.servings,
      nutrition: response.data.nutrition ? response.data.nutrition.nutrients : [],
    };

    res.status(200).json({ recipeDetails });
  } catch (err) {
    console.error('Error fetching recipe details:', err.message);
    res.status(500).json({ message: 'Failed to fetch recipe details.' });
  }
});
