import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useTheme } from '../../context/ThemeContext';
import './NavBar.css';
import '../../assets/style.css';

// Material-UI 图标
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo 区域 */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">DreamCatcher</span>
        </Link>

        {/* 导航链接 */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <HomeIcon className="nav-icon" />
          </Link>
          <Link to="/dashboard" className="nav-link">
            <DashboardIcon className="nav-icon" />
          </Link>
          <Link to="/plans" className="nav-link">
            <AssignmentIcon className="nav-icon" />
          </Link>
          <Link to="/plans/new" className="nav-link">
            <AddIcon className="nav-icon" />
          </Link>
          <Link to="/cloudrendering" className="nav-link">
            <CloudIcon className="nav-icon" />
          </Link>
          <Link to="/settings" className="nav-link">
            <SettingsIcon className="nav-icon" />
          </Link>
          <Link to="/about" className="nav-link">
            <InfoIcon className="nav-icon" />
          </Link>
        </div>

        {/* 右侧操作区 */}
        <div className="navbar-actions">
          {/* 主题切换按钮 */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`切换到${isDark ? '浅色' : '深色'}模式`}
          >
            {isDark ? <DarkModeIcon /> : <LightModeIcon />}
          </button>

          {/* 用户区域 */}
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <PersonIcon className="user-icon" />
                <span className="user-name">{user.user_name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogoutIcon className="logout-icon" />
                退出登录
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="login-btn">
              <LoginIcon className="login-icon" />
              登录
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 