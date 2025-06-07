import React, { useState, useEffect } from 'react';
import {useAuth} from "../../context/AuthProvider.jsx";
import {getPlan, updatePlan} from "../../api/plan.js";
import Map2DContainer from "../../components/Map2D/Map2DContainer.jsx";
import { useParams } from 'react-router-dom';
import { Spin, Alert, message } from "antd";
import { Button } from '@mui/material';
import "../../assets/style.css";
import Background from "../../components/Background/Background.jsx";
import AstronomicalLayer from "./components/AstronomicalLayer.jsx";
import CameraController from "./components/CameraController.jsx";
import TimeController from "./components/TimeController.jsx";
import AstronomicalWidget from "./components/AstronomicalWidget.jsx";
import EventLayer from "../../components/Map2D/Layers/EventLayer.jsx";

function PlanMap2DPage() {
    const {fetchWithAuth} = useAuth();
    const plan_id = useParams().id;
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [time, setTime] = useState(null);
    const [camera, setCamera] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(16);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                setError(null);
                const planData = await getPlan(plan_id, fetchWithAuth);
                setPlan(planData);
                // 设置位置和时间数据
                if (planData && planData.camera && planData.camera.position) {
                    setTime(planData.start_time);
                    setCamera(planData.camera);
                }
            } catch (err) {
                console.error('加载计划详情失败:', err);
                setError(err.message || '加载计划详情失败');
            } finally {
                setLoading(false);
            }
        };

        if (plan_id && fetchWithAuth) {
            loadPlan();
        }
    }, [plan_id, fetchWithAuth]);

    const handleUpdatePlan = async () => {
        if (!plan || !camera || !time) {
            message.error('缺少必要的计划数据');
            return;
        }

        try {
            setIsUpdating(true);
            
            // 构建更新数据
            const updateData = {
                start_time: time,
                camera: {
                    ...camera,
                    position: [camera.position[0], camera.position[1], camera.position[2] || 0]
                }
            };

            const updatedPlan = await updatePlan(plan_id, updateData, fetchWithAuth);
            setPlan(updatedPlan);
            message.success('计划更新成功！');
        } catch (err) {
            console.error('更新计划失败:', err);
            message.error(err.message || '更新计划失败');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="text-white mt-4 text-lg">正在加载地图数据...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black p-9">
                <Alert
                    message="加载失败"
                    description={error}
                    type="error"
                    showIcon
                    className="max-w-md"
                />
            </div>
        );
    }

    if (!plan || !plan.camera || !plan.camera.position || !time) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black p-9">
                <Alert
                    message="数据错误"
                    description="计划数据、相机位置信息或时间信息缺失"
                    type="warning"
                    showIcon
                    className="max-w-md"
                />
            </div>
        );
    }

    const onMapClick = (latlng) => {
        setCamera(
            {
                    ...camera,
                    position: [latlng.lng, latlng.lat, camera.position[2] | 0],
            }
        );
    }

    const onMapZoom = (zoomLevel) => {
        setZoomLevel(zoomLevel);
    }

    return (
       <div className="w-full min-h-screen">
           <Background />
           {/* 地图容器 - 响应式布局 */}
           <div className='flex flex-col lg:flex-row lg:justify-left w-full min-h-screen lg:h-screen overflow-x-visible'>
                {/* 地图区域 */}
                <div className='w-full lg:w-2/3 h-96 lg:h-screen pt-20 pl-4 lg:fixed lg:top-0 lg:left-0 overflow-x-visible'>
                    <Map2DContainer 
                        lat={camera.position[1]} 
                        lon={camera.position[0]} 
                        zoom={16} 
                        height="800px"
                    >
                        <AstronomicalLayer lat={camera.position[1]} lon={camera.position[0]} time={time} zoomLevel={zoomLevel}/>
                        <EventLayer onClick={onMapClick} onZoom={onMapZoom} />
                    </Map2DContainer>
                </div>
                
                {/* 控制面板区域 */}
                <div className="w-full lg:w-1/3 lg:fixed lg:top-0 lg:right-0 lg:h-screen overflow-y-auto overflow-x-visible pt-6 lg:pt-24 px-5 lg:pr-10 lg:pl-5">
                    <div className="flex flex-col pb-8 overflow-visible">
                        {/* 相机控制组件 */}
                        <CameraController camera={camera} setCamera={setCamera} />
                        
                        {/* 时间控制组件 */}
                        <TimeController time={time} setTime={setTime} />
                        
                        {/* 天文信息显示组件 */}
                        <AstronomicalWidget lon={camera.position[0]} lat={camera.position[1]} time={time} />
                        
                        {/* 更新计划按钮 */}
                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            disabled={isUpdating || loading}
                            onClick={handleUpdatePlan}
                            className="!mb-10"
                            sx={{
                                backgroundColor: 'var(--text-primary)',
                                color: 'var(--text-contrast)',
                                padding: '12px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'var(--accent-blue)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'var(--text-muted)',
                                    color: 'var(--text-secondary)',
                                }
                            }}
                        >
                            {isUpdating ? '更新中...' : '更新计划'}
                        </Button>
                    </div>
                </div>
           </div>
       </div>
    );
}

export default PlanMap2DPage;