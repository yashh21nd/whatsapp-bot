import React, { useState } from "react";

const Signup = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setContactError("");
    setError("");
    
    if (value && !validateEmail(value)) {
      setContactError("Please enter a valid email address");
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setContactError("Email address is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setContactError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setContactError("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          contact: email
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep("otp");
        if (data.testMode) {
          setError(`Test mode: Check console for OTP`);
        }
      } else {
        setContactError(data.error || "Failed to send OTP to email");
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setContactError(`Failed to send OTP. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          contact: email,
          otp: otp
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Pass user data to parent component
        onSignup(data.user);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(rgba(11, 20, 26, 0.7), rgba(30, 58, 138, 0.6), rgba(11, 20, 26, 0.7)), url('/background.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
    }}>
      {/* Navigation Bar */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 1000,
        boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Logo and Brand */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#25d366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "white",
            fontWeight: "bold"
          }}>
            💬
          </div>
          <div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#1a1a1a",
              margin: "0",
              letterSpacing: "-0.5px"
            }}>
              WhatsApp-Bot
            </h1>
            <p style={{
              fontSize: "12px",
              color: "#666",
              margin: "0",
              fontWeight: "500"
            }}>
              Business Automation Platform
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "24px"
        }}>
          <a href="#features" style={{
            textDecoration: "none",
            color: "#666",
            fontSize: "14px",
            fontWeight: "500",
            transition: "color 0.2s"
          }} onMouseOver={(e) => e.target.style.color = "#25d366"} onMouseOut={(e) => e.target.style.color = "#666"}>
            Features
          </a>
          <a href="#pricing" style={{
            textDecoration: "none",
            color: "#666",
            fontSize: "14px",
            fontWeight: "500",
            transition: "color 0.2s"
          }} onMouseOver={(e) => e.target.style.color = "#25d366"} onMouseOut={(e) => e.target.style.color = "#666"}>
            Pricing
          </a>
          <a href="#support" style={{
            textDecoration: "none",
            color: "#666",
            fontSize: "14px",
            fontWeight: "500",
            transition: "color 0.2s"
          }} onMouseOver={(e) => e.target.style.color = "#25d366"} onMouseOut={(e) => e.target.style.color = "#666"}>
            Support
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 20px 20px" // Top padding for fixed navbar
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(11, 20, 26, 0.3), 0 8px 25px rgba(11, 20, 26, 0.2)",
          padding: "40px 32px 48px",
          width: "420px",
          maxWidth: "90vw",
          textAlign: "center",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
        {/* WhatsApp Logo */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #25d366 0%, #20c759 100%)",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "45px",
            color: "white",
            boxShadow: "0 8px 32px rgba(37, 211, 102, 0.3)"
          }}>
            💬
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "300",
            color: "#2c3e50",
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px"
          }}>
            WhatsApp Business
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#999",
            margin: "0",
            lineHeight: "20px"
          }}>
            {step === "contact" 
              ? "              Create Account" 
              : "Enter the verification code sent to your email"}
          </p>
        </div>

        {step === "contact" ? (
          <div>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleContactChange}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: contactError ? "1px solid #f44336" : "1px solid #e1e8ed",
                  borderRadius: "6px",
                  fontSize: "16px",
                  background: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  if (!contactError) {
                    e.target.style.borderColor = "#25d366";
                  }
                }}
                onBlur={(e) => {
                  if (!contactError) {
                    e.target.style.borderColor = "#e1e8ed";
                  }
                }}
              />
              {contactError && (
                <p style={{
                  color: "#f44336",
                  fontSize: "12px",
                  margin: "6px 0 0 0",
                  textAlign: "left"
                }}>
                  {contactError}
                </p>
              )}
            </div>
            
            <button
              onClick={handleSendOtp}
              disabled={loading || (!email && !phone) || contactError}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "6px",
                background: loading || (!email && !phone) || contactError ? "#e4e6ea" : "#25d366",
                color: loading || (!email && !phone) || contactError ? "#bcc0c4" : "#ffffff",
                fontSize: "16px",
                fontWeight: "500",
                cursor: loading || (!email && !phone) || contactError ? "not-allowed" : "pointer",
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
                setStep("contact");
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
    </div>
  );
};

export default Signup;
