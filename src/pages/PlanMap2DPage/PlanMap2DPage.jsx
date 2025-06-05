import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Spin, 
  message, 
  Row, 
  Col, 
  List, 
  Slider, 
  Space,
  Switch,
  DatePicker,
  TimePicker
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  SunOutlined,
  MoonOutlined,
  SaveOutlined,
  SwapOutlined,
  ExportOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dayjs from 'dayjs';

import styles from './PlanMap2DPage.module.css';

// 导入我们的模块化工具
import { getAstronomicalData } from './utils/astronomicalUtils';
import { calculateMarkerPosition } from './utils/mapUtils';
import { 
  createSunVisualization, 
  createMoonVisualization, 
  updateSunVisualization, 
  updateMoonVisualization 
} from './utils/mapVisualization';
import { createCameraIcon } from './components/MapIcons';
import { handleExport } from './utils/mapExport';

// 导入API服务
import { planAPI, astronomyAPI } from '../../services/api';

// 修复 Leaflet 默认图标问题
let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #ff4d4f; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

L.Marker.prototype.options.icon = DefaultIcon;

function PlanMap2DPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [planData, setPlanData] = useState(null);//计划信息
  const [cameraPosition, setCameraPosition] = useState(null);//相机位置
  const [astronomicalData, setAstronomicalData] = useState(null);//天文数据
  const [selectedDate, setSelectedDate] = useState(dayjs());//选择日期
  const [selectedTime, setSelectedTime] = useState(dayjs());//选择时间
  const [showSunPath, setShowSunPath] = useState(true);//是否显示太阳轨迹
  const [showMoonPath, setShowMoonPath] = useState(true);//是否显示月亮轨迹
  const [isDragging, setIsDragging] = useState(false);//是否正在拖拽相机位置

  const mapContainerRef = useRef(null);//地图容器
  const mapRef = useRef(null);//地图实例
  const cameraMarkerRef = useRef(null);//相机位置标记
  const sunMarkerRef = useRef(null);//太阳位置标记
  const moonMarkerRef = useRef(null);//月亮位置标记
  const sunPathRef = useRef(null);//太阳轨迹
  const sunRaysRef = useRef(null);//太阳光线
  const sunriseMarkerRef = useRef(null);//日出标记
  const sunsetMarkerRef = useRef(null);//日落标记
  const moonriseMarkerRef = useRef(null);//月出标记
  const moonsetMarkerRef = useRef(null);//月落标记
  const moonRaysRef = useRef(null);//月亮光线
  const draggingRef = useRef(false); //是否正在拖拽相机位置
  const currentCameraPositionRef = useRef(null);//当前相机位置
  const updateTimeoutRef = useRef(null);//更新天文数据定时器
  // 时间状态的ref，确保事件处理器使用最新值
  const selectedDateRef = useRef(selectedDate);
  const selectedTimeRef = useRef(selectedTime);

  // 所有可视化相关的refs
  const visualizationRefs = {
    sunPathRef,
    sunRaysRef,
    sunriseMarkerRef,
    sunsetMarkerRef,
    sunMarkerRef,
    moonriseMarkerRef,
    moonsetMarkerRef,
    moonRaysRef,
    moonMarkerRef
  };

  // 获取计划数据
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const data = await planAPI.getPlan(id);
        
        setPlanData(data);
        setCameraPosition(data.camera.position);
        currentCameraPositionRef.current = data.camera.position;
        const initialTime = dayjs(data.start_time);
        setSelectedDate(initialTime);
        setSelectedTime(initialTime);

        // 获取天文数据
        const astroData = await astronomyAPI.getAstronomyData({
          latitude: data.camera.position[0],
          longitude: data.camera.position[1],
          datetime: data.start_time
        });
        
        setAstronomicalData(astroData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        message.error('加载计划数据失败');
      }
    };

    fetchPlanData();
  }, [id]);

  // 防抖更新天文数据
  const updateAstronomicalData = useCallback((datetime, latitude, longitude) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      try {
        const newAstroData = getAstronomicalData(datetime.toDate(), latitude, longitude);
        if (newAstroData) {
          setAstronomicalData(prev => ({
            ...prev,
            ...newAstroData
          }));

          // 更新可视化
          updateSunVisualization(datetime.toDate(), latitude, longitude, mapRef, visualizationRefs);
          updateMoonVisualization(datetime.toDate(), latitude, longitude, mapRef, visualizationRefs);
        }
      } catch (error) {
        console.error('更新天文数据失败:', error);
      }
    }, 300);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || !planData) return;
    
    // 防止重复初始化
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      // 确保容器有高度
      if (mapContainerRef.current.offsetHeight === 0) {
        mapContainerRef.current.style.height = '400px';
      }

      // 创建 Leaflet 地图实例
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false,
        minZoom: 3,
        maxZoom: 19,
        zoomSnap: 0.5,
        zoomDelta: 1,
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      }).setView([planData.camera.position[0], planData.camera.position[1]], 15);

      // 添加底图图层 - 使用高德地图
      const amapLayer = L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        minZoom: 3,
        maxZoom: 19,
        noWrap: true
      });
      
      amapLayer.addTo(mapRef.current);

      // 可选择添加卫星图层
      const satelliteLayer = L.tileLayer('https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        minZoom: 3,
        maxZoom: 19,
        noWrap: true
      });

      // 添加图层控制
      const baseMaps = {
        "高德地图": amapLayer,
        "卫星图": satelliteLayer
      };

      L.control.layers(baseMaps).addTo(mapRef.current);

      // 创建相机位置标记
      const cameraIcon = createCameraIcon();
      cameraMarkerRef.current = L.marker([planData.camera.position[0], planData.camera.position[1]], {
        icon: cameraIcon,
        draggable: true
      }).addTo(mapRef.current);

      // 添加相机位置标签
      cameraMarkerRef.current.bindPopup('拍摄位置', { 
        permanent: true, 
        direction: 'top',
        offset: [0, -10]
      }).openPopup();

      // 创建初始天文可视化
      if (planData && selectedTime && selectedDate) {
        setTimeout(() => {
          const combinedDateTime = selectedDate
            .hour(selectedTime.hour())
            .minute(selectedTime.minute())
            .second(selectedTime.second());
          
          createSunVisualization(
            combinedDateTime.toDate(), 
            planData.camera.position[0], 
            planData.camera.position[1],
            mapRef,
            visualizationRefs
          );

          createMoonVisualization(
            combinedDateTime.toDate(), 
            planData.camera.position[0], 
            planData.camera.position[1],
            mapRef,
            visualizationRefs
          );
        }, 500);
      }

      // 添加相机标记拖拽事件，并及时更新天文数据
      cameraMarkerRef.current.on('dragstart', () => {
        draggingRef.current = true;
        setIsDragging(true);
      });

      cameraMarkerRef.current.on('drag', (e) => {
        if (draggingRef.current) {
          const { lat, lng } = e.target.getLatLng();
          setCameraPosition([lat, lng, planData.camera.position[2]]);
          currentCameraPositionRef.current = [lat, lng, planData.camera.position[2]];
        }
      });

      cameraMarkerRef.current.on('dragend', (e) => {
        draggingRef.current = false;
        setIsDragging(false);
        const { lat, lng } = e.target.getLatLng();
        
        const combinedDateTime = selectedDateRef.current
          .hour(selectedTimeRef.current.hour())
          .minute(selectedTimeRef.current.minute())
          .second(selectedTimeRef.current.second());
        
        updateAstronomicalData(combinedDateTime, lat, lng);
      });

      // 监听地图缩放事件，重新计算标记位置
      let zoomTimeout;
      const handleZoom = () => {
        if (zoomTimeout) {
          clearTimeout(zoomTimeout);
        }
        
        zoomTimeout = setTimeout(() => {
          if (selectedTimeRef.current && selectedDateRef.current && currentCameraPositionRef.current) {
            console.log('缩放事件触发，当前缩放级别:', mapRef.current.getZoom());
            
            const combinedDateTime = selectedDateRef.current
              .hour(selectedTimeRef.current.hour())
              .minute(selectedTimeRef.current.minute())
              .second(selectedTimeRef.current.second());
            
            const currentPos = currentCameraPositionRef.current;
            
            createSunVisualization(
              combinedDateTime.toDate(), 
              currentPos[0], 
              currentPos[1],
              mapRef,
              visualizationRefs
            );

            createMoonVisualization(
              combinedDateTime.toDate(), 
              currentPos[0], 
              currentPos[1],
              mapRef,
              visualizationRefs
            );
          }
        }, 300);
      };

      // 监听窗口大小变化
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };

      window.addEventListener('resize', handleResize);
      mapRef.current.on('zoomend', handleZoom);

      // 确保地图正确渲染
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          mapRef.current.setView([planData.camera.position[0], planData.camera.position[1]], 15);
        }
      }, 100);

    } catch (error) {
      console.error('初始化地图失败:', error);
      message.error('初始化地图失败');
    }

    // 清理函数
    return () => {
      window.removeEventListener('resize', () => {});
      if (mapRef.current) {
        try {
          mapRef.current.off('zoomend');
          mapRef.current.remove();
        } catch (e) {
          console.warn('地图清理时出现错误:', e);
        }
        mapRef.current = null;
        Object.values(visualizationRefs).forEach(ref => {
          if (ref && ref.current) {
            ref.current = null;
          }
        });
      }
    };
  }, [planData]);

  // 单独处理相机位置更新
  useEffect(() => {
    if (!cameraMarkerRef.current || !cameraPosition || draggingRef.current) return;
    cameraMarkerRef.current.setLatLng([cameraPosition[0], cameraPosition[1]]);
  }, [cameraPosition]);

  // 更新时间相关的数据
  useEffect(() => {
    if (currentCameraPositionRef.current && selectedTime && selectedDate) {
      const combinedDateTime = selectedDate
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(selectedTime.second());
      
      updateAstronomicalData(
        combinedDateTime, 
        currentCameraPositionRef.current[0], 
        currentCameraPositionRef.current[1]
      );
    }
  }, [selectedTime, selectedDate, updateAstronomicalData]);

  // 同步时间状态到ref
  useEffect(() => {
    selectedDateRef.current = selectedDate;
    selectedTimeRef.current = selectedTime;
  }, [selectedDate, selectedTime]);

  // 显示/隐藏太阳轨迹
  useEffect(() => {
    if (showSunPath && mapRef.current) {
      // 显示太阳轨迹相关元素
      [sunPathRef, sunRaysRef, sunriseMarkerRef, sunsetMarkerRef].forEach(ref => {
        if (ref.current && !mapRef.current.hasLayer(ref.current)) {
          mapRef.current.addLayer(ref.current);
        }
      });
    } else if (!showSunPath && mapRef.current) {
      // 隐藏太阳轨迹相关元素
      [sunPathRef, sunRaysRef, sunriseMarkerRef, sunsetMarkerRef].forEach(ref => {
        if (ref.current && mapRef.current.hasLayer(ref.current)) {
          mapRef.current.removeLayer(ref.current);
        }
      });
    }
  }, [showSunPath]);

  // 显示/隐藏月亮轨迹
  useEffect(() => {
    if (moonMarkerRef.current && mapRef.current) {
      const moonRefs = [moonMarkerRef, moonriseMarkerRef, moonsetMarkerRef, moonRaysRef];
      
      if (showMoonPath) {
        moonRefs.forEach(ref => {
          if (ref.current && !mapRef.current.hasLayer(ref.current)) {
            mapRef.current.addLayer(ref.current);
          }
        });
      } else {
        moonRefs.forEach(ref => {
          if (ref.current && mapRef.current.hasLayer(ref.current)) {
            mapRef.current.removeLayer(ref.current);
          }
        });
      }
    }
  }, [showMoonPath]);

  // 保存更新
  const handleSave = async () => {
    try {
      if (!currentCameraPositionRef.current || !selectedDate || !selectedTime || !id) {
        message.error('缺少必要的保存数据');
        return;
      }

      const combinedDateTime = selectedDate
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(selectedTime.second());

      const updateData = {
        start_time: combinedDateTime.toISOString(),
        camera: {
          focal_length: planData?.camera?.focal_length || 35.0,
          position: currentCameraPositionRef.current,
          rotation: planData?.camera?.rotation || [0.0, 0.0, 0.0, 1.0]
        }
      };

      console.log('发送更新数据:', updateData);

      const response = await fetch(`/api/v1/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedPlan = await response.json();
      console.log('保存成功，返回数据:', updatedPlan);
      
      const finalPlanData = {
        ...updatedPlan,
        updated_at: updatedPlan.updated_at || new Date().toISOString()
      };
      
      setPlanData(finalPlanData);
      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error(`保存失败: ${error.message}`);
    }
  };

  // 导出地图
  const handleMapExport = async () => {
    await handleExport({
      mapContainerRef,
      mapRef,
      planData,
      selectedDate,
      selectedTime,
      currentCameraPosition: currentCameraPositionRef.current,
      astronomicalData,
      showSunPath,
      showMoonPath
    });
  };

  // 切换到3D视图
  const handleSwitchTo3D = () => {
    navigate(`/plans/${id}/map3D`);
  };

  // 处理时间滑动条变化
  const handleTimeSliderChange = (value) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    setSelectedTime(prev => prev.hour(hours).minute(minutes));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <Typography.Text type="danger">加载失败: {error}</Typography.Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 顶部导航栏 */}
      <Card className={styles.headerCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/plans/${id}`)}
                className={styles.secondaryButton}
              >
                返回
              </Button>
              <Typography.Title level={4} className={styles.pageTitle}>
                {planData?.name} - 2D地图
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Space className={styles.actionButtons}>
              <Button 
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                className={styles.primaryButton}
              >
                保存
              </Button>
              <Button 
                icon={<SwapOutlined />}
                onClick={handleSwitchTo3D}
                className={styles.secondaryButton}
              >
                切换到3D视图
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleMapExport}
                className={styles.secondaryButton}
              >
                导出地图
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 - 左右布局 */}
      <div className={styles.mainContent}>
        {/* 左侧控制面板 */}
        <div className={styles.leftPanel}>
          {/* 时间控制 */}
          <Card title="时间控制" size="small" className={styles.controlCard}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={8} className={styles.timeControl}>
                <Col span={12}>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={12}>
                  <TimePicker
                    value={selectedTime}
                    onChange={setSelectedTime}
                    format="HH:mm"
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
              <div className={styles.timeSlider}>
                <Slider
                  min={0}
                  max={24}
                  step={0.1}
                  value={selectedTime.hour() + selectedTime.minute() / 60}
                  onChange={handleTimeSliderChange}
                  tooltip={{
                    formatter: (value) => {
                      const hours = Math.floor(value);
                      const minutes = Math.round((value - hours) * 60);
                      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    }
                  }}
                  marks={{
                    0: '00:00',
                    6: '06:00',
                    12: '12:00',
                    18: '18:00',
                    24: '24:00'
                  }}
                />
              </div>
            </Space>
          </Card>

          {/* 图层控制 */}
          <Card title="图层控制" size="small" className={styles.controlCard}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className={styles.switchControl}>
                <span className={styles.switchLabel}>
                  <SunOutlined style={{ marginRight: '8px' }} />
                  太阳轨迹
                </span>
                <Switch
                  checked={showSunPath}
                  onChange={setShowSunPath}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </div>
              <div className={styles.switchControl}>
                <span className={styles.switchLabel}>
                  <MoonOutlined style={{ marginRight: '8px' }} />
                  月亮轨迹
                </span>
                <Switch
                  checked={showMoonPath}
                  onChange={setShowMoonPath}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </div>
            </Space>
          </Card>

          {/* 天文数据 */}
          <Card title="天文数据" size="small" className={styles.controlCard}>
            <List
              size="small"
              dataSource={[
                {
                  icon: <SunOutlined />,
                  title: '太阳位置',
                  content: `高度角: ${astronomicalData?.sunPosition.altitude}°, 方位角: ${astronomicalData?.sunPosition.azimuth}°`,
                },
                {
                  icon: <ClockCircleOutlined />,
                  title: '日出日落',
                  content: `日出: ${astronomicalData?.sunPosition.sunrise} | 日落: ${astronomicalData?.sunPosition.sunset}`,
                },
                {
                  icon: <MoonOutlined />,
                  title: '月亮位置',
                  content: `高度角: ${astronomicalData?.moonPosition.altitude}°, 方位角: ${astronomicalData?.moonPosition.azimuth}°`,
                },
                {
                  icon: <MoonOutlined />,
                  title: '月相',
                  content: `${astronomicalData?.moonPosition.phaseName || '未知'} (亮度: ${astronomicalData?.moonPosition.illumination || 0}%)`,
                },
                {
                  icon: <ClockCircleOutlined />,
                  title: '月出月落',
                  content: `月出: ${astronomicalData?.moonPosition.moonrise || '无'} | 月落: ${astronomicalData?.moonPosition.moonset || '无'}`,
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* 右侧地图区域 */}
        <div className={styles.rightPanel}>
          <Card className={styles.mapCard} bodyStyle={{ padding: 0, height: '100%' }}>
            <div
              ref={mapContainerRef}
              className={styles.mapContainer}
              data-testid="map-container"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PlanMap2DPage; 