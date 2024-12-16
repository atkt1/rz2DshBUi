import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/home/Hero';
import Features from '@/components/sections/home/Features';
import Pricing from '@/components/sections/home/Pricing';
import TestingSection from '@/components/sections/home/TestingSection';
import Footer from '@/components/layout/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';

type AuthScreen = 'login' | 'signup' | 'forgot-password' | 'reset-password' | null;
type AppScreen = 'home' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(null);
  const [appScreen, setAppScreen] = useState<AppScreen>('home');

  const handleNavigate = (screen: AuthScreen) => {
    setCurrentScreen(screen);
  };

  const handleClose = () => {
    setCurrentScreen(null);
  };

  const handleWatchVideo = () => {
    setAppScreen('dashboard');
  };

  const renderAuthScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginForm onClose={handleClose} onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpForm onClose={handleClose} onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordForm onClose={handleClose} onNavigate={handleNavigate} />;
      case 'reset-password':
        return <ResetPasswordForm onClose={handleClose} onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  if (currentScreen) {
    return renderAuthScreen();
  }

  if (appScreen === 'dashboard') {
    return (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onLogin={() => handleNavigate('login')} 
        onSignUp={() => handleNavigate('signup')} 
      />
      <main>
        <Hero onSignUp={() => handleNavigate('signup')} onWatchVideo={handleWatchVideo} />
        <Features />
        <Pricing />
        <TestingSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;