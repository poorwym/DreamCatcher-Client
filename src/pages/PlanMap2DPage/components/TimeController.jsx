import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  IconButton, 
  Box,
  Tooltip
} from '@mui/material';
import { 
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FastForward as FastForwardIcon,
  FastRewind as FastRewindIcon
} from '@mui/icons-material';
import { 
    utcToDateTimeLocal, 
    localToUTC, 
    utcAdd, 
    formatUTCForDisplay 
} from '../../../utils/timeUtils';
import '../../../assets/style.css';

// time : UTC时间字符串格式 "2025-06-08T11:30:00.000Z"
function TimeController({time, setTime}) {
    const [localDateTime, setLocalDateTime] = useState('');

    // 初始化本地时间状态
    useEffect(() => {
        if (time) {
            // 将UTC时间转换为本地datetime-local格式
            const localString = utcToDateTimeLocal(time);
            setLocalDateTime(localString);
        }
    }, [time]);

    // 处理时间变化
    const handleTimeChange = (event) => {
        const newDateTime = event.target.value;
        setLocalDateTime(newDateTime);
        
        // 将本地时间转换为UTC时间
        const utcString = localToUTC(newDateTime);
        setTime(utcString);
    };

    // 快速调整时间的函数
    const adjustTime = (amount, unit) => {
        if (!time) return;
        
        // 在UTC时间基础上进行运算
        const newUtcTime = utcAdd(time, amount, unit);
        setTime(newUtcTime);
    };

    // 格式化显示当前时间
    const formatCurrentTime = () => {
        if (!time) return '';
        const display = formatUTCForDisplay(time, {
            fullFormat: 'YYYY年MM月DD日 HH:mm:ss (ZZ)'
        });
        return display.fullDateTime;
    };

    return (
        <Card 
            className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 mb-8"
            sx={{ 
                backgroundColor: 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                    boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    transform: 'scale(1.02) translateY(-2px)'
                }
            }}
        >
            <CardContent className="p-6">
                <Box className="flex items-center gap-3 mb-6">
                    <ScheduleIcon 
                        sx={{ 
                            color: 'var(--accent-orange)', 
                            fontSize: '2rem',
                            filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    />
                    <Typography 
                        variant="h6" 
                        className="text-contrast font-bold uppercase tracking-wider"
                        sx={{ 
                            color: 'var(--text-contrast)',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        TIME CONTROL
                    </Typography>
                </Box>

                <Box className="space-y-6">
                    {/* 主时间输入 */}
                    <Box 
                        className="bg-secondary/50 backdrop-blur-md rounded-lg p-4 border border-primary/20"
                        sx={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.7)',
                                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            className="text-contrast font-semibold mb-3 uppercase tracking-wide"
                            sx={{ 
                                color: 'var(--text-contrast)',
                                fontWeight: 600
                            }}
                        >
                            SET TIME
                        </Typography>
                        <TextField
                            type="datetime-local"
                            value={localDateTime}
                            onChange={handleTimeChange}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(var(--bg-tertiary-rgb), 0.5)',
                                    color: 'var(--text-main)',
                                    '& fieldset': {
                                        borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--accent-orange)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--accent-orange)',
                                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)'
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                    '&.Mui-focused': {
                                        color: 'var(--accent-orange)',
                                    },
                                },
                                '& input': {
                                    color: 'var(--text-main)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem'
                                }
                            }}
                        />
                    </Box>

                    {/* 快速调整按钮 */}
                    <Box className="flex flex-row lg:flex-col gap-4">
                        {/* 小时调整 */}
                        <Box 
                            className="bg-secondary/50 backdrop-blur-md rounded-lg p-4 border border-primary/20 flex-1"
                            sx={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.7)',
                                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                                }
                            }}
                        >
                            <Typography 
                                variant="subtitle2" 
                                className="text-primary text-center mb-3 uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                            >
                                HOUR
                            </Typography>
                            <Box className="flex items-center justify-between">
                                <Tooltip title="减少1小时">
                                    <IconButton 
                                        onClick={() => adjustTime(-1, 'hour')}
                                        sx={{
                                            color: 'var(--accent-blue)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-blue), 0.1)',
                                                borderColor: 'var(--accent-blue)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="减少6小时">
                                    <IconButton 
                                        onClick={() => adjustTime(-6, 'hour')}
                                        sx={{
                                            color: 'var(--accent-blue)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-blue), 0.1)',
                                                borderColor: 'var(--accent-blue)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <FastRewindIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="增加6小时">
                                    <IconButton 
                                        onClick={() => adjustTime(6, 'hour')}
                                        sx={{
                                            color: 'var(--accent-green)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-green), 0.1)',
                                                borderColor: 'var(--accent-green)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <FastForwardIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="增加1小时">
                                    <IconButton 
                                        onClick={() => adjustTime(1, 'hour')}
                                        sx={{
                                            color: 'var(--accent-green)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-green), 0.1)',
                                                borderColor: 'var(--accent-green)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* 天数调整 */}
                        <Box 
                            className="bg-secondary/50 backdrop-blur-md rounded-lg p-4 border border-primary/20 flex-1"
                            sx={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.7)',
                                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                                }
                            }}
                        >
                            <Typography 
                                variant="subtitle2" 
                                className="text-primary text-center mb-3 uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                            >
                                DAY
                            </Typography>
                            <Box className="flex items-center justify-between">
                                <Tooltip title="减少1天">
                                    <IconButton 
                                        onClick={() => adjustTime(-1, 'day')}
                                        sx={{
                                            color: 'var(--accent-blue)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-blue), 0.1)',
                                                borderColor: 'var(--accent-blue)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="减少1周">
                                    <IconButton 
                                        onClick={() => adjustTime(-1, 'week')}
                                        sx={{
                                            color: 'var(--accent-blue)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-blue), 0.1)',
                                                borderColor: 'var(--accent-blue)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <FastRewindIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="增加1周">
                                    <IconButton 
                                        onClick={() => adjustTime(1, 'week')}
                                        sx={{
                                            color: 'var(--accent-green)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-green), 0.1)',
                                                borderColor: 'var(--accent-green)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <FastForwardIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="增加1天">
                                    <IconButton 
                                        onClick={() => adjustTime(1, 'day')}
                                        sx={{
                                            color: 'var(--accent-green)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--accent-green), 0.1)',
                                                borderColor: 'var(--accent-green)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>

                    {/* 当前时间显示 */}
                    {time && (
                        <Box 
                            className="bg-secondary/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20"
                            sx={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.4)',
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.3)'
                                }
                            }}
                        >
                            <Typography 
                                variant="subtitle2" 
                                className="text-primary mb-3 uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                            >
                                CURRENT TIME
                            </Typography>
                            <Typography 
                                variant="body1" 
                                className="text-contrast font-mono"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                {formatCurrentTime()}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default TimeController;