import { db } from "../db.js";

export async function saveMessage(chatId, sender, receiver, body, direction, source) {
  return db.run(
    `INSERT INTO messages (chatId, sender, receiver, body, direction, source) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [chatId, sender, receiver, body, direction, source]
  );
}

export async function getMessages(chatId, limit = 200) {
  if (chatId) {
    return db.all(
      `SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp DESC LIMIT ?`,
      [chatId, limit]
    );
  }
  return db.all(
    `SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?`,
    [limit]
  );
}
