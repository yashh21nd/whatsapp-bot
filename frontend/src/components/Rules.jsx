import { useEffect, useState } from "react";
import { fetchRules } from "../api/api";

export default function Rules() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fetchRules().then((data) => setRules(data));
  }, []);

  return (
    <div>
      <h3>Rules</h3>
      <ul>
        {rules.map((rule, idx) => (
          <li key={idx}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
