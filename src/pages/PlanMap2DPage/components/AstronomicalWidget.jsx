import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Alert,
  Chip,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import { 
  WbSunny as SunIcon,
  NightlightRound as MoonIcon,
  Schedule as TimeIcon,
  CameraAlt as PhotoIcon,
  Brightness4 as BlueHourIcon,
  WbTwilight as GoldenHourIcon,
  Place as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAstronomicalData } from '../../../utils/astronomicalUtils.js';
import { formatUTCForDisplay } from '../../../utils/timeUtils';
import '../../../assets/style.css';

function AstronomicalWidget({lon, lat, time}) {
    const [astronomicalData, setAstronomicalData] = useState(null);
    const [error, setError] = useState(null);

    // 计算天文数据
    const calculateAstronomicalData = () => {
        if (!lon || !lat || !time) {
            setError('需要设置位置和时间信息');
            return;
        }

        try {
            setError(null);
            const date = new Date(time);
            const data = getAstronomicalData(date, lat, lon);
            
            if (data) {
                setAstronomicalData(data);
            } else {
                setError('计算天文数据失败');
            }
        } catch (err) {
            console.error('计算天文数据失败:', err);
            setError(err.message || '计算天文数据失败');
        }
    };

    // 当位置或时间变化时重新计算天文数据
    useEffect(() => {
        calculateAstronomicalData();
    }, [lon, lat, time]);

    // 获取月相图标
    const getMoonPhaseIcon = (phase) => {
        // 根据月相值返回不同的样式
        const rotation = phase * 360; // 将月相转换为角度
        return (
            <MoonIcon 
                sx={{ 
                    fontSize: '2rem', 
                    color: 'var(--accent-blue)',
                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.4))',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />
        );
    };

    // 如果没有必要的参数，显示提示信息
    if (!lon || !lat || !time) {
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
                        <SunIcon 
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
                            ASTRONOMICAL DATA
                        </Typography>
                    </Box>
                    <Alert 
                        severity="info" 
                        className="bg-secondary/50 border border-primary/30"
                        sx={{
                            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.5)',
                            color: 'var(--text-main)',
                            borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                            '& .MuiAlert-message': {
                                color: 'var(--text-main)',
                            },
                            '& .MuiAlert-icon': {
                                color: 'var(--accent-blue)',
                            },
                        }}
                    >
                        需要设置位置和时间信息才能计算天文数据
                    </Alert>
                </CardContent>
            </Card>
        );
    }

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
                <Box className="flex items-center justify-between mb-6">
                    <Box className="flex items-center gap-3">
                        <SunIcon 
                            sx={{ 
                                color: 'var(--accent-orange)', 
                                fontSize: '2rem',
                                filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="sun-marker-icon"
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
                            ASTRONOMICAL DATA
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={calculateAstronomicalData}
                        sx={{
                            color: 'var(--accent-blue)',
                            border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                            padding: '8px',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-primary-rgb), 0.1)',
                                borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {error && (
                    <Alert 
                        severity="error"
                        className="mb-4"
                        sx={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--text-main)',
                            borderColor: '#ef4444',
                            border: '1px solid',
                            '& .MuiAlert-message': {
                                color: 'var(--text-main)',
                            },
                            '& .MuiAlert-icon': {
                                color: '#ef4444',
                            },
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {astronomicalData && (
                    <Box className="space-y-6">
                        {/* 太阳信息 */}
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
                            <Box className="flex items-center gap-3 mb-4">
                                <SunIcon 
                                    sx={{ 
                                        color: 'var(--accent-orange)', 
                                        fontSize: '1.5rem',
                                        filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))'
                                    }}
                                    className="sun-marker-icon"
                                />
                                <Typography 
                                    variant="h6" 
                                    className="text-contrast font-semibold uppercase tracking-wide"
                                    sx={{ 
                                        color: 'var(--text-contrast)',
                                        fontWeight: 600
                                    }}
                                >
                                    SUN INFORMATION
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            SUNRISE
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            className="text-contrast font-semibold font-mono"
                                            sx={{ 
                                                color: 'var(--text-contrast)',
                                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {astronomicalData.sunPosition.sunrise}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            SUNSET
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            className="text-contrast font-semibold font-mono"
                                            sx={{ 
                                                color: 'var(--text-contrast)',
                                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {astronomicalData.sunPosition.sunset}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            ALTITUDE
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            className="text-main font-mono"
                                            sx={{ 
                                                color: 'var(--text-main)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {astronomicalData.sunPosition.altitude}°
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            AZIMUTH
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            className="text-main font-mono"
                                            sx={{ 
                                                color: 'var(--text-main)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {astronomicalData.sunPosition.azimuth}°
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* 月亮信息 */}
                        <Box 
                            className="bg-secondary/50 backdrop-blur-md rounded-lg p-4 border border-primary/20"
                            sx={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.7)',
                                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)'
                                }
                            }}
                        >
                            <Box className="flex items-center gap-3 mb-4">
                                {getMoonPhaseIcon(astronomicalData.moonPosition.phase)}
                                <Typography 
                                    variant="h6" 
                                    className="text-contrast font-semibold uppercase tracking-wide"
                                    sx={{ 
                                        color: 'var(--text-contrast)',
                                        fontWeight: 600
                                    }}
                                >
                                    MOON INFORMATION
                                </Typography>
                                <Chip 
                                    label={astronomicalData.moonPosition.phaseName.toUpperCase()}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--accent-blue)',
                                        color: 'var(--text-contrast)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        filter: 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.5))'
                                    }}
                                />
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            MOONRISE
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            className="text-contrast font-semibold font-mono"
                                            sx={{ 
                                                color: 'var(--text-contrast)',
                                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {astronomicalData.moonPosition.moonrise}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            MOONSET
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            className="text-contrast font-semibold font-mono"
                                            sx={{ 
                                                color: 'var(--text-contrast)',
                                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {astronomicalData.moonPosition.moonset}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            ALTITUDE
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            className="text-main font-mono"
                                            sx={{ 
                                                color: 'var(--text-main)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {astronomicalData.moonPosition.altitude}°
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            AZIMUTH
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            className="text-main font-mono"
                                            sx={{ 
                                                color: 'var(--text-main)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {astronomicalData.moonPosition.azimuth}°
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="text-center">
                                        <Typography 
                                            variant="caption" 
                                            className="text-secondary uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.7rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            ILLUMINATION
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            className="text-main font-mono"
                                            sx={{ 
                                                color: 'var(--text-main)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {astronomicalData.moonPosition.illumination}%
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider 
                            sx={{ 
                                borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                margin: '1.5rem 0'
                            }} 
                        />

                        {/* 摄影时刻 */}
                        {astronomicalData.photographyTimes && (
                            <Box className="space-y-4">
                                <Box className="flex items-center gap-3 mb-4">
                                    <PhotoIcon 
                                        sx={{ 
                                            color: 'var(--accent-green)', 
                                            fontSize: '1.5rem',
                                            filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))'
                                        }}
                                    />
                                    <Typography 
                                        variant="h6" 
                                        className="text-contrast font-semibold uppercase tracking-wide"
                                        sx={{ 
                                            color: 'var(--text-contrast)',
                                            fontWeight: 600
                                        }}
                                    >
                                        PHOTOGRAPHY TIMES
                                    </Typography>
                                </Box>
                                
                                {/* 黄金时刻 */}
                                <Box 
                                    className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20"
                                    sx={{
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.4)',
                                            borderColor: 'rgba(var(--border-primary-rgb), 0.3)'
                                        }
                                    }}
                                >
                                    <Box className="flex items-center gap-2 mb-3">
                                        <GoldenHourIcon 
                                            sx={{ 
                                                color: 'var(--accent-orange)', 
                                                fontSize: '1.2rem',
                                                filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))'
                                            }}
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            className="text-primary font-semibold uppercase tracking-wide"
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                fontWeight: 600
                                            }}
                                        >
                                            GOLDEN HOUR
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                MORNING GOLDEN
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                className="text-main font-mono"
                                                sx={{ 
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {astronomicalData.photographyTimes.goldenHour.morning.start} - {astronomicalData.photographyTimes.goldenHour.morning.end}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                EVENING GOLDEN
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                className="text-main font-mono"
                                                sx={{ 
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {astronomicalData.photographyTimes.goldenHour.evening.start} - {astronomicalData.photographyTimes.goldenHour.evening.end}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* 蓝调时刻 */}
                                <Box 
                                    className="bg-secondary/30 backdrop-blur-sm rounded-lg p-3 border border-primary/20"
                                    sx={{
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.4)',
                                            borderColor: 'rgba(var(--border-primary-rgb), 0.3)'
                                        }
                                    }}
                                >
                                    <Box className="flex items-center gap-2 mb-3">
                                        <BlueHourIcon 
                                            sx={{ 
                                                color: 'var(--accent-blue)', 
                                                fontSize: '1.2rem',
                                                filter: 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.4))'
                                            }}
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            className="text-primary font-semibold uppercase tracking-wide"
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                fontWeight: 600
                                            }}
                                        >
                                            BLUE HOUR
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                MORNING BLUE
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                className="text-main font-mono"
                                                sx={{ 
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {astronomicalData.photographyTimes.blueHour.morning.start} - {astronomicalData.photographyTimes.blueHour.morning.end}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                EVENING BLUE
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                className="text-main font-mono"
                                                sx={{ 
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {astronomicalData.photographyTimes.blueHour.evening.start} - {astronomicalData.photographyTimes.blueHour.evening.end}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        )}

                        {/* 位置和时间信息 */}
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
                            <Box className="flex items-center gap-2 mb-3">
                                <LocationIcon 
                                    sx={{ 
                                        color: 'var(--text-secondary)', 
                                        fontSize: '1.2rem'
                                    }}
                                />
                                <Typography 
                                    variant="subtitle2" 
                                    className="text-primary uppercase tracking-wider"
                                    sx={{ 
                                        color: 'var(--text-primary)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}
                                >
                                    QUERY INFORMATION
                                </Typography>
                            </Box>
                            <Typography 
                                variant="body2" 
                                className="text-main font-mono"
                                sx={{ 
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                LOCATION: {lat.toFixed(4)}, {lon.toFixed(4)}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-main font-mono"
                                sx={{ 
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                QUERY TIME: {formatUTCForDisplay(time).fullDateTime}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default AstronomicalWidget;