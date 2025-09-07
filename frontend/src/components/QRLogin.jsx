import { useState, useEffect } from "react";
import { socket, initiateWhatsAppConnection } from "../api/api";
import QRCode from "qrcode";

export default function QRLogin() {
  const [qrCode, setQrCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Listen for QR code updates
    socket.on("whatsapp:qr", async (qrData) => {
      try {
        // Convert QR data to data URL
        const qrDataUrl = await QRCode.toDataURL(qrData);
        setQrCode(qrDataUrl);
        setIsConnecting(true);
        setIsReady(false);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    });

    // Listen for ready state
    socket.on("whatsapp:ready", (ready) => {
      setIsReady(ready);
      if (ready) {
        setIsConnecting(false);
        setQrCode("");
      }
    });

    // Initial connection attempt
    handleConnect();

    return () => {
      socket.off("whatsapp:qr");
      socket.off("whatsapp:ready");
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await initiateWhatsAppConnection();
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="qr-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h2>WhatsApp Login</h2>
      {isReady ? (
        <div>
          <h3>WhatsApp Connected!</h3>
          <p>You can now use the bot</p>
        </div>
      ) : isConnecting ? (
        qrCode ? (
          <div>
            <h3>Scan this QR code with WhatsApp</h3>
            <img 
              src={qrCode} 
              alt="WhatsApp QR Code" 
              style={{ 
                maxWidth: '300px', 
                margin: '20px auto',
                display: 'block'
              }} 
            />
            <p>Open WhatsApp on your phone and scan the QR code</p>
          </div>
        ) : (
          <p>Generating QR code...</p>
        )
      ) : (
        <button 
          onClick={handleConnect}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Connect to WhatsApp
        </button>
      )}
    </div>
  );
}
