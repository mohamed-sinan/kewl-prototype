const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Ingredient = require('./models/Ingredient');

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipe_suggester', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Root route for test
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Get all ingredients
app.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json({ ingredients });
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ message: 'Failed to fetch ingredients.' });
  }
});

// Add a new ingredient
app.post('/ingredients', async (req, res) => {
  const { name, expiryDate } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Ingredient name is required.' });
  }

  try {
    const newIngredient = new Ingredient({ name, expiryDate });
    await newIngredient.save();
    res.status(200).json({ message: 'Ingredient added!' });
  } catch (err) {
    console.error('Error adding ingredient:', err);
    res.status(500).json({ message: 'Failed to add ingredient.' });
  }
});

// Delete an ingredient by ID
app.delete('/ingredients/:id', async (req, res) => {
  const ingredientId = req.params.id;
  try {
    const result = await Ingredient.findByIdAndDelete(ingredientId);

    if (result) {
      return res.status(200).json({ message: 'Ingredient deleted!' });
    } else {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }
  } catch (err) {
    console.error('Error deleting ingredient:', err.message);
    res.status(500).json({ message: 'Failed to delete ingredient.' });
  }
});

// Spoonacular API integration
const axios = require('axios');
const SPOONACULAR_API_KEY = '4510937ea1214931b5f4454559560f9d';

// Get recipe suggestions based on current ingredients
app.get('/recipes', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    if (ingredients.length === 0) {
      return res.status(400).json({ message: 'No ingredients available to suggest recipes.' });
    }

    const ingredientString = ingredients.map(i => i.name).join(',');

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredientString,
        number: 5,
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
