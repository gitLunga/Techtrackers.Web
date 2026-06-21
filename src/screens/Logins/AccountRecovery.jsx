import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from './Header2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginsStyle/VerifyEmail.css';
import './LoginsStyle/otpStyle.css';
import './LoginsStyle/ForgotPassword.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function AccountRecovery() {
    const navigate = useNavigate();
    const [step, setStep] = useState('verifyEmail');
    const [Email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [Password, setPassword] = useState('');
    const [ConfirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    // Function to generate a random 4-digit OTP
    const generateOtp = () => {
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otpCode);
        console.log('Generated OTP:', otpCode);
    };

    // Email Verification Step
    function submitEmail() {
        /*
        const engravedEmail = "ezramagagane@gmail.com";
        if (Email.trim() === '') {
            toast.error('Enter your email');
            return;
        }
        const emailValidation = /\S+@\S+\.\S+/;
        if (!Email.match(emailValidation)) {
            toast.error('Enter a valid email address');
            return;
        }
        if (Email.trim().toLowerCase() !== engravedEmail.toLowerCase()) {
            toast.error('This user is not registered!');
            return;
        }

        generateOtp();
        toast.success('OTP was sent to the provided email');
        setTimeout(() => setStep('otp'), 2000);*/
        if (Email.trim() === '') {
            toast.error('Enter your email');
            return;
        }
    
        const emailValidation = /\S+@\S+\.\S+/;
        if (!Email.match(emailValidation)) {
            toast.error('Enter a valid email address');
            return;
        }
    
        axios.post('https://localhost:44328/api/Account/RequestOtp/request-otp', { Email })
            .then((response) => {
                toast.success('OTP was sent to the provided email');
                console.log('OTP request successful:', response.data); // Log success response
                setTimeout(() => setStep('otp'), 2000);
            })
            .catch((error) => {
                const errorMessage = error.response?.data || 'An error occurred while requesting OTP';
                toast.error(errorMessage);
                console.log('OTP request failed:', errorMessage); // Log error response
            });
    }

    // OTP Verification Step
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const verifyOtp = () => {
        /*
        const enteredOtp = otp.join('');
        if (enteredOtp === generatedOtp) {
            toast.success("OTP verified successfully!");
            setTimeout(() => setStep('resetPassword'), 2000);
        } else {
            toast.error("OTP does not match. Please try again.");
        }*/
            // This is to verify OTP and reset Password Step
            const enteredOtp = otp.join('');

            if (enteredOtp === '') {
                toast.error('Please enter the OTP.');
                return;
            }

            console.log('Verifying OTP:', enteredOtp);
            console.log('Email:', Email);

            axios.post('https://localhost:44328/api/Account/VerifyOtp/verify-otp', {
                Email,
                Otp: enteredOtp,
            })
            .then((response) => {
                toast.success('OTP verified successfully!');
                console.log('OTP verification successful:', response.data);

                // Move to the password reset step after successful OTP verification
                setStep('resetPassword');
            })
            .catch((error) => {
                toast.error(error.response?.data || 'Invalid OTP or other error.');
                console.log('Error response:', error.response?.data);
            });
    };

    // Function to check password strength dynamically
    const checkPasswordStrength = (password) => {
        let strengthScore = 0;
        if (password.length >= 8) strengthScore++;
        if (/[A-Z]/.test(password)) strengthScore++;
        if (/\d/.test(password)) strengthScore++;
        if (/[^\w\d\s:]/.test(password)) strengthScore++;

        setStrength(strengthScore);  // Set strength dynamically as the user types
    };

    // Password Reset Step - and validate password and submit
    const submitPassword = () => {
        console.log('Email:', Email);
        console.log('Otp:', otp.join(''));
        console.log('Password:', Password);
        console.log('ConfirmPassword:', ConfirmPassword);
        const validPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

        if (Password === '') {
            toast.error('Enter a new password');
            return;
        }
        if (ConfirmPassword === '') {
            toast.error('Confirm your new password');
            return;
        }
        if (!validPassword.test(Password)) {
            toast.error('Password does not meet the required criteria.');
            return;
        }
        if (Password !== ConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        //Submit the new password
        axios.post('https://localhost:44328/api/Account/ResetPassword/reset-password', {
            Email,
            Otp: otp.join(''), // Combine the OTP digits into a string
            NewPassword: Password,  
        })
        .then((response) => {
            toast.success('Password reset successful!');
            console.log('Password reset successful:', response.data);
            setTimeout(() => navigate('/login'), 2000);
        })
        .catch((error) => {
            toast.error(error.response?.data || 'An error occurred while resetting password.');
            console.log('Error response:', error.response?.data);
        });
        
        //verifyOtp(); // Proceed to verify OTP and reset password
        
        /*if (Password === '') {
            toast.error('Enter a new password');
            return;
        }
        if (ConfirmPassword === '') {
            toast.error('Confirm your new password');
            return;
        }
        if (Password.length < 8 || Password.length > 16) {
            toast.error('Password must be between 8 and 16 characters long.');
            return;
        }
        if (!/[A-Z]/.test(Password)) {
            toast.error('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[a-z]/.test(Password)) {
            toast.error('Password must contain at least one lowercase letter.');
            return;
        }
        if (!/\d/.test(Password)) {
            toast.error('Password must contain at least one digit.');
            return;
        }
        if (!/[^\w\d\s:]/.test(Password)) {
            toast.error('Password must contain at least one special character.');
            return;
        }
        if (/\s/.test(Password)) {
            toast.error('Password cannot contain spaces.');
            return;
        }
        if (!validPassword.test(Password)) {
            toast.error('Password does not meet the required criteria.');
            return;
        }
        if (Password !== ConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        toast.success('Password reset successful');
        setTimeout(() => navigate('/login'), 2000);*/
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkPasswordStrength(newPassword);  // Call the strength checker every time the user types
    };

    return (
        <div>
            <ToastContainer />
            <Header2 />
            {step === 'verifyEmail' && (
                <div className="verify-email-container">
                    <div className="verify-box">
                        <div className="content-side">
                            <h2>Reset Password</h2>
                            <p>Forgot password? No worries, enter your email to receive a one-time pin.</p>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Enter your email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="email-form"
                                />
                            </div>
                            <div className="form-group">
                                <button onClick={submitEmail} className="otp-btn">Get OTP</button>
                            </div>
                        </div>
                        <div className="side-image1">
                            <img src={require('../../Images/background.jpg')} alt="Background" height={300} />
                        </div>
                    </div>
                </div>
            )}

            {step === 'otp' && (
                <div className="otp-container">
                    <div className="otp-box">
                        <div className="otp-content">
                            <h2>Verify Email Address</h2>
                            <p>Enter the OTP sent to <br /> <strong>{Email}</strong></p>
                            <div className="form-group otp-input-group">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="otp-input"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onFocus={(e) => e.target.select()}
                                    />
                                ))}
                            </div>
                            <div className="form-group">
                                <button onClick={verifyOtp} className="verify-btn">Verify</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'resetPassword' && (
                <div className="forgot-password-container">
                    <div className="forgot-password-box">
                        <h2>Reset Password</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Email"
                                value={Email}
                                className="control-form"
                                readOnly
                            />
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${(strength / 4) * 100}%`,
                                    backgroundColor: getStrengthColor(strength),
                                    height: '8px',
                                    marginBottom: '8px',
                                }}
                            />
                        </div>
                        <div className="form-grp password-grp">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={Password}
                                onChange={handlePasswordChange}  // Dynamically check strength as user types
                                className="form-ctrl"
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
                                value={ConfirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="form-ctrl"
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="form-group">
                            <button onClick={submitPassword} className="reset-password-button">Reset Password</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to determine progress bar color
const getStrengthColor = (strength) => {
    switch (strength) {
        case 1:
            return 'red';
        case 2:
            return 'orange';
        case 3:
            return 'yellowgreen';
        case 4:
            return 'green';
        default:
            return '#e0e0e0';
    }
};

export default AccountRecovery;
