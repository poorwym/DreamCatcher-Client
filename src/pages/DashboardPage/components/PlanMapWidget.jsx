import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Map as MapIcon, ZoomIn, ZoomOut, MyLocation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import "../../../assets/style.css";

const PlanMapWidget = ({ plans }) => {
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();

    // 初始化地图
    useEffect(() => {
        if (!plans || plans.length === 0) return;

        // 简单的地图实现，使用CSS和DOM操作
        // 实际项目中可以使用 Leaflet、Google Maps 等
        initializeMap();
    }, [plans]);

    const initializeMap = () => {
        if (!mapRef.current || !plans.length) return;

        // 清除现有标记
        markersRef.current = [];

        // 计算地图边界
        const positions = plans
            .filter(plan => plan.camera && plan.camera.position)
            .map(plan => plan.camera.position);

        if (positions.length === 0) return;

        const lats = positions.map(pos => pos[1]);
        const lngs = positions.map(pos => pos[0]);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // 创建标记点
        positions.forEach((position, index) => {
            const plan = plans.find(p => p.camera && 
                p.camera.position[0] === position[0] && 
                p.camera.position[1] === position[1]);
            
            if (plan) {
                const marker = createMarker(position, plan, minLat, maxLat, minLng, maxLng);
                markersRef.current.push(marker);
            }
        });
    };

    const createMarker = (position, plan, minLat, maxLat, minLng, maxLng) => {
        const [lng, lat] = position;
        
        // 将经纬度转换为地图容器内的像素坐标
        const latRange = maxLat - minLat || 0.01;
        const lngRange = maxLng - minLng || 0.01;
        
        const x = ((lng - minLng) / lngRange) * 100;
        const y = ((maxLat - lat) / latRange) * 100;

        return { x, y, plan };
    };

    const handleMarkerClick = (plan) => {
        navigate(`/plans/${plan.id}`);
    };

    const getStatusColor = (plan) => {
        const isUpcoming = new Date(plan.start_time) > new Date();
        return isUpcoming ? 'var(--accent-green)' : 'var(--accent-orange)';
    };

    return (
        <Card 
            className="h-full bg-secondary/80 backdrop-blur-lg border border-primary/30"
            sx={{ 
                background: 'rgba(var(--bg-secondary-rgb), 0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(var(--border-primary-rgb), 0.3)'
            }}
        >
            <CardContent className="p-6 h-full flex flex-col">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <MapIcon 
                            sx={{ color: 'var(--accent-blue)', marginRight: 1 }}
                        />
                        <Typography 
                            variant="h6" 
                            className="text-contrast font-bold"
                            sx={{ color: 'var(--text-contrast)' }}
                        >
                            计划地图分布
                        </Typography>
                    </div>
                    <Typography 
                        variant="body2" 
                        className="text-secondary"
                        sx={{ color: 'var(--text-secondary)' }}
                    >
                        {plans?.length || 0} 个位置
                    </Typography>
                </div>

                {/* 地图容器 */}
                <div className="flex-1 relative">
                    {plans && plans.length > 0 ? (
                        <div 
                            ref={mapRef}
                            className="w-full h-full relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-primary/20 overflow-hidden"
                            style={{
                                backgroundImage: `
                                    radial-gradient(circle at 20% 30%, rgba(96, 165, 250, 0.1) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                                    linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)
                                `
                            }}
                        >
                            {/* 网格背景 */}
                            <div className="absolute inset-0 opacity-20">
                                <svg className="w-full h-full">
                                    <defs>
                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="0.5"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* 计划标记点 */}
                            {markersRef.current.map((marker, index) => (
                                <div
                                    key={index}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{
                                        left: `${marker.x}%`,
                                        top: `${marker.y}%`
                                    }}
                                    onClick={() => handleMarkerClick(marker.plan)}
                                >
                                    {/* 标记点 */}
                                    <div 
                                        className="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 group-hover:shadow-xl z-10 relative"
                                        style={{ 
                                            backgroundColor: getStatusColor(marker.plan),
                                            boxShadow: `0 0 10px ${getStatusColor(marker.plan)}40`
                                        }}
                                    />
                                    
                                    {/* 波纹效果 */}
                                    <div 
                                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                                        style={{ 
                                            backgroundColor: getStatusColor(marker.plan),
                                            animationDuration: '2s'
                                        }}
                                    />

                                    {/* 悬浮信息卡片 */}
                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                        <div className="bg-secondary/95 backdrop-blur-lg border border-primary/30 rounded-lg p-3 min-w-[160px] shadow-xl">
                                            <Typography 
                                                variant="caption" 
                                                className="text-contrast font-bold block"
                                                sx={{ color: 'var(--text-contrast)' }}
                                            >
                                                {marker.plan.name}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary block mt-1"
                                                sx={{ color: 'var(--text-secondary)' }}
                                            >
                                                {new Date(marker.plan.start_time).toLocaleDateString('zh-CN')}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 中心指示器 */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-1 h-1 bg-accent-blue rounded-full opacity-50"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-primary/20">
                            <div className="text-center">
                                <MapIcon 
                                    sx={{ 
                                        fontSize: 48, 
                                        color: 'var(--text-muted)', 
                                        marginBottom: 2 
                                    }}
                                />
                                <Typography 
                                    variant="body2" 
                                    className="text-muted"
                                    sx={{ color: 'var(--text-muted)' }}
                                >
                                    暂无计划位置数据
                                </Typography>
                            </div>
                        </div>
                    )}
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-primary/20">
                    <div className="flex items-center space-x-2">
                        <div 
                            className="w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: 'var(--accent-green)' }}
                        />
                        <Typography 
                            variant="caption" 
                            className="text-secondary"
                            sx={{ color: 'var(--text-secondary)' }}
                        >
                            即将拍摄
                        </Typography>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div 
                            className="w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: 'var(--accent-orange)' }}
                        />
                        <Typography 
                            variant="caption" 
                            className="text-secondary"
                            sx={{ color: 'var(--text-secondary)' }}
                        >
                            已过期
                        </Typography>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PlanMapWidget; 