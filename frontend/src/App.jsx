import { useState, useEffect } from "react";
import QRLogin from "./components/QRLogin";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Status from "./components/Status";
import ChatBox from "./components/ChatBox";
import Messages from "./components/Messages";
import Rules from "./components/Rules";

function App() {
  useEffect(() => {
    console.log("App mounted");
  }, []);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [messages, setMessages] = useState([]);

  return (
    <div className="App">
      {!user ? (
        showSignup ? (
          <Signup onSignup={setUser} />
        ) : (
          <Login onLogin={setUser} />
        )
      ) : (
        <QRLogin user={user} setUser={setUser} />
      )}
      {!user && (
        <button onClick={() => setShowSignup(!showSignup)} style={{marginTop: 20}}>
          {showSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      )}
      {user && (
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
