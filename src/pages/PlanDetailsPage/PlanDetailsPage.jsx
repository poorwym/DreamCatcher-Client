import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {getPlan} from "../../api/plan.js";
import {useAuth} from "../../context/AuthProvider.jsx";
import {Button, Spin, Alert} from "antd";
import "../../assets/style.css"

function PlanDetailsPage() {
    const navigate = useNavigate();
    const plan_id = useParams().id;
    const {fetchWithAuth} = useAuth();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            }
        };

        if (plan_id && fetchWithAuth) {
            loadPlan();
        }
    }, [plan_id, fetchWithAuth]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen p-9">
                <Alert
                    message="加载失败"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex justify-center items-center min-h-screen p-9">
                <Alert
                    message="未找到计划"
                    description="请检查计划ID是否正确"
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-9">
            <div className="mt-32 max-w-6xl mx-auto">
                {/* 计划基本信息 */}
                <div className="mb-8 p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg border border-white border-opacity-20">
                    <h1 className="text-3xl font-bold mb-4 text-blue-300">{plan.name}</h1>
                    <p className="text-gray-300 mb-4">{plan.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-blue-400 font-semibold">开始时间：</span>
                            <span className="text-gray-300">{new Date(plan.start_time).toLocaleString('zh-CN')}</span>
                        </div>
                        <div>
                            <span className="text-blue-400 font-semibold">创建时间：</span>
                            <span className="text-gray-300">{new Date(plan.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                    </div>
                </div>

                {/* 相机信息 */}
                {plan.camera && (
                    <div className="mb-8 p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg border border-white border-opacity-20">
                        <h2 className="text-xl font-bold mb-4 text-blue-300">相机配置</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-blue-400 font-semibold">焦距：</span>
                                <span className="text-gray-300">{plan.camera.focal_length}mm</span>
                            </div>
                            <div>
                                <span className="text-blue-400 font-semibold">位置：</span>
                                <span className="text-gray-300">
                                    [{plan.camera.position?.join(', ')}]
                                </span>
                            </div>
                            <div>
                                <span className="text-blue-400 font-semibold">旋转：</span>
                                <span className="text-gray-300">
                                    [{plan.camera.rotation?.join(', ')}]
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="flex flex-row gap-4">
                    <Button
                        size="large"
                        type="primary"
                        className="bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-lg"
                        onClick={() => navigate(`/plans/${plan_id}/map2D`)}
                    >
                        2D 地图视图
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        className="bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-lg"
                        onClick={() => navigate(`/plans/${plan_id}/map3D`)}
                    >
                        3D 地图视图
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PlanDetailsPage;