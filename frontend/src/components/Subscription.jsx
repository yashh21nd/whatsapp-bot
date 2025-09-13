import React from "react";

const plans = [
  { id: "hour", label: "Per Hour", price: 2 },
  { id: "day", label: "Per Day", price: 10 },
  { id: "week", label: "Per Week", price: 50 }
];

const Subscription = ({ onSubscribe }) => {
  return (
    <div className="subscription-container" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Montserrat, Segoe UI', fontWeight: 700, fontSize: '2rem', color: '#176d5c', marginBottom: '1rem' }}>Choose Your Subscription</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {plans.map(plan => (
          <li key={plan.id} style={{ marginBottom: '2rem', background: '#f7f7f7', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontWeight: 600, fontSize: '1.2rem', color: '#176d5c' }}>{plan.label} - ${plan.price} USD</span>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => onSubscribe(plan.id, 'paypal')} style={{ background: '#0070ba', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}>
                Pay with PayPal
              </button>
              <button onClick={() => onSubscribe(plan.id, 'razorpay')} style={{ background: '#f37254', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}>
                Pay with Razorpay
              </button>
              <button onClick={() => onSubscribe(plan.id, 'stripe')} style={{ background: '#635bff', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}>
                Pay with Stripe
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subscription;
