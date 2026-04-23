// frontend/src/services/ticketService.js
const API_BASE_URL = 'http://localhost:8080/api/tickets';

export const ticketService = {
    // Get all tickets
    getAllTickets: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return [];
        }
    },

    // Get ticket by ID
    getTicketById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch ticket');
        return await response.json();
    },

    // Create new ticket
    createTicket: async (ticketData) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        if (!response.ok) throw new Error('Failed to create ticket');
        return await response.json();
    },

    // Update ticket
    updateTicket: async (id, ticketData) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        if (!response.ok) throw new Error('Failed to update ticket');
        return await response.json();
    },

    // Delete ticket
    deleteTicket: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete ticket');
        return true;
    },

    // Get tickets by status
    getTicketsByStatus: async (status) => {
        const response = await fetch(`${API_BASE_URL}/status/${status}`);
        if (!response.ok) throw new Error('Failed to fetch tickets by status');
        return await response.json();
    }
};