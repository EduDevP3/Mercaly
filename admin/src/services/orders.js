const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }
  return response.json();
};

export const orderService = {
  // GET ALL orders con paginación
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    const url = `${API_URL}/orders?${queryParams.toString()}`;
    const response = await fetch(url, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};
