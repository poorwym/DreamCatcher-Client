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
import '../../assets/style.css';
import Background from "../../components/Background/Background.jsx";

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
                start_time: new Date(formData.start_time).toISOString(),
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
        backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(var(--border-primary-rgb), 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    };

    const textFieldSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            '& fieldset': {
                borderColor: 'var(--border-subtle)',
            },
            '&:hover fieldset': {
                borderColor: 'var(--border-primary)',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'var(--border-primary)',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'var(--text-secondary)',
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
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            color: 'var(--text-contrast)'
                        }}
                    >
                        创建新的拍摄计划
                    </Typography>
                    <Typography 
                        variant="h5" 
                        className="text-secondary"
                        sx={{ color: 'var(--text-secondary)' }}
                    >
                        规划您的完美拍摄之旅
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                    {/* 左侧表单区域 */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={cardSx}>
                            <CardHeader
                                avatar={<AddIcon sx={{ color: 'var(--text-primary)' }} />}
                                title={
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        计划信息
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
                                                borderBottom: '1px solid var(--border-subtle)'
                                            }}
                                        >
                                            基本信息
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

                                    <Divider sx={{ borderColor: 'var(--border-subtle)' }} />

                                    {/* 位置搜索部分 */}
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                mb: 3,
                                                pb: 1,
                                                borderBottom: '1px solid var(--border-subtle)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <LocationIcon />
                                            拍摄位置
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
                                                    backgroundColor: 'var(--accent-blue)',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--accent-blue-hover)',
                                                    },
                                                    minWidth: '120px',
                                                    px: 3
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
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                    border: '1px solid var(--border-subtle)',
                                                    maxHeight: 200, 
                                                    overflow: 'auto',
                                                    mb: 2
                                                }}
                                            >
                                                <List>
                                                    {searchResults.map((result, index) => (
                                                        <ListItem key={index} disablePadding>
                                                            <ListItemButton 
                                                                onClick={() => handleLocationSelect(result)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--bg-secondary)',
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
                                                    backgroundColor: 'var(--accent-green)',
                                                    color: 'white',
                                                    '& .MuiChip-deleteIcon': {
                                                        color: 'white',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{ borderColor: 'var(--border-subtle)' }} />

                                    {/* 相机配置部分 */}
                                    <Box>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: 'var(--text-primary)',
                                                mb: 3,
                                                pb: 1,
                                                borderBottom: '1px solid var(--border-subtle)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <CameraIcon />
                                            相机配置
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

                                    <Divider sx={{ borderColor: 'var(--border-subtle)' }} />

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
                                            backgroundColor: 'var(--accent-orange)',
                                            '&:hover': {
                                                backgroundColor: 'var(--accent-orange-hover)',
                                                transform: 'scale(1.02)',
                                            },
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
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
                                avatar={<LocationIcon sx={{ color: 'var(--text-primary)' }} />}
                                title={
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        位置预览
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
                                            backgroundColor: 'var(--bg-tertiary)',
                                            gap: 3
                                        }}
                                    >
                                        <LocationIcon sx={{ fontSize: 80, color: 'var(--text-muted)' }} />
                                        <Typography 
                                            variant="h5" 
                                            sx={{ color: 'var(--text-muted)', fontWeight: 'bold' }}
                                        >
                                            请先搜索并选择拍摄位置
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: 'var(--text-secondary)', 
                                                textAlign: 'center',
                                                maxWidth: 300
                                            }}
                                        >
                                            选择位置后，这里将显示地图预览
                                            <br />
                                            您可以在地图上查看拍摄点的详细位置
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