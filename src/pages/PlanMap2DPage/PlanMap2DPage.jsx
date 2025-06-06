import React, { useState, useEffect } from 'react';
import {useAuth} from "../../context/AuthProvider.jsx";
import {getPlan} from "../../api/plan.js";
import Map2DContainer from "../../components/Map2D/Map2DContainer.jsx";
import { useParams } from 'react-router-dom';
import { Spin, Alert } from "antd";
import "../../assets/style.css";
import Background from "../../components/Background/Background.jsx";
import AstronomicalLayer from "./components/AstronomicalLayer.jsx";

function PlanMap2DPage() {
    const {fetchWithAuth} = useAuth();
    const plan_id = useParams().id;
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [position, setPosition] = useState([null, null]);
    const [time, setTime] = useState(null);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                setError(null);
                const planData = await getPlan(plan_id, fetchWithAuth);
                setPlan(planData);
            } catch (err) {
                console.error('加载计划详情失败:', err);
                setError(err.message || '加载计划详情失败');
            } finally {
                setLoading(false);
                setPosition([plan.camera.position[0], plan.camera.position[1]]);
                setTime(plan.start_time);
            }
        };

        if (plan_id && fetchWithAuth) {
            loadPlan();
        }
    }, [plan_id, fetchWithAuth]);

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

    if (!plan || !plan.camera || !plan.camera.position) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black p-9">
                <Alert
                    message="数据错误"
                    description="计划数据或相机位置信息缺失"
                    type="warning"
                    showIcon
                    className="max-w-md"
                />
            </div>
        );
    }

    return (
       <div className="w-full h-full">
           <Background />
           {/* 地图容器 */}
           <div className='flex flex-col'>
                <div style={{ height: "500px"}} className='w-2/3 pt-16'>
                    <Map2DContainer lat={position[1]} lon={position[0]}>
                        <AstronomicalLayer lat={position[1]} lon={position[0]} time={time}/>
                    </Map2DContainer>
                </div>
                <div className="w-auto flex flex-row">
                    <div className="bg-primary/90 h-auto "></div>
                </div>
           </div>
       </div>
    );
}

export default PlanMap2DPage;