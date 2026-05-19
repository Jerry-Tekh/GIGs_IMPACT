import { getAllCategories } from '../models/categoryModels.js';

// Get All Categories
export const getCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};