import apiClient from './index';

export const getClients = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get('/clients', {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching clients:", error);
        throw error;
    }
};

export const getClientById = async (id) => {
    try {
        const response = await apiClient.get(`/clients/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching client ${id}:`, error);
        throw error;
    }
};

export const createClient = async (clientData) => {
    try {
        const response = await apiClient.post('/clients', clientData);
        return response.data;
    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }
};

export const updateClient = async (id, updateData) => {
    try {
        const response = await apiClient.put(`/clients/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating client ${id}:`, error);
        throw error;
    }
};

export const deleteClient = async (id) => {
    try {
        const response = await apiClient.delete(`/clients/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting client ${id}:`, error);
        throw error;
    }
};
