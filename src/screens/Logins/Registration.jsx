"use client"

import { useState } from "react"
import "./LoginsStyle/SignIn.css";
import { Link } from "react-router-dom"

const Registration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: prev.role === selectedRole ? "" : selectedRole,
    }))

    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.role) {
      newErrors.role = "Please select a role"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log("Registration data:", formData)
      // Handle registration logic here
      alert("Registration successful!")
    }
  }

  return (
    <div className="registration-cup">
      <div className="registration-cover">
        <div className="registration-content">
          <div className="user-iconic">
            <img src="/api/placeholder/80/80" alt="User Icon" />
          </div>

          <h2 className="welcome">Create Account</h2>
          <p className="words">Join our platform today</p>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-grp">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className={`form-ctrl ${errors.fullName ? "error" : ""}`}
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-grp">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={`form-ctrl ${errors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-grp password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`form-ctrl ${errors.password ? "error" : ""}`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-grp password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`form-ctrl ${errors.confirmPassword ? "error" : ""}`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </span>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-grp">
              <label className="role-label">Select Your Role:</label>
              <div className="role-selection">
                {["ADMIN", "STAFF", "HOD"].map((role) => (
                  <div
                    key={role}
                    className={`role-option ${formData.role === role ? "selected" : ""}`}
                    onClick={() => handleRoleChange(role)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.role === role}
                      onChange={() => handleRoleChange(role)}
                      className="role-checkbox"
                    />
                    <span className="role-text">{role}</span>
                  </div>
                ))}
              </div>
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>

            <div className="form-grp terms-group">
              <label className="terms-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="terms-checkbox"
                />
                <span className="checkmark"></span>I agree to the{" "}
                <a href="#" className="terms-link">
                  Terms and Conditions
                </a>
              </label>
              {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
            </div>

            <button type="submit" className="registration-btn">
              Create Account
            </button>
          </form>

          <div className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="link-text">
              Sign In
            </Link>
          </div>
        </div>

        <div className="image-section">
          <img src="/api/placeholder/400/600" alt="Registration" />
        </div>
      </div>
    </div>
  )
}

export default Registration
