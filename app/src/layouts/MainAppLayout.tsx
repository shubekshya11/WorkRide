import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';
import { OnboardingGuard } from '../guards/OnboardingGuard';

const MainAppLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <OnboardingGuard enforceProfileCompletion={false}>
        <Outlet />
      </OnboardingGuard>
      <Footer />
    </>
  );
};

export default MainAppLayout;
