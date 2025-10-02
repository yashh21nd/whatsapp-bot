import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError("");
    setError("");
    
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setEmailError("");
    
    // Simulate API call
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin(email);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0b141a",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 17px 50px 0 rgba(11, 20, 26, 0.19), 0 12px 15px 0 rgba(11, 20, 26, 0.24)",
        padding: "28px 20px 40px 20px",
        width: "400px",
        maxWidth: "90vw",
        textAlign: "center"
      }}>
        {/* WhatsApp Logo */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#25d366",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: "white"
          }}>
            
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "300",
            color: "#4a4a4a",
            margin: "0 0 8px 0"
          }}>
            WhatsApp Business
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#999",
            margin: "0",
            lineHeight: "20px"
          }}>
            {step === "email" 
              ? "Sign in to your WhatsApp Business account" 
              : "Enter the verification code sent to your email"}
          </p>
        </div>

        {step === "email" ? (
          <div>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: emailError ? "1px solid #f44336" : "1px solid #e1e8ed",
                  borderRadius: "6px",
                  fontSize: "16px",
                  background: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  if (!emailError) {
                    e.target.style.borderColor = "#25d366";
                  }
                }}
                onBlur={(e) => {
                  if (!emailError) {
                    e.target.style.borderColor = "#e1e8ed";
                  }
                }}
              />
              {emailError && (
                <p style={{
                  color: "#f44336",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                  textAlign: "left"
                }}>
                  {emailError}
                </p>
              )}
            </div>
            
            <button
              onClick={handleSendOtp}
              disabled={loading || !email || emailError}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "6px",
                background: loading || !email || emailError ? "#e4e6ea" : "#25d366",
                color: loading || !email || emailError ? "#bcc0c4" : "#ffffff",
                fontSize: "16px",
                fontWeight: "500",
                cursor: loading || !email || emailError ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                marginBottom: "16px"
              }}
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <input
                type="text"
                placeholder="Enter verification code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                disabled={loading}
                maxLength="6"
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: error ? "1px solid #f44336" : "1px solid #e1e8ed",
                  borderRadius: "6px",
                  fontSize: "18px",
                  textAlign: "center",
                  letterSpacing: "2px",
                  background: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = "#25d366";
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = "#e1e8ed";
                  }
                }}
              />
              {error && (
                <p style={{
                  color: "#f44336",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                  textAlign: "left"
                }}>
                  {error}
                </p>
              )}
            </div>
            
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "6px",
                background: loading || !otp ? "#e4e6ea" : "#25d366",
                color: loading || !otp ? "#bcc0c4" : "#ffffff",
                fontSize: "16px",
                fontWeight: "500",
                cursor: loading || !otp ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                marginBottom: "16px"
              }}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: "#128c7e",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Back to email
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "24px",
          fontSize: "12px",
          color: "#999",
          lineHeight: "16px"
        }}>
          By continuing, you agree to WhatsApp's Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default Login;
