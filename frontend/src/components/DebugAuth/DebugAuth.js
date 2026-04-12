import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DebugAuth() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const savedUser = localStorage.getItem('user');

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#1a1a1a', 
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      border: '1px solid #333'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>🔍 Auth Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Role:</strong> {user?.role || 'N/A'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>LocalStorage User:</strong>
        <pre style={{ 
          background: '#0a0a0a', 
          padding: '8px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '100px',
          fontSize: '11px'
        }}>
          {savedUser || 'null'}
        </pre>
      </div>
      
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        style={{
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          width: '100%'
        }}
      >
        Clear Storage & Reload
      </button>
    </div>
  );
}
