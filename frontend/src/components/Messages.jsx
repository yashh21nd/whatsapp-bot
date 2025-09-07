export default function Messages({ messages }) {
  return (
    <div>
      <h3>Messages</h3>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.user}: </strong>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
