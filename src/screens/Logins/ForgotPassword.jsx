import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginsStyle/ForgotPassword.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [ConfirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function submit() {
        if (Email === '') {
            toast.error('Enter your email');
            return;
        }

        const emailValidation = /\S+@\S+\.\S+/;
        if (!Email.match(emailValidation)) {
            toast.error('Enter a valid email address');
            return;
        }

        if (Password === '') {
            toast.error('Enter a new password');
            return;
        }

        if (ConfirmPassword === '') {
            toast.error('Confirm your new password');
            return;
        }

        if (Password !== ConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const data = { Email, Password };
        console.log('Password reset successful', data);

        // Show success toast and navigate after a slight delay
        toast.success('Password reset successful');
        setTimeout(() => navigate('/login'), 2000); // Delay to let users see the toast before redirecting
    }

    return (
        <div>
            <ToastContainer />
            <Header />
            <div className="forgot-password-container">
                <div className="forgot-password-box">
                    <h2>Reset Password</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Email"
                            onChange={(event) => setEmail(event.target.value)}
                            className="control-form"
                        />
                    </div>
                    <div className="form-grp password-grp">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
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
                    <div className="form-grp password-grp">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="form-ctrl"
                            style={{ backgroundColor: 'white' }}
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="form-group">
                        <button onClick={submit} className="reset-password-button">Reset Password</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
