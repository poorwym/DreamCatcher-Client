import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ButtonGroup
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    PhotoCamera as CameraIcon,
    Schedule as ScheduleIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Map as MapIcon,
    ThreeDRotation as ThreeDIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthProvider';
import { getPlan, updatePlan, deletePlan } from '../../api/plan';
import { getPosition } from '../../api/util';
import Map2DContainer from '../../components/Map2D/Map2DContainer';
import { Marker, Popup } from 'react-leaflet';
import '../../assets/style.css';
import Background from "../../components/Background/Background.jsx";

function PlanDetailsPage() {
    const navigate = useNavigate();
    const { id: plan_id } = useParams();
    const { fetchWithAuth, user } = useAuth();
    
    // 计划加载状态
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // 加载计划数据
    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                const planData = await getPlan(plan_id, fetchWithAuth);
                
                // 填充表单数据
                setFormData({
                    name: planData.name || '',
                    description: planData.description || '',
                    start_time: planData.start_time ? (() => {
                        const date = new Date(planData.start_time);
                        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                        return date.toISOString().slice(0, 16);
                    })() : '',
                    tileset_url: planData.tileset_url || ''
                });
                
                // 设置相机配置
                if (planData.camera) {
                    setCameraConfig(planData.camera);
                    // 如果有位置信息，设置选中的位置
                    if (planData.camera.position && planData.camera.position.length >= 2) {
                        setSelectedLocation({
                            name: '当前位置',
                            district: '',
                            address: '',
                            coordinates: {
                                lon: planData.camera.position[0],
                                lat: planData.camera.position[1]
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('加载计划详情失败:', err);
                setLoadError(err.message || '加载计划详情失败');
            } finally {
                setLoading(false);
            }
        };

        if (plan_id && fetchWithAuth) {
            loadPlan();
        }
    }, [plan_id, fetchWithAuth]);

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

    // 更新计划
    const handleUpdate = async (e) => {
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

        setIsSubmitting(true);
        setError('');
        
        try {
            const updateData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                start_time: new Date(formData.start_time).toISOString(),
                camera: cameraConfig,
                tileset_url: formData.tileset_url || ""
            };
            
            await updatePlan(plan_id, updateData, fetchWithAuth);
            setSuccess('拍摄计划更新成功！');
            
            // 延迟清除成功消息
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            
        } catch (err) {
            console.error('更新计划失败:', err);
            setError('更新计划失败: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 删除计划
    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');
        
        try {
            await deletePlan(plan_id, fetchWithAuth);
            setSuccess('拍摄计划删除成功！');
            
            // 延迟跳转到计划列表页
            setTimeout(() => {
                navigate('/plans');
            }, 1500);
            
        } catch (err) {
            console.error('删除计划失败:', err);
            setError('删除计划失败: ' + err.message);
            setDeleteDialogOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // 获取当前时间的ISO字符串（用于datetime-local输入）
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
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

    if (loading) {
        return (
            <Box className="flex justify-center items-center min-h-screen">
                <Background />
                <CircularProgress size={60} sx={{ color: 'var(--text-primary)' }} />
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box className="flex justify-center items-center min-h-screen p-9">
                <Background />
                <Alert
                    severity="error"
                    sx={{
                        backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        color: 'var(--text-main)',
                        '& .MuiAlert-icon': {
                            color: 'rgb(220, 38, 38)'
                        }
                    }}
                >
                    <Typography variant="h6">加载失败</Typography>
                    <Typography>{loadError}</Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/plans')}
                        startIcon={<ArrowBackIcon />}
                        sx={{ mt: 2, color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}
                    >
                        返回计划列表
                    </Button>
                </Alert>
            </Box>
        );
    }

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
                        MISSION CONTROL
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
                        UPDATE PHOTOGRAPHY MISSION
                    </Typography>
                    
                    {/* 导航按钮组 */}
                    <ButtonGroup 
                        variant="contained" 
                        sx={{ mt: 3 }}
                    >
                        <Button
                            onClick={() => navigate('/plans')}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                backgroundColor: 'rgba(55, 65, 81, 0.8)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(55, 65, 81, 0.3)',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(55, 65, 81, 0.9)',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 0 20px rgba(55, 65, 81, 0.4)',
                                }
                            }}
                        >
                            返回列表
                        </Button>
                        <Button
                            onClick={() => navigate(`/plans/${plan_id}/map2d`)}
                            startIcon={<MapIcon />}
                            sx={{
                                backgroundColor: 'rgba(14, 165, 233, 0.8)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(14, 165, 233, 0.9)',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
                                }
                            }}
                        >
                            2D 地图
                        </Button>
                        <Button
                            onClick={() => navigate(`/plans/${plan_id}/map3d`)}
                            startIcon={<ThreeDIcon />}
                            sx={{
                                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(168, 85, 247, 0.9)',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                                }
                            }}
                        >
                            3D 地图
                        </Button>
                    </ButtonGroup>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                    {/* 左侧表单区域 */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={cardSx}>
                            <CardHeader
                                avatar={<EditIcon sx={{ color: 'var(--text-primary)', filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))' }} />}
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
                                <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                                                label={`${selectedLocation.name} - ${selectedLocation.district || `${selectedLocation.coordinates.lon.toFixed(4)}, ${selectedLocation.coordinates.lat.toFixed(4)}`}`}
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

                                    {/* 操作按钮 */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={isSubmitting}
                                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                                            sx={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                                backdropFilter: 'blur(12px)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                borderRadius: '16px',
                                                py: 2.5,
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                color: 'white',
                                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.1)',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(16, 185, 129, 0.95)',
                                                    transform: 'scale(1.02) translateY(-4px)',
                                                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)',
                                                    borderColor: 'rgba(16, 185, 129, 0.6)',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.5)',
                                                    color: 'var(--text-muted)',
                                                    transform: 'none',
                                                    boxShadow: 'none',
                                                }
                                            }}
                                        >
                                            {isSubmitting ? '更新中...' : '更新计划'}
                                        </Button>
                                        
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => setDeleteDialogOpen(true)}
                                            startIcon={<DeleteIcon />}
                                            sx={{
                                                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                                                backdropFilter: 'blur(12px)',
                                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                                borderRadius: '16px',
                                                py: 2.5,
                                                px: 4,
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                color: 'white',
                                                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.1)',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(220, 38, 38, 0.95)',
                                                    transform: 'scale(1.02) translateY(-4px)',
                                                    boxShadow: '0 0 40px rgba(220, 38, 38, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)',
                                                    borderColor: 'rgba(220, 38, 38, 0.6)',
                                                }
                                            }}
                                        >
                                            删除
                                        </Button>
                                    </Box>
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

            {/* 删除确认对话框 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    确认删除计划
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
                        您确定要删除这个拍摄计划吗？此操作不可恢复。
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)} 
                        disabled={isDeleting}
                        sx={{ color: 'var(--text-secondary)' }}
                    >
                        取消
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                        sx={{
                            backgroundColor: 'rgba(220, 38, 38, 0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(220, 38, 38, 0.9)',
                            }
                        }}
                    >
                        {isDeleting ? '删除中...' : '确认删除'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PlanDetailsPage;