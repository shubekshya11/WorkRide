import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';

const MainAppLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainAppLayout;
