import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../Logins/LoginsStyle/login.css";
import Header from './Header';

const Login = () => {
  const navigate = useNavigate();

  // Function to navigate with role as state
  const handleNavigation = (role) => {
    navigate('/SignIn', { state: { role } });
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-content">
          <h1 className="login-title">LOGIN</h1>
          <hr className="login-line" />
          <div className="button-container">
            <div className="login-card" onClick={() => handleNavigation('Staff')}>Staff</div>
            <div className="login-card" onClick={() => handleNavigation('Technician')}>Technician</div>
            <div className="login-card" onClick={() => handleNavigation('Admin')}>Admin</div>
            <div className="login-card" onClick={() => handleNavigation('HOD')}>HOD</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
