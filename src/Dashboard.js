import React, { useState, useEffect } from 'react';
import { getInvoices, uploadInvoice, actionInvoice } from './api';
import FinalUploadModal from './FinalUploadModal';
import axios from 'axios';
import './css/Dashboard.css';

// Simple modal component for form
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

// InvoiceHistoryPage component (as before)
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
      {invoice?.final_document && (
        <div style={{ margin: '14px 0' }}>
          <a href={`http://localhost:8000/storage/${invoice.final_document}`} target="_blank" rel="noopener noreferrer" style={{ color: '#28A745', fontWeight: 600 }}>
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

// NotificationBell component (unchanged)
function NotificationBell({ role, onViewInvoiceHistory }) {
  const [logs, setLogs] = useState([]);
  const [unseen, setUnseen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!role) return;
    fetch(`http://localhost:8000/api/logs/latest?role=${role}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setUnseen(data.unseen || false);
      });
  }, [role, showDropdown]);

  const markAsSeen = () => {
    fetch(`http://localhost:8000/api/logs/mark-seen?role=${role}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    }).then(() => setUnseen(false));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (showDropdown && !event.target.closest('.bell-container')) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleBellClick = () => {
    if (!showDropdown) {
      markAsSeen();
    }
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="bell-container"
      style={{ position: 'relative', cursor: 'pointer', marginRight: 15 }}
      onClick={handleBellClick}
    >
      <span className="bell-icon" role="img" aria-label="notification" style={{ fontSize: '1.7rem' }}>
        🔔
        {unseen && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        )}
      </span>
      {showDropdown && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 30,
          background: 'white',
          border: '1px solid #ccc',
          width: 'min(420px, calc(100vw - 32px))',
          maxHeight: '340px',
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          borderRadius: 4,
          padding: 12,
          zIndex: 1001,
          '@media (max-width: 480px)': {
            right: '-15px',
          }
        }}>
          <b style={{ marginBottom: 8, display: 'block' }}>Latest Actions</b>
          {logs.length === 0 ? (
            <div style={{ color: "#888", padding: 10 }}>No notifications</div>
          ) : logs.map(log => (
            <div key={log.id} style={{ borderBottom: '1px solid #eee', padding: '6px 0' }}>
              <a
                href="#"
                style={{ color: '#085EE3', fontWeight: 600, textDecoration: 'underline', marginRight: 6 }}
                onClick={e => { e.preventDefault(); onViewInvoiceHistory && onViewInvoiceHistory(log.invoice_id); }}
                title="View invoice history"
              >
                {log.invoice?.title || "No title"}
              </a>
              <b>{log.role}</b> <em>{log.action.toUpperCase()}</em> : {log.comment || '(no comment)'}
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main Dashboard Component
function Dashboard({ role, onLogout}) {
  const [invoices, setInvoices] = useState([]);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  // For invoice history and final upload modals
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const [historyInvoiceId, setHistoryInvoiceId] = useState(null);

  const [finalModalOpen, setFinalModalOpen] = useState(false);
  const [finalModalInvoiceId, setFinalModalInvoiceId] = useState(null);

  // Modal state for create invoice form
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [refresh]);

  async function loadInvoices() {
    try {
      const data = await getInvoices(role);
      setInvoices(data);
    } catch {
      setError('Failed to load invoices');
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !title) {
      setError('Title and file are required');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('comment', comment);
    formData.append('document', file);

    try {
      await uploadInvoice(formData);
      setTitle('');
      setComment('');
      setFile(null);
      setShowCreateModal(false); // close modal on success
      setRefresh(refresh + 1);
    } catch {
      setError('Upload failed');
    }
  }

  async function handleAction(id, chosenAction) {
    const userComment = prompt('Add comment (optional):');
    if (userComment === null) return;

    try {
      await actionInvoice(id, chosenAction, userComment || '');
      setRefresh(refresh + 1);
    } catch {
      alert('Failed to submit action');
    }
  }

  // Handle final accountant modal submission
  async function handleFinalUpload(action, file, comment) {
    if (!file && action === 'approve') {
      alert('File is required to approve the final document.');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('final_doc', file);
    formData.append('comment', comment);
    formData.append('action', action);

    try {
      await fetch(`http://localhost:8000/api/invoices/${finalModalInvoiceId}/final-upload`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') },
        body: formData
      });
      setFinalModalOpen(false);
      setFinalModalInvoiceId(null);
      setRefresh(refresh + 1);
    } catch {
      alert('Failed to upload final document');
    }
  }

  if (showInvoiceHistory && historyInvoiceId) {
    return (
      <InvoiceHistoryPage
        invoiceId={historyInvoiceId}
        onBack={() => { setShowInvoiceHistory(false); setHistoryInvoiceId(null); }}
      />
    );
  }
  

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          {role === 'admin' ? 'Admin Dashboard' : `Dashboard — ${role}`}
        </h2>
        <div>
          <NotificationBell role={role} onViewInvoiceHistory={id => { setShowInvoiceHistory(true); setHistoryInvoiceId(id); }} />
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {role === 'admin' && (
        <div style={{ marginBottom: 20, marginTop: 20 }}>
          <button className="dashboard-btn" onClick={() => setShowCreateModal(true)}>
            Create Invoice
          </button>
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <form className="dashboard-form modal-form" onSubmit={handleUpload}>
          <label className="dashboard-label">Title</label>
          <input className="dashboard-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Invoice title" />
          <label className="dashboard-label">Comment</label>
          <textarea className="dashboard-input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment (optional)" />
          <label className="dashboard-label">File (PDF/Image)</label>
          <input className="dashboard-input" type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} />
          <button type="submit" className="dashboard-btn">Upload</button>
        </form>
      </Modal>

      <FinalUploadModal
        open={finalModalOpen}
        onClose={() => { setFinalModalOpen(false); setFinalModalInvoiceId(null); }}
        onSubmit={handleFinalUpload}
      />

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Current Role</th>
              <th>Document</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan="7">No invoices found</td></tr>
            ) : invoices.map(({ id, title, status, current_role, comment, document_url }, i) => (
              <tr key={id}>
                <td>{i + 1}</td>
                <td>{title}</td>
                <td>{status}</td>
                <td>{current_role}</td>
                <td>
                  <a href={`http://localhost:8000${document_url}`} target="_blank" rel="noopener noreferrer">
                    <button className="dashboard-btn dashboard-view-btn">View Document</button>
                  </a>
                </td>
                <td>{role === 'admin' ? comment : null}</td>
                <td>
                  <button
                    className="dashboard-btn dashboard-history-btn"
                    onClick={() => {
                      setShowInvoiceHistory(true);
                      setHistoryInvoiceId(id);
                    }}
                  >
                    History
                  </button>
                  {role === 'final_accountant' && status === 'completed' && (
                    <button
                      className="dashboard-btn dashboard-final-btn"
                      onClick={() => {
                        setFinalModalInvoiceId(id);
                        setFinalModalOpen(true);
                      }}
                    >
                      Final Upload
                    </button>
                  )}
                  {role !== 'admin' && current_role === role && status !== 'completed' && (
                    <>
                      <button className="dashboard-btn dashboard-approve-btn" onClick={() => handleAction(id, 'approve')}>Approve</button>
                      <button className="dashboard-btn dashboard-reject-btn" onClick={() => handleAction(id, 'reject')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
