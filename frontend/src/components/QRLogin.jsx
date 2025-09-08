import { useState, useEffect } from "react";
import { socket, initiateWhatsAppConnection } from "../api/api";
import QRCode from "qrcode";
import "../styles/QRLogin.css";

export default function QRLogin() {
  const [qrCode, setQrCode] = useState("");
  const [connectionState, setConnectionState] = useState("disconnected");
  const [errorMessage, setErrorMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    console.log("QRLogin mounted, socket state:", socket.connected);

    // Socket connection state handlers
    const handleConnect = () => {
      console.log("Socket connected");
      setSocketConnected(true);
      setErrorMessage("");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
      setConnectionState("disconnected");
      setErrorMessage("Lost connection to server");
    };

    const handleConnectError = (error) => {
      setSocketConnected(false);
      setErrorMessage(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // WhatsApp state updates
    socket.on("whatsapp:state", async (data) => {
      console.log("WhatsApp state update:", data);
      setConnectionState(data.state);
      setErrorMessage(""); // Clear any previous errors

      if (data.state === "qr_ready" && data.qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(data.qr);
          setQrCode(qrDataUrl);
        } catch (err) {
          console.error("Failed to generate QR code:", err);
          setErrorMessage("Failed to generate QR code");
        }
      } else if (data.state === "connected") {
        setQrCode("");
      }
    });

    // Listen for errors
    socket.on("whatsapp:error", (data) => {
      console.error("WhatsApp error:", data.error);
      setErrorMessage(data.error);
    });

    // Initial connection attempt
    handleConnect();

    return () => {
      socket.off("whatsapp:state");
      socket.off("whatsapp:error");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  const handleConnect = async () => {
    if (!socketConnected) {
      setErrorMessage("Waiting for server connection...");
      socket.connect();
      return;
    }

    setConnectionState("connecting");
    setErrorMessage("");
    try {
      await initiateWhatsAppConnection();
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionState("disconnected");
      // Add better error handling
      // we can just use error.message
      setErrorMessage(error.message || "Failed to connect to WhatsApp");
    }
  };

  return (
    <div className="main-container">
      <nav className="navbar">
        <div className="nav-content">
          <img src="/whatsapp-logo.svg" alt="WhatsApp" className="logo" />
          <h1>WhatsApp Bot</h1>
        </div>
      </nav>
      
      <div className="content-container">
        <section className="qr-section">
          <div className="qr-card">
            <div className="qr-wrapper">
              <h2>Connect to WhatsApp</h2>
              
              {errorMessage && (
                <div className="error-message">
                  <p>{errorMessage}</p>
                  <button className="retry-button" onClick={handleConnect}>
                    Retry Connection
                  </button>
                </div>
              )}
              
              {!errorMessage && (
                <>
                  {connectionState === "connected" && (
                    <div className="success-message">
                      <h3>WhatsApp Connected!</h3>
                      <p>Your bot is now ready to use</p>
                    </div>
                  )}
                  
                  {connectionState === "qr_ready" && qrCode && (
                    <div>
                      <div className="qr-code-container">
                        <img src={qrCode} alt="WhatsApp QR Code" className="qr-code" />
                      </div>
                      <div className="instructions">
                        <ol>
                          <li>Open WhatsApp on your phone</li>
                          <li>Tap Menu or Settings and select WhatsApp Web</li>
                          <li>Point your phone to this screen to capture the code</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  
                  {(connectionState === "loading" || connectionState === "connecting" || (connectionState === "qr_ready" && !qrCode)) && (
                    <div className="loading">
                      <div className="spinner"></div>
                      <p>{connectionState === "loading" ? "Loading WhatsApp..." : "Generating QR code..."}</p>
                    </div>
                  )}
                  
                  {connectionState === "disconnected" && (
                    <button className="connect-button" onClick={handleConnect}>
                      Connect to WhatsApp
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-card">
            <h2>About This Bot</h2>
            <ul>
              <li>Perform mathematical calculations</li>
              <li>Engage in personal conversations</li>
              <li>Real-time message processing</li>
              <li>Secure WhatsApp Web integration</li>
            </ul>
            <div className="developer-info">
              <p className="developer-name">Yash Shinde</p>
              <p className="developer-title">Bot Developer</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
