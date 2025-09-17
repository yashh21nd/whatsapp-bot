import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
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
      background: "linear-gradient(135deg, #e8f5e9 0%, #fffbe6 100%)"
    }}>
      <form style={{
        background: "#fffbe6",
        borderRadius: 18,
        boxShadow: "0 4px 24px 0 rgba(34, 139, 34, 0.08)",
        padding: "2.5rem 2.5rem 2rem 2.5rem",
        minWidth: 340,
        maxWidth: 360,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }} onSubmit={e => e.preventDefault()}>
        <h2 style={{
          color: "#176d5c",
          fontFamily: "Montserrat, Segoe UI, Arial, sans-serif",
          fontWeight: 700,
          marginBottom: 24,
          fontSize: 28
        }}>Login</h2>
        {step === "email" ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "1.5px solid #b2dfdb",
                marginBottom: 18,
                fontSize: 16,
                background: "#f6fff7"
              }}
              autoFocus
            />
            <button
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "none",
                background: loading || !email ? "#b2dfdb" : "#7ed957",
                color: "#176d5c",
                fontWeight: 600,
                fontSize: 17,
                cursor: loading || !email ? "not-allowed" : "pointer",
                marginBottom: 10,
                transition: "background 0.2s"
              }}
              onClick={handleSendOtp}
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "1.5px solid #b2dfdb",
                marginBottom: 18,
                fontSize: 16,
                background: "#f6fff7"
              }}
              autoFocus
            />
            <button
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "none",
                background: loading || !otp ? "#b2dfdb" : "#7ed957",
                color: "#176d5c",
                fontWeight: 600,
                fontSize: 17,
                cursor: loading || !otp ? "not-allowed" : "pointer",
                marginBottom: 10,
                transition: "background 0.2s"
              }}
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {error && <div style={{ color: "#d32f2f", marginTop: 8, fontSize: 15 }}>{error}</div>}
      </form>
    </div>
  );
};

export default Login;
