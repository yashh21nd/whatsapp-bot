import { db } from "../db.js";

export async function getRules() {
  return db.all(`SELECT * FROM rules ORDER BY createdAt DESC`);
}

export async function addRule(name, pattern, isRegex, reply, active = 1) {
  return db.run(
    `INSERT INTO rules (name, pattern, isRegex, reply, active) VALUES (?, ?, ?, ?, ?)`,
    [name, pattern, isRegex ? 1 : 0, reply, active ? 1 : 0]
  );
}

export async function updateRule(id, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(k => `${k} = ?`).join(", ");
  return db.run(`UPDATE rules SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteRule(id) {
  return db.run(`DELETE FROM rules WHERE id = ?`, [id]);
}
