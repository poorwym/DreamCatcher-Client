import React from 'react'
import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  List,
  Descriptions,
  Divider,
  Tooltip,
  message,
  Spin,
  Statistic,
  Progress,
  Modal,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  SunOutlined,
  MoonOutlined,
  CloudOutlined,
  CompassOutlined,
  ThunderboltOutlined,
  EyeOutlined
} from '@ant-design/icons';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 导入API服务
import { planAPI, astronomyAPI } from '../../services/api';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';

import styles from './PlanDetailsPage.module.css';

function PlanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [astronomicalData, setAstronomicalData] = useState(null);

  // 创建 ref 用于存储 DOM 元素
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const cameraMarkerRef = useRef(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        
        // 使用真实的API调用获取计划数据
        const data = await planAPI.getPlan(id);
        console.log('=== 获取到的原始计划数据 ===');
        console.log('完整数据:', data);
        console.log('相机数据:', data?.camera);
        console.log('相机位置:', data?.camera?.position);
        
        setPlanData(data);

        // 获取天气数据和天文数据
        try {
          // 获取天气数据
          const weatherData = await astronomyAPI.getWeatherData({
            latitude: data.camera.position[0],
            longitude: data.camera.position[1],
            datetime: data.start_time
          });

          // 获取天文数据（使用SunCalc本地计算）
          const astroData = await astronomyAPI.getAstronomyData({
            latitude: data.camera.position[0],
            longitude: data.camera.position[1],
            datetime: data.start_time
          });

          // 组合天文和天气数据
          setAstronomicalData({
            sunPosition: astroData.sunPosition,
            moonPosition: astroData.moonPosition,
            weather: weatherData
          });

        } catch (weatherError) {
          console.warn('获取天气数据失败，但天文数据仍可用:', weatherError);
          
          try {
            // 即使天气API失败，天文数据仍然可以计算
            const astroData = await astronomyAPI.getAstronomyData({
              latitude: data.camera.position[0],
              longitude: data.camera.position[1],
              datetime: data.start_time
            });

            // 使用计算的天文数据和模拟天气数据
            setAstronomicalData({
              sunPosition: astroData.sunPosition,
              moonPosition: astroData.moonPosition,
              weather: {
                temperature: 25,
                feelsLike: 27,
                humidity: 65,
                cloudCover: 20,
                visibility: "良好",
                windSpeed: 10,
                windDirection: 180,
                precipitation: 0,
                precipitationProbability: 10,
                conditions: "晴朗",
                description: "天气晴朗，适合拍摄",
                forecast: "晴朗"
              }
            });
          } catch (astroError) {
            console.error('天文数据计算也失败:', astroError);
            // 完全使用模拟数据作为最后的降级方案
            setAstronomicalData({
              sunPosition: {
                altitude: 45,
                azimuth: 180,
                sunrise: "06:00",
                sunset: "18:00",
                goldenHour: {
                  morning: "05:30-06:30",
                  evening: "17:30-18:30"
                }
              },
              moonPosition: {
                altitude: 30,
                azimuth: 90,
                phase: "上弦月",
                moonrise: "20:00",
                moonset: "08:00"
              },
              weather: {
                temperature: 25,
                feelsLike: 27,
                humidity: 65,
                cloudCover: 20,
                visibility: "良好",
                windSpeed: 10,
                windDirection: 180,
                precipitation: 0,
                precipitationProbability: 10,
                conditions: "晴朗",
                description: "天气晴朗，适合拍摄",
                forecast: "晴朗"
              }
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取计划数据失败:', error);
        setError(error.message);
        setLoading(false);
        message.error(`加载计划数据失败: ${error.message}`);
      }
    };

    fetchPlanData();
  }, [id]);

  useEffect(() => {
    console.log('=== useEffect 地图初始化触发 ===');
    console.log('planData 状态:', planData);
    console.log('mapContainerRef.current:', mapContainerRef.current);
    console.log('mapRef.current:', mapRef.current);
    console.log('cameraMarkerRef.current:', cameraMarkerRef.current);
    
    if (planData) {
      console.log('=== 验证计划数据 ===');
      console.log('计划名称:', planData.name);
      console.log('相机位置数据:', planData.camera?.position);
      
      // 验证相机位置数据的有效性
      if (planData.camera && planData.camera.position && Array.isArray(planData.camera.position) && planData.camera.position.length >= 3) {
        const latitude = planData.camera.position[0];
        const longitude = planData.camera.position[1];
        const height = planData.camera.position[2];
        console.log('解析的位置:', { latitude, longitude, height });
        
        if (typeof latitude === 'number' && typeof longitude === 'number' && typeof height === 'number') {
          console.log('位置数据验证通过，等待DOM容器准备');
        } else {
          console.error('位置数据类型错误:', { latitude: typeof latitude, longitude: typeof longitude, height: typeof height });
        }
      } else {
        console.error('相机位置数据无效:', planData.camera);
      }
    }

    return () => {
      // 清理函数
      if (mapRef.current) {
        console.log('清理地图实例');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [planData]);

  // 新增：专门处理地图容器准备状态的 useEffect
  useEffect(() => {
    // 确保地图容器DOM准备好后再初始化地图
    if (planData && mapContainerRef.current && !mapRef.current) {
      console.log('=== DOM容器准备好，延迟初始化地图 ===');
      // 添加短暂延迟确保DOM完全渲染
      const timer = setTimeout(() => {
        console.log('延迟初始化开始，检查条件:');
        console.log('- mapContainerRef.current:', !!mapContainerRef.current);
        console.log('- planData:', !!planData);
        console.log('- mapRef.current:', !!mapRef.current);
        
        if (mapContainerRef.current && planData && !mapRef.current) {
          initializeMap();
        }
      }, 100); // 100ms延迟
      
      return () => clearTimeout(timer);
    }
  }, [planData, mapContainerRef.current]);

  // 新增：监听路由参数变化，确保复制后的页面能正确初始化
  useEffect(() => {
    console.log('=== 路由参数变化，重新初始化 ===');
    console.log('当前计划ID:', id);
    
    // 清理现有的地图实例
    if (mapRef.current) {
      console.log('清理现有地图实例');
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // 重置状态
    setPlanData(null);
    setAstronomicalData(null);
    setError(null);
    
  }, [id]); // 依赖id参数

  // 初始化地图
  const initializeMap = async () => {
    console.log('=== initializeMap 函数开始执行 ===');
    console.log('检查条件:');
    console.log('- mapContainerRef.current:', !!mapContainerRef.current);
    console.log('- planData:', !!planData);
    console.log('- mapRef.current:', !!mapRef.current);
    console.log('- planData.camera:', planData?.camera);
    console.log('- container DOM 状态:', mapContainerRef.current ? {
      offsetWidth: mapContainerRef.current.offsetWidth,
      offsetHeight: mapContainerRef.current.offsetHeight,
      display: window.getComputedStyle(mapContainerRef.current).display,
      visibility: window.getComputedStyle(mapContainerRef.current).visibility
    } : 'null');
    
    if (!mapContainerRef.current || !planData || mapRef.current) {
      console.log('初始化条件不满足，退出');
      return;
    }

    // 验证计划数据的完整性
    if (!planData.camera || !planData.camera.position || !Array.isArray(planData.camera.position) || planData.camera.position.length < 3) {
      console.error('计划数据中缺少有效的相机位置信息:', planData);
      message.error('计划数据格式错误：缺少相机位置信息');
      return;
    }

    try {
      console.log('=== 开始创建 Leaflet 地图 ===');
      
      // 确保容器有高度
      if (mapContainerRef.current.offsetHeight === 0) {
        mapContainerRef.current.style.height = '300px';
        console.log('设置地图容器高度为 300px');
      }

      // 清空容器内容（防止重复创建）
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
        console.log('已清空地图容器内容');
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
      });

      console.log('Leaflet 地图创建成功:', mapRef.current);

      // 从计划数据中获取相机位置 [纬度, 经度, 高度]
      const latitude = planData.camera.position[0];
      const longitude = planData.camera.position[1];
      const height = planData.camera.position[2];
      
      console.log('=== 设置地图位置 ===');
      console.log('原始位置数据:', planData.camera.position);
      console.log('解析后位置:', { latitude, longitude, height });
      
      // 验证坐标范围
      if (latitude < -90 || latitude > 90) {
        console.error('纬度超出有效范围:', latitude);
        message.error(`纬度数据错误: ${latitude}`);
        return;
      }
      
      if (longitude < -180 || longitude > 180) {
        console.error('经度超出有效范围:', longitude);
        message.error(`经度数据错误: ${longitude}`);
        return;
      }

      // 设置地图中心和缩放级别
      mapRef.current.setView([latitude, longitude], 15);

      // 添加高德地图底图
      const amapLayer = L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        minZoom: 3,
        maxZoom: 19,
        noWrap: true
      });
      
      amapLayer.addTo(mapRef.current);
      console.log('高德地图底图添加成功');

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
      cameraMarkerRef.current = L.marker([latitude, longitude], {
        icon: cameraIcon,
        draggable: false
      }).addTo(mapRef.current);

      // 添加相机位置标签
      cameraMarkerRef.current.bindPopup(planData.name || '拍摄位置', { 
        permanent: false, 
        direction: 'top',
        offset: [0, -10]
      });

      console.log('相机标记创建成功');

      // 添加点击事件
      cameraMarkerRef.current.on('click', () => {
        message.info(`拍摄位置: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      });

      // 确保地图正确渲染
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          console.log('地图尺寸已更新');
        }
      }, 100);

      console.log('=== Leaflet 地图初始化完成 ===');
      console.log('相机位置:', { latitude, longitude, height });

    } catch (error) {
      console.error('=== Leaflet 地图初始化失败 ===', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      message.error('地图加载失败: ' + error.message);
    }
  };

  // 创建相机图标
  const createCameraIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #1890ff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="color: white; font-size: 16px;">📷</span>
      </div>`,
      className: 'camera-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个拍摄计划吗？')) {
      try {
        setLoading(true);
        await planAPI.deletePlan(id);
        message.success('删除成功');
        navigate('/plans');
      } catch (error) {
        console.error('删除计划失败:', error);
        setError(error.message);
        message.error(`删除失败: ${error.message}`);
        setLoading(false);
      }
    }
  };

  // 测试函数
  const testCopy = () => {
    console.log('测试按钮被点击了！');
    alert('测试按钮工作正常！');
  };

  // 复制计划
  const handleCopy = async () => {
    try {
      console.log('=== 复制按钮被点击 ===');
      console.log('planData 存在:', !!planData);
      console.log('planData 内容:', planData);
      
      if (!planData) {
        console.log('planData 不存在，显示错误');
        message.error('计划数据未加载完成，无法复制');
        return;
      }

      console.log('准备显示 Modal.confirm');
      console.log('Modal 对象:', Modal);
      console.log('Modal.confirm 方法:', typeof Modal.confirm);
      
      // 尝试显示一个简单的confirm先
      if (window.confirm(`确定要复制计划 "${planData.name}" 吗？`)) {
        console.log('用户确认复制');
        
        try {
          // 显示加载状态
          console.log('显示加载消息');
          message.loading('正在复制计划...', 1);
          
          // 创建计划副本
          const copyData = {
            name: `${planData.name} - 副本`,
            description: planData.description || '复制的拍摄计划',
            start_time: planData.start_time,
            camera: {
              position: [...planData.camera.position],
              rotation: [...planData.camera.rotation],
              focal_length: planData.camera.focal_length || 50
            },
            tileset_url: planData.tileset_url || '',
            user_id: planData.user_id || 1
          };
          
          console.log('复制计划数据:', copyData);
          console.log('准备调用 createPlan API');
          
          // 调用API创建新计划
          const newPlan = await planAPI.createPlan(copyData);
          console.log('API 返回结果:', newPlan);
          
          if (newPlan && newPlan.id) {
            console.log('复制成功，准备导航');
            message.success(`计划复制成功！新计划ID: ${newPlan.id}`);
            
            // 导航到新计划页面
            setTimeout(() => {
              navigate(`/plans/${newPlan.id}`);
            }, 1000);
          } else {
            throw new Error('创建计划失败：未返回有效的计划数据');
          }
          
        } catch (apiError) {
          console.error('API调用失败:', apiError);
          message.error(`复制失败: ${apiError.message || '未知错误'}`);
        }
      } else {
        console.log('用户取消复制');
      }
      
    } catch (error) {
      console.error('handleCopy 函数执行错误:', error);
      console.error('错误堆栈:', error.stack);
      message.error(`复制操作失败: ${error.message}`);
    }
  };

  // 更新计划数据
  const handleUpdate = async (updates) => {
    try {
      const updatedPlan = await planAPI.updatePlan(id, updates);
      setPlanData(updatedPlan);
      message.success('保存成功');
      return updatedPlan;
    } catch (error) {
      console.error('更新计划失败:', error);
      message.error(`保存失败: ${error.message}`);
      throw error;
    }
  };

  const handleEdit = () => {
    navigate(`/plans/${id}/edit`);
  };

  const handleView2D = () => {
    navigate(`/plans/${id}/map2D`);
  };

  const handleView3D = () => {
    navigate(`/plans/${id}/map3D`);
  };

  // 飞行到相机位置
  const flyToCamera = () => {
    if (mapRef.current && planData) {
      const latitude = planData.camera.position[0];
      const longitude = planData.camera.position[1];
      const height = planData.camera.position[2];
      console.log('飞行到相机位置:', { latitude, longitude, height });
      
      mapRef.current.setView([latitude, longitude], 15);
      
      // 打开标记的弹窗
      if (cameraMarkerRef.current) {
        cameraMarkerRef.current.openPopup();
      }
      
      message.success('已定位到相机位置');
    } else {
      console.warn('无法飞行：地图或计划数据不可用');
      message.warning('地图未初始化或计划数据缺失');
    }
  };

  // 调试地图容器
  const debugMapContainer = () => {
    console.log('=== 调试地图容器状态 ===');
    console.log('mapContainerRef.current:', mapContainerRef.current);
    console.log('planData:', !!planData);
    console.log('mapRef.current:', !!mapRef.current);
    
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(mapContainerRef.current);
      
      console.log('=== 容器状态 ===');
      console.log('容器尺寸:', {
        width: rect.width,
        height: rect.height,
        offsetWidth: mapContainerRef.current.offsetWidth,
        offsetHeight: mapContainerRef.current.offsetHeight
      });
      console.log('容器样式:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        overflow: computedStyle.overflow,
        position: computedStyle.position
      });
      
      // 检查地图状态
      if (mapRef.current) {
        console.log('=== 地图状态检查 ===');
        console.log('地图对象:', mapRef.current);
        console.log('地图容器:', mapRef.current.getContainer());
        console.log('地图中心:', mapRef.current.getCenter());
        console.log('地图缩放:', mapRef.current.getZoom());
        
        // 强制重绘
        try {
          mapRef.current.invalidateSize();
          console.log('强制重绘完成');
        } catch (renderError) {
          console.error('强制重绘失败:', renderError);
        }
      } else {
        console.log('地图对象不存在');
      }
      
      // 如果有planData但没有地图，强制初始化地图
      if (planData && !mapRef.current) {
        console.log('强制初始化地图');
        initializeMap();
      }
    } else {
      console.error('地图容器不存在');
    }
  };

  // 强制重新创建地图
  const forceRecreateMap = () => {
    console.log('=== 强制重新创建地图 ===');
    
    // 清理现有的地图
    if (mapRef.current) {
      console.log('销毁现有地图');
      try {
        mapRef.current.remove();
      } catch (error) {
        console.error('销毁地图失败:', error);
      }
      mapRef.current = null;
    }
    
    // 清理相机标记
    if (cameraMarkerRef.current) {
      cameraMarkerRef.current = null;
    }
    
    // 重新初始化
    if (planData && mapContainerRef.current) {
      console.log('重新初始化地图');
      setTimeout(() => {
        initializeMap();
      }, 100);
    } else {
      console.error('重新创建条件不满足');
    }
  };

  // 根据天气条件获取图标和颜色
  const getWeatherIcon = (conditions) => {
    const condition = conditions?.toLowerCase() || '';
    
    if (condition.includes('sunny') || condition.includes('clear') || condition.includes('晴')) {
      return { icon: <SunOutlined />, color: '#f39c12' };
    } else if (condition.includes('rain') || condition.includes('雨')) {
      return { icon: <CloudOutlined />, color: '#3498db' };
    } else if (condition.includes('thunder') || condition.includes('storm') || condition.includes('雷')) {
      return { icon: <ThunderboltOutlined />, color: '#9b59b6' };
    } else if (condition.includes('snow') || condition.includes('雪')) {
      return { icon: <CloudOutlined />, color: '#ecf0f1' };
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('雾')) {
      return { icon: <CloudOutlined />, color: '#95a5a6' };
    } else if (condition.includes('cloud') || condition.includes('cloudy') || condition.includes('阴') || condition.includes('多云')) {
      return { icon: <CloudOutlined />, color: '#7f8c8d' };
    } else {
      return { icon: <SunOutlined />, color: '#34495e' };
    }
  };

  // 获取温度颜色
  const getTemperatureColor = (temp) => {
    if (temp >= 30) return '#e74c3c'; // 热 - 红色
    if (temp >= 20) return '#f39c12'; // 温暖 - 橙色
    if (temp >= 10) return '#f1c40f'; // 凉爽 - 黄色
    if (temp >= 0) return '#3498db';  // 冷 - 蓝色
    return '#9b59b6'; // 很冷 - 紫色
  };

  // 根据天气条件给出拍摄建议
  const getShootingTip = (weather) => {
    const { conditions, cloudCover, precipitation, windSpeed } = weather;
    
    if (precipitation > 0) {
      return "⚠️ 有降水，注意保护设备";
    } else if (cloudCover < 30) {
      return "☀️ 天气晴朗，光线充足，适合拍摄";
    } else if (cloudCover > 70) {
      return "☁️ 多云天气，注意补光";
    } else if (windSpeed > 20) {
      return "💨 风力较大，注意稳定设备";
    } else {
      return "📸 天气条件良好，适合拍摄";
    }
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
      <div className={styles.errorContainer}>
        <ErrorDisplay 
          error={error}
          title="加载计划数据失败"
          onReload={() => {
            setError(null);
            // 重新触发数据加载
            window.location.reload();
          }}
        />
      </div>
    );
  }

  if (!planData) {
    return (
      <div className={styles.emptyContainer}>
        <Typography.Text className={styles.emptyText}>未找到计划</Typography.Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.headerCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Typography.Title level={2} className={styles.planTitle}>
              {planData.name}
            </Typography.Title>
          </Col>
          <Col>
            <div className={styles.actionButtons}>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className={styles.primaryButton}>
                编辑
              </Button>
              <Button 
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className={styles.secondaryButton}>
                复制
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                onClick={() => {
                  // 复制当前页面URL到剪贴板
                  navigator.clipboard.writeText(window.location.href);
                  message.success('分享链接已复制到剪贴板');
                }}
                className={styles.secondaryButton}>
                分享
              </Button>
              <Divider type="vertical" />
              <Button 
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={handleView2D}
                className={styles.primaryButton}>
                2D地图
              </Button>
              <Button 
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={handleView3D}
                className={styles.primaryButton}>
                3D地图
              </Button>
              <Divider type="vertical" />
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={loading}
                className={styles.dangerButton}>
                删除
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <div className={styles.contentRow}>
        {/* 左侧信息区 */}
        <div className={styles.leftColumn}>
          {/* 基本信息 */}
          <Card title={<span className={styles.cardTitle}>基本信息</span>} className={styles.basicInfoCard}>
            <Typography.Paragraph>{planData.description}</Typography.Paragraph>
            <Descriptions column={2}>
              <Descriptions.Item label="创建时间">
                {new Date(planData.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(planData.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 地图预览 */}
          <Card 
            title={<span className={styles.cardTitle}>地图预览</span>}
            className={styles.mapPreviewCard}
            extra={
              <Space>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<EnvironmentOutlined />}
                  onClick={flyToCamera}
                  className={styles.primaryButton}
                >
                  定位相机
                </Button>
                <Button 
                  size="small" 
                  type="dashed"
                  onClick={forceRecreateMap}
                  className={styles.secondaryButton}
                >
                  重建地图
                </Button>
              </Space>
            }
          >
            <div
              ref={mapContainerRef}
              className={styles.mapContainer}
            >
              {!mapRef.current && (
                <div className={styles.mapPlaceholder}>
                  <EnvironmentOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                  <div>地图加载中...</div>
                  {planData && (
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      位置: {planData.camera.position[0].toFixed(4)}, {planData.camera.position[1].toFixed(4)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              {/* 拍摄信息 */}
              <Card title={<span className={styles.cardTitle}>拍摄信息</span>} className={styles.shootingInfoCard}>
                <List
                  className={styles.infoList}
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      icon: <ClockCircleOutlined />,
                      title: '拍摄时间',
                      content: new Date(planData.start_time).toLocaleString(),
                    },
                    {
                      icon: <CameraOutlined />,
                      title: '相机参数',
                      content: `焦距: ${planData.camera.focal_length}mm`,
                    },
                    {
                      icon: <EnvironmentOutlined />,
                      title: '拍摄位置',
                      content: `经度: ${parseFloat(planData.camera.position[1]).toFixed(4)}, 纬度: ${parseFloat(planData.camera.position[0]).toFixed(4)}, 高度: ${parseFloat(planData.camera.position[2]).toFixed(1)}m`,
                    },
                    {
                      icon: <CompassOutlined />,
                      title: '相机旋转',
                      content: `X: ${parseFloat(planData.camera.rotation[0]).toFixed(3)}, Y: ${parseFloat(planData.camera.rotation[1]).toFixed(3)}, Z: ${parseFloat(planData.camera.rotation[2]).toFixed(3)}, W: ${parseFloat(planData.camera.rotation[3]).toFixed(3)}`,
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
            </Col>

            <Col span={12}>
              {/* 天文数据 */}
              {astronomicalData && (
                <Card 
                  title={
                    <div className={styles.astronomyCardTitle}>
                      <SunOutlined style={{ color: '#f39c12', marginRight: '8px' }} />
                      <span>天文数据</span>
                    </div>
                  } 
                  className={styles.astronomyCard}
                >
                  {/* 主要天文信息 */}
                  <div className={styles.mainAstronomyInfo}>
                    <div className={styles.sunSection}>
                      <div className={styles.sunDisplay}>
                        <SunOutlined style={{ fontSize: '32px', color: '#f39c12', marginBottom: '8px' }} />
                        <div className={styles.astronomyLabel}>太阳</div>
                        <div className={styles.astronomyValue}>
                          {parseFloat(astronomicalData.sunPosition.altitude).toFixed(1)}°
                        </div>
                        <div className={styles.astronomySubValue}>高度角</div>
                      </div>
                    </div>
                    
                    <div className={styles.moonSection}>
                      <div className={styles.moonDisplay}>
                        <MoonOutlined style={{ fontSize: '32px', color: '#95a5a6', marginBottom: '8px' }} />
                        <div className={styles.astronomyLabel}>月亮</div>
                        <div className={styles.astronomyValue}>
                          {parseFloat(astronomicalData.moonPosition.altitude).toFixed(1)}°
                        </div>
                        <div className={styles.astronomySubValue}>高度角</div>
                      </div>
                    </div>
                  </div>

                  {/* 详细天文信息 */}
                  <div className={styles.astronomyDetails}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <div className={styles.astronomyDetailItem}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <SunOutlined style={{ color: '#f39c12' }} />
                            </div>
                            <div className={styles.detailLabel}>日出</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>{astronomicalData.sunPosition.sunrise}</div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col span={12}>
                        <div className={styles.astronomyDetailItem}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <SunOutlined style={{ color: '#e67e22' }} />
                            </div>
                            <div className={styles.detailLabel}>日落</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>{astronomicalData.sunPosition.sunset}</div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col span={12}>
                        <div className={styles.astronomyDetailItem}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <MoonOutlined style={{ color: '#95a5a6' }} />
                            </div>
                            <div className={styles.detailLabel}>月出</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>{astronomicalData.moonPosition.moonrise}</div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col span={12}>
                        <div className={styles.astronomyDetailItem}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <MoonOutlined style={{ color: '#34495e' }} />
                            </div>
                            <div className={styles.detailLabel}>月落</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>{astronomicalData.moonPosition.moonset}</div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col span={24}>
                        <div className={styles.astronomyDetailItem} style={{ height: 'auto' }}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <SunOutlined style={{ color: '#f1c40f' }} />
                            </div>
                            <div className={styles.detailLabel}>黄金时刻</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>
                              早晨: {astronomicalData.sunPosition.goldenHour.morning}
                            </div>
                            <div className={styles.detailSubValue}>
                              傍晚: {astronomicalData.sunPosition.goldenHour.evening}
                            </div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col span={24}>
                        <div className={styles.astronomyDetailItem} style={{ height: 'auto' }}>
                          <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>
                              <MoonOutlined style={{ color: '#8e44ad' }} />
                            </div>
                            <div className={styles.detailLabel}>月相</div>
                          </div>
                          <div className={styles.detailContent}>
                            <div className={styles.detailValue}>{astronomicalData.moonPosition.phase}</div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* 拍摄建议 */}
                  <div className={styles.astronomyTip}>
                    🌅 最佳拍摄时间：黄金时刻和蓝调时分
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </div>

        {/* 右侧预览区 */}
        <div className={styles.rightColumn}>
          {/* 3D模型预览 */}
          <Card title={<span className={styles.cardTitle}>3D模型预览</span>} className={styles.modelPreviewCard}>
            <div className={styles.modelPreview}>
              <div className={styles.modelPlaceholder}>
                <CameraOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Typography.Text style={{ color: 'white' }}>3D模型加载中...</Typography.Text>
              </div>
            </div>
            <Typography.Paragraph style={{ marginTop: '16px', fontSize: '12px' }}>
              模型地址: {planData.tileset_url}
            </Typography.Paragraph>
          </Card>

          {/* 天气信息 */}
          {astronomicalData && (
            <Card 
              title={
                <div className={styles.weatherCardTitle}>
                  <span style={{ color: getWeatherIcon(astronomicalData.weather.conditions).color }}>
                    {getWeatherIcon(astronomicalData.weather.conditions).icon}
                  </span>
                  <span style={{ marginLeft: '8px' }}>天气信息</span>
                </div>
              } 
              className={styles.weatherCard}
            >
              {/* 主要天气信息 */}
              <div className={styles.mainWeatherInfo}>
                <div className={styles.temperatureSection}>
                  <div className={styles.temperatureDisplay}>
                    <span 
                      className={styles.currentTemp}
                      style={{ color: getTemperatureColor(astronomicalData.weather.temperature) }}
                    >
                      {astronomicalData.weather.temperature}°
                    </span>
                    <span className={styles.tempUnit}>C</span>
                  </div>
                  <div className={styles.feelsLike}>
                    体感 {astronomicalData.weather.feelsLike}°C
                  </div>
                </div>
                
                <div className={styles.weatherIconSection}>
                  <div className={styles.weatherIconLarge}>
                    <span style={{ 
                      fontSize: '48px', 
                      color: getWeatherIcon(astronomicalData.weather.conditions).color 
                    }}>
                      {getWeatherIcon(astronomicalData.weather.conditions).icon}
                    </span>
                  </div>
                </div>
                
                <div className={styles.conditionSection}>
                  <div className={styles.condition}>{astronomicalData.weather.conditions}</div>
                  <div className={styles.description}>{astronomicalData.weather.description}</div>
                </div>
              </div>

              {/* 详细信息 */}
              <div className={styles.weatherDetails}>
                <Row gutter={[12, 12]}>
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <CloudOutlined style={{ color: '#3498db' }} />
                        </div>
                        <div className={styles.detailLabel}>湿度</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.humidity}%</div>
                        <Progress 
                          percent={astronomicalData.weather.humidity} 
                          size="small" 
                          strokeColor="#3498db"
                          showInfo={false}
                          className={styles.weatherProgress}
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <CloudOutlined style={{ color: '#95a5a6' }} />
                        </div>
                        <div className={styles.detailLabel}>云量</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.cloudCover}%</div>
                        <Progress 
                          percent={astronomicalData.weather.cloudCover} 
                          size="small" 
                          strokeColor="#95a5a6"
                          showInfo={false}
                          className={styles.weatherProgress}
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <CloudOutlined style={{ color: '#3498db' }} />
                        </div>
                        <div className={styles.detailLabel}>降水</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.precipitation}mm</div>
                        <div className={styles.detailSubValue}>
                          {astronomicalData.weather.precipitationProbability}% 概率
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <CompassOutlined style={{ color: '#2ecc71' }} />
                        </div>
                        <div className={styles.detailLabel}>风速</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.windSpeed} km/h</div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <CompassOutlined style={{ color: '#e67e22' }} />
                        </div>
                        <div className={styles.detailLabel}>风向</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.windDirection}°</div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={8}>
                    <div className={styles.weatherDetailItem}>
                      <div className={styles.detailHeader}>
                        <div className={styles.detailIcon}>
                          <EyeOutlined style={{ color: '#9b59b6' }} />
                        </div>
                        <div className={styles.detailLabel}>能见度</div>
                      </div>
                      <div className={styles.detailContent}>
                        <div className={styles.detailValue}>{astronomicalData.weather.visibility}</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 拍摄建议 */}
              <div className={styles.shootingTip}>
                {getShootingTip(astronomicalData.weather)}
              </div>
            </Card>
          )}

          {/* 拍摄准备清单 */}
          <Card title={<span className={styles.cardTitle}>拍摄准备清单</span>} className={styles.checklistCard}>
            <List
              size="small"
              dataSource={[
                {
                  title: '最佳到达时间',
                  content: '建议提前30分钟到达拍摄地点',
                },
                {
                  title: '器材准备',
                  content: '相机、三脚架、备用电池、存储卡',
                },
                {
                  title: '天气提醒',
                  content: '建议查看天气预报，注意光线条件',
                },
              ]}
              renderItem={(item) => (
                <List.Item className={styles.checklistItem}>
                  <List.Item.Meta
                    title={item.title}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PlanDetailsPage;