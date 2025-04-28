import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface User {
  userId: number;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        role,
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;