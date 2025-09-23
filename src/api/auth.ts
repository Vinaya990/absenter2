// API layer for authentication
import type { User } from '../types';

const API_BASE = '/api';

class AuthAPI {
  async login(username: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Login API error:', error);
      return null;
    }
  }

  async register(username: string, _password: string, employeeId: string): Promise<{ user: User; token: string } | null> {
    try {
      // Mock registration - in real app, this would create a user in the database
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email: `${username}@company.com`,
        employee_id: employeeId,
        role: 'employee',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      return {
        user: newUser,
        token: 'mock-jwt-token'
      };
    } catch (error) {
      console.error('Registration API error:', error);
      return null;
    }
  }

  async getCurrentUser(_token: string): Promise<User | null> {
    try {
      // In a real app, this would validate the token and return user data
      const storedUser = localStorage.getItem('absentra_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Get current user API error:', error);
      return null;
    }
  }

  async updateProfile(_userId: string, updates: { username?: string; email?: string }, _token: string): Promise<User | null> {
    try {
      // Mock profile update
      const storedUser = localStorage.getItem('absentra_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('absentra_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Update profile API error:', error);
      return null;
    }
  }
}

export const authAPI = new AuthAPI();