import React, { useState } from 'react';

function RegisterForm(){
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
          ...formData,
          [id.replace('register-', '')]: value
        });
    };

    const handleSubmit = (e) => {

    };

    return(
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="register-username">用户名</label>
                <input 
                    type="text" 
                    id="register-username" 
                    value={formData.username}
                    onChange={handleChange}
                    required 
                />
                <small>用户名长度3-50个字符，只能包含字母、数字和下划线</small>
            </div>
            <div className="form-group">
                <label htmlFor="register-password">密码</label>
                <input 
                    type="password" 
                    id="register-password" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                />
                <small>密码至少8个字符，至少包含一个大写字母和一个数字</small>
            </div>
            <div className="form-group">
                <label htmlFor="register-email">邮箱</label>
                <input 
                    type="email" 
                    id="register-email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                />
            </div>
            <button type="submit">注册</button>
      </form>
    );
}

export default RegisterForm