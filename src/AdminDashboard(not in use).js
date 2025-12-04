import React, { useState, useEffect } from 'react';
import { getInvoices, uploadInvoice } from './api';

function AdminDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (e) {
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
      loadInvoices();
    } catch {
      setError('Upload failed');
    }
  }

  return (
    <div className="container">
      <h2>Admin Dashboard - Upload Invoice</h2>

      {error && <div style={{color: 'red'}}>{error}</div>}

      <form onSubmit={handleUpload}>
        <label>Title:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />

        <label>Comment:</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} />

        <label>File (PDF/Image):</label>
        <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} />

        <button type="submit">Upload</button>
      </form>

      <h3>Invoices</h3>
      <table>
        <thead>
          <tr><th>#</th><th>Title</th><th>Status</th><th>Document</th></tr>
        </thead>
        <tbody>
          {invoices.length === 0 && 
            <tr><td colSpan="3">No invoices found</td></tr>
          }
          {invoices.map(({id, title, status, document_url}, index) => (
            <tr key={id}>
              <td>{index+1}</td>
              <td>{title}</td>
              <td>{status}</td>
              <td>
        <a href={document_url} target="_blank" rel="noopener noreferrer">
          <button>View Document</button>
        </a>
        {/* Existing Approve/Reject buttons here */}
      </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
