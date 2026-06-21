// MainContent.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./TechnicianSidebar";
import TechnicianHeader from './TechnicianHeader';

//import Techdashboard from "./pages/Techdashboard";
//import NotificationsPage from "./pages/TechNotification";
//import TechCollaboration from "./pages/TechCollaboration";
//import TechReviews from "./pages/TechReviews";
//import MyIssues from "./pages/TechAllIssues";



//From the folders called components

//import TechnicianNotifications from '../../components/Notifications/TechnicianNotifications';
//import WelcomTechnician from '../TechDashBoard1/WelcomeTechnician';
//import RoutesComponent from '../../components/All Issue and View Page/RoutesComponent';
//import CollabMain from '../../components/CollaborationRequest/CollabMain';
//import Ratings from '../../components/Ratings';
//import "./SidebarCSS/SidebarNavStyle.css";
//import TechnicianLiveChat from '../../components/TechnicianLiveChat/TechnicianLiveChat';
//import Table from "../../components/All Issue and View Page/Table";
//import IssueDetails from "../../components/All Issue and View Page/IssueDetails";
//import useIssues from "../../components/All Issue and View Page/useIssues";
//import IssueDetailsCollab from '../../components/CollaborationRequest/TableCollaburationRequest';
//import Table1 from '../../components/CollaborationRequest/TableCollaburationRequest';
//import IssueDetails1 from '../../components/CollaborationRequest/IssueDetailsCollaburationRequest';
//in the navigation folder 


import TechnicianNotifications from './pages/TechnicianNotifications.jsx';
import WelcomTechnician from './pages/WelcomeTechnician.jsx';
import RoutesComponent from './pages/RoutesComponent.jsx';
import CollabMain from './pages/CollabMain.jsx';
import Ratings from './pages/Ratings.jsx';
import "./SidebarCSS/SidebarNavStyle.css";
import TechnicianLiveChat from './pages/TechnicianLiveChat.jsx';
import Table from "./pages/Table.jsx";
import IssueDetails from "./pages/IssueDetails.jsx";
import useIssues from "./pages/useIssues.jsx";
import IssueDetailsCollab from './pages/IssueDetailsCollaburationRequest.jsx';
import Table1 from './pages/TableCollaburationRequest.jsx';
import IssueDetails1 from './pages/IssueDetailsCollaburationRequest.jsx';
import TechnicianStaffLiveChat from './pages/TechnicianStaffLiveChat.jsx';



const TechnicianDashboard = () => {
  const { issues, setIssues } = useIssues();
  
  const handleLogout = ()=> {
      localStorage.removeItem('user_info');
  }
  return (
    <div className="admin-dashboard">
      <TechnicianHeader />
      <Sidebar />
      <div className="main-content">
        <Routes>
        {/* <Route path="/issues/:issueId" element={<IssueDetails issues={issues} />} /> */}

          <Route path="/dashboard" element={<WelcomTechnician/>} />
          <Route path="/notifications" element={<TechnicianNotifications />} />
          <Route path="/tbl" element={<Table issues={issues} setIssues={setIssues} />} />
          <Route path="/issues/:issueId" element={<IssueDetails issues={issues} />} />
          <Route path="/techChat" element={<TechnicianLiveChat/>} />
          <Route path="/staffChat" element={<TechnicianStaffLiveChat/>} />
          {/* <Route path="/collaboration" element={<CollabMain />} /> */}
          <Route path="/issue1/:issueId" element={<IssueDetailsCollab />} />
          <Route path="/reviews" element={<Ratings />} />
          
          <Route path="/collab" element={<Table1 />} />
          <Route path="/issue/:issueId" element={<IssueDetails1 />} />
          
        </Routes>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
