import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './screens/Logins/SignIn';
import Register from './screens/Logins/Registration';
import ForgotPassword from './screens/Logins/ForgotPassword';
import Login from './screens/Logins/SignIn'; // Keep one of the Login imports
import About from './screens/Logins/About';
import Service from './screens/Logins/Service';
import Contact from './screens/Logins/Contact';
import 'bootstrap/dist/css/bootstrap.min.css'; // Use this instead of '../node_modules'
import LandingPage from './screens/Logins/LandingPage';
import StaffDashboard from './screens/Staff/StaffDashboard';
import AccountRecovery from './screens/Logins/AccountRecovery';
import AdminDashboard from './screens/ADMIN/AdminDashboard/Admin/SideBarNavigation';
import TechnicianDashboard from './screens/TECHNICIAN/SideBarNavigation';
import HODDashboard from './screens/HOD/HeadDepartment';
import Registration from './screens/Logins/Registration';


function App() {
  return (
    <Router>
      <Routes>
        {/* This is the main single-page layout */}
        <Route path="/" element={<LandingPage />} />

        {/* registration */}
        <Route path="/registration" element={<Registration />} />

        {/* Define routes for the main application */}

        {/* Define separate routes for standalone pages */}
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/accountRecovery" element={<AccountRecovery />} />

        {/* Additional routes */}
        <Route path="/staffdashboard/*" element={<StaffDashboard />} />
        <Route path="/techniciandashboard/*" element={<TechnicianDashboard />} />
        <Route path="/admindashboard/*" element={<AdminDashboard/>} />
        <Route path="/headdepartment/*" element={<HODDashboard/>} />
        <Route path="/ReportButtons/issueReport" element={<issueReport />} />
        <Route path="/ReportButtons/monthlyReport" element={<monthlyReport />} />
        <Route path="/ReportButtons/technicianReport" element={<technicianReport />} />
      </Routes>
    </Router>
  );
}

export default App;