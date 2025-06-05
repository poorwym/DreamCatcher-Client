import React, { useRef, useState, useEffect } from 'react';
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
  TimePicker,
  InputNumber,
  Select
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
  EyeInvisibleOutlined,
  CameraFilled,
  SettingOutlined,
  ToolOutlined
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
  HeadingPitchRoll,
  Transforms,
  Matrix4,
  Quaternion,
  Math as CesiumMath,
  createWorldTerrainAsync,
  ShadowMode,
  DirectionalLight,
  Cesium3DTileset,
  ColorBlendMode,
  HeightReference
} from 'cesium';
import dayjs from 'dayjs';
import SunCalc from 'suncalc';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { DEFAULT_ION_TOKEN } from "../../config/config";

function PlanMap3DPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [astronomicalData, setAstronomicalData] = useState(null);
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [showSunPath, setShowSunPath] = useState(true);
  const [showMoonPath, setShowMoonPath] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showCameraPreview, setShowCameraPreview] = useState(true);
  const [showCompositionGuides, setShowCompositionGuides] = useState(true);
  const [cameraFOV, setCameraFOV] = useState(35);
  const [cameraHeight, setCameraHeight] = useState(1.7);
  const [selectedModel, setSelectedModel] = useState('default');
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const cameraEntityRef = useRef(null);
  const sunEntityRef = useRef(null);
  const moonEntityRef = useRef(null);
  const cameraPreviewRef = useRef(null);
  const directionalLightRef = useRef(null);

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
        setSelectedTime(dayjs(data.start_time));
        setCameraFOV(data.camera.focal_length);

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

  // 初始化3D地图
  useEffect(() => {
    if (!mapContainerRef.current || !planData) return;

    const initViewer = async () => {
      try {
        // 创建 Viewer 实例
        viewerRef.current = new Viewer(mapContainerRef.current, {
          terrainProvider: await createWorldTerrainAsync(),
          baseLayerPicker: true,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          timeline: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          shadows: true,
          scene3DOnly: true
        });

        // 隐藏 Credits
        viewerRef.current._cesiumWidget._creditContainer.style.display = "none";

        // 设置 token
        Ion.defaultAccessToken = DEFAULT_ION_TOKEN;

        // 设置初始视角
        const [latitude, longitude, height] = planData.camera.position;
        viewerRef.current.camera.flyTo({
          destination: Cartesian3.fromDegrees(longitude, latitude, height + 100),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-30),
            roll: 0.0
          },
          duration: 2
        });

        // 添加相机位置标记
        cameraEntityRef.current = viewerRef.current.entities.add({
          position: Cartesian3.fromDegrees(longitude, latitude, height),
          model: {
            uri: '/models/camera.glb',
            minimumPixelSize: 32,
            maximumScale: 20000,
            color: Color.WHITE,
            colorBlendMode: ColorBlendMode.HIGHLIGHT,
            silhouetteColor: Color.RED,
            silhouetteSize: 1.0,
            heightReference: HeightReference.RELATIVE_TO_GROUND
          },
          label: {
            text: '拍摄位置',
            font: '14pt sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            pixelOffset: new Cartesian3(0, -20),
            show: true
          }
        });

        // 添加相机预览实体
        if (showCameraPreview) {
          createCameraPreview();
        }

        // 添加太阳位置标记和光照
        const sunPosition = calculateSunPosition(selectedTime.toDate(), latitude, longitude);
        updateSunPosition(sunPosition);

        // 添加月亮位置标记
        const moonPosition = calculateMoonPosition(selectedTime.toDate(), latitude, longitude);
        updateMoonPosition(moonPosition);

        // 加载3D模型
        if (planData.tileset_url) {
          viewerRef.current.scene.primitives.add(
            new Cesium3DTileset({
              url: planData.tileset_url,
              shadows: ShadowMode.ENABLED
            })
          );
        }

        // 添加拖拽事件处理
        const handler = new ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        
        handler.setInputAction((movement) => {
          if (isDragging) {
            // 阻止相机移动
            viewerRef.current.scene.screenSpaceCameraController.enableRotate = false;
            viewerRef.current.scene.screenSpaceCameraController.enableTranslate = false;
            viewerRef.current.scene.screenSpaceCameraController.enableZoom = false;
            viewerRef.current.scene.screenSpaceCameraController.enableTilt = false;
            viewerRef.current.scene.screenSpaceCameraController.enableLook = false;

            const cartesian = viewerRef.current.camera.pickEllipsoid(
              movement.endPosition,
              viewerRef.current.scene.globe.ellipsoid
            );
            if (cartesian) {
              const cartographic = viewerRef.current.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
              const longitude = CesiumMath.toDegrees(cartographic.longitude);
              const latitude = CesiumMath.toDegrees(cartographic.latitude);
              const height = cartographic.height;

              updateCameraPosition(latitude, longitude, height);
            }
          }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(() => {
          setIsDragging(true);
          // 开始拖拽时禁用相机控制
          viewerRef.current.scene.screenSpaceCameraController.enableRotate = false;
          viewerRef.current.scene.screenSpaceCameraController.enableTranslate = false;
          viewerRef.current.scene.screenSpaceCameraController.enableZoom = false;
          viewerRef.current.scene.screenSpaceCameraController.enableTilt = false;
          viewerRef.current.scene.screenSpaceCameraController.enableLook = false;
        }, ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction(() => {
          setIsDragging(false);
          // 结束拖拽时恢复相机控制
          viewerRef.current.scene.screenSpaceCameraController.enableRotate = true;
          viewerRef.current.scene.screenSpaceCameraController.enableTranslate = true;
          viewerRef.current.scene.screenSpaceCameraController.enableZoom = true;
          viewerRef.current.scene.screenSpaceCameraController.enableTilt = true;
          viewerRef.current.scene.screenSpaceCameraController.enableLook = true;
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
    };

    initViewer();
  }, [planData]);

  // 创建相机预览
  const createCameraPreview = () => {
    if (!viewerRef.current || !planData) return;

    const [latitude, longitude, height] = planData.camera.position;
    const heading = CesiumMath.toRadians(0); // 从相机旋转四元数中获取
    const pitch = CesiumMath.toRadians(-30);
    const roll = 0;

    // 创建相机预览实体
    cameraPreviewRef.current = viewerRef.current.entities.add({
      position: Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: Transforms.headingPitchRollQuaternion(
        Cartesian3.fromDegrees(longitude, latitude, height),
        new HeadingPitchRoll(heading, pitch, roll)
      ),
      frustum: {
        fov: CesiumMath.toRadians(cameraFOV),
        aspectRatio: 16/9,
        near: 0.1,
        far: 1000.0
      },
      frustumOutline: {
        color: Color.YELLOW,
        width: 2
      }
    });
  };

  // 更新相机位置
  const updateCameraPosition = (latitude, longitude, height) => {
    if (!cameraEntityRef.current || !cameraPreviewRef.current) return;

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    cameraEntityRef.current.position = position;
    
    if (cameraPreviewRef.current) {
      cameraPreviewRef.current.position = position;
    }

    // 更新计划数据
    setPlanData(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        position: [latitude, longitude, height]
      }
    }));
  };

  // 更新太阳位置和光照
  const updateSunPosition = (sunPosition) => {
    if (!viewerRef.current || !planData) return;

    const [latitude, longitude] = planData.camera.position;
    
    // 更新太阳位置标记
    if (sunEntityRef.current) {
      sunEntityRef.current.position = Cartesian3.fromDegrees(
        longitude + Math.sin(sunPosition.azimuth * Math.PI / 180) * 0.01,
        latitude + Math.cos(sunPosition.azimuth * Math.PI / 180) * 0.01,
        planData.camera.position[2] + 1000
      );
    }

    // 更新光照
    if (!directionalLightRef.current) {
      directionalLightRef.current = new DirectionalLight({
        direction: Cartesian3.normalize(
          Cartesian3.fromDegrees(
            longitude + Math.sin(sunPosition.azimuth * Math.PI / 180),
            latitude + Math.cos(sunPosition.azimuth * Math.PI / 180),
            sunPosition.altitude
          ),
          new Cartesian3()
        ),
        intensity: 1.0
      });
      viewerRef.current.scene.globe.enableLighting = true;
      viewerRef.current.scene.globe.directionalLight = directionalLightRef.current;
    } else {
      directionalLightRef.current.direction = Cartesian3.normalize(
        Cartesian3.fromDegrees(
          longitude + Math.sin(sunPosition.azimuth * Math.PI / 180),
          latitude + Math.cos(sunPosition.azimuth * Math.PI / 180),
          sunPosition.altitude
        ),
        new Cartesian3()
      );
    }
  };

  // 更新月亮位置
  const updateMoonPosition = (moonPosition) => {
    if (!viewerRef.current || !planData) return;

    const [latitude, longitude] = planData.camera.position;
    
    if (moonEntityRef.current) {
      moonEntityRef.current.position = Cartesian3.fromDegrees(
        longitude + Math.sin(moonPosition.azimuth * Math.PI / 180) * 0.01,
        latitude + Math.cos(moonPosition.azimuth * Math.PI / 180) * 0.01,
        planData.camera.position[2] + 800
      );
    }
  };

  // 更新时间相关的实体位置
  useEffect(() => {
    if (!viewerRef.current || !planData) return;

    const [latitude, longitude] = planData.camera.position;

    // 更新太阳位置和光照
    const sunPosition = calculateSunPosition(selectedTime.toDate(), latitude, longitude);
    updateSunPosition(sunPosition);

    // 更新月亮位置
    const moonPosition = calculateMoonPosition(selectedTime.toDate(), latitude, longitude);
    updateMoonPosition(moonPosition);

    // 更新天文数据
    setAstronomicalData(prev => ({
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
    }));
  }, [selectedTime, planData]);

  // 计算太阳位置（使用SunCalc）
  const calculateSunPosition = (date, latitude, longitude) => {
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    
    // 转换弧度到角度
    const altitude = (sunPos.altitude * 180) / Math.PI;
    const azimuth = ((sunPos.azimuth * 180) / Math.PI + 180) % 360;

    // 获取日出日落时间
    const times = SunCalc.getTimes(date, latitude, longitude);
    const sunrise = dayjs(times.sunrise).format('HH:mm');
    const sunset = dayjs(times.sunset).format('HH:mm');
    
    // 计算黄金时刻
    const goldenHourMorning = dayjs(times.goldenHour).format('HH:mm');
    const goldenHourEvening = dayjs(times.goldenHourEnd).format('HH:mm');

    return {
      altitude,
      azimuth,
      sunrise,
      sunset,
      goldenHour: {
        morning: goldenHourMorning,
        evening: goldenHourEvening
      }
    };
  };

  // 计算月亮位置（使用SunCalc）
  const calculateMoonPosition = (date, latitude, longitude) => {
    const moonPos = SunCalc.getMoonPosition(date, latitude, longitude);
    const moonIllumination = SunCalc.getMoonIllumination(date);
    
    // 转换弧度到角度
    const altitude = (moonPos.altitude * 180) / Math.PI;
    const azimuth = ((moonPos.azimuth * 180) / Math.PI + 180) % 360;

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

    return {
      altitude,
      azimuth,
      phase: phaseName,
      moonrise,
      moonset
    };
  };

  // 保存更新
  const handleSave = async () => {
    try {
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
      link.download = `map_${planData.name}_${selectedTime.format('YYYY-MM-DD_HH-mm')}.png`;
      link.click();
    }
  };

  // 切换到2D视图
  const handleSwitchTo2D = () => {
    navigate(`/plans/${id}/map2D`);
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
                {planData?.name} - 3D地图
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
                onClick={handleSwitchTo2D}
              >
                切换到2D视图
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
        <Col span={6}>
          <Card title="时间控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <TimePicker
                value={selectedTime}
                onChange={setSelectedTime}
                format="HH:mm"
                style={{ width: '100%' }}
              />
              <Slider
                min={0}
                max={24}
                step={0.5}
                value={selectedTime.hour() + selectedTime.minute() / 60}
                onChange={(value) => {
                  const [hours, minutes] = value.toString().split('.');
                  setSelectedTime(prev => 
                    prev.hour(parseInt(hours)).minute(minutes ? parseInt(minutes) * 6 : 0)
                  );
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

        {/* 相机控制 */}
        <Col span={6}>
          <Card title="相机控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row align="middle">
                <Col span={12}>
                  <Typography.Text>焦距 (mm)</Typography.Text>
                </Col>
                <Col span={12}>
                  <InputNumber
                    min={12}
                    max={200}
                    value={cameraFOV}
                    onChange={setCameraFOV}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
              <Row align="middle">
                <Col span={12}>
                  <Typography.Text>相机高度 (m)</Typography.Text>
                </Col>
                <Col span={12}>
                  <InputNumber
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={cameraHeight}
                    onChange={setCameraHeight}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <CameraFilled />
                    <Typography.Text>相机预览</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showCameraPreview}
                    onChange={setShowCameraPreview}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Col>
              </Row>
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <ToolOutlined />
                    <Typography.Text>构图辅助</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showCompositionGuides}
                    onChange={setShowCompositionGuides}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* 图层控制 */}
        <Col span={6}>
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
              <Row align="middle">
                <Col span={12}>
                  <Space>
                    <SettingOutlined />
                    <Typography.Text>3D模型</Typography.Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Select
                    value={selectedModel}
                    onChange={setSelectedModel}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'default', label: '默认模型' },
                      { value: 'high', label: '高精度模型' },
                      { value: 'low', label: '低精度模型' }
                    ]}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* 天文数据 */}
        <Col span={6}>
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

export default PlanMap3DPage;
