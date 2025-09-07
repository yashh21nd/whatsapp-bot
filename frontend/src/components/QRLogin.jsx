import { useState } from "react";
import { loginWithQR } from "../api/api";

export default function QRLogin({ setUser }) {
  const [qr, setQr] = useState("");

  const handleLogin = async () => {
    const res = await loginWithQR(qr);
    if (res.success) setUser(res.user);
    else alert("Invalid QR Code");
  };

  return (
    <div>
      <h2>Login with QR Code</h2>
      <input
        type="text"
        placeholder="Enter QR Code"
        value={qr}
        onChange={(e) => setQr(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
