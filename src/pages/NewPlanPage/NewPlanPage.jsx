import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Chip,
    Alert,
    CircularProgress,
    Grid,
    Paper,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    LocationOn as LocationIcon,
    PhotoCamera as CameraIcon,
    Schedule as ScheduleIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthProvider';
import { createPlan } from '../../api/plan';
import { getPosition } from '../../api/util';
import Map2DContainer from '../../components/Map2D/Map2DContainer';
import { Marker, Popup } from 'react-leaflet';
import { localToUTC, getCurrentDateTimeLocal } from '../../utils/timeUtils';
import '../../assets/style.css';
import Background from "../../components/Background/Background.jsx";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 设置marker图标
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl    from 'leaflet/dist/images/marker-icon.png';
import shadowUrl  from 'leaflet/dist/images/marker-shadow.png';

// 先删除旧的 _getIconUrl，避免缓存旧路径
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl:       iconUrl,
  shadowUrl:     shadowUrl,
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

function NewPlanPage() {
    const navigate = useNavigate();
    const { fetchWithAuth, user } = useAuth();
    
    // 表单状态
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_time: '',
        tileset_url: ''
    });
    
    // 位置搜索状态
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    // 相机配置状态
    const [cameraConfig, setCameraConfig] = useState({
        focal_length: 50,
        position: [116.4074, 39.9042, 100], // 默认北京坐标
        rotation: [0, 0, 0, 1]
    });
    
    // UI状态
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 搜索位置
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        setError('');
        
        try {
            const response = await getPosition(searchQuery, fetchWithAuth);
            if (response.tips && response.tips.length > 0) {
                setSearchResults(response.tips.filter(tip => tip.location && tip.location.length > 0));
            } else {
                setSearchResults([]);
                setError('未找到相关位置，请尝试其他关键词');
            }
        } catch (err) {
            console.error('位置搜索失败:', err);
            setError('位置搜索失败: ' + err.message);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, fetchWithAuth]);

    // 选择位置
    const handleLocationSelect = (location) => {
        const [lon, lat] = location.location.split(',').map(Number);
        const newLocation = {
            ...location,
            coordinates: { lon, lat }
        };
        
        setSelectedLocation(newLocation);
        setCameraConfig(prev => ({
            ...prev,
            position: [lon, lat, prev.position[2]]
        }));
        setSearchResults([]);
        setSearchQuery('');
    };

    // 处理表单输入
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 处理相机配置变化
    const handleCameraConfigChange = (field, value) => {
        setCameraConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 提交表单
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('请输入计划名称');
            return;
        }
        
        if (!formData.description.trim()) {
            setError('请输入计划描述');
            return;
        }
        
        if (!formData.start_time) {
            setError('请选择开始时间');
            return;
        }
        
        if (!selectedLocation) {
            setError('请选择拍摄位置');
            return;
        }
        
        if (!user || !user.user_id) {
            setError('用户信息未加载，请重新登录');
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        try {
            const planData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                start_time: localToUTC(formData.start_time),
                camera: cameraConfig,
                tileset_url: formData.tileset_url ? formData.tileset_url : "",
                user_id: user.user_id
            };
            
            const newPlan = await createPlan(planData, fetchWithAuth);
            setSuccess('拍摄计划创建成功！');
            
            // 延迟跳转到计划详情页
            setTimeout(() => {
                navigate(`/plans/${newPlan.id}`);
            }, 1500);
            
        } catch (err) {
            console.error('创建计划失败:', err);
            setError('创建计划失败: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 获取当前时间的datetime-local格式（用于输入框最小值）
    const getCurrentDateTime = () => {
        return getCurrentDateTimeLocal();
    };

    // 处理键盘事件
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Material UI 主题样式
    const cardSx = {
        backgroundColor: 'transparent',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 30px rgba(14, 165, 233, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
            borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
            boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-2px)'
        }
    };

    const textFieldSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.6)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-main)',
            border: '1px solid rgba(var(--border-primary-rgb), 0.2)',
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
                borderColor: 'rgba(55, 65, 81, 0.3)',
            },
            '&:hover': {
                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.8)',
                borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                '& fieldset': {
                    borderColor: 'rgba(var(--border-primary-rgb), 0.4)',
                },
            },
            '&.Mui-focused': {
                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)',
                borderColor: 'var(--border-primary)',
                boxShadow: '0 0 20px rgba(96, 165, 250, 0.2)',
                '& fieldset': {
                    borderColor: 'var(--border-primary)',
                },
            },
        },
        '& .MuiInputLabel-root': {
            color: 'var(--text-secondary)',
            fontWeight: 500,
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: 'var(--text-primary)',
        },
    };

    return (
        <Box className="min-h-screen bg-primary" sx={{ p: 3 }}>
            <Background />
            <Container maxWidth="xl">
                {/* 页面标题 */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                        variant="h2" 
                        className="text-contrast font-bold"
                        sx={{ 
                            mb: 2, 
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            color: 'var(--text-contrast)',
                            textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        CREATE NEW MISSION
                    </Typography>
                    <Typography 
                        variant="h5" 
                        className="text-secondary"
                        sx={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            fontWeight: 300,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                        }}
                    >
                        PHOTOGRAPHY MISSION CONTROL
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                    {/* 左侧表单区域 */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={cardSx}>
                            <CardHeader
                                avatar={<AddIcon sx={{ color: 'var(--text-primary)', filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))' }} />}
                                title={
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontFamily: 'monospace',
                                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                                        }}
                                    >
                                        MISSION INFO
                                    </Typography>
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent>
                                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {/* 基本信息部分 */}
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                mb: 3,
                                                pb: 1,
                                                borderBottom: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: 'monospace',
                                                filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                                            }}
                                        >
                                            BASIC INFO
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="计划名称"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="输入您的拍摄计划名称..."
                                                sx={textFieldSx}
                                            />

                                            <TextField
                                                fullWidth
                                                label="计划描述"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                multiline
                                                rows={4}
                                                placeholder="描述您的拍摄计划详情..."
                                                sx={textFieldSx}
                                            />

                                            <TextField
                                                fullWidth
                                                label="开始时间"
                                                type="datetime-local"
                                                value={formData.start_time}
                                                onChange={(e) => handleInputChange('start_time', e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ min: getCurrentDateTime() }}
                                                sx={textFieldSx}
                                            />
                                        </Box>
                                    </Box>

                                    <Divider sx={{ borderColor: 'rgba(var(--border-primary-rgb), 0.2)' }} />

                                    {/* 位置搜索部分 */}
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                mb: 3,
                                                pb: 1,
                                                borderBottom: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: 'monospace',
                                                filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                                            }}
                                        >
                                            <LocationIcon sx={{ filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))' }} />
                                            LOCATION TARGET
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="搜索位置"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="输入地点名称，如：天安门、故宫、长城..."
                                                sx={textFieldSx}
                                                InputProps={{
                                                    endAdornment: searchQuery && (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setSearchQuery('')}
                                                                size="small"
                                                                sx={{ color: 'var(--text-secondary)' }}
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleSearch}
                                                disabled={isSearching || !searchQuery.trim()}
                                                sx={{
                                                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: '1px solid rgba(14, 165, 233, 0.3)',
                                                    borderRadius: '12px',
                                                    minWidth: '120px',
                                                    px: 3,
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(14, 165, 233, 0.9)',
                                                        transform: 'scale(1.05) translateY(-2px)',
                                                        boxShadow: '0 0 25px rgba(14, 165, 233, 0.4), 0 10px 20px rgba(0, 0, 0, 0.2)',
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.5)',
                                                        color: 'var(--text-muted)',
                                                    }
                                                }}
                                            >
                                                {isSearching ? (
                                                    <CircularProgress size={20} sx={{ color: 'white' }} />
                                                ) : (
                                                    <SearchIcon />
                                                )}
                                            </Button>
                                        </Box>

                                        {/* 搜索结果 */}
                                        {searchResults.length > 0 && (
                                            <Paper 
                                                sx={{ 
                                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.8)',
                                                    backdropFilter: 'blur(12px)',
                                                    border: '1px solid rgba(var(--border-primary-rgb), 0.2)',
                                                    borderRadius: '12px',
                                                    maxHeight: 200, 
                                                    overflow: 'auto',
                                                    mb: 2,
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                                                }}
                                            >
                                                <List>
                                                    {searchResults.map((result, index) => (
                                                        <ListItem key={index} disablePadding>
                                                            <ListItemButton 
                                                                onClick={() => handleLocationSelect(result)}
                                                                sx={{
                                                                    borderRadius: '8px',
                                                                    margin: '4px',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(11, 15, 26, 0.6)',
                                                                        backdropFilter: 'blur(8px)',
                                                                        transform: 'translateX(4px)',
                                                                    }
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={result.name}
                                                                    secondary={`${result.district} ${result.address}`}
                                                                    sx={{
                                                                        '& .MuiListItemText-primary': {
                                                                            color: 'var(--text-main)',
                                                                        },
                                                                        '& .MuiListItemText-secondary': {
                                                                            color: 'var(--text-secondary)',
                                                                        },
                                                                    }}
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Paper>
                                        )}

                                        {/* 已选择的位置 */}
                                        {selectedLocation && (
                                            <Chip
                                                icon={<LocationIcon />}
                                                label={`${selectedLocation.name} - ${selectedLocation.district}`}
                                                onDelete={() => setSelectedLocation(null)}
                                                sx={{
                                                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                                    backdropFilter: 'blur(8px)',
                                                    color: 'white',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    fontWeight: 500,
                                                    '& .MuiChip-deleteIcon': {
                                                        color: 'white',
                                                        '&:hover': {
                                                            color: 'rgba(255, 255, 255, 0.8)',
                                                        }
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                                                        transform: 'scale(1.02)',
                                                    },
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{ borderColor: 'rgba(var(--border-primary-rgb), 0.2)' }} />

                                    {/* 相机配置部分 */}
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                mb: 3,
                                                pb: 1,
                                                borderBottom: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: 'monospace',
                                                filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                                            }}
                                        >
                                            <CameraIcon sx={{ filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))' }} />
                                            CAMERA CONFIG
                                        </Typography>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="焦距 (mm)"
                                                    type="number"
                                                    value={cameraConfig.focal_length}
                                                    onChange={(e) => handleCameraConfigChange('focal_length', Number(e.target.value))}
                                                    inputProps={{ min: 10, max: 1000 }}
                                                    sx={textFieldSx}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="高度 (m)"
                                                    type="number"
                                                    value={cameraConfig.position[2]}
                                                    onChange={(e) => handleCameraConfigChange('position', [
                                                        cameraConfig.position[0],
                                                        cameraConfig.position[1],
                                                        Number(e.target.value)
                                                    ])}
                                                    inputProps={{ min: 0, max: 10000 }}
                                                    sx={textFieldSx}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ borderColor: 'rgba(var(--border-primary-rgb), 0.2)' }} />

                                    {/* Tileset URL */}
                                    <TextField
                                        fullWidth
                                        label="Tileset URL (可选)"
                                        value={formData.tileset_url}
                                        onChange={(e) => handleInputChange('tileset_url', e.target.value)}
                                        placeholder="https://example.com/tileset.json"
                                        sx={textFieldSx}
                                    />

                                    {/* 错误和成功消息 */}
                                    {error && (
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
                                    
                                    {success && (
                                        <Alert severity="success" sx={{ mt: 2 }}>
                                            {success}
                                        </Alert>
                                    )}

                                    {/* 提交按钮 */}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={isSubmitting}
                                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <ScheduleIcon />}
                                        sx={{
                                            backgroundColor: 'rgba(245, 158, 11, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '16px',
                                            py: 2.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: 'white',
                                            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.1)',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(245, 158, 11, 0.95)',
                                                transform: 'scale(1.02) translateY(-4px)',
                                                boxShadow: '0 0 40px rgba(245, 158, 11, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)',
                                                borderColor: 'rgba(245, 158, 11, 0.6)',
                                            },
                                            '&:disabled': {
                                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.5)',
                                                color: 'var(--text-muted)',
                                                transform: 'none',
                                                boxShadow: 'none',
                                            }
                                        }}
                                    >
                                        {isSubmitting ? '创建中...' : '创建拍摄计划'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* 右侧地图预览区域 */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={cardSx}>
                            <CardHeader
                                avatar={<LocationIcon sx={{ color: 'var(--text-primary)', filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))' }} />}
                                title={
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontFamily: 'monospace',
                                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                                        }}
                                    >
                                        LOCATION PREVIEW
                                    </Typography>
                                }
                                subheader={
                                    selectedLocation && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                                            >
                                                {selectedLocation.name}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ color: 'var(--text-secondary)' }}
                                            >
                                                {selectedLocation.district} {selectedLocation.address}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ color: 'var(--text-muted)' }}
                                            >
                                                坐标: {selectedLocation.coordinates.lon.toFixed(6)}, {selectedLocation.coordinates.lat.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    )
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ p: 0 }}>
                                {selectedLocation ? (
                                    <Map2DContainer
                                        lon={selectedLocation.coordinates.lon}
                                        lat={selectedLocation.coordinates.lat}
                                        zoom={15}
                                        height="600px"
                                    >
                                        <Marker position={[selectedLocation.coordinates.lat, selectedLocation.coordinates.lon]}>
                                            <Popup>
                                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                        {selectedLocation.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {selectedLocation.address}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                                                        拍摄高度: {cameraConfig.position[2]}m
                                                    </Typography>
                                                </Box>
                                            </Popup>
                                        </Marker>
                                    </Map2DContainer>
                                ) : (
                                    <Box 
                                        sx={{ 
                                            height: 400, 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.3)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(var(--border-primary-rgb), 0.2)',
                                            borderRadius: '16px',
                                            gap: 3,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.4)',
                                                borderColor: 'rgba(var(--border-primary-rgb), 0.3)',
                                            }
                                        }}
                                    >
                                        <LocationIcon sx={{ fontSize: 80, color: 'var(--text-muted)', filter: 'drop-shadow(0 0 15px rgba(96, 165, 250, 0.2))' }} />
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                color: 'var(--text-muted)', 
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            SELECT TARGET LOCATION
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: 'var(--text-secondary)', 
                                                textAlign: 'center',
                                                maxWidth: 300,
                                                fontSize: '0.9rem',
                                                lineHeight: 1.6,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            SEARCH AND SELECT A LOCATION
                                            <br />
                                            TO VIEW MAP PREVIEW
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default NewPlanPage;