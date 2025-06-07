import React, { useState, useEffect } from 'react';
import { 
    TextField,
    Typography,
    Avatar,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import { Edit, Save, Cancel, Person } from '@mui/icons-material';
import "../../../assets/style.css";
import { updateCurrentUser } from '../../../api/auth.js';
import { useAuth } from '../../../context/AuthProvider.jsx';

// email , username and userid
function UserProfile() {
    const { user, token, loading: authLoading, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        user_name: '',
        email: ''
    });
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 当用户信息加载完成后，初始化编辑数据
    useEffect(() => {
        if (user) {
            setEditData({
                user_name: user.user_name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            user_name: user.user_name || '',
            email: user.email || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            user_name: user.user_name || '',
            email: user.email || ''
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            if (!token) {
                throw new Error('未找到认证令牌，请重新登录');
            }

            // 只发送已更改的字段
            const updateData = {};
            if (editData.user_name !== user.user_name) {
                updateData.user_name = editData.user_name;
            }
            if (editData.email !== user.email) {
                updateData.email = editData.email;
            }

            if (Object.keys(updateData).length === 0) {
                showNotification('没有检测到任何更改', 'info');
                setIsEditing(false);
                return;
            }

            await updateCurrentUser(token, updateData);
            
            // 刷新用户信息
            await refreshUser();
            
            setIsEditing(false);
            showNotification('用户信息更新成功', 'success');
            
        } catch (error) {
            console.error('更新用户信息失败:', error);
            let errorMessage = '更新失败';
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = '认证已过期，请重新登录';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 如果认证还在加载中或没有用户信息
    if (authLoading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <CircularProgress sx={{ color: 'var(--text-primary)' }} />
                <Typography sx={{ color: 'var(--text-secondary)', ml: 2 }}>
                    加载用户信息中...
                </Typography>
            </div>
        );
    }

    // 如果没有认证或用户信息
    if (!user || !token) {
        return (
            <div className="p-8 flex flex-col justify-center items-center">
                <Typography 
                    variant="h6" 
                    sx={{ color: 'var(--text-secondary)', mb: 2 }}
                >
                    请先登录以查看用户资料
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Avatar
                        className="mr-8"
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'var(--accent-blue)',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            filter: 'drop-shadow(0 0 15px rgba(14, 165, 233, 0.5))',
                            border: '2px solid rgba(var(--border-primary-rgb), 0.3)'
                        }}
                    >
                        {/*<Person />*/}
                        {user.user_name.charAt(0).toUpperCase()}
                    </Avatar>
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
                            USER PROFILE
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
                            PERSONAL INFORMATION & ACCOUNT SETTINGS
                        </Typography>
                    </div>
                </div>
                
                {!isEditing ? (
                    <IconButton 
                        onClick={handleEdit}
                        sx={{
                            background: 'rgba(var(--border-primary-rgb), 0.1)',
                            color: 'var(--text-primary)',
                            '&:hover': {
                                background: 'rgba(var(--border-primary-rgb), 0.2)',
                            }
                        }}
                    >
                        <Edit />
                    </IconButton>
                ) : (
                    <div className="flex space-x-2">
                        <IconButton 
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                background: 'rgba(var(--accent-green), 0.1)',
                                color: 'var(--accent-green)',
                                '&:hover': {
                                    background: 'rgba(var(--accent-green), 0.2)',
                                }
                            }}
                        >
                            {saving ? <CircularProgress size={20} /> : <Save />}
                        </IconButton>
                        <IconButton 
                            onClick={handleCancel}
                            sx={{
                                background: 'rgba(var(--text-muted), 0.1)',
                                color: 'var(--text-muted)',
                                '&:hover': {
                                    background: 'rgba(var(--text-muted), 0.2)',
                                }
                            }}
                        >
                            <Cancel />
                        </IconButton>
                    </div>
                )}
            </div>

            {/* User Information Form */}
            <div className="space-y-6">
                {/* User ID (Read-only) */}
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
                        USER ID
                    </Typography>
                    <div className="bg-tertiary/50 rounded-lg px-4 py-3 border border-subtle">
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace'
                            }}
                        >
                            {user.user_id}
                        </Typography>
                    </div>
                </div>

                {/* Username */}
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
                        USERNAME
                    </Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            value={editData.user_name}
                            onChange={(e) => handleInputChange('user_name', e.target.value)}
                            variant="outlined"
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
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                }
                            }}
                        />
                    ) : (
                        <div className="bg-tertiary/30 rounded-lg px-4 py-3 border border-subtle">
                            <Typography 
                                variant="body1" 
                                sx={{ color: 'var(--text-main)' }}
                            >
                                {user.user_name}
                            </Typography>
                        </div>
                    )}
                </div>

                {/* Email */}
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
                        EMAIL ADDRESS
                    </Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            type="email"
                            value={editData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            variant="outlined"
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
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                }
                            }}
                        />
                    ) : (
                        <div className="bg-tertiary/30 rounded-lg px-4 py-3 border border-subtle">
                            <Typography 
                                variant="body1" 
                                sx={{ color: 'var(--text-main)' }}
                            >
                                {user.email}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
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

export default UserProfile;