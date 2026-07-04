import React, { createContext, useContext, useState, useEffect } from 'react';

// Initialize the Authentication Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Global user session state initialized to null
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reactive synchronization loop runs once when the app first mounts
  useEffect(() => {
    const checkSavedSession = () => {
      try {
        const savedUser = localStorage.getItem('corehire_user');
        const token = localStorage.getItem('corehire_token');

        // Verify active token structures before committing them to live state
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Session hydration failed:', error);
        localStorage.removeItem('corehire_user');
        localStorage.removeItem('corehire_token');
      } finally {
        setLoading(false);
      }
    };

    checkSavedSession();
  }, []);

  // Execution wrapper handling credential ingestion and authorization handoffs
  const login = async (email, password) => {
    try {
      // NOTE: This placeholder directly prepares the front-end state loop.
      // In the future, replace this execution block with a clean Axios payload hit to your backend auth router.
      
      // Mocking successful server identity verification payload
      const mockUserResponse = {
        id: "usr-9284-x2",
        email: email,
        role: email.includes('recruiter') ? 'RECRUITER' : 'CANDIDATE', // Decoupled system roles
        tenantId: email.includes('recruiter') ? 'tenant-stripe-id' : null
      };
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...mockSignature";

      // Commit response data profile models directly to the React application state
      setUser(mockUserResponse);
      
      // Secure local browser records to survive manual page reloads
      localStorage.setItem('corehire_user', JSON.stringify(mockUserResponse));
      localStorage.setItem('corehire_token', mockToken);

      return { success: true, role: mockUserResponse.role };
    } catch (error) {
      console.error('Authentication gateway rejected login payload:', error);
      throw new Error(error.response?.data?.message || 'Invalid email or password input.');
    }
  };

  // Session termination script clearing all client cached authorization components
  const logout = () => {
    setUser(null);
    localStorage.removeItem('corehire_user');
    localStorage.removeItem('corehire_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Highly accessible custom hook to grab user permissions contexts down the layout tree
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed inside a valid AuthProvider layout wrapper');
  }
  return context;
};