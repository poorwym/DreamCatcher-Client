import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // 清除该字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 模拟注册API调用
      console.log('注册数据:', formData);
      
      // 这里应该是实际的API调用
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     username: formData.username,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('注册失败');
      // }
      
      // const result = await response.json();
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 注册成功，跳转到dashboard
      console.log('注册成功，跳转到dashboard...');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('注册失败:', error);
      setErrors({
        submit: '注册失败，请稍后重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoLoad = () => {
    console.log('视频加载成功');
    setVideoError(false);
  };

  const handleVideoError = (e) => {
    console.error('视频加载失败:', e);
    setVideoError(true);
  };

  return (
    <div className="register-container">
      {/* 地球视频背景 - 修正文件路径 */}
      <video 
        className="background-video"
        autoPlay 
        muted 
        loop 
        playsInline
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        style={{ display: videoError ? 'none' : 'block' }}
      >
        <source src="/videos/earth-loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 如果视频加载失败，显示CSS背景 */}
      {videoError && (
        <div className="css-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="particle-field">
            {[...Array(30)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="particle"
                style={{
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 3 + 's',
                  animationDuration: (3 + Math.random() * 4) + 's'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 精简星星装饰 - 增强太空氛围 */}
      <div className="stars-overlay">
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="star-dot"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (2 + Math.random() * 2) + 's'
            }}
          />
        ))}
      </div>


      <div className="register-content">
        <h1>创建账号</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="请输入用户名"
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入邮箱"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入密码"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="请再次输入密码"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="login-link">
          已有账号？ <a href="/login">立即登录</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
