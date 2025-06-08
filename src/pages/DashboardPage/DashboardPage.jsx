import React, { useState, useEffect, useRef } from 'react';
import './DashboardPage.css';
import PlanCard from "../../components/PlanCard/PlanCard.jsx";
import {useAuth} from "../../context/AuthProvider.jsx";
import { getPlans } from "../../api/plan.js";
import Background from "../../components/Background/Background.jsx";
import DashboardMapWidget from "./components/DashboardMapWidget.jsx";
import { 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Avatar, 
    IconButton,
    Chip,
    Box
} from '@mui/material';
import { 
    Add, 
    Settings, 
    Schedule, 
    CameraAlt, 
    TrendingUp,
    CalendarToday,
    Edit,
    Map as MapIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isUTCFuture, formatUTCForDisplay, getCurrentUTC } from '../../utils/timeUtils';
import "../../assets/style.css";

const DashboardPage = () => {
    const [planList, setPlanList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const {user, fetchWithAuth} = useAuth()
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log('Current user:', user);
        
        // 获取计划列表
        const fetchPlans = async () => {
            if (!fetchWithAuth) {
                console.log('fetchWithAuth not ready yet');
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const plans = await getPlans({}, fetchWithAuth);
                console.log('获取计划列表成功:', plans);
                setPlanList(plans);
            } catch (err) {
                console.error('获取计划列表失败:', err);
                setError(err.message || '获取计划列表失败');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPlans();
    }, [])

    // 计算统计数据
    const getStatistics = () => {
        const nowUTC = getCurrentUTC();
        
        const recentPlans = planList.filter(plan => {
            if (!plan.created_at) return false;
            // 计算7天前的UTC时间
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(plan.created_at) >= sevenDaysAgo;
        });
        
        const upcomingPlans = planList.filter(plan => isUTCFuture(plan.start_time));
        
        return {
            total: planList.length,
            recent: recentPlans.length,
            upcoming: upcomingPlans.length
        };
    };

    // 获取最近编辑的计划
    const getRecentlyEditedPlans = () => {
        return [...planList]
            .filter(plan => plan.updated_at)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 3);
    };

    // 获取即将到期的计划
    const getUpcomingPlans = () => {
        return planList
            .filter(plan => isUTCFuture(plan.start_time))
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .slice(0, 3);
    };

    const handleCreateNewPlan = () => {
        navigate('/plans/new');
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    const handlePlanClick = (planId) => {
        navigate(`/plans/${planId}`);
    };

    const formatUserName = (user) => {
        if (user?.user_name) return user.user_name;
        if (user?.email) return user.email.split('@')[0];
        return '用户';
    };
    
    if (loading) {
        return (
            <>
                <Background />
                <div className="flex flex-col items-center justify-center h-screen">
                    <div 
                        className="text-contrast uppercase tracking-widest text-lg"
                        style={{
                            color: 'var(--text-contrast)',
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                            fontFamily: 'monospace'
                        }}
                    >
                        LOADING...
                    </div>
                </div>
            </>
        );
    }
    
    if (error) {
        return (
            <>
                <Background />
                <div className="flex flex-col items-center justify-center h-screen">
                    <div 
                        className="text-muted uppercase tracking-widest text-lg"
                        style={{
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace'
                        }}
                    >
                        ERROR: {error}
                    </div>
                </div>
            </>
        );
    }

    const statistics = getStatistics();
    const recentlyEdited = getRecentlyEditedPlans();
    const upcomingPlans = getUpcomingPlans();
    
    return(
        <>
            <Background />
            <div className="flex flex-col max-w-7xl mx-auto px-6 relative ">
                {/* 用户信息和标题 */}
                <div className="flex flex-col items-center justify-center h-auto mb-12 mt-32">
                    <div className="flex items-center space-x-6 mb-8">
                        <Avatar 
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
                            {formatUserName(user).charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="text-center">
                            <Typography 
                                variant="h3" 
                                className="text-contrast font-bold mb-4 uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    fontSize: '2.5rem',
                                    fontWeight: 600,
                                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'monospace'
                                }}
                            >
                                WELCOME BACK
                            </Typography>
                            <Typography 
                                variant="h6" 
                                className="text-primary mb-2 uppercase tracking-widest"
                                sx={{ 
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    fontWeight: 400,
                                    filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))'
                                }}
                            >
                                {formatUserName(user)}
                            </Typography>
                            <Typography 
                                variant="body1" 
                                className="text-secondary uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    fontWeight: 300
                                }}
                            >
                                PHOTOGRAPHY MISSION CONTROL
                            </Typography>
                        </div>
                        <IconButton
                            onClick={handleSettingsClick}
                            sx={{
                                color: 'var(--text-primary)',
                                border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                padding: '12px',
                                '&:hover': {
                                    backgroundColor: 'rgba(var(--bg-primary-rgb), 0.1)',
                                    borderColor: 'rgba(var(--border-primary-rgb), 0.5)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            <Settings sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </div>
                </div>

                {/* 统计信息和快捷操作 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {/* 总计划数 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-xl hover:scale-103 cursor-pointer"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                                boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.05) translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent className="p-6 text-center">
                            <CameraAlt 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'var(--accent-blue)', 
                                    marginBottom: 2,
                                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.3))',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                            <Typography 
                                variant="h2" 
                                className="text-contrast font-bold mb-2 tracking-wider"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {statistics.total.toString().padStart(2, '0')}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-secondary uppercase tracking-widest"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 300
                                }}
                            >
                                TOTAL PLANS
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 最近7天创建 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-xl hover:scale-103 cursor-pointer"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.05) translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent className="p-6 text-center">
                            <TrendingUp 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'var(--accent-green)', 
                                    marginBottom: 2,
                                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                            <Typography 
                                variant="h2" 
                                className="text-contrast font-bold mb-2 tracking-wider"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {statistics.recent.toString().padStart(2, '0')}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-secondary uppercase tracking-widest"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 300
                                }}
                            >
                                RECENT 7D
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 即将到来 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-xl hover:scale-103 cursor-pointer"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                                boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.05) translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent className="p-6 text-center">
                            <Schedule 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'var(--accent-orange)', 
                                    marginBottom: 2,
                                    filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                            <Typography 
                                variant="h2" 
                                className="text-contrast font-bold mb-2 tracking-wider"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {statistics.upcoming.toString().padStart(2, '0')}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-secondary uppercase tracking-widest"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 300
                                }}
                            >
                                UPCOMING
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 创建新计划 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 cursor-pointer transition-all duration-300 ease-out hover:border-accent/70 hover:shadow-xl hover:scale-103 group"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                                boxShadow: '0 0 30px rgba(14, 165, 233, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.05) translateY(-4px)'
                            }
                        }}
                        onClick={handleCreateNewPlan}
                    >
                        <CardContent className="p-6 text-center">
                            <Add 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'var(--accent-blue)', 
                                    marginBottom: 2,
                                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.3))',
                                    transition: 'all 0.3s ease'
                                }}
                                className="group-hover:scale-110"
                            />
                            <Typography 
                                variant="h6" 
                                className="text-contrast font-bold mb-2 uppercase tracking-wider"
                                sx={{ 
                                    color: 'var(--text-contrast)',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                CREATE NEW
                            </Typography>
                            <Typography 
                                variant="body2" 
                                className="text-secondary"
                                sx={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 300
                                }}
                            >
                                Begin New Journey
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                {/* 最近编辑和即将开始 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* 最近编辑的计划 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:scale-103 hover:shadow-xl"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.02) translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Edit 
                                        sx={{ 
                                            color: 'var(--accent-blue)', 
                                            marginRight: 1,
                                            filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                                        RECENT EDITS
                                    </Typography>
                                </div>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/plans')}
                                    sx={{ 
                                        color: 'var(--accent-blue)',
                                        fontSize: '0.75rem',
                                        fontWeight: 300,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                >
                                    VIEW ALL
                                </Button>
                            </div>
                            <div className="space-y-3 h-64 overflow-y-auto">
                                {recentlyEdited.length > 0 ? (
                                    recentlyEdited.map(plan => (
                                        <div 
                                            key={plan.id}
                                            className="p-4 bg-secondary/50 backdrop-blur-md rounded-lg border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:bg-secondary/70 hover:shadow-lg"
                                            onClick={() => handlePlanClick(plan.id)}
                                            style={{
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '';
                                            }}
                                        >
                                            <Typography 
                                                variant="body1" 
                                                className="text-contrast font-medium mb-2"
                                                sx={{ 
                                                    color: 'var(--text-contrast)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {plan.name}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                EDITED: {formatUTCForDisplay(plan.updated_at).date}
                                            </Typography>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Typography 
                                            variant="body2" 
                                            className="text-muted uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-muted)',
                                                fontSize: '0.8rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            NO RECENT EDITS
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 即将开始的计划 */}
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:scale-103 hover:shadow-xl"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                transform: 'scale(1.02) translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <CalendarToday 
                                        sx={{ 
                                            color: 'var(--accent-orange)', 
                                            marginRight: 1,
                                            filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                                        UPCOMING
                                    </Typography>
                                </div>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/plans')}
                                    sx={{ 
                                        color: 'var(--accent-orange)',
                                        fontSize: '0.75rem',
                                        fontWeight: 300,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                >
                                    VIEW ALL
                                </Button>
                            </div>
                            <div className="space-y-3 h-64 overflow-y-auto">
                                {upcomingPlans.length > 0 ? (
                                    upcomingPlans.map(plan => (
                                        <div 
                                            key={plan.id}
                                            className="p-4 bg-secondary/50 backdrop-blur-md rounded-lg border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:bg-secondary/70 hover:shadow-lg"
                                            onClick={() => handlePlanClick(plan.id)}
                                            style={{
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.2), 0 8px 25px -8px rgba(0, 0, 0, 0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '';
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Typography 
                                                    variant="body1" 
                                                    className="text-contrast font-medium"
                                                    sx={{ 
                                                        color: 'var(--text-contrast)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {plan.name}
                                                </Typography>
                                                <Chip
                                                    label="ACTIVE"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'var(--accent-green)',
                                                        color: 'var(--text-contrast)',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 600,
                                                        height: '20px',
                                                        filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))'
                                                    }}
                                                />
                                            </div>
                                            <Typography 
                                                variant="caption" 
                                                className="text-secondary uppercase tracking-wider"
                                                sx={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 300
                                                }}
                                            >
                                                {formatUTCForDisplay(plan.start_time).fullDateTime}
                                            </Typography>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Typography 
                                            variant="body2" 
                                            className="text-muted uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-muted)',
                                                fontSize: '0.8rem',
                                                fontWeight: 300
                                            }}
                                        >
                                            NO UPCOMING PLANS
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 所有计划 */}
                <div className="mb-8">
                    <Card 
                        className="bg-secondary/90 backdrop-blur-lg rounded-xl shadow-2xl border border-primary/30 transition-all duration-300 ease-out hover:shadow-xl"
                        sx={{ 
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 0 30px rgba(14, 165, 233, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            }
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                    <MapIcon 
                                        sx={{ 
                                            color: 'var(--accent-blue)', 
                                            marginRight: 1.5,
                                            filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    />
                                    <Typography 
                                        variant="h5" 
                                        className="text-contrast font-bold uppercase tracking-wider"
                                        sx={{ 
                                            color: 'var(--text-contrast)',
                                            fontSize: '1.2rem',
                                            fontWeight: 600,
                                            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        ALL PLANS
                                    </Typography>
                                </div>
                                <Button
                                    onClick={() => navigate('/plans')}
                                    sx={{ 
                                        color: 'var(--accent-blue)',
                                        fontSize: '0.8rem',
                                        fontWeight: 400,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        border: '1px solid rgba(var(--border-primary-rgb), 0.3)',
                                        padding: '6px 16px',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(var(--border-primary-rgb), 0.1)',
                                            borderColor: 'rgba(var(--border-primary-rgb), 0.5)'
                                        }
                                    }}
                                >
                                    MANAGE PLANS
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                            {planList.length > 0 ? (
                                                planList.map((plan, index) => (
                                                    <div key={plan.id} className="flex justify-center">
                                                        <PlanCard 
                                                            index={index} 
                                                            plan={plan} 
                                                        />
                                                    </div>
                                ))
                            ) : (
                                    <div className="col-span-full text-center py-16">
                                        <CameraAlt 
                                            sx={{ 
                                                fontSize: 80, 
                                                color: 'var(--text-muted)', 
                                                marginBottom: 3,
                                                filter: 'drop-shadow(0 0 10px rgba(107, 114, 128, 0.3))'
                                            }}
                                        />
                                        <Typography 
                                            variant="h5" 
                                            className="text-muted mb-6 uppercase tracking-wider"
                                            sx={{ 
                                                color: 'var(--text-muted)',
                                                fontSize: '1.1rem',
                                                fontWeight: 400
                                            }}
                                        >
                                            NO PLANS CREATED YET
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={handleCreateNewPlan}
                                            sx={{
                                                backgroundColor: 'var(--accent-blue)',
                                                color: 'var(--text-contrast)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                padding: '12px 24px',
                                                filter: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.4))',
                                                '&:hover': {
                                                    backgroundColor: 'var(--accent-blue-hover)',
                                                    transform: 'translateY(-1px)',
                                                    filter: 'drop-shadow(0 0 15px rgba(14, 165, 233, 0.6))'
                                                }
                                            }}
                                        >
                                            CREATE FIRST PLAN
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 地图组件 */}
                <div className="mb-8">
                    <DashboardMapWidget plans={planList} />
                </div>
            </div>
        </>
    )
};

export default DashboardPage;