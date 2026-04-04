import React from 'react';
import './Loader.css';

const PulseLoader = ({ color = '#6B7280' }) => (
  <span className="pulse-loader" aria-hidden="true">
    <span className="pulse-loader-dot" style={{ backgroundColor: color, '--dot-delay': '0ms' }} />
    <span className="pulse-loader-dot" style={{ backgroundColor: color, '--dot-delay': '120ms' }} />
    <span className="pulse-loader-dot" style={{ backgroundColor: color, '--dot-delay': '240ms' }} />
  </span>
);

const Loader = () => (
  <div className="page-loader-overlay" role="status" aria-live="polite" aria-label="Loading">
    <PulseLoader color="#6B7280" />
  </div>
);

export default Loader;
