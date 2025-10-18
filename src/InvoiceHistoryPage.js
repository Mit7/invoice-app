// src/InvoiceHistoryPage.js
import React, { useEffect, useState } from 'react';

function InvoiceHistoryPage({ invoiceId, onBack }) {
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/logs/invoice/${invoiceId}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
      .then(res => res.json())
      .then(data => {
        setInvoice(data.invoice || null);
        setHistory(data.logs || []);
      });
  }, [invoiceId]);

  return (
    <div className="container">
      <button onClick={onBack} style={{ marginBottom: 14 }}>← Back</button>
      <h2 style={{ color: '#085EE3' }}>{invoice ? `Invoice: ${invoice.title}` : 'Invoice History'}</h2>
      <h4>Status: {invoice?.status || "-"}</h4>
      <h4>Current Role: {invoice?.current_role || "-"}</h4>

      {/* Show final document if present */}
      {invoice?.final_document && (
        <div style={{ margin: '14px 0' }}>
          <a
            href={`http://localhost:8000/storage/${invoice.final_document}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#28A745', fontWeight: 600 }}
          >
            View Final Document
          </a>
        </div>
      )}

      <hr />
      <h3>Action History</h3>
      {history.length === 0 ? "No history found." :
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>User/Role</th>
              <th>Action</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {history.map(entry =>
              <tr key={entry.id}>
                <td>{new Date(entry.created_at).toLocaleString()}</td>
                <td>{entry.user?.name || entry.role}</td>
                <td><b>{entry.action.toUpperCase()}</b></td>
                <td>{entry.comment || '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
      }
    </div>
  );
}

export default InvoiceHistoryPage;
