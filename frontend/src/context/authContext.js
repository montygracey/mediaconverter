import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('jwtToken');
        } else {
          dispatch({
            type: 'LOGIN',
            payload: {
              id: decodedToken.id,
              username: decodedToken.username,
              email: decodedToken.email,
              token
            }
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('jwtToken');
      }
    }
  }, []);
  
  const login = (userData) => {
    localStorage.setItem('jwtToken', userData.token);
    
    dispatch({
      type: 'LOGIN',
      payload: userData
    });
  };
  
  const logout = () => {
    localStorage.removeItem('jwtToken');
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);