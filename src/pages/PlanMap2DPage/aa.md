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
  Tooltip,
  Switch,
  DatePicker,
  TimePicker
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CameraOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  SunOutlined,
  MoonOutlined,
  CloudOutlined,
  CompassOutlined,
  SaveOutlined,
  SwapOutlined,
  ExportOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { 
  Viewer, 
  Ion, 
  Camera, 
  Cartesian3, 
  Color, 
  Entity, 
  ScreenSpaceEventHandler, 
  ScreenSpaceEventType,
  Math as CesiumMath
} from 'cesium';
import dayjs from 'dayjs';
// 获取实时太阳月亮方位
import SunCalc from 'suncalc';

import html2canvas from 'html2canvas';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { DEFAULT_ION_TOKEN } from "../../config/config";

function PlanMap2DPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [astronomicalData, setAstronomicalData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [showSunPath, setShowSunPath] = useState(true);
  const [showMoonPath, setShowMoonPath] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const cameraEntityRef = useRef(null);
  const sunEntityRef = useRef(null);
  const moonEntityRef = useRef(null);
  const mapCardRef = useRef(null);
  const draggingRef = useRef(false); 
  const initialPositionRef = useRef(null); 
  const currentCameraPositionRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // 获取计划数据
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        // TODO: 替换为实际的API调用
        const data = {
          "id": 1,
          "name": "黄昏下的建筑",
          "description": "捕捉夕阳照射下的城市建筑",
          "start_time": "2025-04-25T10:00:00Z",
          "camera": {
            "focal_length": 35.0,
            "position": [30.2741, 120.1551, 100.0],
            "rotation": [0.0, 0.0, 0.0, 1.0]
          },
          "tileset_url": "https://mycdn.com/city/tileset.json",
          "user_id": "test_user_123",
          "created_at": "2023-06-10T08:30:00Z",
          "updated_at": "2023-06-10T08:30:00Z"
        };
        
        setPlanData(data);
        setCameraPosition(data.camera.position);
        currentCameraPositionRef.current = data.camera.position;
        const initialTime = dayjs(data.start_time);
        setSelectedDate(initialTime);
        setSelectedTime(initialTime);

        // 模拟天文数据
        const astroData = {
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
            cloudCover: 20,
            visibility: "良好",
            forecast: "晴朗"
          }
        };
        
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

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || !planData) return;

    try {
      // 创建 Viewer 实例
      viewerRef.current = new Viewer(mapContainerRef.current, {
        animation: false,
        baseLayerPicker: true,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        timeline: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
      });

      // 隐藏 Credits
      viewerRef.current._cesiumWidget._creditContainer.style.display = "none";

      // 设置 token
      Ion.defaultAccessToken = DEFAULT_ION_TOKEN;

      // 设置初始视角
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          planData.camera.position[1],
          planData.camera.position[0],
          planData.camera.position[2] + 1000
        ),
        duration: 2
      });

      // 添加相机位置标记
      cameraEntityRef.current = viewerRef.current.entities.add({
        position: Cartesian3.fromDegrees(
          planData.camera.position[1],
          planData.camera.position[0],
          planData.camera.position[2]
        ),
        point: {
          pixelSize: 20,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 3
        },
        label: {
          text: '拍摄位置',
          font: '14pt sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian3(0, -25),
          show: true
        }
      });

      // 添加太阳位置标记
      sunEntityRef.current = viewerRef.current.entities.add({
        position: Cartesian3.fromDegrees(
          planData.camera.position[1] + 0.05,
          planData.camera.position[0] + 0.05,
          planData.camera.position[2] + 1000
        ),
        billboard: {
          image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYzEwNyIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==',
          verticalOrigin: 1,
          scale: 0.5,
          color: Color.YELLOW
        },
        label: {
          text: '太阳位置',
          font: '12pt sans-serif',
          fillColor: Color.YELLOW,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian3(0, -15),
          show: true
        }
      });

      // 添加月亮位置标记
      moonEntityRef.current = viewerRef.current.entities.add({
        position: Cartesian3.fromDegrees(
          planData.camera.position[1] - 0.03,
          planData.camera.position[0] - 0.03,
          planData.camera.position[2] + 800
        ),
        billboard: {
          image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==',
          verticalOrigin: 1,
          scale: 0.5,
          color: Color.WHITE
        },
        label: {
          text: '月亮位置',
          font: '12pt sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian3(0, -15),
          show: true
        }
      });

      // 添加拖拽事件处理
      const handler = new ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
      let isPointPicked = false;
      
      handler.setInputAction((click)=>{
        console.log('鼠标按下事件触发');
        
        // 尝试多种方式检测点击的对象
        const pickedObject = viewerRef.current.scene.pick(click.position);
        console.log('点击对象:', pickedObject);
        console.log('相机实体:', cameraEntityRef.current);
        
        // 增加点击容错范围，检查附近的对象
        let isClickOnCamera = false;
        
        if (pickedObject && pickedObject.id === cameraEntityRef.current) {
          isClickOnCamera = true;
          console.log('直接点击到相机位置点');
        } else {
          // 尝试在点击位置周围检测
          const tolerance = 10; // 像素容错范围
          for (let dx = -tolerance; dx <= tolerance; dx += 5) {
            for (let dy = -tolerance; dy <= tolerance; dy += 5) {
              const testPosition = {
                x: click.position.x + dx,
                y: click.position.y + dy
              };
              const testPicked = viewerRef.current.scene.pick(testPosition);
              if (testPicked && testPicked.id === cameraEntityRef.current) {
                isClickOnCamera = true;
                console.log('在容错范围内检测到相机位置点');
                break;
              }
            }
            if (isClickOnCamera) break;
          }
        }
        
        if (isClickOnCamera) {
          console.log('开始拖拽相机位置点');
          draggingRef.current = true;
          setIsDragging(true);
          
          // 禁用场景的默认相机控制
          viewerRef.current.scene.screenSpaceCameraController.enableRotate = false;
          viewerRef.current.scene.screenSpaceCameraController.enableTranslate = false;
          viewerRef.current.scene.screenSpaceCameraController.enableZoom = false;
          viewerRef.current.scene.screenSpaceCameraController.enableTilt = false;
          viewerRef.current.scene.screenSpaceCameraController.enableLook = false;
          
          // 记录初始位置
          initialPositionRef.current = cameraEntityRef.current.position.getValue();
          
          viewerRef.current.cesiumWidget.canvas.style.cursor = 'move';
        } else {
          console.log('点击的不是相机位置点');
        }
      },ScreenSpaceEventType.LEFT_DOWN);

      // 检查点是否在当前视窗范围内
      const isPointInViewport = (longitude, latitude) => {
        if (!viewerRef.current) return true;
        
        const camera = viewerRef.current.camera;
        const canvas = viewerRef.current.canvas;
        
        // 获取当前视窗的边界
        const rectangle = camera.computeViewRectangle();
        if (!rectangle) return true;
        
        const lonRad = CesiumMath.toRadians(longitude);
        const latRad = CesiumMath.toRadians(latitude);
        
        // 检查点是否在视窗矩形内
        return (lonRad >= rectangle.west && lonRad <= rectangle.east &&
                latRad >= rectangle.south && latRad <= rectangle.north);
      };

      // 自动调整视窗以跟随拖拽的点
      const adjustViewportToFollow = (longitude, latitude, height) => {
        if (!viewerRef.current) return;
        
        const camera = viewerRef.current.camera;
        const currentHeight = camera.positionCartographic.height;
        
        // 计算合适的视角高度（保持当前高度的80%作为缓冲）
        const targetHeight = Math.max(currentHeight * 0.8, height + 500);
        
        // 平滑移动到新位置
        camera.flyTo({
          destination: Cartesian3.fromDegrees(longitude, latitude, targetHeight),
          duration: 0.5, // 较短的动画时间，保持流畅
          easingFunction: CesiumMath.EasingFunction.CUBIC_OUT
        });
      };

      handler.setInputAction((movement) => {
        console.log('鼠标移动事件触发，拖拽状态:', draggingRef.current);
        
        if (draggingRef.current) {
          console.log('处理拖拽移动');
          
          // 获取地表点（忽略高度）
          const cartesian = viewerRef.current.camera.pickEllipsoid(
            movement.endPosition,
            viewerRef.current.scene.globe.ellipsoid
          );
          
          if (cartesian) {
            console.log('获取到地表坐标');
            
            // 获取经纬度
            const cartographic = viewerRef.current.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            const longitude = CesiumMath.toDegrees(cartographic.longitude);
            const latitude = CesiumMath.toDegrees(cartographic.latitude);
            
            console.log('新的经纬度:', latitude, longitude);
            
            // 保持原始高度不变
            const initialPosition = initialPositionRef.current;
            const initialCartographic = viewerRef.current.scene.globe.ellipsoid.cartesianToCartographic(initialPosition);
            const height = initialCartographic.height;
            
            // 创建新位置（保持原始高度）
            const newPosition = Cartesian3.fromDegrees(longitude, latitude, height);
            cameraEntityRef.current.position = newPosition;
            
            // 检查是否需要调整视窗
            if (!isPointInViewport(longitude, latitude)) {
              console.log('调整视窗跟随拖拽点');
              adjustViewportToFollow(longitude, latitude, height);
            }
            
            // 减少状态更新频率，只更新ref
            const newCameraPosition = [latitude, longitude, height];
            currentCameraPositionRef.current = newCameraPosition;
            
            console.log('准备更新状态和天文数据');
            
            // 直接更新相机位置状态，减少延迟
            setCameraPosition(newCameraPosition);
            
            // 立即更新天文数据显示
            const fullDateTime = selectedDate
              .hour(selectedTime.hour())
              .minute(selectedTime.minute())
              .second(selectedTime.second());
            
            // 立即计算并更新天文数据
            console.log('重新计算天文数据 - 位置:', latitude, longitude, '时间:', fullDateTime.format('YYYY-MM-DD HH:mm'));
            const sunPosition = calculateSunPosition(fullDateTime.toDate(), latitude, longitude);
            const moonPosition = calculateMoonPosition(fullDateTime.toDate(), latitude, longitude);
            
            console.log('太阳位置:', sunPosition);
            console.log('月亮位置:', moonPosition);
            
            // 立即更新太阳月亮的视觉位置
            if (sunEntityRef.current) {
              const sunOffsetDistance = 0.05;
              const newSunPosition = Cartesian3.fromDegrees(
                longitude + Math.sin(sunPosition.azimuth * Math.PI / 180) * sunOffsetDistance,
                latitude + Math.cos(sunPosition.azimuth * Math.PI / 180) * sunOffsetDistance,
                height + 1000
              );
              sunEntityRef.current.position = newSunPosition;
              console.log('更新太阳视觉位置');
            }
            
            if (moonEntityRef.current) {
              const moonOffsetDistance = 0.03;
              const newMoonPosition = Cartesian3.fromDegrees(
                longitude + Math.sin(moonPosition.azimuth * Math.PI / 180) * moonOffsetDistance,
                latitude + Math.cos(moonPosition.azimuth * Math.PI / 180) * moonOffsetDistance,
                height + 800
              );
              moonEntityRef.current.position = newMoonPosition;
              console.log('更新月亮视觉位置');
            }
            
            // 使用节流更新天文数据面板，避免过于频繁的状态更新
            if (!updateTimeoutRef.current) {
              updateTimeoutRef.current = setTimeout(() => {
                setAstronomicalData(prev => {
                  const newData = {
                    ...prev,
                    sunPosition: {
                      altitude: Math.round(sunPosition.altitude),
                      azimuth: Math.round(sunPosition.azimuth),
                      sunrise: sunPosition.sunrise,
                      sunset: sunPosition.sunset,
                      goldenHour: sunPosition.goldenHour
                    },
                    moonPosition: {
                      altitude: Math.round(moonPosition.altitude),
                      azimuth: Math.round(moonPosition.azimuth),
                      phase: moonPosition.phase,
                      moonrise: moonPosition.moonrise,
                      moonset: moonPosition.moonset
                    }
                  };
                  console.log('更新天文数据面板:', newData);
                  return newData;
                });
                updateTimeoutRef.current = null;
              }, 100); // 100ms节流，避免过于频繁更新UI
            }
          } else {
            console.log('未能获取到地表坐标');
          }
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        console.log('鼠标释放事件触发，拖拽状态:', draggingRef.current);
        
        if (draggingRef.current) {
          console.log('结束拖拽');
          draggingRef.current = false;
          setIsDragging(false);
          
          // 不在拖拽结束时更新 planData，避免重新初始化地图
          // setPlanData 只在保存时调用
          
          // 重新启用相机控制
          viewerRef.current.scene.screenSpaceCameraController.enableRotate = true;
          viewerRef.current.scene.screenSpaceCameraController.enableTranslate = true;
          viewerRef.current.scene.screenSpaceCameraController.enableZoom = true;
          viewerRef.current.scene.screenSpaceCameraController.enableTilt = true;
          viewerRef.current.scene.screenSpaceCameraController.enableLook = true;
          
          viewerRef.current.cesiumWidget.canvas.style.cursor = 'auto';
        }
      }, ScreenSpaceEventType.LEFT_UP);

      // 清理函数
      return () => {
        handler.destroy();
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }
      };

    } catch (error) {
      console.error('初始化地图失败:', error);
      message.error('初始化地图失败');
    }
  }, [planData]); // 只依赖 planData，不依赖 cameraPosition

  // 单独处理相机位置更新，不重新初始化地图
  useEffect(() => {
    if (!cameraEntityRef.current || !cameraPosition) return;

    // 只更新相机实体位置，不重新初始化地图
    const newPosition = Cartesian3.fromDegrees(
      cameraPosition[1],
      cameraPosition[0],
      cameraPosition[2]
    );
    cameraEntityRef.current.position = newPosition;
  }, [cameraPosition]);

  // 防抖更新天文数据
  const updateAstronomicalDataDebounced = useCallback((latitude, longitude, height, dateTime) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (!viewerRef.current) return;

      // 更新太阳位置
      if (sunEntityRef.current) {
        const sunPosition = calculateSunPosition(dateTime.toDate(), latitude, longitude);
        
        // 增加偏移量，让太阳位置变化更明显
        const sunOffsetDistance = 0.05;
        sunEntityRef.current.position = Cartesian3.fromDegrees(
          longitude + Math.sin(sunPosition.azimuth * Math.PI / 180) * sunOffsetDistance,
          latitude + Math.cos(sunPosition.azimuth * Math.PI / 180) * sunOffsetDistance,
          height + 1000
        );

        // 更新天文数据
        setAstronomicalData(prev => ({
          ...prev,
          sunPosition: {
            altitude: Math.round(sunPosition.altitude),
            azimuth: Math.round(sunPosition.azimuth),
            sunrise: sunPosition.sunrise,
            sunset: sunPosition.sunset,
            goldenHour: sunPosition.goldenHour
          }
        }));
      }

      // 更新月亮位置
      if (moonEntityRef.current) {
        const moonPosition = calculateMoonPosition(dateTime.toDate(), latitude, longitude);
        
        // 增加偏移量，让月亮位置变化更明显
        const moonOffsetDistance = 0.03;
        moonEntityRef.current.position = Cartesian3.fromDegrees(
          longitude + Math.sin(moonPosition.azimuth * Math.PI / 180) * moonOffsetDistance,
          latitude + Math.cos(moonPosition.azimuth * Math.PI / 180) * moonOffsetDistance,
          height + 800
        );

        // 更新天文数据
        setAstronomicalData(prev => ({
          ...prev,
          moonPosition: {
            altitude: Math.round(moonPosition.altitude),
            azimuth: Math.round(moonPosition.azimuth),
            phase: moonPosition.phase,
            moonrise: moonPosition.moonrise,
            moonset: moonPosition.moonset
          }
        }));
      }
    }, 50); // 减少防抖时间从100ms到50ms，让更新更快
  }, []);

  // 更新时间相关的实体位置 - 简化依赖
  useEffect(() => {
    if (!cameraPosition) return;

    const [latitude, longitude, height] = cameraPosition;
    
    // 合并日期和时间
    const fullDateTime = selectedDate
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(selectedTime.second());

    // 使用防抖更新，传入完整的位置信息
    updateAstronomicalDataDebounced(latitude, longitude, height, fullDateTime);

    // 清理函数
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [selectedDate, selectedTime, cameraPosition, updateAstronomicalDataDebounced]);

  // 计算太阳位置（使用SunCalc）
  const calculateSunPosition = (date, latitude, longitude) => {
    console.log('计算太阳位置 - 输入参数:', { date, latitude, longitude });
    
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    
    // 转换弧度到角度
    const altitude = (sunPos.altitude * 180) / Math.PI;
    const azimuth = ((sunPos.azimuth * 180) / Math.PI + 180) % 360; // 转换为0-360度，北为0度

    // 获取日出日落时间
    const times = SunCalc.getTimes(date, latitude, longitude);
    const sunrise = dayjs(times.sunrise).format('HH:mm');
    const sunset = dayjs(times.sunset).format('HH:mm');
    
    // 计算黄金时刻
    const goldenHourMorning = dayjs(times.goldenHour).format('HH:mm');
    const goldenHourEvening = dayjs(times.goldenHourEnd).format('HH:mm');

    const result = {
      altitude,
      azimuth,
      sunrise,
      sunset,
      goldenHour: {
        morning: goldenHourMorning,
        evening: goldenHourEvening
      }
    };
    
    console.log('太阳位置计算结果:', result);
    return result;
  };

  // 计算月亮位置（使用SunCalc）
  const calculateMoonPosition = (date, latitude, longitude) => {
    console.log('计算月亮位置 - 输入参数:', { date, latitude, longitude });
    
    const moonPos = SunCalc.getMoonPosition(date, latitude, longitude);
    const moonIllumination = SunCalc.getMoonIllumination(date);
    
    // 转换弧度到角度
    const altitude = (moonPos.altitude * 180) / Math.PI;
    const azimuth = ((moonPos.azimuth * 180) / Math.PI + 180) % 360; // 转换为0-360度，北为0度

    // 获取月相信息
    const phase = moonIllumination.phase;
    let phaseName = '';
    if (phase < 0.25) phaseName = '新月';
    else if (phase < 0.5) phaseName = '上弦月';
    else if (phase < 0.75) phaseName = '满月';
    else phaseName = '下弦月';

    // 获取月亮升起和落下时间
    const times = SunCalc.getMoonTimes(date, latitude, longitude);
    const moonrise = times.rise ? dayjs(times.rise).format('HH:mm') : '不升起';
    const moonset = times.set ? dayjs(times.set).format('HH:mm') : '不落下';

    const result = {
      altitude,
      azimuth,
      phase: phaseName,
      moonrise,
      moonset
    };
    
    console.log('月亮位置计算结果:', result);
    return result;
  };

  // 保存更新
  const handleSave = async () => {
    try {
      // 保存时才更新 planData
      if (currentCameraPositionRef.current) {
        setPlanData(prev => ({
          ...prev,
          camera: {
            ...prev.camera,
            position: currentCameraPositionRef.current
          }
        }));
      }
      
      // TODO: 实现保存逻辑
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 导出地图
  const handleExport = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.canvas;
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `map_${planData.name}_${selectedDate.format('YYYY-MM-DD')}_${selectedTime.format('HH-mm')}.png`;
      link.click();
    }
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography.Text type="danger">加载失败: {error}</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/plans/${id}`)}
              >
                返回
              </Button>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {planData?.name} - 2D地图
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存
              </Button>
              <Button 
                icon={<SwapOutlined />}
                onClick={handleSwitchTo3D}
              >
                切换到3D视图
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出地图
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 地图容器 */}
      <Card style={{ flex: 1, marginBottom: '16px' }}>
        <div
          ref={mapContainerRef}
          style={{
            height: '100%',
            width: '100%',
            position: 'relative'
          }}
        />
      </Card>

      {/* 底部控制面板 */}
      <Row gutter={16}>
        {/* 时间控制 */}
        <Col span={8}>
          <Card title="时间控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={8}>
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
            </Space>
          </Card>
        </Col>

        {/* 图层控制 */}
        <Col span={8}>
          <Card title="图层控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <SunOutlined />
                    <Typography.Text>太阳轨迹</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showSunPath}
                    onChange={setShowSunPath}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Col>
              </Row>
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <MoonOutlined />
                    <Typography.Text>月亮轨迹</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showMoonPath}
                    onChange={setShowMoonPath}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Col>
              </Row>
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <CloudOutlined />
                    <Typography.Text>天气信息</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showWeather}
                    onChange={setShowWeather}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* 天文数据 */}
        <Col span={8}>
          <Card title="天文数据" size="small">
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
                  title: '日出/日落',
                  content: `${astronomicalData?.sunPosition.sunrise} / ${astronomicalData?.sunPosition.sunset}`,
                },
                {
                  icon: <MoonOutlined />,
                  title: '月亮位置',
                  content: `高度角: ${astronomicalData?.moonPosition.altitude}°, 方位角: ${astronomicalData?.moonPosition.azimuth}°`,
                },
                {
                  icon: <CloudOutlined />,
                  title: '天气',
                  content: `${astronomicalData?.weather.temperature}°C, ${astronomicalData?.weather.forecast}`,
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
      </Row>
    </div>
  );
}

export default PlanMap2DPage;