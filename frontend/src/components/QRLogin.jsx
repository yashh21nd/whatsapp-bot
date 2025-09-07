import { useState, useEffect } from "react";
import { socket, initiateWhatsAppConnection } from "../api/api";

export default function QRLogin() {
  const [qrCode, setQrCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Listen for QR code updates
    socket.on("whatsapp:qr", (qrDataUrl) => {
      setQrCode(qrDataUrl);
      setIsConnecting(true);
    });

    // Listen for ready state
    socket.on("whatsapp:ready", (ready) => {
      if (ready) {
        setIsConnecting(false);
        setQrCode("");
      }
    });

    // Initiate connection
    initiateWhatsAppConnection();

    return () => {
      socket.off("whatsapp:qr");
      socket.off("whatsapp:ready");
    };
  }, []);

  return (
    <div className="qr-container">
      <h2>WhatsApp Login</h2>
      {isConnecting ? (
        qrCode ? (
          <div>
            <p>Scan this QR code with WhatsApp</p>
            <img src={qrCode} alt="WhatsApp QR Code" />
          </div>
        ) : (
          <p>Generating QR code...</p>
        )
      ) : (
        <button onClick={initiateWhatsAppConnection}>
          Connect to WhatsApp
        </button>
      )}
    </div>
  );
}
