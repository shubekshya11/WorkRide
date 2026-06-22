import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import useTheme from './hooks/useTheme';
import RouterToTop from './utils/RouterToTop';

import { AuthProvider } from './contexts/AuthContext';

import MainAppLayout from './layouts/MainAppLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Brand from './pages/Brand';
import Login from './layouts/Login';
import FAQPage from './pages/FAQPage';
import Error404 from './pages/Error404';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';
import ViewScore from './pages/ViewScore';
import ViewKarma from './pages/ViewKarma';
import RedeemPage from './pages/RedeemPage';
import RideDetails from './pages/RideDetails';
import Leaderboard from './pages/Leaderboard';
import RoleBasedPage from './pages/RoleBasedPage';
import SelfReflection from './pages/SelfReflection';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRides from './pages/admin/Rides';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLogs from './pages/admin/Logs';
import AdminSettings from './pages/admin/Settings';

import { GuestRoute } from './guards/GuestRoute';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { AdminRoute } from './guards/AdminRoute';

import { SocketManager } from './components/SocketManager';

import {
  ROUTE_404,
  ROUTE_HOME,
  ROUTE_HELP,
  ROUTE_ROLE,
  ROUTE_ABOUT,
  ROUTE_LOGIN,
  ROUTE_BRAND,
  ROUTE_LEGAL,
  ROUTE_REDEEM,
  ROUTE_PROFILE,
  ROUTE_VIEW_SCORE,
  ROUTE_EARN_KARMA,
  ROUTE_LEADERBOARD,
  ROUTE_RIDE_DETAILS,
  ROUTE_LOGS_DASHBOARD,
  ROUTE_ADMIN,
  ROUTE_ADMIN_LOGS,
} from './constants/routes';

import { RideEventProvider } from './contexts/RideEventContext';

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <Router>
        <AuthProvider>
          <RideEventProvider>
            <SocketManager>
              <RouterToTop />
              <Routes>
                {/* Admin routes — no Navbar/Footer */}
                <Route
                  path={ROUTE_ADMIN}
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="rides" element={<AdminRides />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Main app — with Navbar/Footer */}
                <Route element={<MainAppLayout />}>
                  <Route path={ROUTE_HOME} element={<Home />} />
                  <Route path={ROUTE_HELP} element={<FAQPage />} />
                  <Route path={ROUTE_ABOUT} element={<AboutPage />} />
                  <Route path={ROUTE_BRAND} element={<Brand />} />
                  <Route path={ROUTE_LEGAL} element={<LegalPage />} />
                  <Route path={ROUTE_LEADERBOARD} element={<Leaderboard />} />

                  <Route
                    path={ROUTE_LOGIN}
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />

                  <Route
                    path={ROUTE_PROFILE}
                    element={
                      <ProtectedRoute>
                        <SelfReflection />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_RIDE_DETAILS}
                    element={
                      <ProtectedRoute>
                        <RideDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_ROLE}
                    element={
                      <ProtectedRoute>
                        <RoleBasedPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_LOGS_DASHBOARD}
                    element={
                      <ProtectedRoute>
                        <Navigate to={ROUTE_ADMIN_LOGS} replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_REDEEM}
                    element={
                      <ProtectedRoute>
                        <RedeemPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_VIEW_SCORE}
                    element={
                      <ProtectedRoute>
                        <ViewScore />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTE_EARN_KARMA}
                    element={
                      <ProtectedRoute>
                        <ViewKarma />
                      </ProtectedRoute>
                    }
                  />

                  <Route path={ROUTE_404} element={<Error404 />} />
                </Route>
              </Routes>
            </SocketManager>
          </RideEventProvider>
        </AuthProvider>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </>
  );
};

export default App;
