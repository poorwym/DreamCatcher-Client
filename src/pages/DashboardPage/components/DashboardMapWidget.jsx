import React, { useMemo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import Map2DContainer from '../../../components/Map2D/Map2DContainer.jsx';
import PointLayer from './PointLayer.jsx';
import "../../../assets/style.css";

const DashboardMapWidget = ({ plans }) => {
    // 计算地图中心点和缩放级别
    const mapConfig = useMemo(() => {
        if (!plans || plans.length === 0) {
            return {
                center: { lat: 39.9042, lon: 116.4074 }, // 默认北京
                zoom: 10,
                hasPlans: false
            };
        }

        // 过滤出有位置信息的计划
        const plansWithLocation = plans.filter(plan => 
            plan.camera && 
            plan.camera.position && 
            Array.isArray(plan.camera.position) && 
            plan.camera.position.length >= 2
        );

        if (plansWithLocation.length === 0) {
            return {
                center: { lat: 39.9042, lon: 116.4074 },
                zoom: 10,
                hasPlans: false
            };
        }

        // 计算边界
        const positions = plansWithLocation.map(plan => plan.camera.position);
        const lats = positions.map(pos => pos[1]);
        const lons = positions.map(pos => pos[0]);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        // 计算中心点
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        // 计算缩放级别
        const latDiff = maxLat - minLat;
        const lonDiff = maxLon - minLon;
        const maxDiff = Math.max(latDiff, lonDiff);
        
        let zoom = 10;
        if (maxDiff < 0.01) zoom = 15;
        else if (maxDiff < 0.05) zoom = 13;
        else if (maxDiff < 0.1) zoom = 12;
        else if (maxDiff < 0.5) zoom = 10;
        else if (maxDiff < 1) zoom = 8;
        else zoom = 6;

        return {
            center: { lat: centerLat, lon: centerLon },
            zoom: zoom,
            hasPlans: true,
            planCount: plansWithLocation.length
        };
    }, [plans]);

    return (
        <Card 
            className="bg-secondary/90 backdrop-blur-lg border border-primary/30 transition-all duration-300 ease-out hover:shadow-xl"
            sx={{
                background: 'transparent',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }
            }}
        >
            <CardContent className="pb-3 pt-6 flex flex-col bg-transparent">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <MapIcon 
                            sx={{ 
                                color: 'var(--accent-blue)', 
                                marginRight: 1,
                                filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))'
                            }}
                        />
                        <Typography 
                            variant="h6" 
                            className="text-contrast font-bold uppercase tracking-wider"
                            sx={{ 
                                color: 'var(--text-contrast)',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            计划地图分布
                        </Typography>
                    </div>
                    <div className="text-right">
                        <Typography 
                            variant="body2" 
                            className="text-secondary uppercase tracking-wider"
                            sx={{ 
                                color: 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: 300
                            }}
                        >
                            {mapConfig.hasPlans ? `${mapConfig.planCount} 个位置` : '暂无数据'}
                        </Typography>
                    </div>
                </div>

                {/* 地图容器 */}
                <div className="flex-1 relative">
                    {mapConfig.hasPlans ? (
                            <Map2DContainer
                                lat={mapConfig.center.lat}
                                lon={mapConfig.center.lon}
                                zoom={mapConfig.zoom}
                                height="300px"
                            >
                                <PointLayer plans={plans} />
                            </Map2DContainer>
                    ) : (
                        <div className="w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-primary/20">
                            <div className="text-center">
                                <MapIcon 
                                    sx={{ 
                                        fontSize: 48, 
                                        color: 'var(--text-muted)', 
                                        marginBottom: 2,
                                        filter: 'drop-shadow(0 0 10px rgba(107, 114, 128, 0.3))'
                                    }}
                                />
                                <Typography 
                                    variant="body1" 
                                    className="text-muted uppercase tracking-wider mb-2"
                                    sx={{ 
                                        color: 'var(--text-muted)',
                                        fontSize: '0.9rem',
                                        fontWeight: 400
                                    }}
                                >
                                    暂无位置数据
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    className="text-muted"
                                    sx={{ 
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 300
                                    }}
                                >
                                    创建计划时请添加相机位置信息
                                </Typography>
                            </div>
                        </div>
                    )}
                </div>

                {/* 图例 */}
                {mapConfig.hasPlans && (
                    <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-primary/20">
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ 
                                    backgroundColor: '#10B981',
                                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)'
                                }}
                            />
                            <Typography 
                                variant="caption" 
                                className="text-secondary uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 300
                                }}
                            >
                                即将拍摄
                            </Typography>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ 
                                    backgroundColor: '#F59E0B',
                                    boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)'
                                }}
                            />
                            <Typography 
                                variant="caption" 
                                className="text-secondary uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 300
                                }}
                            >
                                已过期
                            </Typography>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DashboardMapWidget; 