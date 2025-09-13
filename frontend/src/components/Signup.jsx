import React, { useState } from "react";

const Signup = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    // TODO: Call backend to send OTP for signup
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    // TODO: Call backend to verify OTP and create account
    setTimeout(() => {
      setLoading(false);
      onSignup(email);
    }, 1000);
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {step === "email" ? (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleSendOtp} disabled={loading || !email}>
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
          />
          <button onClick={handleVerifyOtp} disabled={loading || !otp}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Signup;
