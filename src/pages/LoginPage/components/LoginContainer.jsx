import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box } from '@mui/material';
import "../../../assets/style.css";

function LoginContainer() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = '请输入邮箱地址';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }
        
        if (!formData.password) {
            newErrors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码长度至少6位';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            await login({
                email: formData.email,
                password: formData.password
            });
            
            // 登录成功，跳转到主页
            navigate('/');
        } catch (error) {
            setErrors({
                submit: error.message || '登录失败，请稍后重试'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen z-50 relative">
            <div className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 w-full max-w-md mx-4 p-8">
                <div className="flex flex-col items-center justify-center h-auto">
                    <h1 className="text-4xl font-bold text-contrast mb-8">登录</h1>
                    
                    <Box component="form" onSubmit={handleSubmit} className="w-full">
                        <TextField
                            fullWidth
                            name="email"
                            type="email"
                            label="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            margin="normal"
                            variant="outlined"
                            className="!mb-4"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'var(--text-main)',
                                    '& fieldset': {
                                        borderColor: 'var(--border-subtle)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--border-secondary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--text-primary)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                },
                                '& .MuiFormHelperText-root': {
                                    color: 'var(--accent-orange)',
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            name="password"
                            type="password"
                            label="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            margin="normal"
                            variant="outlined"
                            className="!mb-8"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'var(--text-main)',
                                    '& fieldset': {
                                        borderColor: 'var(--border-subtle)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--border-secondary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--text-primary)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                },
                                '& .MuiFormHelperText-root': {
                                    color: 'var(--accent-orange)',
                                }
                            }}
                        />
                        
                        {errors.submit && (
                            <div className="text-accent !mb-6 text-center">
                                {errors.submit}
                            </div>
                        )}
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting || loading}
                            className={errors.submit ? "!mt-4" : "!mt-6"}
                            sx={{
                                backgroundColor: 'var(--text-primary)',
                                color: 'var(--text-contrast)',
                                padding: '12px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'var(--accent-blue)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'var(--text-muted)',
                                    color: 'var(--text-secondary)',
                                }
                            }}
                        >
                            {isSubmitting || loading ? '登录中...' : '登录'}
                        </Button>
                    </Box>
                </div>
            </div>
        </div>
    );
}

export default LoginContainer;