import { useState, useEffect } from "react";
import QRLogin from "./components/QRLogin";
import Status from "./components/Status";
import ChatBox from "./components/ChatBox";
import Messages from "./components/Messages";
import Rules from "./components/Rules";

function App() {
  useEffect(() => {
    console.log("App mounted - Direct Access Mode");
  }, []);
  
  const [messages, setMessages] = useState([]);
  // Create a mock user object for direct access
  const user = { email: "direct-access@whatsapp-bot.local", directAccess: true };

  return (
    <div className="App">
      <QRLogin user={user} setUser={() => {}} />
      <Status user={user} />
      <Messages messages={messages} />
      <ChatBox user={user} setMessages={setMessages} />
      <Rules />
    </div>
  );
}

export default App;
