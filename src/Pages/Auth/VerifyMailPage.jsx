// src/Pages/Auth/VerifyMailPage.jsx

import React from 'react';
import AnimatedNumbers from '../../components/AnimatedNumbers';
import Navbar from '../../components/Navbar';
import VerifyMailFormComponent from '../../components/auth/VerifyMailComponent';

const VerifyMailPage = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center p-4 overflow-hidden">
            {/* Navbar and Toaster are placed here to ensure they are on top */}
            <div className="fixed inset-x-0 top-0 z-50">
                <Navbar />
            </div>

            {/* Main content is given a top-padding to push it below the fixed navbar */}
            <div className="w-full flex-grow flex flex-col items-center justify-center pt-16">
                
                {/* Animated Numbers Background */}
                <AnimatedNumbers />

                {/* Register Form */}
                <VerifyMailFormComponent />
            </div>
        </div>

    );
};

export default VerifyMailPage;