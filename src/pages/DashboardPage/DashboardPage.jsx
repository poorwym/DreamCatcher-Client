import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout';
import imageService from '../../services/imageService';
import HybridPlanStorage, { DATA_SOURCE } from '../../services/hybridPlanStorage';
import { checkAPIConnection } from '../../services/apiService';
import { FaBullseye, FaCamera } from 'react-icons/fa';
import { AiOutlineClockCircle } from 'react-icons/ai';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    recentPlans: 0,
    upcomingPlans: 0
  });
  
  const totalPlans = stats.recentPlans + stats.upcomingPlans;

  const [recentPlans, setRecentPlans] = useState([]);
  const [upcomingPlans, setUpcomingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: '检查中...' });
  const [dataSource, setDataSource] = useState({ source: DATA_SOURCE.UNKNOWN, error: null });
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // 景点坐标数据
  const locationCoordinates = {
    '黄山': { longitude: 118.1670, latitude: 30.1304, name: '黄山日出' },
    '西湖': { longitude: 120.1551, latitude: 30.2294, name: '西湖黄昏' },
    '张家界': { longitude: 110.4790, latitude: 29.1269, name: '张家界森林' },
    '桂林': { longitude: 110.2990, latitude: 25.2740, name: '桂林山水' },
    '三亚': { longitude: 109.5122, latitude: 18.2528, name: '三亚海滩' },
    '长城': { longitude: 116.5704, latitude: 40.4319, name: '长城星轨' },
    '泰山': { longitude: 117.1340, latitude: 36.2540, name: '泰山日出' },
    '玉龙雪山': { longitude: 100.1870, latitude: 27.1090, name: '玉龙雪山' }
  };

  // 检查API连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkAPIConnection();
        setApiStatus(status);
        console.log('🌐 API状态:', status);
      } catch (error) {
        setApiStatus({ connected: false, message: '连接检查失败' });
      }
    };

    checkConnection();
  }, []);

  // 当计划数据变化时更新统计信息
  useEffect(() => {
    setStats({
      recentPlans: recentPlans.length,
      upcomingPlans: upcomingPlans.length
    });
  }, [recentPlans, upcomingPlans]);

  // 获取图片数据 - 使用混合存储服务
  useEffect(() => {
    const loadImagesForPlans = async () => {
      setLoading(true);
      
      try {
        console.log('🔄 开始从混合存储加载计划数据...');
        
        const [recentResult, upcomingResult] = await Promise.all([
          HybridPlanStorage.getRecentPlans(),
          HybridPlanStorage.getUpcomingPlans()
        ]);

        // 更新数据源状态
        const overallSource = recentResult.source === DATA_SOURCE.LOCAL || upcomingResult.source === DATA_SOURCE.LOCAL
          ? DATA_SOURCE.LOCAL
          : recentResult.source === DATA_SOURCE.API && upcomingResult.source === DATA_SOURCE.API
          ? DATA_SOURCE.API
          : DATA_SOURCE.UNKNOWN;

        const combinedError = [recentResult.error, upcomingResult.error].filter(Boolean).join('; ');
        
        setDataSource({ 
          source: overallSource, 
          error: combinedError || null 
        });

        console.log('📊 混合存储返回数据:', {
          recent: recentResult.data.length,
          upcoming: upcomingResult.data.length,
          recentSource: recentResult.source,
          upcomingSource: upcomingResult.source,
          errors: combinedError
        });

        // 为最近计划获取图片
        const recentPlansWithImages = await Promise.all(
          recentResult.data.map(async (plan) => {
            try {
              const imageData = await imageService.getImageByTags(plan.location, plan.tags);
              return {
                ...plan,
                thumbnail: imageData.thumbnail,
                imageUrl: imageData.url,
                imageAlt: imageData.alt,
                photographer: imageData.photographer,
                photographerUrl: imageData.photographerUrl
              };
            } catch (error) {
              console.error(`加载 ${plan.name} 的图片失败:`, error);
              return {
                ...plan,
                thumbnail: `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(plan.location)}`,
                imageUrl: `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(plan.location)}`,
                imageAlt: `${plan.location}的占位图片`,
                photographer: '占位图片',
                photographerUrl: '#'
              };
            }
          })
        );

        // 为即将拍摄的计划获取图片
        const upcomingPlansWithImages = await Promise.all(
          upcomingResult.data.map(async (plan) => {
            try {
              const imageData = await imageService.getImageByTags(plan.location, plan.tags);
              return {
                ...plan,
                thumbnail: imageData.thumbnail,
                imageUrl: imageData.url,
                imageAlt: imageData.alt,
                photographer: imageData.photographer,
                photographerUrl: imageData.photographerUrl
              };
            } catch (error) {
              console.error(`加载 ${plan.name} 的图片失败:`, error);
              return {
                ...plan,
                thumbnail: `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(plan.location)}`,
                imageUrl: `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(plan.location)}`,
                imageAlt: `${plan.location}的占位图片`,
                photographer: '占位图片',
                photographerUrl: '#'
              };
            }
          })
        );

        setRecentPlans(recentPlansWithImages);
        setUpcomingPlans(upcomingPlansWithImages);
        
        console.log('✅ 计划数据加载完成');
      } catch (error) {
        console.error('❌ 加载计划数据失败:', error);
        setRecentPlans([]);
        setUpcomingPlans([]);
        setDataSource({ source: DATA_SOURCE.UNKNOWN, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadImagesForPlans();
  }, []);

  // 初始化地图
  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      if (typeof window.L === 'undefined') {
        console.warn('Leaflet未加载，渲染备用地图');
        renderFallbackMap();
        return;
      }

      const map = window.L.map(mapContainerRef.current, {
        center: [35.0, 104.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
      });

      mapRef.current = map;

      window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        subdomains: '1234'
      }).addTo(map);

      addPlanMarkers(map);

      console.log('✅ 地图初始化成功');
    } catch (error) {
      console.error('❌ 地图初始化失败:', error);
      renderFallbackMap();
    }
  };

  // 添加计划标记
  const addPlanMarkers = (map) => {
    const allPlans = [...recentPlans, ...upcomingPlans];
    const colors = ['#FF6B35', '#4ECDC4', '#56AB2F', '#667EEA', '#FF9A9E'];
    
    allPlans.forEach((plan, index) => {
      const coords = locationCoordinates[plan.location];
      if (!coords) {
        if (plan.latitude && plan.longitude) {
          const customCoords = {
            latitude: parseFloat(plan.latitude),
            longitude: parseFloat(plan.longitude)
          };
          addSingleMarker(map, plan, customCoords, colors[index % colors.length]);
        }
        return;
      }

      addSingleMarker(map, plan, coords, colors[index % colors.length]);
    });
  };

  // 添加单个标记
  const addSingleMarker = (map, plan, coords, color) => {
    const customIcon = window.L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">📷</div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = window.L.marker([coords.latitude, coords.longitude], {
      icon: customIcon
    }).addTo(map);

    let popupContent = `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: ${color};">${plan.name}</h3>
    `;

    if (plan.thumbnail) {
      popupContent += `
        <div style="width: 100%; height: 100px; overflow: hidden; margin-bottom: 10px; border-radius: 4px;">
          <img 
            src="${plan.thumbnail}" 
            alt="${plan.imageAlt || plan.name}" 
            style="width: 100%; height: 100%; object-fit: cover;"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/${color.substring(1)}/ffffff?text=${encodeURIComponent(plan.location)}';"
          />
        </div>
      `;
    }

    popupContent += `
        <p style="margin: 5px 0;"><strong>📍 地点:</strong> ${plan.location}</p>
        <p style="margin: 5px 0;"><strong>📅 日期:</strong> ${plan.shootingDate || plan.date}</p>
        <p style="margin: 5px 0;"><strong>🏷️ 标签:</strong> ${plan.tags.join(', ')}</p>
        <div style="margin-top: 10px;">
          <a href="/plans/${plan.id}" style="
            background: ${color};
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
          ">查看详情</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);
  };

  // 备用地图
  const renderFallbackMap = () => {
    if (!mapContainerRef.current) return;

    const allPlans = [...recentPlans, ...upcomingPlans];
    const colors = ['#FF6B35', '#4ECDC4', '#56AB2F', '#667EEA', '#FF9A9E'];

    mapContainerRef.current.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
        border-radius: 10px;
      ">
        <div style="
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: white;
          z-index: 10;
        ">
          <h3 style="margin: 0; font-size: 24px;">🗺️ 摄影计划分布图</h3>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">点击查看计划详情</p>
        </div>
        
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 80%;
          opacity: 0.1;
          background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 800\"><path d=\"M300 200 L700 200 L800 400 L700 600 L300 600 L200 400 Z\" fill=\"white\" opacity=\"0.3\"/></svg>');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        "></div>
        
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 5;
        ">
          ${allPlans.map((plan, index) => {
            let coords = locationCoordinates[plan.location];
            
            if (!coords && plan.latitude && plan.longitude) {
              coords = {
                latitude: parseFloat(plan.latitude),
                longitude: parseFloat(plan.longitude)
              };
            }
            
            if (!coords) return '';
            
            const x = ((coords.longitude - 70) / (140 - 70)) * 100;
            const y = ((coords.latitude - 15) / (55 - 15)) * 100;
            const color = colors[index % colors.length];
            
            return `
              <div 
                class="location-marker" 
                data-plan='${JSON.stringify({
                  ...plan,
                  date: plan.shootingDate || plan.date
                })}'
                style="
                  position: absolute;
                  left: ${x}%;
                  top: ${100 - y}%;
                  transform: translate(-50%, -50%);
                  width: 50px;
                  height: 50px;
                  background: ${color};
                  border: 4px solid white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  z-index: 10;
                "
                onmouseover="this.style.transform='translate(-50%, -50%) scale(1.2)'"
                onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'"
                onclick="showPlanDetails(this)"
                title="${plan.name} - ${plan.location}"
              >📷</div>
            `;
          }).join('')}
        </div>
        
        <div id="plan-popup" style="
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          min-width: 280px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          display: none;
          z-index: 20;
        ">
          <div id="popup-content"></div>
          <button onclick="document.getElementById('plan-popup').style.display='none'" style="
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        
        <div style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 15px;
          z-index: 10;
        ">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">图例</h4>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <div style="width: 20px; height: 20px; background: #FF6B35; border-radius: 50%;"></div>
              <span>已完成计划</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <div style="width: 20px; height: 20px; background: #4ECDC4; border-radius: 50%;"></div>
              <span>即将拍摄</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加全局函数
    window.showPlanDetails = (element) => {
      const planData = JSON.parse(element.dataset.plan);
      const popup = document.getElementById('plan-popup');
      const content = document.getElementById('popup-content');
      
      let contentHTML = `
        <h3 style="margin: 0 0 10px 0; color: #333;">${planData.name}</h3>
      `;
      
      if (planData.thumbnail) {
        contentHTML += `
          <div style="width: 100%; height: 120px; overflow: hidden; margin-bottom: 10px; border-radius: 6px;">
            <img 
              src="${planData.thumbnail}" 
              alt="${planData.imageAlt || planData.name}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(planData.location)}';"
            />
          </div>
        `;
      }
      
      contentHTML += `
        <p style="margin: 5px 0; color: #666;"><strong>📍 地点:</strong> ${planData.location}</p>
        <p style="margin: 5px 0; color: #666;"><strong>📅 日期:</strong> ${planData.date}</p>
        <p style="margin: 5px 0; color: #666;"><strong>🏷️ 标签:</strong> ${planData.tags.join(', ')}</p>
        <div style="margin-top: 15px;">
          <a href="/plans/${planData.id}" style="
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            display: inline-block;
          ">查看详情 →</a>
        </div>
      `;
      
      content.innerHTML = contentHTML;
      popup.style.display = 'block';
    };

    console.log('✅ 交互式备用地图渲染完成');
  };

  // 初始化地图
  useEffect(() => {
    if (loading || (!recentPlans.length && !upcomingPlans.length)) {
      return;
    }

    if (typeof window.L === 'undefined') {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setTimeout(initializeMap, 100);
      script.onerror = () => setTimeout(renderFallbackMap, 100);
      document.head.appendChild(script);
    } else {
      setTimeout(initializeMap, 100);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn('地图清理时出现错误:', error);
        }
      }
      if (window.showPlanDetails) {
        delete window.showPlanDetails;
      }
    };
  }, [loading, recentPlans, upcomingPlans]);

  return (
    <PageLayout title="仪表盘">
      <div className="dashboard-container">
        {/* API连接状态指示器 */}
        <div className={`api-status ${apiStatus.connected ? 'connected' : 'disconnected'}`}>
          {apiStatus.connected ? '✅ API已连接' : '❌ ' + apiStatus.message}
        </div>

        {/* 数据源状态指示器 */}
        {dataSource.source !== DATA_SOURCE.UNKNOWN && (
          <div className={`data-source-status ${dataSource.source === DATA_SOURCE.API ? 'success' : 'warning'}`}>
            {dataSource.source === DATA_SOURCE.API 
              ? '📡 数据来自API服务器' 
              : `⚠️ API连接失败，显示本地缓存数据${dataSource.error ? ` (${dataSource.error})` : ''}`
            }
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>
              <FaBullseye style={{ marginRight: 6, color: '#667eea' }} />
              计划总数
            </h3>
            <div className="stat-value">{totalPlans}</div>
          </div>
          <div className="stat-card">
            <h3>
              <AiOutlineClockCircle style={{ marginRight: 6, color: '#ff9800' }} />
              最近创建
            </h3>
            <div className="stat-value">{stats.recentPlans}</div>
          </div>
          <div className="stat-card">
            <h3>
              <FaCamera style={{ marginRight: 6, color: '#4ecdc4' }} />
              即将拍摄
            </h3>
            <div className="stat-value">{stats.upcomingPlans}</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/plans/new" className="action-button">
            <span className="action-icon">+</span>
            <span>创建新计划</span>
          </Link>
          <Link to="/plans" className="action-button secondary">
            <span>查看所有计划</span>
          </Link>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>最近计划</h2>
              <Link to="/plans" className="view-all">查看全部</Link>
            </div>
            <div className="plan-cards">
              {loading ? (
                <div className="loading-placeholder">
                  <p>正在加载数据...</p>
                </div>
              ) : recentPlans.length === 0 ? (
                <div className="empty-placeholder">
                  <p>📋 暂无最近计划</p>
                  {dataSource.source === DATA_SOURCE.LOCAL && (
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      (本地缓存数据)
                    </p>
                  )}
                </div>
              ) : (
                recentPlans.map(plan => (
                  <Link to={`/plans/${plan.id}`} key={plan.id} className="plan-card">
                    <div 
                      className="plan-thumbnail" 
                      style={{ backgroundImage: `url(${plan.thumbnail})` }}
                      title={plan.imageAlt}
                    >
                    </div>
                    <div className="plan-info">
                      <h3>{plan.name}</h3>
                      <div className="plan-meta">
                        <span className="plan-location">{plan.location}</span>
                        <span className="plan-date">{plan.shootingDate || plan.date}</span>
                      </div>
                      {plan.tags && (
                        <div className="plan-tags">
                          {plan.tags.map(tag => (
                            <span key={tag} className="plan-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>即将拍摄</h2>
            </div>
            <div className="plan-cards">
              {loading ? (
                <div className="loading-placeholder">
                  <p>正在加载数据...</p>
                </div>
              ) : upcomingPlans.length === 0 ? (
                <div className="empty-placeholder">
                  <p>📅 暂无即将拍摄的计划</p>
                  {dataSource.source === DATA_SOURCE.LOCAL && (
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      (本地缓存数据)
                    </p>
                  )}
                </div>
              ) : (
                upcomingPlans.map(plan => (
                  <Link to={`/plans/${plan.id}`} key={plan.id} className="plan-card">
                    <div 
                      className="plan-thumbnail" 
                      style={{ backgroundImage: `url(${plan.thumbnail})` }}
                      title={plan.imageAlt}
                    >
                    </div>
                    <div className="plan-info">
                      <h3>{plan.name}</h3>
                      <div className="plan-meta">
                        <span className="plan-location">{plan.location}</span>
                        <span className="plan-date">{plan.shootingDate || plan.date}</span>
                      </div>
                      {plan.tags && (
                        <div className="plan-tags">
                          {plan.tags.map(tag => (
                            <span key={tag} className="plan-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 地图区域 */}
        <div className="dashboard-section map-widget">
          <div className="section-header">
            <h2>计划地图</h2>
            <div className="map-controls">
              <button 
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setView([35.0, 104.0], 5);
                  }
                }}
                className="map-control-btn"
                title="回到中国视角"
              >
                🏠 重置视角
              </button>
              <button 
                onClick={() => {
                  if (mapRef.current && window.L) {
                    const group = new window.L.featureGroup();
                    mapRef.current.eachLayer(layer => {
                      if (layer instanceof window.L.Marker) {
                        group.addLayer(layer);
                      }
                    });
                    if (group.getLayers().length > 0) {
                      mapRef.current.fitBounds(group.getBounds().pad(0.1));
                    }
                  }
                }}
                className="map-control-btn"
                title="查看所有计划"
              >
                🎯 查看全部
              </button>
            </div>
          </div>
          <div className="map-container">
            <div 
              ref={mapContainerRef}
              style={{ 
                width: '100%', 
                height: '400px',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;