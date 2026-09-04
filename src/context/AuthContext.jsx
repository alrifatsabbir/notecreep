// src/context/AuthContext.jsx
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
            const response = await auth.login({ username, password });
            const data = response.data;
            
            if (data?.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            setIsLoggedIn(true);
            setUser(data.user);

            return data;
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

        if (token && savedUser && token !== 'undefined') {
            try {
                const parsedUser = JSON.parse(savedUser);
                await auth.getUserProfile(parsedUser.username);

                setIsLoggedIn(true);
                setUser(parsedUser);
            } catch (error) {
                console.error('Authentication check failed:', error);
                logout();
            }
        } else {
            logout();
        }
        setIsLoading(false);
    }, [logout]);

    // Check for email verification requirement
    const checkVerification = useCallback(async (email) => {
        try {
            const response = await auth.getUserProfile(email);
            return response.isVerified;
        } catch (error) {
            return false;
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value = {
        isLoggedIn,
        login,
        logout,
        user,
        isLoading,
        checkAuthStatus,
        checkVerification,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};