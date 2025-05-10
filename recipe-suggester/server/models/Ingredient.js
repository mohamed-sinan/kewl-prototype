const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expiryDate: { type: Date, required: false },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
