import React, { useState } from 'react';
import './RegisterPage.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function RegisterPage() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className='container'>
      <h1>DreamCatcher 📷</h1>

      <div className='tabs'>
        <div 
        className={`tab ${activeTab === 'login' ? 'active' : ''}`}
        onClick={() => setActiveTab('login')}
        >
          Login
        </div>
        <div 
        className={`tab ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => setActiveTab('register')}
        >
          Register
        </div>
      </div>
      
      {activeTab === 'login' ? (<LoginForm/>) : (<RegisterForm/>)}
    </div>
  );
}

export default RegisterPage
