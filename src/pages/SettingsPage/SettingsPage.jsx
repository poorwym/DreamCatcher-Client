import React, { useState } from 'react';
import './SettingsPage.css';

function SettingsPage() {
  const [profileData, setProfileData] = useState({
    nickname: '',
    email: '',
    avatar: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'zh',
    notifications: true,
    emailUpdates: false,
    privacy: 'friends'
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    console.log('个人信息更新:', profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    console.log('密码更新:', passwordData);
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Hero Section */}
        <div className="settings-hero">
          <div className="hero-left">
            <h1 className="settings-title">设置中心</h1>
            <p className="settings-subtitle">个性化 · 安全 · 便捷</p>
            <div className="hero-description">
              <p>管理您的账户设置和偏好</p>
              <p>让您的使用体验更加个性化</p>
            </div>
          </div>
          <div className="hero-right">
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">●</div>
                <div className="stat-info">
                  <span className="stat-label">账户状态</span>
                  <span className="stat-value">已验证</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">◉</div>
                <div className="stat-info">
                  <span className="stat-label">安全级别</span>
                  <span className="stat-value">高</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">◈</div>
                <div className="stat-info">
                  <span className="stat-label">最后登录</span>
                  <span className="stat-value">今天</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="settings-grid">
          {/* Profile Section - Large */}
          <div className="settings-card profile-card large">
            <div className="card-header">
              <span className="card-icon">◐</span>
              <h2>个人信息</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nickname">
                    <span className="label-icon">◦</span>
                    昵称
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={profileData.nickname}
                      onChange={handleProfileChange}
                      placeholder="设置你的昵称"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">◎</span>
                    邮箱
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="your@email.com"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="bio">
                  <span className="label-icon">◈</span>
                  个人简介
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="介绍一下自己..."
                    rows="3"
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  <span className="button-icon">◉</span>
                  <span className="button-text">保存修改</span>
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Display */}
          <div className="settings-card theme-card">
            <div className="card-header">
              <span className="card-icon">◑</span>
              <h3>主题外观</h3>
            </div>
            <div className="theme-options">
              <div className="theme-option">
                <div className="theme-preview dark active"></div>
                <span>深色模式</span>
              </div>
              <div className="theme-option">
                <div className="theme-preview light"></div>
                <span>浅色模式</span>
              </div>
            </div>
            <div className="form-group">
              <label>
                <span className="label-icon">◎</span>
                语言
              </label>
              <select 
                name="language" 
                value={preferences.language}
                onChange={handlePreferenceChange}
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-card notification-card">
            <div className="card-header">
              <span className="card-icon">◈</span>
              <h3>通知设置</h3>
            </div>
            <div className="notification-options">
              <div className="notification-item">
                <div className="notification-info">
                  <span className="notification-title">应用通知</span>
                  <span className="notification-desc">接收应用内通知</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    name="notifications"
                    checked={preferences.notifications}
                    onChange={handlePreferenceChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <span className="notification-title">邮件更新</span>
                  <span className="notification-desc">接收邮件通知</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    name="emailUpdates"
                    checked={preferences.emailUpdates}
                    onChange={handlePreferenceChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Security - Wide */}
          <div className="settings-card security-card wide">
            <div className="card-header">
              <span className="card-icon">◉</span>
              <h2>安全设置</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">
                  <span className="label-icon">◎</span>
                  当前密码
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="输入当前密码"
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">
                    <span className="label-icon">◐</span>
                    新密码
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="输入新密码"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <span className="label-icon">◑</span>
                    确认密码
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="再次输入新密码"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>
              </div>
              <div className="password-strength">
                <div className="strength-label">密码强度</div>
                <div className="strength-bar">
                  <div className="strength-fill medium"></div>
                </div>
                <div className="strength-text">中等</div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  <span className="button-icon">◈</span>
                  <span className="button-text">更新密码</span>
                </button>
              </div>
            </form>
          </div>

          {/* Privacy */}
          <div className="settings-card privacy-card">
            <div className="card-header">
              <span className="card-icon">◎</span>
              <h3>隐私</h3>
            </div>
            <div className="privacy-options">
              <div className="privacy-item">
                <span className="privacy-label">个人资料可见性</span>
                <select 
                  name="privacy" 
                  value={preferences.privacy}
                  onChange={handlePreferenceChange}
                >
                  <option value="public">公开</option>
                  <option value="friends">好友</option>
                  <option value="private">私密</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data & Storage */}
          <div className="settings-card storage-card">
            <div className="card-header">
              <span className="card-icon">◐</span>
              <h3>数据管理</h3>
            </div>
            <div className="storage-info">
              <div className="storage-item">
                <span className="storage-label">存储空间</span>
                <div className="storage-bar">
                  <div className="storage-used" style={{width: '65%'}}></div>
                </div>
                <span className="storage-text">65% 已使用</span>
              </div>
              <div className="action-buttons">
                <button className="action-btn">清理缓存</button>
                <button className="action-btn">导出数据</button>
              </div>
            </div>
          </div>

          {/* Account Actions - Tall */}
          <div className="settings-card account-card tall">
            <div className="card-header">
              <span className="card-icon">◑</span>
              <h3>账户操作</h3>
            </div>
            <div className="account-actions">
              <button className="account-action safe">
                <span className="action-icon">◎</span>
                <div className="action-info">
                  <span className="action-title">导出账户</span>
                  <span className="action-desc">下载您的数据</span>
                </div>
              </button>
              <button className="account-action warning">
                <span className="action-icon">◈</span>
                <div className="action-info">
                  <span className="action-title">重置设置</span>
                  <span className="action-desc">恢复默认设置</span>
                </div>
              </button>
              <button className="account-action danger">
                <span className="action-icon">◉</span>
                <div className="action-info">
                  <span className="action-title">删除账户</span>
                  <span className="action-desc">永久删除账户</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
