import { useState } from "react";
import { sendMessage, socket } from "../api/api";

export default function ChatBox({ user, setMessages }) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text) return;
    const msg = { user: user.name, text };
    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    await sendMessage(text);
    setText("");
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
