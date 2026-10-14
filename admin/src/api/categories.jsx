import apiClient from './index';

/**
 * Retrieves all categories from the server.
 * @returns {Promise<Array<object>>} A list of all categories.
 */
export const getAllCategories = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/categories', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

/**
 * Creates a new category.
 * @param {object} categoryData - The data for the new category { name, description }.
 * @returns {Promise<object>} The newly created category.
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

/**
 * Updates an existing category.
 * @param {string} id - The ID of the category to update.
 * @param {object} updateData - The data to update the category with { name, description }.
 * @returns {Promise<object>} The updated category.
 */
export const updateCategory = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a category by its ID.
 * @param {string} id - The ID of the category to delete.
 * @returns {Promise<object>} The confirmation message.
 */
export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};
