import React, {useEffect, useRef, useState} from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import {useParams} from "react-router-dom";
import {useAuth} from "../../context/AuthProvider.jsx";
import {getPlan} from "../../api/plan.js";
import { Spin, Alert } from "antd";
import "../../assets/style.css";
import Background from "../../components/Background/Background.jsx";
import { calculateSunPosition } from "../../utils/astronomicalUtils.js";

const CESIUM_TOKEN=import.meta.env.VITE_CESIUM_TOKEN;

function PlanMap3DPage() {
    const viewerRef = useRef(null);          // 只存实例，不触发重新渲染
    const containerRef = useRef(null);       // div 容器
    const {fetchWithAuth} = useAuth();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sunInfo, setSunInfo] = useState(null);
    const [cesiumLoading, setCesiumLoading] = useState(false);

    const plan_id = useParams().id;

    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                setError(null);
                const planData = await getPlan(plan_id, fetchWithAuth);
                setPlan(planData);
            } catch (err) {
                console.error('加载计划详情失败:', err);
                setError(err.message || '加载计划详情失败');
            } finally {
                setLoading(false);
            }
        };

        if (plan_id && fetchWithAuth) {
            loadPlan();
        }
    }, [plan_id, fetchWithAuth]);

    /* ① 仅在组件挂载时初始化一次 Viewer */
    useEffect(() => {
        // 添加严格的检查和延迟初始化
        if (!containerRef.current || !plan) return;
        
        // 检查容器是否已经正确挂载到DOM
        if (!containerRef.current.isConnected || !document.contains(containerRef.current)) {
            console.log('容器尚未正确挂载到DOM，延迟初始化');
            return;
        }

        // 设置初始化标志
        setCesiumLoading(true);
        
        // 延迟初始化以避免与浏览器扩展冲突
        const initCesium = async () => {
            try {
                // 等待一小段时间确保DOM完全准备好
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 再次检查容器状态
                if (!containerRef.current || !containerRef.current.isConnected) {
                    console.warn('容器在初始化过程中变为不可用');
                    setCesiumLoading(false);
                    return;
                }

                // 设置 Cesium Token
                if (CESIUM_TOKEN) {
                    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;
                }

                // 创建 Viewer 时添加错误处理
                viewerRef.current = new Cesium.Viewer(containerRef.current, {
                    shouldAnimate: true,
                    animation: false,
                    timeline: false,
                    baseLayerPicker: false,
                    geocoder: false,
                    homeButton: false,
                    sceneModePicker: false,
                    navigationHelpButton: false,
                    fullscreenButton: false,
                    vrButton: false,
                    infoBox: false,
                    selectionIndicator: false
                });

                // 启用全球光照和天空盒
                viewerRef.current.scene.globe.enableLighting = true;
                viewerRef.current.scene.skyBox.show = true;
                viewerRef.current.scene.sun.show = true;
                
                // 设置默认光照，确保地球表面始终可见
                viewerRef.current.scene.light.intensity = 0.8;
                viewerRef.current.scene.light.color = Cesium.Color.WHITE;
                
                // 禁用默认的双击行为
                viewerRef.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                
                // 用于存储太阳位置标记
                let sunMarker = null;
                
                // 设置基于真实太阳位置的光照
                const setupSunLighting = () => {
                    try {
                        // 如果有相机位置信息，使用相机位置计算太阳光照；否则使用默认位置
                        let longitude = 0;
                        let latitude = 0;
                        
                        if (plan.camera && plan.camera.position) {
                            [longitude, latitude] = plan.camera.position;
                        } else {
                            // 使用默认位置（北京）
                            longitude = 116.4074;
                            latitude = 39.9042;
                        }
                        
                        if (true) { // 总是执行太阳光照设置
                            const currentTime = new Date();
                            
                            // 计算当前时间太阳位置
                            const sunPos = calculateSunPosition(currentTime, latitude, longitude);
                            console.log('太阳位置:', sunPos);
                            
                            // 将太阳方位角和高度角转换为 Cesium 坐标系
                            const sunAzimuthRad = Cesium.Math.toRadians(parseFloat(sunPos.azimuth));
                            const sunElevationRad = Cesium.Math.toRadians(parseFloat(sunPos.altitude));
                            
                            // 计算太阳在笛卡尔坐标系中的方向向量
                            const sunDirection = new Cesium.Cartesian3(
                                Math.cos(sunElevationRad) * Math.sin(sunAzimuthRad),
                                Math.cos(sunElevationRad) * Math.cos(sunAzimuthRad),
                                Math.sin(sunElevationRad)
                            );
                            
                            // 设置太阳方向
                            viewerRef.current.scene.light.direction = Cesium.Cartesian3.normalize(
                                Cesium.Cartesian3.negate(sunDirection, new Cesium.Cartesian3()),
                                new Cesium.Cartesian3()
                            );
                            
                            // 根据太阳高度角调整光照强度和颜色
                            const sunAltitude = parseFloat(sunPos.altitude);
                            let lightIntensity = 1.0;
                            let lightColor = Cesium.Color.WHITE;
                            
                            if (sunAltitude < -6) {
                                // 夜间 - 保持足够的光照以便观察
                                lightIntensity = 0.4;
                                lightColor = new Cesium.Color(0.6, 0.6, 0.9, 1.0);
                            } else if (sunAltitude < 0) {
                                // 天文暮光/晨光 - 渐变到暖色调
                                lightIntensity = 0.4 + (sunAltitude + 6) / 6 * 0.4;
                                const factor = (sunAltitude + 6) / 6;
                                lightColor = new Cesium.Color(
                                    0.6 + factor * 0.4,
                                    0.6 + factor * 0.3,
                                    0.9 - factor * 0.2,
                                    1.0
                                );
                            } else if (sunAltitude < 15) {
                                // 黄昏/黎明时分 - 温暖的光照
                                lightIntensity = 0.8 + (sunAltitude / 15) * 0.2;
                                const factor = sunAltitude / 15;
                                lightColor = new Cesium.Color(
                                    1.0,
                                    0.8 + factor * 0.2,
                                    0.7 + factor * 0.3,
                                    1.0
                                );
                            } else {
                                // 白天光照 - 纯白色
                                lightIntensity = 1.0;
                                lightColor = Cesium.Color.WHITE;
                            }
                            
                            viewerRef.current.scene.light.intensity = lightIntensity;
                            viewerRef.current.scene.light.color = lightColor;
                            
                            // 设置大气效果
                            viewerRef.current.scene.skyAtmosphere.show = true;
                            
                            // 添加太阳位置标记（如果太阳在地平线以上）
                            if (sunMarker) {
                                viewerRef.current.entities.remove(sunMarker);
                                sunMarker = null;
                            }
                            
                            if (sunAltitude > 0) {
                                // 计算太阳在天球上的位置（距离地心一定距离）
                                const sunDistance = 100000000; // 1亿米，足够远让太阳看起来在天球上
                                const sunPosition = Cesium.Cartesian3.fromElements(
                                    sunDistance * Math.cos(sunElevationRad) * Math.sin(sunAzimuthRad),
                                    sunDistance * Math.cos(sunElevationRad) * Math.cos(sunAzimuthRad),
                                    sunDistance * Math.sin(sunElevationRad)
                                );
                                
                                // 将太阳位置转换为相对于观察地点的位置
                                const observerPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
                                const sunWorldPosition = Cesium.Cartesian3.add(observerPosition, sunPosition, new Cesium.Cartesian3());
                                
                                sunMarker = viewerRef.current.entities.add({
                                    position: sunWorldPosition,
                                    billboard: {
                                        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cg fill='%23FFD700'%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3Cpath d='M12 0v3m0 18v3M3.5 3.5l1.4 1.4m14.2 14.2l1.4 1.4M0 12h3m18 0h3m-4.1-7.1l1.4-1.4M3.5 20.5l1.4-1.4'/%3E%3C/g%3E%3C/svg%3E",
                                        scale: 0.8,
                                        scaleByDistance: new Cesium.NearFarScalar(10000, 2.0, 1000000, 0.5),
                                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                                    },
                                    label: {
                                        text: `太阳\n高度: ${sunPos.altitude}°\n方位: ${sunPos.azimuth}°`,
                                        font: '12pt sans-serif',
                                        fillColor: Cesium.Color.YELLOW,
                                        outlineColor: Cesium.Color.BLACK,
                                        outlineWidth: 2,
                                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                        pixelOffset: new Cesium.Cartesian2(0, -50),
                                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                        scale: 0.8
                                    }
                                });
                            }
                            
                            // 更新太阳信息状态
                            setSunInfo({
                                altitude: sunPos.altitude,
                                azimuth: sunPos.azimuth,
                                intensity: lightIntensity.toFixed(2),
                                updateTime: currentTime.toLocaleTimeString('zh-CN')
                            });
                            
                            console.log(`太阳光照设置完成 - 方位角: ${sunPos.azimuth}°, 高度角: ${sunPos.altitude}°, 光照强度: ${lightIntensity.toFixed(2)}`);
                        }
                    } catch (error) {
                        console.error('设置太阳光照时出错:', error);
                        // 如果太阳光照设置失败，使用默认光照
                        viewerRef.current.scene.light.intensity = 0.8;
                        viewerRef.current.scene.light.color = Cesium.Color.WHITE;
                    }
                };

                // 设置太阳光照
                setupSunLighting();

                // 每隔5分钟更新太阳光照（可根据需要调整频率）
                const lightingUpdateInterval = setInterval(() => {
                    setupSunLighting();
                }, 5 * 60 * 1000); // 5分钟

                const add_tileset = async (url) => {
                    try {
                        console.log("加载tileset, url=",url);
                        const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
                        viewerRef.current.scene.primitives.add(tileset);
                        
                        // tileset加载完成后，飞到tileset上空
                        tileset.readyPromise.then(() => {
                            console.log('Tileset加载完成，飞到上空');
                            const boundingSphere = tileset.boundingSphere;
                            const center = boundingSphere.center;
                            const radius = boundingSphere.radius;
                            
                            // 计算合适的高度（tileset半径的2倍，最少1000米，最大50000米）
                            const height = Math.min(Math.max(radius * 2, 1000), 50000);
                            
                            // 将笛卡尔坐标转换为经纬度
                            const cartographic = Cesium.Cartographic.fromCartesian(center);
                            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
                            
                            console.log(`飞行到: 经度${longitude}, 纬度${latitude}, 高度${height}m`);
                            
                            viewerRef.current.camera.flyTo({
                                destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                                orientation: {
                                    heading: Cesium.Math.toRadians(0), // 朝向北方
                                    pitch: Cesium.Math.toRadians(-30), // 向下30度俯视
                                    roll: 0
                                },
                                duration: 3.0 // 飞行时间3秒
                            });
                        });
                        
                    } catch (error) {
                        console.error('加载 tileset 失败:', error);
                    }
                }

                // 只有当存在tileset_url时才加载tileset并飞行
                if(plan.tileset_url) {
                    add_tileset(plan.tileset_url);
                }

                // 清理函数
                const cleanup = () => {
                    if (lightingUpdateInterval) {
                        clearInterval(lightingUpdateInterval);
                    }
                    if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                        viewerRef.current.destroy();
                        viewerRef.current = null;
                    }
                };

                // 存储清理函数
                containerRef.current._cleanup = cleanup;
                
                setCesiumLoading(false);
                
            } catch (error) {
                console.error('Cesium 初始化失败:', error);
                setError('3D地图初始化失败: ' + error.message);
                setCesiumLoading(false);
            }
        };

        initCesium();

        return () => {
            if (containerRef.current && containerRef.current._cleanup) {
                containerRef.current._cleanup();
            }
        };
    }, [plan]);                               // 依赖 plan 数据

    if (loading) {
        return (
            <div className="w-full min-h-screen">
                <Background />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <Spin size="large" />
                        <p className="text-white mt-4 text-lg">正在加载3D地图数据...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen">
                <Background />
                <div className="flex justify-center items-center min-h-screen p-9">
                    <Alert
                        message="加载失败"
                        description={error}
                        type="error"
                        showIcon
                        className="max-w-md"
                    />
                </div>
            </div>
        );
    }

    if (!plan || !plan.camera || !plan.camera.position) {
        return (
            <div className="w-full min-h-screen">
                <Background />
                <div className="flex justify-center items-center min-h-screen p-9">
                    <Alert
                        message="数据错误"
                        description="计划数据或相机位置信息缺失"
                        type="warning"
                        showIcon
                        className="max-w-md"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen relative">
            <Background />
            
            {/* Cesium 容器 */}
            <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
            
            {/* Cesium 加载中的覆盖层 */}
            {cesiumLoading && (
                <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm bg-black/30 z-10">
                    <div className="text-center">
                        <Spin size="large" />
                        <p className="text-white mt-4 text-lg">正在初始化3D地球...</p>
                    </div>
                </div>
            )}
            
            {/* 太阳光照信息面板 */}
            {sunInfo && !cesiumLoading && (
                <div className="absolute top-4 left-4 backdrop-blur-md bg-black/40 text-white p-4 rounded-lg shadow-lg border border-white/20">
                    <h3 className="text-lg font-bold mb-2 text-yellow-400">☀️ 太阳光照</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">高度角:</span> {sunInfo.altitude}°</p>
                        <p><span className="font-medium">方位角:</span> {sunInfo.azimuth}°</p>
                        <p><span className="font-medium">光照强度:</span> {sunInfo.intensity}</p>
                        <p className="text-xs text-gray-300 mt-2">更新时间: {sunInfo.updateTime}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
export default PlanMap3DPage;