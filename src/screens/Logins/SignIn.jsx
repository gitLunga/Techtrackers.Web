import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginsStyle/SignIn.css';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    // console.log("logging in to system");


    // Function to handle the login process by calling the API
    const login = async () => {
        try {
            const response = await fetch('https://localhost:44328/api/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: Email,
                    password: Password,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Save the user details in localStorage
                localStorage.setItem('user_info', JSON.stringify(data.user));
                // console.log("user logged in");



                // Check roles and navigate to respective dashboards
                const roles = data.user.roles;
                if (roles && roles.length > 0) {
                    const userRole = roles.find(role => ['staff', 'technician', 'admin', 'hod', 'external technician'].includes(role.toLowerCase()));
                    switch (userRole.toLowerCase()) {
                        case 'staff':
                            navigate('/staffdashboard/WelcomeStaff');
                            break;
                        case 'technician':
                        case 'external technician':
                            navigate('/techniciandashboard/dashboard');
                            break;
                        case 'admin':
                            navigate('/admindashboard/dashboard');
                            break;
                        case 'hod':
                            navigate('/headdepartment/hod-dashboard');
                            break;
                        default:
                            toast.error("Unknown role.");
                    }
                    toast.success(`You are now logged in as ${userRole}`);
                } else {
                    toast.error("No roles found.");
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Invalid email or password");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            toast.error("An error occurred while trying to log in.");
        }
    };


    return (
        <div className="signin-cup">
            <ToastContainer />
            <Header />
            <div className="signin-cover">
                <div className="signin-cot">
                    <div className="user-iconic">
                        <img src={require('../../Images/user.jpg')} alt="User Icon" />
                    </div>
                    <h2 className="welcome">Welcome</h2>
                    <p className="words">Please enter your details</p>
                    <div className="form-grp">
                        <input
                            type="email"
                            placeholder="Email"
                            onChange={(event) => setEmail(event.target.value)}
                            className="form-ctrl"
                            style={{ backgroundColor: 'white' }}
                        />
                    </div>
                    <div className="form-grp password-grp">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            onChange={(event) => setPassword(event.target.value)}
                            className="form-ctrl"
                            style={{ backgroundColor: 'white' }}
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button className="signin-btn" onClick={login}>Sign In</button>
                    <div className="forgot-pwd">
                        <Link to="/accountRecovery" className="forg-link">Forgot Password? Click here</Link>
                    </div>

                    {/* <div className="register-link">
                        Don't have an account?{" "}
                        <Link to="/registration" className="register-link-text">
                            Create Account
                        </Link>
                    </div> */}
                </div>
                <div className="image-section">
                    <img src={require('../../Images/background.jpg')} alt="Background" />
                </div>
            </div>
        </div>
    );
}

export default SignIn;
