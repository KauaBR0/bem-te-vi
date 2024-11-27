import { getToken } from './auth';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  body?: any
) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const authApi = {
  register: (username: string, email: string, password: string) => 
    apiRequest('/auth/register', 'POST', { username, email, password }),
  
  login: (email: string, password: string) => 
    apiRequest('/auth/login', 'POST', { email, password })
};

export const todosApi = {
  getAll: () => apiRequest('/todos', 'GET'),
  
  create: (title: string, completed: boolean = false) => 
    apiRequest('/todos', 'POST', { title, completed }),
  
  update: (id: string, data: { title?: string, completed?: boolean }) => 
    apiRequest(`/todos/${id}`, 'PUT', data),
  
  delete: (id: string) => 
    apiRequest(`/todos/${id}`, 'DELETE')
};
