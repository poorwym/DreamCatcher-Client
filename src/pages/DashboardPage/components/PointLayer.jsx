import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import "../../../assets/style.css";
import "./PointLayer.css";

/**
 * 创建计划标记图标
 * @param {string} status - 计划状态 ('upcoming' | 'past')
 * @param {number} size - 图标大小
 * @returns {L.Icon} Leaflet图标
 */
const createPlanIcon = (status = 'upcoming', size = 32) => {
  const color = status === 'upcoming' ? '#10B981' : '#F59E0B'; // green for upcoming, orange for past
  const glowColor = status === 'upcoming' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)';
  
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Glow effect -->
      <defs>
        <filter id="glow-${status}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Outer ring -->
      <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.3" filter="url(#glow-${status})"/>
      <circle cx="12" cy="12" r="9" fill="${color}" opacity="0.6"/>
      
      <!-- Camera icon -->
      <g transform="translate(12,12)" fill="white">
        <path transform="translate(-6,-6)" d="M4 4h2l2-2h4l2 2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="white" stroke-width="1"/>
        <circle transform="translate(-6,-6)" cx="8" cy="10" r="3" stroke="white" stroke-width="1"/>
      </g>
      
      <!-- Pulse animation -->
      <circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-width="1" opacity="0.8">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-plan-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

/**
 * PointLayer组件
 * 在地图上显示所有计划的位置标记
 */
const PointLayer = ({ plans }) => {
  const navigate = useNavigate();

  // 过滤出有位置信息的计划
  const plansWithLocation = plans?.filter(plan => 
    plan.camera && 
    plan.camera.position && 
    Array.isArray(plan.camera.position) && 
    plan.camera.position.length >= 2
  ) || [];

  const handlePlanClick = (plan) => {
    navigate(`/plans/${plan.id}`);
  };

  const getPlanStatus = (plan) => {
    const now = new Date();
    const startTime = new Date(plan.start_time);
    return startTime > now ? 'upcoming' : 'past';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    return status === 'upcoming' ? '即将拍摄' : '已过期';
  };

  const getStatusColor = (status) => {
    return status === 'upcoming' ? 'text-green-400' : 'text-orange-400';
  };

  return (
    <>
      {plansWithLocation.map((plan) => {
        const [lon, lat] = plan.camera.position;
        const status = getPlanStatus(plan);
        
        return (
          <Marker
            key={plan.id}
            position={[lat, lon]}
            icon={createPlanIcon(status, 36)}
          >
                         <Popup>
               <div 
                 className="p-3 min-w-[200px] rounded-lg text-center"
                 style={{
                   backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.95)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(var(--border-primary-rgb), 0.3)'
                 }}
               >
                 {/* 计划名称 */}
                 <h3 
                   className="font-bold text-lg mb-2"
                   style={{ color: 'var(--text-contrast)' }}
                 >
                   📷 {plan.name}
                 </h3>
                 
                 {/* 状态标识 */}
                 <div 
                   className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${getStatusColor(status)}`}
                   style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                 >
                   {getStatusText(status)}
                 </div>
                 
                 {/* 计划信息 */}
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span 
                       className="font-medium"
                       style={{ color: 'var(--text-secondary)' }}
                     >
                       拍摄时间:
                     </span>
                     <span style={{ color: 'var(--text-contrast)' }}>
                       {formatDateTime(plan.start_time)}
                     </span>
                   </div>
                   
                   <div className="flex justify-between">
                     <span 
                       className="font-medium"
                       style={{ color: 'var(--text-secondary)' }}
                     >
                       位置:
                     </span>
                     <span style={{ color: 'var(--text-contrast)' }}>
                       {lat.toFixed(4)}°, {lon.toFixed(4)}°
                     </span>
                   </div>
                   
                   {plan.description && (
                     <div 
                       className="mt-3 pt-2"
                       style={{ borderTop: '1px solid rgba(var(--border-primary-rgb), 0.2)' }}
                     >
                       <p 
                         className="text-xs"
                         style={{ color: 'var(--text-secondary)' }}
                       >
                         {plan.description.length > 50 
                           ? `${plan.description.substring(0, 50)}...` 
                           : plan.description
                         }
                       </p>
                     </div>
                   )}
                 </div>
                
                {/* 查看详情按钮 */}
                <button
                  onClick={() => handlePlanClick(plan)}
                  className="mt-4 w-full px-3 py-2 bg-accent-blue/80 hover:bg-accent-blue text-white rounded-md transition-all duration-300 text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(14, 165, 233, 1)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(14, 165, 233, 0.8)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '';
                  }}
                >
                  查看详情
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default PointLayer;
