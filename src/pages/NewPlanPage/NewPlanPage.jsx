import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HybridPlanStorage, { DATA_SOURCE } from '../../services/hybridPlanStorage';
import { checkAPIConnection } from '../../services/apiService';
import PageLayout from '../../components/PageLayout/PageLayout';
import './NewPlanPage.css';
import decoImg from './ken-cheung-WKcS19JBFVU-unsplash.jpg';
import { FaBullseye, FaCamera } from 'react-icons/fa';

const NewPlanPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: '检查中...' });

  // 表单状态
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    shootingDate: '',
    shootingTime: '',
    location: '',
    latitude: '',
    longitude: '',
    altitude: '',
    focalLength: '50',
    aperture: 'f/1.5',
    tags: [],
    tilesetUrl: '',
    userId: 'default_user'
  });

  const [newTag, setNewTag] = useState('');

  // 预设标签
  const commonTags = [
    '日出', '日落', '夜景', '星空', '云海', '雪景', '秋叶', '花朵',
    '山景', '湖景', '海景', '森林', '建筑', '人文', '街头', '野生动物'
  ];

  // 著名景点坐标
  const famousLocations = [
    { name: '黄山', latitude: 30.1304, longitude: 118.1670, altitude: 1864 },
    { name: '张家界', latitude: 29.1269, longitude: 110.4790, altitude: 1080 },
    { name: '九寨沟', latitude: 33.1903, longitude: 103.8568, altitude: 2000 },
    { name: '桂林', latitude: 25.2740, longitude: 110.2990, altitude: 150 },
    { name: '西湖', latitude: 30.2294, longitude: 120.1551, altitude: 8 },
    { name: '泰山', latitude: 36.2540, longitude: 117.1340, altitude: 1545 },
    { name: '华山', latitude: 34.4749, longitude: 110.0845, altitude: 2155 },
    { name: '峨眉山', latitude: 29.5525, longitude: 103.3347, altitude: 3099 }
  ];

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

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 添加标签
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  // 删除标签
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 选择预设位置
  const selectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      altitude: location.altitude.toString()
    }));
    setSelectedLocation(location);

    if (mapRef.current && window.L) {
      mapRef.current.setView([location.latitude, location.longitude], 10);
      
      mapRef.current.eachLayer(layer => {
        if (layer instanceof window.L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });

      const marker = window.L.marker([location.latitude, location.longitude])
        .addTo(mapRef.current)
        .bindPopup(`<strong>${location.name}</strong><br/>海拔: ${location.altitude}米`)
        .openPopup();
    }
  };

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

      // 添加预设位置标记
      famousLocations.forEach((location, index) => {
        const colors = ['#FF6B35', '#4ECDC4', '#56AB2F', '#667EEA', '#FF9A9E'];
        const color = colors[index % colors.length];

        const customIcon = window.L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
            ">📍</div>
          `,
          className: 'location-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = window.L.marker([location.latitude, location.longitude], {
          icon: customIcon
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 5px 0;">${location.name}</h4>
            <p style="margin: 2px 0; font-size: 12px;">海拔: ${location.altitude}米</p>
            <button onclick="window.selectMapLocation('${location.name}', ${location.latitude}, ${location.longitude}, ${location.altitude})" 
                    style="
                      background: ${color};
                      color: white;
                      border: none;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      cursor: pointer;
                      margin-top: 5px;
                    ">选择此位置</button>
          </div>
        `);
      });

      // 地图点击事件
      map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: `自定义位置 (${lat}, ${lng})`
        }));

        if (window.tempMarker) {
          map.removeLayer(window.tempMarker);
        }
        
        window.tempMarker = window.L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<strong>选定位置</strong><br/>坐标: ${lat}, ${lng}`)
          .openPopup();
      });

      console.log('✅ 地图初始化成功');
    } catch (error) {
      console.error('❌ 地图初始化失败:', error);
      renderFallbackMap();
    }
  };

  // 备用地图
  const renderFallbackMap = () => {
    if (!mapContainerRef.current) return;

    mapContainerRef.current.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        border-radius: 8px;
        position: relative;
      ">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">🗺️</div>
          <h3 style="margin: 0 0 10px 0;">地图预览</h3>
          <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 14px;">选择预设位置或手动输入坐标</p>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            max-width: 300px;
          ">
            ${famousLocations.slice(0, 4).map((loc, index) => {
              const colors = ['#FF6B35', '#4ECDC4', '#56AB2F', '#667EEA'];
              return `
                <button onclick="window.selectFallbackLocation('${loc.name}', ${loc.latitude}, ${loc.longitude}, ${loc.altitude})" style="
                  background: rgba(255,255,255,0.2);
                  border: 1px solid rgba(255,255,255,0.3);
                  color: white;
                  padding: 10px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 12px;
                  transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                  <div style="color: ${colors[index]}; font-size: 16px; margin-bottom: 4px;">📍</div>
                  ${loc.name}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本验证
    if (!formData.planName.trim()) {
      alert('请输入计划名称');
      return;
    }
    
    if (!formData.location.trim()) {
      alert('请选择拍摄地点');
      return;
    }

    if (!formData.shootingDate) {
      alert('请选择拍摄日期');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert('请设置拍摄位置的经纬度');
      return;
    }

    setSaving(true);

    try {
      console.log('📤 提交计划数据:', formData);
      
      const result = await HybridPlanStorage.addNewPlan(formData);
      
      console.log('✅ 新建计划成功:', result);
      
      // 根据数据源显示不同的成功消息
      const sourceMessage = result.source === DATA_SOURCE.API 
        ? '已保存到API服务器' 
        : result.source === DATA_SOURCE.LOCAL 
        ? '已保存到本地存储（API连接失败）' 
        : '保存位置未知';
      
      alert(`计划"${formData.planName}"创建成功！\nID: ${result.data.id}\n${sourceMessage}`);
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ 保存计划失败:', error);
      alert(`保存计划失败: ${error.message}\n\n请检查表单数据是否完整`);
    } finally {
      setSaving(false);
    }
  };

  // 初始化地图
  useEffect(() => {
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

    // 全局函数
    window.selectMapLocation = (name, lat, lng, alt) => {
      setFormData(prev => ({
        ...prev,
        location: name,
        latitude: lat.toString(),
        longitude: lng.toString(),
        altitude: alt.toString()
      }));
    };

    window.selectFallbackLocation = (name, lat, lng, alt) => {
      setFormData(prev => ({
        ...prev,
        location: name,
        latitude: lat.toString(),
        longitude: lng.toString(),
        altitude: alt.toString()
      }));
    };

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn('地图清理错误:', error);
        }
      }
      delete window.selectMapLocation;
      delete window.selectFallbackLocation;
      delete window.tempMarker;
    };
  }, []);

  return (
    <PageLayout title="创建新计划">
      <div className="new-plan-container">
        {/* API连接状态指示器 */}
        <div className={`api-status ${apiStatus.connected ? 'connected' : 'disconnected'}`}>
          {apiStatus.connected ? '✅ API已连接' : '❌ ' + apiStatus.message}
        </div>

        <form onSubmit={handleSubmit} className="new-plan-form">
          <div className="form-sections">
            {/* 左侧：基本信息 */}
            <div className="form-section basic-info">
              <h2><FaBullseye style={{ marginRight: 8, color: '#e94f4a' }} />基本信息</h2>
              
              <div className="form-group">
                <label htmlFor="planName">计划名称*</label>
                <input
                  type="text"
                  id="planName"
                  value={formData.planName}
                  onChange={(e) => handleInputChange('planName', e.target.value)}
                  placeholder="例如：黄山日出摄影"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">描述</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="描述您的拍摄计划..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shootingDate">拍摄日期*</label>
                  <input
                    type="date"
                    id="shootingDate"
                    value={formData.shootingDate}
                    onChange={(e) => handleInputChange('shootingDate', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shootingTime">拍摄时间*</label>
                  <input
                    type="time"
                    id="shootingTime"
                    value={formData.shootingTime}
                    onChange={(e) => handleInputChange('shootingTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">拍摄地点*</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="输入地点名称或从地图选择"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">纬度*</label>
                  <input
                    type="number"
                    id="latitude"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="例如: 30.1304"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">经度*</label>
                  <input
                    type="number"
                    id="longitude"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="例如: 118.1670"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="altitude">海拔高度 (米)</label>
                <input
                  type="number"
                  id="altitude"
                  value={formData.altitude}
                  onChange={(e) => handleInputChange('altitude', e.target.value)}
                  placeholder="可选"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tilesetUrl">3D模型URL (可选)</label>
                <input
                  type="url"
                  id="tilesetUrl"
                  value={formData.tilesetUrl}
                  onChange={(e) => handleInputChange('tilesetUrl', e.target.value)}
                  placeholder="例如: https://mycdn.com/city/tileset.json"
                />
                <small className="form-hint">
                  用于3D场景渲染的Cesium 3D Tiles或其他3D模型URL
                </small>
              </div>
            </div>

            {/* 右侧：相机设置和标签 */}
            <div className="form-section settings-and-map" style={{ position: 'relative' }}>
              <h2><FaCamera style={{ marginRight: 8, color: '#667eea' }} />相机设置</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="focalLength">焦距 (mm)</label>
                  <input
                    type="number"
                    id="focalLength"
                    value={formData.focalLength}
                    onChange={(e) => handleInputChange('focalLength', e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aperture">相机光圈 (f/)</label>
                  <input
                    type="number"
                    id="aperture"
                    step="0.1"
                    value={formData.aperture}
                    onChange={(e) => handleInputChange('aperture', e.target.value)}
                    placeholder="1.5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>标签</label>
                <div className="tags-section">
                  <div className="tags-input">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="输入标签并按回车"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(newTag)}
                      className="add-tag-btn"
                    >
                      添加
                    </button>
                  </div>
                  
                  <div className="common-tags">
                    <span className="common-tags-label">常用标签:</span>
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="common-tag"
                        disabled={formData.tags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="selected-tags">
                      {formData.tags.map(tag => (
                        <span key={tag} className="selected-tag">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              　
              {/* 装饰图片 */}
              <img 
                src={decoImg}
                alt="摄影装饰" 
                style={{
                  position: 'absolute',
                  left: 50,
                  top: 480,
                  width: 400,
                  height: 'auto',
                  borderRadius: 20,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  opacity: 0.98,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            </div>
          </div>

          {/* 地图部分 */}
          <div className="map-full-width">
            <h2>地图预览</h2>
            <div className="map-section">
              <div className="quick-locations">
                <span className="quick-locations-label">快速选择:</span>
                {famousLocations.slice(0, 4).map(location => (
                  <button
                    key={location.name}
                    type="button"
                    onClick={() => selectLocation(location)}
                    className={`quick-location ${selectedLocation?.name === location.name ? 'active' : ''}`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>
              
              <div
                ref={mapContainerRef}
                className="map-container"
              />
              
              <div className="map-hint">
                💡 点击地图选择位置，或使用上方快速选择按钮
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/plans')}
              className="cancel-btn"
              disabled={saving}
            >
              取消
            </button>
            <button
              type="submit"
              className={`submit-btn ${!apiStatus.connected ? 'disabled' : ''}`}
              disabled={saving || !apiStatus.connected}
            >
              {saving ? '保存中...' : !apiStatus.connected ? 'API未连接' : '创建计划'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default NewPlanPage;