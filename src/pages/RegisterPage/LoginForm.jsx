import React, { useState } from 'react';

function LoginForm(){
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
          ...formData,
          [id.replace('login-', '')]: value
        });
    };

    const handleSubmit = (e) => {

    };

    return(
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="login-username">用户名</label>
                <input 
                    type="text" 
                    id="login-username" 
                    value={formData.username}
                    onChange={handleChange}
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="login-password">密码</label>
                <input 
                    type="password" 
                    id="login-password" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                />
            </div>
            <button type="submit">登录</button>
        </form>
    );
}

export default LoginForm