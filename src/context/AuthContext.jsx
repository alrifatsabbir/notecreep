import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const login = useCallback(async ({ username, password }) => {
        setIsLoading(true);
        try {
            const responseData = await auth.login({ username, password });
            
            // ✅ Change: We are now explicitly saving the token and user data to localStorage.
            if (responseData.token) {
                localStorage.setItem('token', responseData.token);
                localStorage.setItem('user', JSON.stringify(responseData.user));
            }

            setIsLoggedIn(true);
            setUser(responseData.user);

        } catch (error) {
            console.error('Login failed:', error);
            setIsLoggedIn(false);
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setIsLoading(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
    }, []);

    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                // ✅ Change: We will now make an API call to verify the token.
                // The backend's `verifyToken` middleware will validate the token.
                await auth.getUserProfile(JSON.parse(savedUser).username);

                // If the API call succeeds, the token is valid, so we set the state.
                setIsLoggedIn(true);
                setUser(JSON.parse(savedUser));
            } catch (error) {
                // If the API call fails, it means the token is invalid or expired.
                console.error('Authentication check failed:', error);
                logout(); // Call the logout function to clear localStorage and state
            }
        } else {
            // No token or user data means not logged in.
            logout();
        }
        setIsLoading(false);
    }, [logout]); // Added logout to the dependency array

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value = {
        isLoggedIn,
        login,
        logout,
        user,
        isLoading,
        checkAuthStatus // It's good practice to expose this if needed elsewhere
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};