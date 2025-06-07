import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    Lock, 
    Security,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import "../../../assets/style.css";
import { changePassword } from '../../../api/auth.js';
import { useAuth } from '../../../context/AuthProvider.jsx';

function PasswordEditor() {
    const { user, token, logout } = useAuth();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [isChanging, setIsChanging] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [passwordStrength, setPasswordStrength] = useState(0);

    // 密码强度检查
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case 0:
            case 1: return '#ef4444'; // 红色
            case 2: return '#f59e0b'; // 橙色
            case 3: return '#eab308'; // 黄色
            case 4: return '#84cc16'; // 浅绿色
            case 5: return '#22c55e'; // 绿色
            default: return '#6b7280';
        }
    };

    const getPasswordStrengthText = (strength) => {
        switch (strength) {
            case 0:
            case 1: return 'WEAK';
            case 2: return 'FAIR';
            case 3: return 'GOOD';
            case 4: return 'STRONG';
            case 5: return 'EXCELLENT';
            default: return '';
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleInputChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));

        // 如果是新密码，计算强度
        if (field === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!passwordData.oldPassword) {
            showNotification('请输入当前密码', 'error');
            return false;
        }
        if (!passwordData.newPassword) {
            showNotification('请输入新密码', 'error');
            return false;
        }
        if (passwordData.newPassword.length < 6) {
            showNotification('新密码长度至少为6个字符', 'error');
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('新密码和确认密码不匹配', 'error');
            return false;
        }
        if (passwordData.oldPassword === passwordData.newPassword) {
            showNotification('新密码不能与当前密码相同', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // 检查认证状态
        if (!token || !user) {
            showNotification('认证已过期，请重新登录', 'error');
            return;
        }

        try {
            setIsChanging(true);

            await changePassword(token, {
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword
            });

            // 重置表单
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordStrength(0);

            showNotification('密码修改成功！为了安全，请重新登录。', 'success');
            
            // 延迟登出，让用户看到成功消息
            setTimeout(() => {
                logout();
                // 可以添加路由跳转到登录页
                // navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('修改密码失败:', error);
            let errorMessage = '修改密码失败';
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = '当前密码错误或认证已过期，请重试';
            } else if (error.message.includes('400')) {
                errorMessage = '密码格式不符合要求，请检查后重试';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setIsChanging(false);
        }
    };

    const handleReset = () => {
        setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordStrength(0);
    };

    // 如果没有认证或用户信息
    if (!user || !token) {
        return (
            <div className="p-8 flex flex-col justify-center items-center">
                <Typography 
                    variant="h6" 
                    sx={{ color: 'var(--text-secondary)', mb: 2 }}
                >
                    请先登录以修改密码
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent-orange to-accent-blue">
                    <Security sx={{ fontSize: '2rem', color: 'white' }} />
                </div>
                <div>
                    <Typography 
                        variant="h4" 
                        className="text-contrast font-bold mb-4 uppercase tracking-wider"
                        sx={{ 
                            color: 'var(--text-contrast)',
                            fontSize: '1.8rem',
                            fontWeight: 600,
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                            fontFamily: 'monospace'
                        }}
                    >
                        PASSWORD SECURITY
                    </Typography>
                    <Typography 
                        variant="body1" 
                        className="text-secondary uppercase tracking-wider"
                        sx={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 300
                        }}
                    >
                        MODIFY ACCOUNT CREDENTIALS FOR ENHANCED SECURITY
                    </Typography>
                </div>
            </div>

            {/* Password Change Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'var(--text-secondary)',
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace',
                            fontWeight: 500
                        }}
                    >
                        CURRENT PASSWORD
                    </Typography>
                    <TextField
                        fullWidth
                        type={showPasswords.old ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                        variant="outlined"
                        placeholder="Enter current password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock sx={{ color: 'var(--text-muted)' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('old')}
                                        sx={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPasswords.old ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.3)',
                                color: 'var(--text-main)',
                                '& fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--border-primary)',
                                },
                            },
                        }}
                    />
                </div>

                {/* New Password */}
                <div>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'var(--text-secondary)',
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace',
                            fontWeight: 500
                        }}
                    >
                        NEW PASSWORD
                    </Typography>
                    <TextField
                        fullWidth
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        variant="outlined"
                        placeholder="Enter new password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock sx={{ color: 'var(--text-muted)' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('new')}
                                        sx={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.3)',
                                color: 'var(--text-main)',
                                '& fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--border-primary)',
                                },
                            },
                        }}
                    />
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'var(--text-secondary)',
                                        fontFamily: 'monospace',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                >
                                    PASSWORD STRENGTH
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: getPasswordStrengthColor(passwordStrength),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {getPasswordStrengthText(passwordStrength)}
                                </Typography>
                            </div>
                            <LinearProgress
                                variant="determinate"
                                value={(passwordStrength / 5) * 100}
                                sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(var(--bg-tertiary), 0.3)',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Confirm New Password */}
                <div>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'var(--text-secondary)',
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontFamily: 'monospace',
                            fontWeight: 500
                        }}
                    >
                        CONFIRM NEW PASSWORD
                    </Typography>
                    <TextField
                        fullWidth
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        variant="outlined"
                        placeholder="Confirm new password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock sx={{ color: 'var(--text-muted)' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <div className="flex items-center space-x-1">
                                        {passwordData.confirmPassword && (
                                            passwordData.newPassword === passwordData.confirmPassword ? (
                                                <CheckCircle sx={{ color: 'var(--accent-green)', fontSize: '1.25rem' }} />
                                            ) : (
                                                <Cancel sx={{ color: '#ef4444', fontSize: '1.25rem' }} />
                                            )
                                        )}
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            sx={{ color: 'var(--text-muted)' }}
                                        >
                                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </div>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.3)',
                                color: 'var(--text-main)',
                                '& fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--border-primary)',
                                },
                            },
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isChanging}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 15px rgba(var(--border-primary-rgb), 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, var(--accent-blue-hover), var(--accent-green-hover))',
                                boxShadow: '0 6px 20px rgba(var(--border-primary-rgb), 0.4)',
                            },
                            '&:disabled': {
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-muted)',
                            },
                        }}
                    >
                        {isChanging ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                                UPDATING...
                            </>
                        ) : (
                            'UPDATE PASSWORD'
                        )}
                    </Button>
                    
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleReset}
                        disabled={isChanging}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                            color: 'var(--text-secondary)',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.1)',
                            },
                        }}
                    >
                        RESET
                    </Button>
                </div>

                {/* Security Tips */}
                <div className="bg-tertiary/30 rounded-lg p-4 border border-subtle mt-6">
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'var(--text-secondary)',
                            mb: 2,
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    >
                        SECURITY RECOMMENDATIONS:
                    </Typography>
                    <ul className="space-y-1 text-sm text-muted">
                        <li>• Minimum 8 characters in length</li>
                        <li>• Include uppercase, lowercase, numbers and special characters</li>
                        <li>• Avoid using personal information as passwords</li>
                        <li>• Change passwords regularly for enhanced security</li>
                    </ul>
                </div>
            </form>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    severity={notification.severity}
                    sx={{
                        backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                        color: 'var(--text-main)',
                        '& .MuiAlert-icon': {
                            color: notification.severity === 'error' ? '#ef4444' : 
                                   notification.severity === 'success' ? 'var(--accent-green)' : 
                                   'var(--accent-blue)'
                        }
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default PasswordEditor;