// FinalUploadModal.js
import React, { useState } from 'react';

function FinalUploadModal({ open, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.20)', zIndex: 2000, display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: '#fff', padding: 24, borderRadius: 8, width: 380, boxShadow: '0 4px 20px #0002'
      }}>
        <h3 style={{marginTop:0}}>Final Document Upload</h3>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={e => setFile(e.target.files[0])}
          style={{ marginBottom: 14 }}
        />
        <textarea
          style={{ width: '100%', marginBottom: 14 }}
          rows={3}
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button style={{ marginRight: 10 }} onClick={onClose}>Cancel</button>
          <button
            style={{
              background: '#28A745', color: '#fff', border: 'none',
              padding: '7px 18px', borderRadius: 4, fontWeight: 600, marginRight: 5
            }}
            onClick={() => onSubmit('approve', file, comment)}
            disabled={!file}
          >Approve & Upload</button>
          <button
            style={{
              background: '#dc3545', color: '#fff', border: 'none',
              padding: '7px 14px', borderRadius: 4, fontWeight: 600
            }}
            onClick={() => onSubmit('reject', file, comment)}
          >Reject</button>
        </div>
      </div>
    </div>
  );
}

export default FinalUploadModal;
