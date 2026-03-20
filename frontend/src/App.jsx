import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastProvider';
import './style.css';
import './utils.css';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';

import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AttendeeDashboard from './pages/AttendeeDashboard';

import BrowseEvents from './pages/BrowseEvents';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import ManageUsers from './pages/ManageUsers';
import ApproveEvents from './pages/ApproveEvents';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';
import Feedback from './pages/Feedback';
import MemoryBook from './pages/MemoryBook';
import Registrations from './pages/Registrations';
import TicketView from './pages/TicketView';
import AdminEvents from './pages/AdminEvents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';

import Notifications from './pages/Notifications';

import VerifyTicket from './pages/VerifyTicket';
import EventAttendees from './pages/EventAttendees';
import CheckIn from './pages/CheckIn';

const ConditionalLayout = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('isAuthenticated'));

  React.useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('isAuthenticated'));
  }, [location]);

  return isAuthenticated ? <DashboardLayout><Outlet /></DashboardLayout> : <Layout><Outlet /></Layout>;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_ACTUAL_GOOGLE_CLIENT_ID">
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes with Conditional Layout (Sidebar if logged in, otherwise Navbar) */}
              <Route element={<ConditionalLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/events" element={<BrowseEvents />} />
                <Route path="/event-details/:id" element={<EventDetails />} />
                <Route path="/memory-book/:id" element={<MemoryBook />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/chatbot" element={<Chatbot />} />
              </Route>

              {/* Auth Routes (No Navbar, No Sidebar) */}
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Dashboard Routes with Dashboard Layout (Sidebar, No Navbar) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
                  <Route path="/dashboard/attendee" element={<AttendeeDashboard />} />

                  {/* Functional Dashboard Pages */}
                  <Route path="/create-event" element={<CreateEvent />} />
                  <Route path="/manage-users" element={<ManageUsers />} />
                  <Route path="/approve-events" element={<ApproveEvents />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/event/:id/attendees" element={<EventAttendees />} />
                  <Route path="/registrations" element={<Registrations />} />
                  <Route path="/my-ticket" element={<TicketView />} />

                  {/* New Role-Specific Pages */}
                  <Route path="/dashboard/admin/events" element={<AdminEvents />} />
                  <Route path="/dashboard/admin/reports" element={<Reports />} />
                  <Route path="/dashboard/admin/settings" element={<Settings />} />
                  <Route path="/dashboard/organizer/my-events" element={<MyEvents />} />
                  <Route path="/dashboard/organizer/profile" element={<Profile />} />
                  <Route path="/dashboard/organizer/check-in" element={<CheckIn />} />
                  <Route path="/dashboard/attendee/notifications" element={<Notifications />} />
                  <Route path="/dashboard/attendee/profile" element={<Profile />} />
                  <Route path="/verify-ticket" element={<VerifyTicket />} />
                </Route>
              </Route>

              <Route path="*" element={<Layout><div className="text-center mt-5"><h1>404 Not Found</h1></div></Layout>} />
            </Routes>
            <Chatbot />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
