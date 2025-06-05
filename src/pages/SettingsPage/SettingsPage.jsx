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
        <div className="title-section">
          <h1 className="settings-title">设置</h1>
          <div className="title-decoration"></div>
          <p className="settings-subtitle">管理您的账户设置和偏好</p>
        </div>
        
        <div className="profile-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h2>个人信息</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nickname">
                  <span className="label-icon">✏️</span>
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
                  <span className="label-icon">📧</span>
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
                <span className="label-icon">📝</span>
                个人简介
              </label>
              <div className="input-wrapper">
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="介绍一下自己..."
                  rows="4"
                />
                <div className="input-focus-line"></div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button profile-save">
                <span className="button-icon">💾</span>
                <span className="button-text">保存修改</span>
              </button>
            </div>
          </form>
        </div>

        <div className="password-section">
          <div className="section-header">
            <span className="section-icon">🔒</span>
            <h2>修改密码</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">
                <span className="label-icon">🔑</span>
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
                  <span className="label-icon">🔐</span>
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
                  <span className="label-icon">✅</span>
                  确认新密码
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
              <button type="submit" className="save-button password-save">
                <span className="button-icon">🔄</span>
                <span className="button-text">更新密码</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
