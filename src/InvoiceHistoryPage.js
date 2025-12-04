import React, { useEffect, useState } from 'react';

function InvoiceHistoryPage({ invoiceId, onBack }) {
  const [invNo, setInvNo] = useState("");
  const [invoices, setInvoices] = useState([]);

  // Global Logs Toggle
  const [showAllLogs, setShowAllLogs] = useState(true);

  // Modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [currentDocs, setCurrentDocs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/logs/invoice/${invoiceId}`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("auth_token") }
    })
      .then(res => res.json())
      .then(data => {
        setInvNo(data.inv_no || "");
        setInvoices(data.invoices || []);
      });
  }, [invoiceId]);

  const openDocumentModal = (invoice) => {
    const docs = JSON.parse(invoice.document || "[]");
    setCurrentDocs(docs);
    setShowDocModal(true);
  };

  return (
    <div className="container" style={{ position: "relative" }}>
      
      {/* GLOBAL LOG TOGGLE BUTTON */}
      <button
        onClick={() => setShowAllLogs(!showAllLogs)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "#085EE3",
          color: "white",
          padding: "6px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none"
        }}
      >
        {showAllLogs ? "Hide All Logs ▲" : "Show All Logs ▼"}
      </button>

      <button onClick={onBack} style={{ marginBottom: 14 }}>← Back</button>

      <h2 style={{ color: '#085EE3' }}>
        Invoice History (INV No: {invNo})
      </h2>
      <hr />

      {invoices.length === 0 && <p>No invoices found.</p>}

      {invoices.map((invoice, index) => {

        const prev = index < invoices.length - 1 ? invoices[index + 1] : null;

        const changed = (field) =>
          prev && invoice[field] !== prev[field];

        return (
          <div
            key={invoice.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              borderRadius: 10,
              marginBottom: 25,
              background: "#f9f9f9"
            }}
          >

            {/* ========== SUMMARY TABLE ========== */}
            <table style={{ width: "100%", marginBottom: 18 }}>
              <tbody>

                <tr>
                  <td><b>Company:</b></td>
                  <td style={{ background: changed("title") ? "#ffe5a0" : "" }}>
                    {invoice.title}
                  </td>

                  <td><b>Department:</b></td>
                  <td>{invoice.department}</td>
                </tr>

                <tr>
                  <td><b>Status:</b></td>
                  <td>{invoice.status}</td>

                  <td><b>Invoice Type:</b></td>
                  <td style={{ background: changed("inv_type") ? "#ffe5a0" : "" }}>
                    {invoice.inv_type}
                  </td>
                </tr>

                <tr>
                  <td><b>Invoice No:</b></td>
                  <td style={{ background: changed("inv_no") ? "#ffe5a0" : "" }}>
                    {invoice.inv_no}
                  </td>

                  <td><b>Invoice Amount:</b></td>
                  <td style={{ background: changed("inv_amt") ? "#ffe5a0" : "" }}>
                    ₹ {invoice.inv_amt}
                  </td>
                </tr>

                <tr>
                  <td><b>Current Role:</b></td>
                  <td>{invoice.current_role}</td>

                  <td><b>Comment:</b></td>
                  <td style={{ background: changed("comment") ? "#ffe5a0" : "" }}>
                    {invoice.comment || "-"}
                  </td>
                </tr>

                {/* DOCUMENT BUTTON */}
                <tr>
                  <td><b>Document(s):</b></td>
                  <td colSpan="3">
                    <button
                      onClick={() => openDocumentModal(invoice)}
                      style={{
                        background: "#007bff",
                        padding: "6px 14px",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      📄 Show Documents
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>

            {/* ========== ACTION HISTORY (Global Toggle) ========== */}
            {showAllLogs && (
              <div>
                <h4>Action History</h4>

                {invoice.logs.length === 0 && <p>No logs found.</p>}

                {invoice.logs.length > 0 && (
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr style={{ background: "#eee" }}>
                        <th>Time</th>
                        <th>User/Role</th>
                        <th>Action</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.logs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.user?.name || log.role}</td>
                          <td><b>{log.action.toUpperCase()}</b></td>
                          <td>{log.comment || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

          </div>
        );
      })}

      {/* =============== DOCUMENT POPUP MODAL =============== */}
      {showDocModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "white",
              width: "500px",
              padding: "20px",
              borderRadius: "10px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h3>Documents</h3>
            <hr />

            {currentDocs.length === 0 ? (
              <p>No Documents</p>
            ) : (
              currentDocs.map((doc, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    gap: "10px"
                  }}
                >
                  <b>Doc {index + 1}</b>

                  {/* View */}
                  <a
                    href={`http://localhost:8000/storage/${doc}`}
                    target="_blank"
                    style={{
                      background: "#007bff",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      textDecoration: "none"
                    }}
                  >
                    👁️ View
                  </a>

                  {/* Download */}
                  <a
                    href={`http://localhost:8000/invoice-download/${doc}`}
                    style={{
                      background: "#28a745",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      textDecoration: "none"
                    }}
                  >
                    ⬇️ Download
                  </a>
                </div>
              ))
            )}

            <button
              onClick={() => setShowDocModal(false)}
              style={{
                marginTop: "10px",
                background: "red",
                color: "white",
                padding: "6px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                border: "none"
              }}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default InvoiceHistoryPage;
