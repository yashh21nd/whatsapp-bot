import { useState } from "react";
import QRLogin from "./components/QRLogin";
import Status from "./components/Status";
import ChatBox from "./components/ChatBox";
import Messages from "./components/Messages";
import Rules from "./components/Rules";

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  return (
    <div className="App">
      {!user ? (
        <QRLogin setUser={setUser} />
      ) : (
        <>
          <Status user={user} />
          <Messages messages={messages} />
          <ChatBox user={user} setMessages={setMessages} />
          <Rules />
        </>
      )}
    </div>
  );
}

export default App;
