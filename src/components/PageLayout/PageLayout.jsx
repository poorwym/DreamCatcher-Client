import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageLayout.css';

const PageLayout = ({ title, children, showBackButton = true, backTo = -1 }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof backTo === 'string') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <div className="header-content">
          {showBackButton && (
            <button className="back-button" onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              返回
            </button>
          )}
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;