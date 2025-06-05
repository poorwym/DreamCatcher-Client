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
} from '@ant-design/icons';

import { DEFAULT_ION_TOKEN, DEFAULT_VIEW_RECTANGLE } from "../../config/config";
import { HeightReference } from "cesium"; 
import { Viewer, Ion, Camera } from "cesium";
import { Cartesian3, HeadingPitchRoll, Math as CesiumMath, Transforms, JulianDate } from "cesium";
import { Cartesian2,Color, VerticalOrigin } from "cesium";
import { ImageryLayer } from "cesium";
import { IonImageryProvider, UrlTemplateImageryProvider, WebMapTileServiceImageryProvider, WebMercatorTilingScheme, Credit } from "cesium";
// 导入API服务
import { planAPI, astronomyAPI } from '../../services/api';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';

import 'cesium/Build/Cesium/Widgets/widgets.css';
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
  const viewerRef = useRef(null);

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
    console.log('viewerRef.current:', viewerRef.current);
    
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
      if (viewerRef.current) {
        console.log('清理地图实例');
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [planData]);

  // 新增：专门处理地图容器准备状态的 useEffect
  useEffect(() => {
    // 确保地图容器DOM准备好后再初始化地图
    if (planData && mapContainerRef.current && !viewerRef.current) {
      console.log('=== DOM容器准备好，延迟初始化地图 ===');
      // 添加短暂延迟确保DOM完全渲染
      const timer = setTimeout(() => {
        console.log('延迟初始化开始，检查条件:');
        console.log('- mapContainerRef.current:', !!mapContainerRef.current);
        console.log('- planData:', !!planData);
        console.log('- viewerRef.current:', !!viewerRef.current);
        
        if (mapContainerRef.current && planData && !viewerRef.current) {
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
    if (viewerRef.current) {
      console.log('清理现有地图实例');
      viewerRef.current.destroy();
      viewerRef.current = null;
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
    console.log('- viewerRef.current:', !!viewerRef.current);
    console.log('- planData.camera:', planData?.camera);
    console.log('- container DOM 状态:', mapContainerRef.current ? {
      offsetWidth: mapContainerRef.current.offsetWidth,
      offsetHeight: mapContainerRef.current.offsetHeight,
      display: window.getComputedStyle(mapContainerRef.current).display,
      visibility: window.getComputedStyle(mapContainerRef.current).visibility
    } : 'null');
    
    if (!mapContainerRef.current || !planData || viewerRef.current) {
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
      console.log('=== 开始创建 Cesium Viewer ===');
      
      // 设置 Cesium Ion 访问令牌
      if (DEFAULT_ION_TOKEN) {
        Ion.defaultAccessToken = DEFAULT_ION_TOKEN;
        console.log('Cesium Ion token 已设置');
      } else {
        console.warn('未设置 Cesium Ion token');
      }

      // 清空容器内容（防止重复创建）
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
        console.log('已清空地图容器内容');
      }

      // 创建 Cesium Viewer
      console.log('准备创建 Cesium Viewer，容器:', mapContainerRef.current);
      const viewer = new Viewer(mapContainerRef.current, {
        terrainProvider: undefined, // 不加载地形
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        infoBox: false,
        selectionIndicator: false,
      });

      viewerRef.current = viewer;
      console.log('Cesium Viewer 创建成功:', viewer);
      console.log('Viewer container:', viewer.container);
      console.log('Viewer canvas:', viewer.canvas);

      // 移除默认底图
      viewer.imageryLayers.removeAll();
      console.log('已移除默认底图');

      // 添加高德地图底图
      const gaodeProvider = new UrlTemplateImageryProvider({
        url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        credit: new Credit("© 高德地图"),
      });
      const gaodeLayer = new ImageryLayer(gaodeProvider);
      viewer.imageryLayers.add(gaodeLayer);
      console.log('高德地图底图添加成功');

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
      
      // 转换为 Cartesian3 坐标
      const position = Cartesian3.fromDegrees(longitude, latitude, height);
      console.log('转换为 Cartesian3:', position);

      // 创建相机位置标记
      const cameraEntity = viewer.entities.add({
        name: '拍摄位置',
        position: position,
        point: {
          pixelSize: 20,
          color: Color.YELLOW,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          show: true
        },
        label: {
          text: planData.name || '拍摄位置',
          font: '14pt sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: 0, // FILL_AND_OUTLINE
          pixelOffset: new Cartesian2(0, -60),
          verticalOrigin: VerticalOrigin.BOTTOM,
          scale: 0.8,
          show: true
        },
        billboard: {
          image: createCameraIcon(),
          width: 48,
          height: 48,
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          pixelOffset: new Cartesian2(0, -10),
          show: true
        }
      });

      console.log('相机标记创建成功:', cameraEntity);

      // 设置相机视角，确保能看到标记
      const initialCameraPosition = Cartesian3.fromDegrees(longitude, latitude, height + 2000);
      console.log('设置初始相机位置:', initialCameraPosition);
      
      viewer.camera.setView({
        destination: initialCameraPosition,
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-60),
          roll: 0.0
        }
      });

      // 等待地图完全加载后再飞行到位置
      setTimeout(() => {
        console.log('开始飞行动画');
        if (viewer && !viewer.isDestroyed()) {
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(longitude, latitude, height + 1500),
            duration: 2.0
          });
        }
      }, 1000);

      // 添加点击事件
      viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
        if (selectedEntity === cameraEntity) {
          message.info(`拍摄位置: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      });

      // 强制渲染
      setTimeout(() => {
        if (viewer && !viewer.isDestroyed()) {
          viewer.render();
          console.log('强制渲染完成');
        }
      }, 100);

      console.log('=== Cesium 地图初始化完成 ===');
      console.log('相机位置:', { latitude, longitude, height });
      console.log('创建的实体:', cameraEntity);

    } catch (error) {
      console.error('=== Cesium 地图初始化失败 ===', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      message.error('地图加载失败: ' + error.message);
    }
  };

  // 创建相机图标
  const createCameraIcon = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    // 绘制相机图标
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(8, 12, 32, 20); // 使用fillRect替代roundRect以兼容性
    
    // 绘制镜头
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(24, 22, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(24, 22, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // 镜头反光
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(24, 22, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // 添加一个小的反光点
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(22, 20, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    return canvas.toDataURL();
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
    if (viewerRef.current && planData) {
      const latitude = planData.camera.position[0];
      const longitude = planData.camera.position[1];
      const height = planData.camera.position[2];
      console.log('飞行到相机位置:', { latitude, longitude, height });
      
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height + 1000),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0.0
        },
        duration: 2.0
      });
      
      // 确保实体可见
      if (viewerRef.current.entities.values.length > 0) {
        viewerRef.current.entities.values.forEach(entity => {
          console.log('实体状态:', entity.name, entity.show);
        });
      }
    } else {
      console.warn('无法飞行到相机位置: viewer或planData未就绪');
    }
  };

  // 调试地图容器状态
  const debugMapContainer = () => {
    console.log('=== 调试地图容器状态 ===');
    console.log('mapContainerRef.current:', mapContainerRef.current);
    console.log('planData:', !!planData);
    console.log('viewerRef.current:', !!viewerRef.current);
    
    if (mapContainerRef.current) {
      const container = mapContainerRef.current;
      console.log('容器元素:', container);
      console.log('容器尺寸:', {
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight
      });
      
      const style = window.getComputedStyle(container);
      console.log('容器样式:', {
        display: style.display,
        visibility: style.visibility,
        width: style.width,
        height: style.height,
        position: style.position
      });
      
      // 检查 Viewer 状态
      if (viewerRef.current) {
        console.log('=== Viewer 状态检查 ===');
        console.log('Viewer 对象:', viewerRef.current);
        console.log('Viewer 容器:', viewerRef.current.container);
        console.log('Viewer canvas:', viewerRef.current.canvas);
        console.log('Scene:', viewerRef.current.scene);
        console.log('实体数量:', viewerRef.current.entities.values.length);
        console.log('图层数量:', viewerRef.current.imageryLayers.length);
        
        // 检查 canvas 样式
        if (viewerRef.current.canvas) {
          const canvasStyle = window.getComputedStyle(viewerRef.current.canvas);
          console.log('Canvas 样式:', {
            display: canvasStyle.display,
            visibility: canvasStyle.visibility,
            width: canvasStyle.width,
            height: canvasStyle.height,
            position: canvasStyle.position
          });
        }
        
        // 强制渲染
        try {
          viewerRef.current.render();
          console.log('强制渲染完成');
        } catch (renderError) {
          console.error('强制渲染失败:', renderError);
        }
      }
      
      // 如果有planData但没有viewer，强制初始化地图
      if (planData && !viewerRef.current) {
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
    
    // 清理现有的 viewer
    if (viewerRef.current) {
      console.log('销毁现有 Viewer');
      try {
        viewerRef.current.destroy();
      } catch (error) {
        console.error('销毁 Viewer 失败:', error);
      }
      viewerRef.current = null;
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
              {!viewerRef.current && (
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
                      content: `经度: ${planData.camera.position[1]}, 纬度: ${planData.camera.position[0]}, 高度: ${planData.camera.position[2]}m`,
                    },
                    {
                      icon: <CompassOutlined />,
                      title: '相机旋转',
                      content: `X: ${planData.camera.rotation[0]}, Y: ${planData.camera.rotation[1]}, Z: ${planData.camera.rotation[2]}, W: ${planData.camera.rotation[3]}`,
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
                <Card title={<span className={styles.cardTitle}>天文数据</span>} className={styles.astronomyCard}>
                  <List
                    className={styles.infoList}
                    itemLayout="horizontal"
                    dataSource={[
                      {
                        icon: <SunOutlined />,
                        title: '太阳位置',
                        content: `高度角: ${astronomicalData.sunPosition.altitude}°, 方位角: ${astronomicalData.sunPosition.azimuth}°`,
                      },
                      {
                        icon: <ClockCircleOutlined />,
                        title: '日出/日落',
                        content: `${astronomicalData.sunPosition.sunrise} / ${astronomicalData.sunPosition.sunset}`,
                      },
                      {
                        icon: <SunOutlined />,
                        title: '黄金时刻',
                        content: `早晨: ${astronomicalData.sunPosition.goldenHour.morning}, 傍晚: ${astronomicalData.sunPosition.goldenHour.evening}`,
                      },
                      {
                        icon: <MoonOutlined />,
                        title: '月亮位置',
                        content: `高度角: ${astronomicalData.moonPosition.altitude}°, 方位角: ${astronomicalData.moonPosition.azimuth}°`,
                      },
                      {
                        icon: <MoonOutlined />,
                        title: '月相',
                        content: astronomicalData.moonPosition.phase,
                      },
                      {
                        icon: <ClockCircleOutlined />,
                        title: '月出/月落',
                        content: `${astronomicalData.moonPosition.moonrise} / ${astronomicalData.moonPosition.moonset}`,
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
            <Card title={<span className={styles.cardTitle}>天气信息</span>} className={styles.weatherCard}>
              <List
                className={styles.infoList}
                itemLayout="horizontal"
                dataSource={[
                  {
                    icon: <CloudOutlined />,
                    title: '温度',
                    content: `${astronomicalData.weather.temperature}°C (体感 ${astronomicalData.weather.feelsLike}°C)`,
                  },
                  {
                    icon: <CloudOutlined />,
                    title: '湿度',
                    content: (
                      <div className={styles.progressContainer}>
                        <Progress percent={astronomicalData.weather.humidity} size="small" />
                        <span>{astronomicalData.weather.humidity}%</span>
                      </div>
                    ),
                  },
                  {
                    icon: <CloudOutlined />,
                    title: '云量',
                    content: (
                      <div className={styles.progressContainer}>
                        <Progress percent={astronomicalData.weather.cloudCover} size="small" />
                        <span>{astronomicalData.weather.cloudCover}%</span>
                      </div>
                    ),
                  },
                  {
                    icon: <EnvironmentOutlined />,
                    title: '能见度',
                    content: astronomicalData.weather.visibility,
                  },
                  {
                    icon: <CompassOutlined />,
                    title: '风速风向',
                    content: `${astronomicalData.weather.windSpeed}km/h ${astronomicalData.weather.windDirection}°`,
                  },
                  {
                    icon: <CloudOutlined />,
                    title: '降水',
                    content: `${astronomicalData.weather.precipitation}mm (${astronomicalData.weather.precipitationProbability}%概率)`,
                  },
                  {
                    icon: <CloudOutlined />,
                    title: '天气状况',
                    content: astronomicalData.weather.conditions,
                  },
                  {
                    icon: <CloudOutlined />,
                    title: '天气描述',
                    content: astronomicalData.weather.description,
                  },
                ]}
                renderItem={(item) => (
                  <List.Item className={styles.weatherItem}>
                    <List.Item.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
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