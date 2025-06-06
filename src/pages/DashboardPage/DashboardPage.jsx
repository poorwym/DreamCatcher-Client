import React, { useState, useEffect, useRef } from 'react';
import './DashboardPage.css';
import PlanCard from "../../components/PlanCard/PlanCard.jsx";
import {useAuth} from "../../context/AuthProvider.jsx";
import { getPlans } from "../../api/plan.js";

const DashboardPage = () => {
    const [planList, setPlanList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const {user, fetchWithAuth} = useAuth()
    
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
    }, [user, fetchWithAuth])
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-auto">
                <div className="text-white">加载中...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-auto">
                <div className="text-red-500">错误: {error}</div>
            </div>
        );
    }
    
    return(
        <>
            <div className="flex flex-col items-center justify-center h-auto">
                {planList.length > 0 ? (
                    planList.map((plan, index) => (
                        <PlanCard key={plan.plan_id || index} plan={plan} />
                    ))
                ) : (
                    <div className="text-white">暂无计划</div>
                )}
            </div>
        </>
    )
};

export default DashboardPage;