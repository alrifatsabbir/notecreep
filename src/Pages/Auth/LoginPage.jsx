// src/pages/LoginPage.jsx

import React from 'react';
import AnimatedNumbers from '../../components/AnimatedNumbers'; 
import LoginFormComponent from '../../components/forms/LoginFormComponent'; 
import Navbar from '../../components/Navbar';
// Toaster is removed from here
import { toast } from 'react-hot-toast'; 

const LoginPage = () => {
    // customToast function is no longer needed
    const customToast = (message, type) => {
        // This function is now redundant
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center p-4 overflow-hidden">
            {/* Navbar is here, it should be in App.jsx but keeping it for your current setup */}
            <div className="fixed inset-x-0 top-0 z-50">
                <Navbar />
            </div>

            <div className="w-full flex-grow flex flex-col items-center justify-center pt-16">
                <AnimatedNumbers />
                <LoginFormComponent /> {/* customToast prop is removed */}
            </div>
        </div>
    );
};

export default LoginPage;