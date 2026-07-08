import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('corehire_jwt') || null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-restore session from token on page reload
  useEffect(() => {
    if (token) {
      try {
        // Decode the JWT payload to restore user role and tenant context
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          role: payload.role,
          tenantId: payload.tenantId
        });
      } catch (e) {
        console.error("[!] INVALID_TOKEN_SIGNATURE");
        logout();
      }
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Send credentials to the Node.js Engine
      const response = await axios.post('http://127.0.0.1:3000/api/auth/login', {
        email,
        password
      }, {
        // 👇 THE CRITICAL FIX: Synchronize with Backend CORS
        withCredentials: true 
      });

      const { token: jwtToken, user: userData } = response.data;

      // 2. Cryptographic Token Acquired: Lock it into state and storage
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('corehire_jwt', jwtToken);

      return { success: true, role: userData.role, error: null }; // Login Success with role
    } catch (err) {
      // Catch network rejections (401 Unauthorized, etc.)
      const errorMsg = err.response?.data?.error || err.message || 'CRITICAL_FAILURE: NETWORK_REJECTION';
      setError(errorMsg);
      console.error('[AuthContext] Login failed:', errorMsg);
      return { success: false, role: null, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        // Ping the backend to instantly blacklist this token in Redis
        await axios.post('http://127.0.0.1:3000/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("[!] REDIS_BLACKLIST_FAILED", e);
      }
    }
    // Wipe local traces
    setToken(null);
    setUser(null);
    localStorage.removeItem('corehire_jwt');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);