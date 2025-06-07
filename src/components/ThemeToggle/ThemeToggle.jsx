import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import useTheme from '../../hooks/useTheme';
import '../assets/style.css';

/**
 * 主题切换按钮组件
 * 提供白天/黑夜模式切换功能
 */
export default function ThemeToggle({ className = '', size = 'medium' }) {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <Tooltip title={isDark ? '切换到白天模式' : '切换到黑夜模式'}>
            <IconButton
                onClick={toggleTheme}
                size={size}
                className={`
                    ${className}
                    text-primary hover:bg-primary-hover
                    transition-all duration-300 ease-in-out
                    border border-subtle hover:border-primary
                    backdrop-blur-sm
                `}
                sx={{
                    '& .MuiSvgIcon-root': {
                        fontSize: size === 'large' ? '2rem' : size === 'small' ? '1.2rem' : '1.5rem',
                        transition: 'transform 0.3s ease-in-out',
                    },
                    '&:hover .MuiSvgIcon-root': {
                        transform: 'rotate(180deg)',
                    },
                }}
            >
                {isDark ? (
                    <Brightness7 />
                ) : (
                    <Brightness4 />
                )}
            </IconButton>
        </Tooltip>
    );
} 