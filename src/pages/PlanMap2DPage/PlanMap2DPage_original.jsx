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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dayjs from 'dayjs';
// 获取实时太阳月亮方位
import SunCalc from 'suncalc';

import html2canvas from 'html2canvas';
import styles from './PlanMap2DPage.module.css';

// 修复 Leaflet 默认图标问题
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
  const [planData, setPlanData] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [astronomicalData, setAstronomicalData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [showSunPath, setShowSunPath] = useState(true);
  const [showMoonPath, setShowMoonPath] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const cameraMarkerRef = useRef(null);
  const sunMarkerRef = useRef(null);
  const moonMarkerRef = useRef(null);
  const sunPathRef = useRef(null);
  const sunRaysRef = useRef(null);
  const sunriseMarkerRef = useRef(null);
  const sunsetMarkerRef = useRef(null);
  const moonriseMarkerRef = useRef(null);
  const moonsetMarkerRef = useRef(null);
  const moonRaysRef = useRef(null);
  const mapCardRef = useRef(null);
  const draggingRef = useRef(false); 
  const initialPositionRef = useRef(null); 
  const currentCameraPositionRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  // 添加时间状态的ref，确保缩放事件处理器使用最新值
  const selectedDateRef = useRef(selectedDate);
  const selectedTimeRef = useRef(selectedTime);

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
            phase: 0.5,
            phaseName: "满月",
            illumination: 100,
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
        minZoom: 3,  // 限制最小缩放级别
        maxZoom: 19, // 限制最大缩放级别
        zoomSnap: 0.5, // 缩放步长
        zoomDelta: 1, // 滚轮缩放步长
        worldCopyJump: false, // 禁用世界循环跳跃
        maxBounds: [[-90, -180], [90, 180]], // 限制地图边界
        maxBoundsViscosity: 1.0 // 边界粘性，防止拖拽超出边界
      }).setView([planData.camera.position[0], planData.camera.position[1]], 15);

      // 添加底图图层 - 使用高德地图
      const amapLayer = L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        minZoom: 3,
        maxZoom: 19,
        noWrap: true // 禁用瓦片无限循环
      });
      
      amapLayer.addTo(mapRef.current);

      // 可选择添加卫星图层 - 使用高德卫星图
      const satelliteLayer = L.tileLayer('https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        minZoom: 3,
        maxZoom: 19,
        noWrap: true // 禁用瓦片无限循环
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

      // 创建专业的太阳可视化
      if (planData && selectedTime && selectedDate) {
        setTimeout(() => {
          // 合并选定的日期和时间
          const combinedDateTime = selectedDate
            .hour(selectedTime.hour())
            .minute(selectedTime.minute())
            .second(selectedTime.second());
          
          createSunVisualization(
            combinedDateTime.toDate(), 
            planData.camera.position[0], 
            planData.camera.position[1]
          );

          // 创建专业的月亮可视化
          createMoonVisualization(
            combinedDateTime.toDate(), 
            planData.camera.position[0], 
            planData.camera.position[1]
          );
        }, 500);
      }

      // 添加相机标记拖拽事件
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
        
        // 合并选定的日期和时间 - 使用ref中的最新值
        const combinedDateTime = selectedDateRef.current
          .hour(selectedTimeRef.current.hour())
          .minute(selectedTimeRef.current.minute())
          .second(selectedTimeRef.current.second());
        
        // 更新天文数据
        updateAstronomicalData(combinedDateTime, lat, lng);
      });

      // 确保地图正确渲染
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          // 确保地图视角正确设置
          mapRef.current.setView([planData.camera.position[0], planData.camera.position[1]], 15);
        }
      }, 100);

      // 监听窗口大小变化
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };

      // 监听地图缩放事件，重新计算标记位置
      let zoomTimeout;
      const handleZoom = () => {
        if (zoomTimeout) {
          clearTimeout(zoomTimeout);
        }
        
        zoomTimeout = setTimeout(() => {
          if (selectedTimeRef.current && selectedDateRef.current && currentCameraPositionRef.current) {
            console.log('缩放事件触发，当前缩放级别:', mapRef.current.getZoom());
            console.log('使用时间状态:', {
              selectedDate: selectedDateRef.current.format('YYYY-MM-DD'),
              selectedTime: selectedTimeRef.current.format('HH:mm')
            });
            
            // 合并选定的日期和时间 - 使用ref中的最新值
            const combinedDateTime = selectedDateRef.current
              .hour(selectedTimeRef.current.hour())
              .minute(selectedTimeRef.current.minute())
              .second(selectedTimeRef.current.second());
            
            // 获取当前相机位置
            const currentPos = currentCameraPositionRef.current;
            
            // 重新创建可视化
            createSunVisualization(
              combinedDateTime.toDate(), 
              currentPos[0], 
              currentPos[1]
            );

            createMoonVisualization(
              combinedDateTime.toDate(), 
              currentPos[0], 
              currentPos[1]
            );
          }
        }, 300); // 300ms 防抖
      };

      window.addEventListener('resize', handleResize);
      mapRef.current.on('zoomend', handleZoom);

    } catch (error) {
      console.error('初始化地图失败:', error);
      message.error('初始化地图失败');
    }

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) {
        try {
          mapRef.current.off('zoomend', handleZoom);
          mapRef.current.remove();
        } catch (e) {
          console.warn('地图清理时出现错误:', e);
        }
        mapRef.current = null;
        cameraMarkerRef.current = null;
        sunMarkerRef.current = null;
        moonMarkerRef.current = null;
        sunPathRef.current = null;
        sunRaysRef.current = null;
        sunriseMarkerRef.current = null;
        sunsetMarkerRef.current = null;
        moonriseMarkerRef.current = null;
        moonsetMarkerRef.current = null;
        moonRaysRef.current = null;
      }
    };
  }, [planData]);

  // 单独处理相机位置更新，不重新初始化地图
  useEffect(() => {
    if (!cameraMarkerRef.current || !cameraPosition || draggingRef.current) return;

    // 只更新相机标记位置，不重新初始化地图
    cameraMarkerRef.current.setLatLng([cameraPosition[0], cameraPosition[1]]);
  }, [cameraPosition]);

  // 防抖更新天文数据
  const updateAstronomicalData = useCallback((datetime, latitude, longitude) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      try {
        console.log('=== 更新天文数据 ===');
        console.log('日期时间:', datetime.format ? datetime.format('YYYY-MM-DD HH:mm:ss') : datetime.toLocaleString());
        console.log('位置:', { latitude, longitude });
        
        const sunPos = calculateSunPosition(datetime.toDate(), latitude, longitude);
        const moonPos = calculateMoonPosition(datetime.toDate(), latitude, longitude);
        
        // 计算日出日落时间
        const sunTimes = SunCalc.getTimes(datetime.toDate(), latitude, longitude);
        
        // 计算月出月落时间
        const moonTimes = SunCalc.getMoonTimes(datetime.toDate(), latitude, longitude);
        
        // 计算月相信息
        const moonIllumination = SunCalc.getMoonIllumination(datetime.toDate());
        const moonPhaseNames = [
          '新月', '娥眉月', '上弦月', '盈凸月', 
          '满月', '亏凸月', '下弦月', '残月'
        ];
        const moonPhaseName = moonPhaseNames[Math.floor(moonIllumination.phase * 8)];
        
        console.log('计算结果:', {
          sunPos,
          sunrise: sunTimes.sunrise.toLocaleTimeString(),
          sunset: sunTimes.sunset.toLocaleTimeString(),
          moonrise: moonTimes.rise ? moonTimes.rise.toLocaleTimeString() : '无',
          moonset: moonTimes.set ? moonTimes.set.toLocaleTimeString() : '无',
          moonPhase: moonIllumination.phase,
          moonPhaseName: moonPhaseName
        });
        
        setAstronomicalData(prev => ({
          ...prev,
          sunPosition: {
            ...prev.sunPosition,
            altitude: sunPos.altitude,
            azimuth: sunPos.azimuth,
            sunrise: sunTimes.sunrise.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            sunset: sunTimes.sunset.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          },
          moonPosition: {
            ...prev.moonPosition,
            altitude: moonPos.altitude,
            azimuth: moonPos.azimuth,
            moonrise: moonTimes.rise ? moonTimes.rise.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无',
            moonset: moonTimes.set ? moonTimes.set.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无',
            phase: moonIllumination.phase,
            phaseName: moonPhaseName,
            illumination: Math.round(moonIllumination.fraction * 100)
          }
        }));

        // 更新太阳位置标记
        updateSunVisualization(datetime.toDate(), latitude, longitude);
        
        // 更新月亮位置标记
        updateMoonVisualization(datetime.toDate(), latitude, longitude);
      } catch (error) {
        console.error('更新天文数据失败:', error);
      }
    }, 300); // 300ms 防抖
  }, []);

  // 创建专业的太阳可视化
  const createSunVisualization = (date, latitude, longitude) => {
    if (!mapRef.current) return;

    // 清除之前的太阳可视化
    if (sunPathRef.current) {
      mapRef.current.removeLayer(sunPathRef.current);
    }
    if (sunRaysRef.current) {
      mapRef.current.removeLayer(sunRaysRef.current);
    }
    if (sunriseMarkerRef.current) {
      mapRef.current.removeLayer(sunriseMarkerRef.current);
    }
    if (sunsetMarkerRef.current) {
      mapRef.current.removeLayer(sunsetMarkerRef.current);
    }

    // 计算日出日落时间和位置
    const sunTimes = SunCalc.getTimes(date, latitude, longitude);
    const sunrisePos = SunCalc.getPosition(sunTimes.sunrise, latitude, longitude);
    const sunsetPos = SunCalc.getPosition(sunTimes.sunset, latitude, longitude);

    // 计算日出日落的方位角（转换为度并调整）
    const sunriseAzimuth = (sunrisePos.azimuth * 180 / Math.PI) + 180;
    const sunsetAzimuth = (sunsetPos.azimuth * 180 / Math.PI) + 180;

    // 计算日出日落在地图上的位置
    const markDistance = 0.012; // 标记距离相机的距离
    
    // 日出位置
    const [sunriseLat, sunriseLng] = calculateMarkerPosition(latitude, longitude, sunriseAzimuth, markDistance, 'sunrise');

    // 日落位置
    const [sunsetLat, sunsetLng] = calculateMarkerPosition(latitude, longitude, sunsetAzimuth, markDistance, 'sunset');

    // 创建日出标记
    const sunriseIcon = L.divIcon({
      html: `<div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      ">
        <div style="
          background: linear-gradient(135deg, #ff6b35 0%, #ff8f00 50%, #ffd54f 100%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.7);
          position: relative;
        "></div>
        <div style="
          background: rgba(255, 107, 53, 0.9);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">日出</div>
      </div>`,
      iconSize: [40, 35],
      iconAnchor: [20, 17],
      className: 'sunrise-marker'
    });

    sunriseMarkerRef.current = L.marker([sunriseLat, sunriseLng], {
      icon: sunriseIcon,
      zIndexOffset: 900
    }).addTo(mapRef.current);

    // 创建日落标记
    const sunsetIcon = L.divIcon({
      html: `<div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      ">
        <div style="
          background: linear-gradient(135deg, #ff8f00 0%, #ff6b35 50%, #e74c3c 100%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(255, 143, 0, 0.7);
          position: relative;
        "></div>
        <div style="
          background: rgba(255, 143, 0, 0.9);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">日落</div>
      </div>`,
      iconSize: [40, 35],
      iconAnchor: [20, 17],
      className: 'sunset-marker'
    });

    sunsetMarkerRef.current = L.marker([sunsetLat, sunsetLng], {
      icon: sunsetIcon,
      zIndexOffset: 900
    }).addTo(mapRef.current);

    // 绑定日出日落信息弹窗
    const sunriseContent = `
      <div style="text-align: center; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #ff6b35;">🌅 日出</h4>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${sunTimes.sunrise.toLocaleTimeString()}</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${sunriseAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0; font-size: 12px; color: #666;">太阳从这个方向升起</div>
      </div>
    `;

    const sunsetContent = `
      <div style="text-align: center; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #ff8f00;">🌇 日落</h4>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${sunTimes.sunset.toLocaleTimeString()}</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${sunsetAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0; font-size: 12px; color: #666;">太阳在这个方向落下</div>
      </div>
    `;

    sunriseMarkerRef.current.bindPopup(sunriseContent, {
      offset: [0, -17],
      className: 'sunrise-popup'
    });

    sunsetMarkerRef.current.bindPopup(sunsetContent, {
      offset: [0, -17],
      className: 'sunset-popup'
    });

    // 计算全天的太阳轨迹
    const sunPath = [];
    
    // 从日出前1小时到日落后1小时，每15分钟计算一次位置
    const startTime = new Date(sunTimes.sunrise.getTime() - 60 * 60 * 1000); // 日出前1小时
    const endTime = new Date(sunTimes.sunset.getTime() + 60 * 60 * 1000);   // 日落后1小时
    
    for (let time = startTime; time <= endTime; time = new Date(time.getTime() + 15 * 60 * 1000)) {
      const sunPos = SunCalc.getPosition(time, latitude, longitude);
      const altitude = sunPos.altitude * 180 / Math.PI; // 转换为度
      const azimuth = sunPos.azimuth * 180 / Math.PI + 180; // 转换为度，调整方位角
      
      if (altitude > -18) { // 只显示民用曙光时间以上的轨迹
        // 根据方位角和高度角计算地图上的位置，使用相同的距离计算方法
        const baseDistance = Math.max(0.001, 0.01 * (90 - altitude) / 90);
        const [sunLat, sunLng] = calculateMarkerPosition(latitude, longitude, azimuth, baseDistance, 'sun');
        
        sunPath.push([sunLat, sunLng, altitude, time]);
      }
    }

    // 创建太阳轨迹线
    if (sunPath.length > 0) {
      const pathCoords = sunPath.map(point => [point[0], point[1]]);
      
      // 创建渐变色轨迹
      const sunPathLayer = L.layerGroup();
      
      for (let i = 0; i < pathCoords.length - 1; i++) {
        const altitude1 = sunPath[i][2];
        const altitude2 = sunPath[i + 1][2];
        const avgAltitude = (altitude1 + altitude2) / 2;
        
        // 根据高度角设置颜色：低角度偏红，高角度偏黄
        let color;
        if (avgAltitude < 0) {
          color = '#4a5568'; // 夜间 - 灰色
        } else if (avgAltitude < 10) {
          color = '#ff6b6b'; // 低角度 - 红色
        } else if (avgAltitude < 30) {
          color = '#ffa726'; // 中低角度 - 橙色
        } else if (avgAltitude < 60) {
          color = '#ffd54f'; // 中高角度 - 黄色
        } else {
          color = '#fff176'; // 高角度 - 亮黄色
        }
        
        const segment = L.polyline([pathCoords[i], pathCoords[i + 1]], {
          color: color,
          weight: 3,
          opacity: 0.8
        });
        
        sunPathLayer.addLayer(segment);
      }
      
      sunPathRef.current = sunPathLayer;
      sunPathLayer.addTo(mapRef.current);
    }

    // 创建当前太阳位置和光线
    const currentSunPos = SunCalc.getPosition(date, latitude, longitude);
    const currentAltitude = currentSunPos.altitude * 180 / Math.PI;
    const currentAzimuth = currentSunPos.azimuth * 180 / Math.PI + 180;
    
    if (currentAltitude > 0) {
      // 计算当前太阳在地图上的位置
      const distance = Math.max(0.001, 0.01 * (90 - currentAltitude) / 90);
      const [sunLat, sunLng] = calculateMarkerPosition(latitude, longitude, currentAzimuth, distance, 'sun');

      // 更新或创建太阳标记
      if (sunMarkerRef.current) {
        sunMarkerRef.current.setLatLng([sunLat, sunLng]);
      } else {
        const sunIcon = createSunIcon();

        sunMarkerRef.current = L.marker([sunLat, sunLng], {
          icon: sunIcon,
          zIndexOffset: 1000
        }).addTo(mapRef.current);
      }

      // 创建太阳光线效果
      const raysLayer = L.layerGroup();
      
      // 添加从相机到太阳的方位线
      const azimuthLine = L.polyline([[latitude, longitude], [sunLat, sunLng]], {
        color: '#ffd54f',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10'
      });
      raysLayer.addLayer(azimuthLine);

      // 添加从相机到日出位置的指示线
      const sunriseLine = L.polyline([[latitude, longitude], [sunriseLat, sunriseLng]], {
        color: '#ff6b35',
        weight: 2,
        opacity: 0.4,
        dashArray: '3, 6'
      });
      raysLayer.addLayer(sunriseLine);

      // 添加从相机到日落位置的指示线
      const sunsetLine = L.polyline([[latitude, longitude], [sunsetLat, sunsetLng]], {
        color: '#ff8f00',
        weight: 2,
        opacity: 0.4,
        dashArray: '3, 6'
      });
      raysLayer.addLayer(sunsetLine);

      // 添加高度角弧线（模拟）
      const altitudeRadius = distance * 0.3;
      const altitudeArc = [];
      for (let angle = 0; angle <= currentAltitude; angle += 2) {
        const angleRad = angle * Math.PI / 180;
        const arcDistance = altitudeRadius * Math.cos(angleRad);
        const arcLat = latitude + arcDistance * Math.cos(currentAzimuth * Math.PI / 180);
        const arcLng = longitude + arcDistance * Math.sin(currentAzimuth * Math.PI / 180);
        altitudeArc.push([arcLat, arcLng]);
      }
      
      if (altitudeArc.length > 0) {
        const altitudeLine = L.polyline(altitudeArc, {
          color: '#ff8f00',
          weight: 3,
          opacity: 0.7
        });
        raysLayer.addLayer(altitudeLine);
      }

      // 添加方位角指示器
      const compassPoints = [
        { angle: 0, label: 'N' },
        { angle: 90, label: 'E' }, 
        { angle: 180, label: 'S' },
        { angle: 270, label: 'W' }
      ];

      compassPoints.forEach(point => {
        const pointRad = point.angle * Math.PI / 180;
        const pointDistance = 0.008;
        const pointLat = latitude + pointDistance * Math.cos(pointRad);
        const pointLng = longitude + pointDistance * Math.sin(pointRad);
        
        const compassMarker = L.divIcon({
          html: `<div style="
            background: rgba(255,255,255,0.9);
            color: #333;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid #ddd;
            text-align: center;
          ">${point.label}</div>`,
          iconSize: [20, 16],
          iconAnchor: [10, 8],
          className: 'compass-marker'
        });
        
        const marker = L.marker([pointLat, pointLng], { icon: compassMarker });
        raysLayer.addLayer(marker);
      });

      sunRaysRef.current = raysLayer;
      raysLayer.addTo(mapRef.current);

      // 更新太阳位置信息弹窗
      const sunInfoContent = `
        <div style="text-align: center; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #ff8f00;">☀️ 太阳位置</h4>
          <div style="margin: 4px 0;"><strong>高度角:</strong> ${currentAltitude.toFixed(1)}°</div>
          <div style="margin: 4px 0;"><strong>方位角:</strong> ${currentAzimuth.toFixed(1)}°</div>
          <div style="margin: 4px 0;"><strong>时间:</strong> ${date.toLocaleTimeString()}</div>
        </div>
      `;
      
      sunMarkerRef.current.bindPopup(sunInfoContent, {
        offset: [0, -12],
        className: 'sun-popup'
      });
    }
  };

  // 更新月亮可视化
  const updateMoonVisualization = (date, latitude, longitude) => {
    createMoonVisualization(date, latitude, longitude);
  };

  // 创建专业的月亮可视化
  const createMoonVisualization = (date, latitude, longitude) => {
    if (!mapRef.current) return;

    console.log('=== 创建月亮可视化 ===');
    console.log('astronomicalData:', astronomicalData);
    console.log('moonPosition:', astronomicalData?.moonPosition);

    // 计算当前的月相信息
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const currentMoonPhase = moonIllumination.phase;
    
    console.log('计算的月相:', currentMoonPhase);

    // 清除之前的月亮可视化
    if (moonriseMarkerRef.current) {
      mapRef.current.removeLayer(moonriseMarkerRef.current);
    }
    if (moonsetMarkerRef.current) {
      mapRef.current.removeLayer(moonsetMarkerRef.current);
    }
    if (moonRaysRef.current) {
      mapRef.current.removeLayer(moonRaysRef.current);
    }

    // 计算月出月落时间和位置
    const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
    
    // 检查是否有有效的月出月落时间
    if (!moonTimes.rise && !moonTimes.set) {
      console.log('当天没有月出月落时间');
      return;
    }

    const markDistance = 0.010; // 月亮标记距离相机的距离

    // 创建月出标记
    if (moonTimes.rise) {
      const moonrisePos = SunCalc.getMoonPosition(moonTimes.rise, latitude, longitude);
      const moonriseAzimuth = (moonrisePos.azimuth * 180 / Math.PI) + 180;
      
      const [moonriseLat, moonriseLng] = calculateMarkerPosition(latitude, longitude, moonriseAzimuth, markDistance, 'moonrise');

      const moonriseIcon = L.divIcon({
        html: `<div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        ">
          <div style="
            background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 50%, #9e9e9e 100%);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 12px rgba(224, 224, 224, 0.8);
            position: relative;
          "></div>
          <div style="
            background: rgba(158, 158, 158, 0.9);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">月出</div>
        </div>`,
        iconSize: [40, 33],
        iconAnchor: [20, 16],
        className: 'moonrise-marker'
      });

      moonriseMarkerRef.current = L.marker([moonriseLat, moonriseLng], {
        icon: moonriseIcon,
        zIndexOffset: 800
      }).addTo(mapRef.current);

      const moonriseContent = `
        <div style="text-align: center; min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; color: #9e9e9e;">🌙 月出</h4>
          <div style="margin: 4px 0;"><strong>时间:</strong> ${moonTimes.rise.toLocaleTimeString()}</div>
          <div style="margin: 4px 0;"><strong>方位角:</strong> ${moonriseAzimuth.toFixed(1)}°</div>
          <div style="margin: 4px 0; font-size: 12px; color: #666;">月亮从这个方向升起</div>
        </div>
      `;

      moonriseMarkerRef.current.bindPopup(moonriseContent, {
        offset: [0, -16],
        className: 'moonrise-popup'
      });
    }

    // 创建月落标记
    if (moonTimes.set) {
      const moonsetPos = SunCalc.getMoonPosition(moonTimes.set, latitude, longitude);
      const moonsetAzimuth = (moonsetPos.azimuth * 180 / Math.PI) + 180;
      
      const [moonsetLat, moonsetLng] = calculateMarkerPosition(latitude, longitude, moonsetAzimuth, markDistance, 'moonset');

      const moonsetIcon = L.divIcon({
        html: `<div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        ">
          <div style="
            background: linear-gradient(135deg, #9e9e9e 0%, #757575 50%, #616161 100%);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 12px rgba(158, 158, 158, 0.8);
            position: relative;
          "></div>
          <div style="
            background: rgba(117, 117, 117, 0.9);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">月落</div>
        </div>`,
        iconSize: [40, 33],
        iconAnchor: [20, 16],
        className: 'moonset-marker'
      });

      moonsetMarkerRef.current = L.marker([moonsetLat, moonsetLng], {
        icon: moonsetIcon,
        zIndexOffset: 800
      }).addTo(mapRef.current);

      const moonsetContent = `
        <div style="text-align: center; min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; color: #757575;">🌚 月落</h4>
          <div style="margin: 4px 0;"><strong>时间:</strong> ${moonTimes.set.toLocaleTimeString()}</div>
          <div style="margin: 4px 0;"><strong>方位角:</strong> ${moonsetAzimuth.toFixed(1)}°</div>
          <div style="margin: 4px 0; font-size: 12px; color: #666;">月亮在这个方向落下</div>
        </div>
      `;

      moonsetMarkerRef.current.bindPopup(moonsetContent, {
        offset: [0, -16],
        className: 'moonset-popup'
      });
    }

    // 增强当前月亮位置标记
    const currentMoonPos = SunCalc.getMoonPosition(date, latitude, longitude);
    const currentMoonAltitude = currentMoonPos.altitude * 180 / Math.PI;
    const currentMoonAzimuth = currentMoonPos.azimuth * 180 / Math.PI + 180;
    
    // 计算当前月亮在地图上的位置（无论是否在地平线上）
    const distance = Math.max(0.001, 0.008 * (90 - Math.abs(currentMoonAltitude)) / 90);
    const [moonLat, moonLng] = calculateMarkerPosition(latitude, longitude, currentMoonAzimuth, distance, 'moon');

    // 创建或更新月亮标记
    if (moonMarkerRef.current) {
      // 更新现有月亮图标
      const enhancedMoonIcon = createBeautifulMoonIcon(currentMoonPhase);
      moonMarkerRef.current.setIcon(enhancedMoonIcon);
      moonMarkerRef.current.setLatLng([moonLat, moonLng]);
    } else {
      // 创建新的月亮标记
      const enhancedMoonIcon = createBeautifulMoonIcon(currentMoonPhase);
      moonMarkerRef.current = L.marker([moonLat, moonLng], {
        icon: enhancedMoonIcon,
        zIndexOffset: 950
      }).addTo(mapRef.current);
    }

    // 创建月亮光线效果
    if (moonRaysRef.current) {
      mapRef.current.removeLayer(moonRaysRef.current);
    }
    
    const moonRaysLayer = L.layerGroup();
    
    // 添加从相机到月亮的方位线
    const moonAzimuthLine = L.polyline([[latitude, longitude], [moonLat, moonLng]], {
      color: currentMoonAltitude > 0 ? '#e0e0e0' : '#666666',
      weight: 2,
      opacity: currentMoonAltitude > 0 ? 0.5 : 0.3,
      dashArray: '4, 8'
    });
    moonRaysLayer.addLayer(moonAzimuthLine);

    // 如果有月出月落，添加指示线
    if (moonTimes.rise && moonriseMarkerRef.current) {
      const moonriseLine = L.polyline([[latitude, longitude], moonriseMarkerRef.current.getLatLng()], {
        color: '#bdbdbd',
        weight: 1.5,
        opacity: 0.3,
        dashArray: '2, 4'
      });
      moonRaysLayer.addLayer(moonriseLine);
    }

    if (moonTimes.set && moonsetMarkerRef.current) {
      const moonsetLine = L.polyline([[latitude, longitude], moonsetMarkerRef.current.getLatLng()], {
        color: '#9e9e9e',
        weight: 1.5,
        opacity: 0.3,
        dashArray: '2, 4'
      });
      moonRaysLayer.addLayer(moonsetLine);
    }

    moonRaysRef.current = moonRaysLayer;
    moonRaysLayer.addTo(mapRef.current);

    // 更新月亮位置信息弹窗
    const moonInfoContent = `
      <div style="text-align: center; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #9e9e9e;">🌙 月亮位置</h4>
        <div style="margin: 4px 0;"><strong>高度角:</strong> ${currentMoonAltitude.toFixed(1)}°</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${currentMoonAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${date.toLocaleTimeString()}</div>
        <div style="margin: 4px 0; font-size: 12px; color: #666;">
          ${currentMoonAltitude > 0 ? '月亮在地平线上' : '月亮在地平线下'}
        </div>
      </div>
    `;
    
    moonMarkerRef.current.bindPopup(moonInfoContent, {
      offset: [0, -10],
      className: 'moon-popup'
    });
  };

  // 更新太阳可视化
  const updateSunVisualization = (date, latitude, longitude) => {
    createSunVisualization(date, latitude, longitude);
  };

  // 更新时间相关的数据
  useEffect(() => {
    if (currentCameraPositionRef.current && selectedTime && selectedDate) {
      // 合并选定的日期和时间
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

  // 同步时间状态到ref，确保事件处理器始终使用最新值
  useEffect(() => {
    selectedDateRef.current = selectedDate;
    selectedTimeRef.current = selectedTime;
  }, [selectedDate, selectedTime]);

  // 显示/隐藏太阳轨迹
  useEffect(() => {
    if (showSunPath && mapRef.current) {
      // 显示太阳轨迹相关元素
      if (sunPathRef.current && !mapRef.current.hasLayer(sunPathRef.current)) {
        mapRef.current.addLayer(sunPathRef.current);
      }
      if (sunRaysRef.current && !mapRef.current.hasLayer(sunRaysRef.current)) {
        mapRef.current.addLayer(sunRaysRef.current);
      }
      if (sunriseMarkerRef.current && !mapRef.current.hasLayer(sunriseMarkerRef.current)) {
        mapRef.current.addLayer(sunriseMarkerRef.current);
      }
      if (sunsetMarkerRef.current && !mapRef.current.hasLayer(sunsetMarkerRef.current)) {
        mapRef.current.addLayer(sunsetMarkerRef.current);
      }
    } else if (!showSunPath && mapRef.current) {
      // 隐藏太阳轨迹相关元素
      if (sunPathRef.current && mapRef.current.hasLayer(sunPathRef.current)) {
        mapRef.current.removeLayer(sunPathRef.current);
      }
      if (sunRaysRef.current && mapRef.current.hasLayer(sunRaysRef.current)) {
        mapRef.current.removeLayer(sunRaysRef.current);
      }
      if (sunriseMarkerRef.current && mapRef.current.hasLayer(sunriseMarkerRef.current)) {
        mapRef.current.removeLayer(sunriseMarkerRef.current);
      }
      if (sunsetMarkerRef.current && mapRef.current.hasLayer(sunsetMarkerRef.current)) {
        mapRef.current.removeLayer(sunsetMarkerRef.current);
      }
    }
  }, [showSunPath]);

  // 显示/隐藏月亮轨迹
  useEffect(() => {
    if (moonMarkerRef.current && mapRef.current) {
      if (showMoonPath) {
        if (!mapRef.current.hasLayer(moonMarkerRef.current)) {
          mapRef.current.addLayer(moonMarkerRef.current);
        }
        // 显示月出月落标记
        if (moonriseMarkerRef.current && !mapRef.current.hasLayer(moonriseMarkerRef.current)) {
          mapRef.current.addLayer(moonriseMarkerRef.current);
        }
        if (moonsetMarkerRef.current && !mapRef.current.hasLayer(moonsetMarkerRef.current)) {
          mapRef.current.addLayer(moonsetMarkerRef.current);
        }
        if (moonRaysRef.current && !mapRef.current.hasLayer(moonRaysRef.current)) {
          mapRef.current.addLayer(moonRaysRef.current);
        }
      } else {
        if (mapRef.current.hasLayer(moonMarkerRef.current)) {
          mapRef.current.removeLayer(moonMarkerRef.current);
        }
        // 隐藏月出月落标记
        if (moonriseMarkerRef.current && mapRef.current.hasLayer(moonriseMarkerRef.current)) {
          mapRef.current.removeLayer(moonriseMarkerRef.current);
        }
        if (moonsetMarkerRef.current && mapRef.current.hasLayer(moonsetMarkerRef.current)) {
          mapRef.current.removeLayer(moonsetMarkerRef.current);
        }
        if (moonRaysRef.current && mapRef.current.hasLayer(moonRaysRef.current)) {
          mapRef.current.removeLayer(moonRaysRef.current);
        }
      }
    }
  }, [showMoonPath]);

  // 计算太阳位置
  const calculateSunPosition = (date, latitude, longitude) => {
    try {
      const sunPosition = SunCalc.getPosition(date, latitude, longitude);
      return {
        altitude: (sunPosition.altitude * 180 / Math.PI).toFixed(1),
        azimuth: ((sunPosition.azimuth * 180 / Math.PI) + 180).toFixed(1)
      };
    } catch (error) {
      console.error('计算太阳位置失败:', error);
      return { altitude: 0, azimuth: 0 };
    }
  };

  // 计算月亮位置
  const calculateMoonPosition = (date, latitude, longitude) => {
    try {
      const moonPosition = SunCalc.getMoonPosition(date, latitude, longitude);
      return {
        altitude: (moonPosition.altitude * 180 / Math.PI).toFixed(1),
        azimuth: ((moonPosition.azimuth * 180 / Math.PI) + 180).toFixed(1)
      };
    } catch (error) {
      console.error('计算月亮位置失败:', error);
      return { altitude: 0, azimuth: 0 };
    }
  };

  // 保存更新
  const handleSave = async () => {
    try {
      // 检查必要的数据是否存在
      if (!currentCameraPositionRef.current || !selectedDate || !selectedTime || !id) {
        message.error('缺少必要的保存数据');
        return;
      }

      // 合并选定的日期和时间
      const combinedDateTime = selectedDate
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(selectedTime.second());

      // 准备更新数据
      const updateData = {
        start_time: combinedDateTime.toISOString(), // 转换为ISO格式
          camera: {
          focal_length: planData?.camera?.focal_length || 35.0, // 保持原有焦距
          position: currentCameraPositionRef.current, // 更新相机位置
          rotation: planData?.camera?.rotation || [0.0, 0.0, 0.0, 1.0] // 保持原有旋转
        }
      };

      console.log('发送更新数据:', updateData);

      // 发送PATCH请求
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
      
      // 确保更新本地状态，包含最新的updated_at时间
      const finalPlanData = {
        ...updatedPlan,
        updated_at: updatedPlan.updated_at || new Date().toISOString() // 如果服务器没有返回updated_at，使用当前时间
      };
      
      setPlanData(finalPlanData);
      
      message.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error(`保存失败: ${error.message}`);
    }
  };

  // 导出地图
  const handleExport = async () => {
    if (!mapContainerRef.current || !mapRef.current) {
      message.error('地图未准备好，请稍后再试');
      return;
    }

    try {
      message.loading('正在生成地图图片...', 0);

      // 暂时禁用动画以便更好地捕获
      const mapContainer = mapContainerRef.current;
      const originalStyle = mapContainer.style.cssText;
      mapContainer.style.cssText += '; animation: none !important; transition: none !important;';
      
      // 等待所有瓦片和元素加载完成
      await new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30;
        
        const checkReady = () => {
          attempts++;
          
          // 检查瓦片加载
          const tiles = mapContainer.querySelectorAll('.leaflet-tile');
          const tilesLoaded = Array.from(tiles).every(tile => 
            tile.complete || tile.naturalWidth > 0
          );
          
          // 检查标记元素
          const markers = mapContainer.querySelectorAll('.leaflet-marker-icon');
          const markersReady = markers.length >= 2; // 至少应该有相机和一些天文标记
          
          // 检查SVG元素
          const svgs = mapContainer.querySelectorAll('svg');
          const svgsReady = svgs.length > 0;
          
          if ((tilesLoaded && markersReady && svgsReady) || attempts >= maxAttempts) {
            console.log(`导出准备完成 - 瓦片:${tilesLoaded}, 标记:${markersReady}, SVG:${svgsReady}, 尝试:${attempts}`);
            resolve();
          } else {
            setTimeout(checkReady, 200);
          }
        };
        
        checkReady();
      });

      // 强制重绘页面
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      // 使用更兼容的html2canvas配置
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
        backgroundColor: '#f5f7fa',
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        // 处理特殊元素
        onclone: (clonedDoc) => {
          // 在克隆文档中处理SVG和动画
          const clonedContainer = clonedDoc.querySelector(`[data-testid="map-container"]`) || 
                                  clonedDoc.querySelector('.leaflet-container');
          
          if (clonedContainer) {
            // 移除动画类
            const animatedElements = clonedContainer.querySelectorAll('[class*="animation"], [style*="animation"]');
            animatedElements.forEach(el => {
              el.style.animation = 'none';
              el.style.transition = 'none';
            });
            
            // 确保SVG可见
            const svgs = clonedContainer.querySelectorAll('svg');
            svgs.forEach(svg => {
              svg.style.display = 'block';
              svg.style.visibility = 'visible';
            });
            
            // 确保标记可见
            const markers = clonedContainer.querySelectorAll('.leaflet-marker-icon');
            markers.forEach(marker => {
              marker.style.display = 'block';
              marker.style.visibility = 'visible';
            });
          }
        },
        // 忽略某些控制元素
        ignoreElements: (element) => {
          return element.classList.contains('leaflet-control-zoom') ||
                 element.classList.contains('leaflet-control-layers') ||
                 element.classList.contains('leaflet-control-attribution') ||
                 element.classList.contains('leaflet-popup');
        }
      });

      // 恢复原始样式
      mapContainer.style.cssText = originalStyle;

      // 创建最终图片
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      
      // 绘制地图
      ctx.drawImage(canvas, 0, 0);
      
      // 手动绘制可能丢失的关键信息
      await drawMissingElements(ctx, finalCanvas.width, finalCanvas.height);
      
      // 添加信息水印
      const watermarkInfo = [
        `${planData?.name || '拍摄计划'} - ${selectedDate.format('YYYY年MM月DD日')}`,
        `时间: ${selectedTime.format('HH:mm')}`,
        `位置: ${currentCameraPositionRef.current?.[0]?.toFixed(4)}, ${currentCameraPositionRef.current?.[1]?.toFixed(4)}`,
        `生成时间: ${new Date().toLocaleString()}`
      ];
      
      // 设置水印样式
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, finalCanvas.height - 90, 420, 80);
      
      ctx.fillStyle = 'white';
      ctx.font = '13px Arial, sans-serif';
      
      watermarkInfo.forEach((text, index) => {
        ctx.fillText(text, 20, finalCanvas.height - 70 + index * 18);
      });

      // 下载图片
      const image = finalCanvas.toDataURL('image/png', 0.95);
        const link = document.createElement('a');
        link.href = image;
      link.download = `DreamCatcher_${planData?.name || 'Plan'}_${selectedDate.format('YYYY-MM-DD')}_${selectedTime.format('HH-mm')}.png`;
      document.body.appendChild(link);
        link.click();
      document.body.removeChild(link);

      message.destroy();
      message.success('地图导出成功');

    } catch (error) {
        console.error('导出失败:', error);
      message.destroy();
      message.error('导出失败，请重试');
    }
  };

  // 手动绘制可能丢失的元素
  const drawMissingElements = async (ctx, width, height) => {
    if (!mapRef.current || !currentCameraPositionRef.current) return;

    const cameraLat = currentCameraPositionRef.current[0];
    const cameraLng = currentCameraPositionRef.current[1];

    // 计算像素坐标转换函数
    const latLngToPixel = (lat, lng) => {
      const point = mapRef.current.latLngToContainerPoint([lat, lng]);
      return { x: point.x, y: point.y };
    };

    // 获取当前时间
    const currentDateTime = selectedDate
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(selectedTime.second())
      .toDate();

    // 绘制太阳轨迹
    if (showSunPath) {
      const sunTimes = SunCalc.getTimes(currentDateTime, cameraLat, cameraLng);
      const sunPath = [];
      
      // 从日出前1小时到日落后1小时，每15分钟计算一次位置
      const startTime = new Date(sunTimes.sunrise.getTime() - 60 * 60 * 1000);
      const endTime = new Date(sunTimes.sunset.getTime() + 60 * 60 * 1000);
      
      for (let time = startTime; time <= endTime; time = new Date(time.getTime() + 15 * 60 * 1000)) {
        const sunPos = SunCalc.getPosition(time, cameraLat, cameraLng);
        const altitude = sunPos.altitude * 180 / Math.PI;
        const azimuth = sunPos.azimuth * 180 / Math.PI + 180;
        
        if (altitude > -18) { // 只显示民用曙光时间以上的轨迹
          const baseDistance = Math.max(0.001, 0.01 * (90 - altitude) / 90);
          const [sunLat, sunLng] = calculateMarkerPosition(cameraLat, cameraLng, azimuth, baseDistance, 'sun');
          const pixel = latLngToPixel(sunLat, sunLng);
          sunPath.push({ ...pixel, altitude, time });
        }
      }
      
      // 绘制太阳轨迹线
      if (sunPath.length > 1) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < sunPath.length - 1; i++) {
          const point1 = sunPath[i];
          const point2 = sunPath[i + 1];
          const avgAltitude = (point1.altitude + point2.altitude) / 2;
          
          // 根据高度角设置颜色
          let color;
          if (avgAltitude < 0) {
            color = '#4a5568'; // 夜间 - 灰色
          } else if (avgAltitude < 10) {
            color = '#ff6b6b'; // 低角度 - 红色
          } else if (avgAltitude < 30) {
            color = '#ffa726'; // 中低角度 - 橙色
          } else if (avgAltitude < 60) {
            color = '#ffd54f'; // 中高角度 - 黄色
          } else {
            color = '#fff176'; // 高角度 - 亮黄色
          }
          
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(point1.x, point1.y);
          ctx.lineTo(point2.x, point2.y);
          ctx.stroke();
        }
      }
    }

    // 绘制方位线（从相机到各个标记的连接线）
    const cameraPixel = latLngToPixel(cameraLat, cameraLng);
    
    // 太阳方位线
    if (showSunPath) {
      const currentSunPos = SunCalc.getPosition(currentDateTime, cameraLat, cameraLng);
      const currentAltitude = currentSunPos.altitude * 180 / Math.PI;
      const currentAzimuth = currentSunPos.azimuth * 180 / Math.PI + 180;
      
      if (currentAltitude > 0) {
        const distance = Math.max(0.001, 0.01 * (90 - currentAltitude) / 90);
        const [sunLat, sunLng] = calculateMarkerPosition(cameraLat, cameraLng, currentAzimuth, distance, 'sun');
        const sunPixel = latLngToPixel(sunLat, sunLng);
        
        // 绘制太阳方位线
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(cameraPixel.x, cameraPixel.y);
        ctx.lineTo(sunPixel.x, sunPixel.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // 日出日落方位线
      const sunTimes = SunCalc.getTimes(currentDateTime, cameraLat, cameraLng);
      const sunrisePos = SunCalc.getPosition(sunTimes.sunrise, cameraLat, cameraLng);
      const sunsetPos = SunCalc.getPosition(sunTimes.sunset, cameraLat, cameraLng);
      
      const sunriseAzimuth = (sunrisePos.azimuth * 180 / Math.PI) + 180;
      const sunsetAzimuth = (sunsetPos.azimuth * 180 / Math.PI) + 180;
      
      const [sunriseLat, sunriseLng] = calculateMarkerPosition(cameraLat, cameraLng, sunriseAzimuth, 0.012, 'sunrise');
      const [sunsetLat, sunsetLng] = calculateMarkerPosition(cameraLat, cameraLng, sunsetAzimuth, 0.012, 'sunset');
      
      const sunrisePixel = latLngToPixel(sunriseLat, sunriseLng);
      const sunsetPixel = latLngToPixel(sunsetLat, sunsetLng);
      
      // 日出方位线
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(sunrisePixel.x, sunrisePixel.y);
      ctx.stroke();
      
      // 日落方位线
      ctx.strokeStyle = '#ff8f00';
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(sunsetPixel.x, sunsetPixel.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 月亮方位线
    if (showMoonPath) {
      const currentMoonPos = SunCalc.getMoonPosition(currentDateTime, cameraLat, cameraLng);
      const currentMoonAltitude = currentMoonPos.altitude * 180 / Math.PI;
      const currentMoonAzimuth = currentMoonPos.azimuth * 180 / Math.PI + 180;
      
      const distance = Math.max(0.001, 0.008 * (90 - Math.abs(currentMoonAltitude)) / 90);
      const [moonLat, moonLng] = calculateMarkerPosition(cameraLat, cameraLng, currentMoonAzimuth, distance, 'moon');
      const moonPixel = latLngToPixel(moonLat, moonLng);
      
      // 绘制月亮方位线
      ctx.strokeStyle = currentMoonAltitude > 0 ? '#e0e0e0' : '#666666';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(moonPixel.x, moonPixel.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 月出月落方位线
      const moonTimes = SunCalc.getMoonTimes(currentDateTime, cameraLat, cameraLng);
      
      if (moonTimes.rise) {
        const moonrisePos = SunCalc.getMoonPosition(moonTimes.rise, cameraLat, cameraLng);
        const moonriseAzimuth = (moonrisePos.azimuth * 180 / Math.PI) + 180;
        const [moonriseLat, moonriseLng] = calculateMarkerPosition(cameraLat, cameraLng, moonriseAzimuth, 0.010, 'moonrise');
        const moonrisePixel = latLngToPixel(moonriseLat, moonriseLng);
        
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(cameraPixel.x, cameraPixel.y);
        ctx.lineTo(moonrisePixel.x, moonrisePixel.y);
        ctx.stroke();
      }
      
      if (moonTimes.set) {
        const moonsetPos = SunCalc.getMoonPosition(moonTimes.set, cameraLat, cameraLng);
        const moonsetAzimuth = (moonsetPos.azimuth * 180 / Math.PI) + 180;
        const [moonsetLat, moonsetLng] = calculateMarkerPosition(cameraLat, cameraLng, moonsetAzimuth, 0.010, 'moonset');
        const moonsetPixel = latLngToPixel(moonsetLat, moonsetLng);
        
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(cameraPixel.x, cameraPixel.y);
        ctx.lineTo(moonsetPixel.x, moonsetPixel.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 绘制相机位置（确保在最上层）
    const cameraPos = latLngToPixel(cameraLat, cameraLng);
    
    if (cameraPos.x >= 0 && cameraPos.x <= width && cameraPos.y >= 0 && cameraPos.y <= height) {
      // 绘制相机图标
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(cameraPos.x, cameraPos.y, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(cameraPos.x, cameraPos.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📷', cameraPos.x, cameraPos.y + 3);
    }

    // 绘制天文数据指示（放在左上角）
    if (astronomicalData) {
      ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      
      const infoY = 30;
      ctx.fillText(`☀️ 日出: ${astronomicalData.sunPosition?.sunrise}`, 10, infoY);
      ctx.fillText(`🌅 日落: ${astronomicalData.sunPosition?.sunset}`, 10, infoY + 20);
      
      if (astronomicalData.moonPosition?.moonrise !== '无') {
        ctx.fillText(`🌙 月出: ${astronomicalData.moonPosition?.moonrise}`, 10, infoY + 40);
      }
      if (astronomicalData.moonPosition?.moonset !== '无') {
        ctx.fillText(`🌚 月落: ${astronomicalData.moonPosition?.moonset}`, 10, infoY + 60);
      }
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

  // 创建相机图标
  const createCameraIcon = () => {
    return L.divIcon({
      html: `<div style="
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" 
                fill="#2c3e50" stroke="#fff" stroke-width="0.5"/>
          <circle cx="12" cy="12" r="4" fill="#34495e" stroke="#fff" stroke-width="0.5"/>
          <circle cx="12" cy="12" r="2.5" fill="#3498db"/>
          <circle cx="12" cy="12" r="1" fill="#fff" opacity="0.8"/>
          <circle cx="17" cy="8" r="1" fill="#e74c3c"/>
        </svg>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'camera-marker-icon'
    });
  };

  // 创建太阳图标
  const createSunIcon = (size = 24) => {
    const gradientId = `sunGradient_${Date.now()}_${Math.random()}`;
    return L.divIcon({
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 8px rgba(255,193,7,0.8));">
          <!-- 太阳光芒 -->
          <g stroke="#ffd54f" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="21" y1="12" x2="19" y2="12"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="3" y1="12" x2="5" y2="12"/>
            <line x1="18.36" y1="5.64" x2="16.95" y2="7.05"/>
            <line x1="18.36" y1="18.36" x2="16.95" y2="16.95"/>
            <line x1="5.64" y1="18.36" x2="7.05" y2="16.95"/>
            <line x1="5.64" y1="5.64" x2="7.05" y2="7.05"/>
          </g>
          <!-- 渐变定义 -->
          <defs>
            <radialGradient id="${gradientId}" cx="0.3" cy="0.3">
              <stop offset="0%" stop-color="#fff176"/>
              <stop offset="70%" stop-color="#ffd54f"/>
              <stop offset="100%" stop-color="#ff8f00"/>
            </radialGradient>
          </defs>
          <!-- 太阳主体 -->
          <circle cx="12" cy="12" r="5" fill="url(#${gradientId})" stroke="#ff8f00" stroke-width="1"/>
        </svg>
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle, rgba(255,213,79,0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      className: 'sun-marker-icon'
    });
  };

  // 创建美观的月亮图标
  const createBeautifulMoonIcon = (moonPhase, size = 26) => {
    const phasePercent = (typeof moonPhase === 'number' && !isNaN(moonPhase)) ? moonPhase : 0.5;
    
    // 根据月相确定颜色
    let moonColor, glowColor;
    if (phasePercent < 0.25) {
      moonColor = '#a0a0a0'; // 新月/娥眉月 - 较暗
      glowColor = 'rgba(160,160,160,0.8)';
    } else if (phasePercent < 0.75) {
      moonColor = '#e8e8e8'; // 上弦月/盈凸月 - 中等
      glowColor = 'rgba(232,232,232,0.9)';
    } else {
      moonColor = '#f5f5f5'; // 满月/亏凸月 - 明亮
      glowColor = 'rgba(245,245,245,1)';
    }

    return L.divIcon({
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- 外层光晕 -->
        <div style="
          position: absolute;
          width: ${size + 6}px;
          height: ${size + 6}px;
          background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
          border-radius: 50%;
          top: -3px;
          left: -3px;
          animation: moonGlow 4s ease-in-out infinite;
        "></div>
        
        <!-- 月亮主体 -->
        <div style="
          width: ${size - 4}px;
          height: ${size - 4}px;
          background: linear-gradient(135deg, ${moonColor} 0%, #c0c0c0 50%, #909090 100%);
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 
            inset -2px -2px 4px rgba(0,0,0,0.3),
            inset 2px 2px 4px rgba(255,255,255,0.7),
            0 0 8px rgba(255,255,255,0.5);
          position: relative;
          z-index: 2;
        ">
          <!-- 月亮表面纹理 -->
          <div style="
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
            top: 30%;
            left: 40%;
          "></div>
          <div style="
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0,0,0,0.15);
            border-radius: 50%;
            top: 60%;
            left: 60%;
          "></div>
          <div style="
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0,0,0,0.1);
            border-radius: 50%;
            top: 45%;
            left: 25%;
          "></div>
        </div>
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      className: 'moon-marker-beautiful'
    });
  };

  // 根据缩放级别计算距离系数
  const getDistanceMultiplier = () => {
    if (!mapRef.current) return 1;
    const zoom = mapRef.current.getZoom();
    
    // 缩放级别越小，距离系数越大，避免标记重合
    if (zoom <= 8) return 8;      // 很远的距离
    if (zoom <= 10) return 4;     // 较远的距离
    if (zoom <= 12) return 2;     // 中等距离
    if (zoom <= 15) return 1;     // 正常距离
    return 0.5;                   // 近距离
  };

  // 计算标记位置，考虑缩放级别
  const calculateMarkerPosition = (centerLat, centerLng, azimuth, baseDistance, type = 'default') => {
    const distanceMultiplier = getDistanceMultiplier();
    let adjustedDistance = baseDistance * distanceMultiplier;
    
    // 根据类型调整距离，避免重合
    switch(type) {
      case 'sun':
        adjustedDistance *= 1.0;  // 太阳标记保持基准距离
        break;
      case 'moon':
        adjustedDistance *= 1.3;  // 月亮标记稍远一些
        break;
      case 'sunrise':
        adjustedDistance *= 1.8;  // 日出标记更远
        break;
      case 'sunset':
        adjustedDistance *= 1.8;  // 日落标记更远
        break;
      case 'moonrise':
        adjustedDistance *= 2.0;  // 月出标记最远
        break;
      case 'moonset':
        adjustedDistance *= 2.0;  // 月落标记最远
        break;
      default:
        break;
    }
    
    const azimuthRad = azimuth * Math.PI / 180;
    const lat = centerLat + adjustedDistance * Math.cos(azimuthRad);
    const lng = centerLng + adjustedDistance * Math.sin(azimuthRad);
    
    return [lat, lng];
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
                onClick={handleExport}
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