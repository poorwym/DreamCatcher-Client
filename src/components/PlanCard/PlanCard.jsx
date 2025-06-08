import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { LocationOn, Schedule, Edit, Delete, CameraAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import "../../assets/style.css";
import "./PlanCard.css";
import { formatUTCForDisplay, isUTCFuture } from '../../utils/timeUtils';

// {
//   "name": "Sunset Time-lapse",
//   "description": "Capture sunset over the city skyline",
//   "start_time": "2025-06-11T02:30:00+08:00",
//   "camera": {
//       "focal_length": 35.0,
//       "position": [
//           120.1536,
//           30.2875,
//           100.0
//       ],
//       "rotation": [
//           0.0,
//           0.0,
//           0.0,
//           1.0
//       ]
//   },
//   "tileset_url": "https://example.com/tileset.json",
//   "user_id": "89f0f3a0-4c1e-4a41-bb8e-a786dd0828b4",
//   "id": "b000da98-a72c-48a3-81ec-a78d67f67204",
//   "created_at": "2025-06-05T21:44:31.003196+08:00",
//   "updated_at": "2025-06-05T21:44:31.003196+08:00"
// }

function PlanCard({ index, plan, onEdit, onDelete }) {
    const navigate = useNavigate();
    
    // 处理卡片点击事件
    const handleCardClick = (e) => {
        // 阻止在点击编辑/删除按钮时触发卡片点击
        if (e.target.closest('.action-buttons')) {
            return;
        }
        // 跳转到计划详情页面
        navigate(`/plans/${plan.id}`);
    };

    // 格式化时间显示 - 使用UTC时间工具
    const formatDateTime = (utcDateString) => {
        return formatUTCForDisplay(utcDateString, {
            dateFormat: 'YYYY年MM月DD日',
            timeFormat: 'HH:mm'
        });
    };

    // 格式化地理坐标显示
    const formatLocation = (position) => {
        // position 是数组格式 [经度, 纬度, 高度]
        if (Array.isArray(position) && position.length >= 2) {
            const [longitude, latitude, height] = position;
            const lonStr = `${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`;
            const latStr = `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? 'N' : 'S'}`;
            return height ? `${latStr}, ${lonStr} (${height}m)` : `${latStr}, ${lonStr}`;
        }
        return '未知位置';
    };

    const scheduledDateTime = formatDateTime(plan.start_time);

    return (
        <div 
            id={`plan-card-${index}`} 
            className="plan-card w-80 min-h-[280px] flex flex-col overflow-hidden bg-secondary/80 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(96,165,250,0.15)] hover:border-primary/50 z-50 cursor-pointer"
            onClick={handleCardClick}
        >
            {/* 顶部装饰栏 */}
            <div className="w-full h-9 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-orange)] flex-shrink-0"></div>
            
            {/* 内容区域 */}
            <div className="flex-1 p-6">
                {/* 标题和操作按钮 */}
                <div className="flex justify-between items-start mb-4">
                    <Typography 
                        variant="h5" 
                        className="text-contrast font-bold flex-1 mr-2 truncate max-w-[200px]"
                        sx={{ color: 'var(--text-contrast)' }}
                    >
                        {plan.name}
                    </Typography>
                    <div className="flex space-x-1 flex-shrink-0 action-buttons">
                        {onEdit && (
                            <IconButton
                                size="small"
                                onClick={() => onEdit(plan)}
                                sx={{
                                    color: 'var(--text-primary)',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-primary-hover)',
                                    }
                                }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        )}
                        {onDelete && (
                            <IconButton
                                size="small"
                                onClick={() => onDelete(plan)}
                                sx={{
                                    color: 'var(--accent-orange)',
                                    '&:hover': {
                                        backgroundColor: 'var(--bg-primary-hover)',
                                    }
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        )}
                    </div>
                </div>

                {/* 描述 */}
                {plan.description && (
                    <Typography 
                        variant="body2" 
                        className="text-secondary mb-4 leading-relaxed line-clamp-3"
                        sx={{ color: 'var(--text-secondary)' }}
                    >
                        {plan.description}
                    </Typography>
                )}

                {/* 位置信息 */}
                <div className="flex items-start mb-3">
                    <LocationOn 
                        fontSize="small" 
                        sx={{ color: 'var(--accent-orange)', marginRight: 1, marginTop: 0.2 }}
                    />
                    <div className="flex flex-col flex-1">
                        <Typography 
                            variant="body2" 
                            className="text-main truncate max-w-[240px]"
                            sx={{ color: 'var(--text-main)' }}
                        >
                            {plan.camera ? formatLocation(plan.camera.position) : '未知位置'}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            className="text-secondary mt-1"
                            sx={{ color: 'var(--text-secondary)' }}
                        >
                            GPS坐标
                        </Typography>
                    </div>
                </div>

                {/* 相机配置信息 */}
                {plan.camera && (
                    <div className="flex items-center mb-3">
                        <CameraAlt 
                            fontSize="small" 
                            sx={{ color: 'var(--accent-blue)', marginRight: 1 }}
                        />
                        <Typography 
                            variant="body2" 
                            className="text-main"
                            sx={{ color: 'var(--text-main)' }}
                        >
                            焦距: {plan.camera.focal_length}mm
                        </Typography>
                    </div>
                )}

                {/* 时间信息 */}
                <div className="flex items-center mb-4">
                    <Schedule 
                        fontSize="small" 
                        sx={{ color: 'var(--accent-blue)', marginRight: 1 }}
                    />
                    <div className="flex flex-col">
                        <Typography 
                            variant="body2" 
                            className="text-main font-medium"
                            sx={{ color: 'var(--text-main)' }}
                        >
                            {scheduledDateTime.date}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            className="text-secondary"
                            sx={{ color: 'var(--text-secondary)' }}
                        >
                            {scheduledDateTime.time}
                        </Typography>
                    </div>
                </div>

                {/* 状态标签 */}
                <div className="flex justify-between items-center">
                    <Chip
                        label={isUTCFuture(plan.start_time) ? "待拍摄" : "已过期"}
                        size="small"
                        sx={{
                            backgroundColor: isUTCFuture(plan.start_time)
                                ? 'var(--accent-green)' 
                                : 'var(--accent-orange)',
                            color: 'var(--text-contrast)',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                        }}
                    />
                    
                    {/* 创建时间 */}
                    <Typography 
                        variant="caption" 
                        className="text-muted"
                        sx={{ color: 'var(--text-muted)' }}
                    >
                        创建于 {formatDateTime(plan.created_at).date}
                    </Typography>
                </div>
            </div>
        </div>
    );
}

export default PlanCard;