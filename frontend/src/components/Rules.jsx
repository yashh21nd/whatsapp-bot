import { useEffect, useState } from "react";
import { fetchRules } from "../api/api";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const data = await fetchRules();
        setRules(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch rules:", err);
        setError("Failed to load rules");
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadRules();
  }, []);

  if (loading) {
    return (
      <div>
        <h3>Rules</h3>
        <p>Loading rules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Rules</h3>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Rules</h3>
      {rules.length === 0 ? (
        <p>No rules configured yet.</p>
      ) : (
        <ul>
          {rules.map((rule, idx) => (
            <li key={idx}>{typeof rule === 'string' ? rule : rule.name || rule.pattern || 'Unknown rule'}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
