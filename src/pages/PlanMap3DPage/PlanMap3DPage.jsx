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
import { getCurrentUTC, formatUTCForDisplay } from '../../utils/timeUtils';

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
                
                // 获取当前UTC时间的辅助函数
                const getCurrentTime = () => {
                    // 如果计划有指定的开始时间，使用计划时间；否则使用当前UTC时间
                    if (plan.start_time) {
                        return new Date(plan.start_time);
                    }
                    return new Date(); // 当前UTC时间
                };
                
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
                            // 获取当前时间（UTC）
                            const currentTime = getCurrentTime();
                            
                            // 计算当前时间太阳位置（使用UTC时间）
                            const sunPos = calculateSunPosition(currentTime, latitude, longitude);
                            console.log('使用UTC时间计算太阳位置:', currentTime.toISOString());
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
                            
                            // 更新太阳信息状态（使用UTC时间）
                            setSunInfo({
                                altitude: sunPos.altitude,
                                azimuth: sunPos.azimuth,
                                intensity: lightIntensity.toFixed(2),
                                updateTime: formatUTCForDisplay(currentTime.toISOString()).fullDateTime
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
                        console.log("加载tileset, url=", url);
                        
                        // 验证 URL 格式
                        if (!url || typeof url !== 'string') {
                            throw new Error('Invalid tileset URL');
                        }
                        
                        // 使用 Cesium.Cesium3DTileset.fromUrl 创建 tileset
                        const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
                            // 可选配置参数
                            debugShowBoundingVolume: false,
                            debugShowContentBoundingVolume: false,
                            debugShowGeometricError: false,
                            debugWireframe: false
                        });
                        
                        if (!tileset) {
                            throw new Error('Failed to create tileset from URL');
                        }
                        
                        console.log('Tileset 创建成功，添加到场景');
                        console.log('Tileset 对象属性:', {
                            ready: tileset.ready,
                            hasReadyPromise: !!tileset.readyPromise,
                            boundingSphere: !!tileset.boundingSphere,
                            root: !!tileset.root
                        });
                        
                        viewerRef.current.scene.primitives.add(tileset);
                        
                        // 处理 tileset 加载完成的多种方式
                        const handleTilesetReady = () => {
                            console.log('Tileset加载完成，飞到计划指定位置');
                            
                            // 直接使用计划中的相机位置
                            if (plan.camera && plan.camera.position && Array.isArray(plan.camera.position) && plan.camera.position.length >= 2) {
                                const [longitude, latitude] = plan.camera.position;
                                
                                // 使用计划中的高度，如果没有则使用默认高度
                                let height = 5000; // 默认高度5000米
                                
                                if (plan.camera.position.length >= 3) {
                                    height = plan.camera.position[2];
                                } else if (plan.camera.height) {
                                    height = plan.camera.height;
                                }
                                
                                console.log(`飞行到计划位置: 经度${longitude.toFixed(6)}, 纬度${latitude.toFixed(6)}, 高度${height}m`);
                                
                                try {
                                    viewerRef.current.camera.flyTo({
                                        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                                        orientation: {
                                            heading: plan.camera.heading ? Cesium.Math.toRadians(plan.camera.heading) : Cesium.Math.toRadians(0),
                                            pitch: plan.camera.pitch ? Cesium.Math.toRadians(plan.camera.pitch) : Cesium.Math.toRadians(-30),
                                            roll: plan.camera.roll ? Cesium.Math.toRadians(plan.camera.roll) : 0
                                        },
                                        duration: 3.0 // 飞行时间3秒
                                    });
                                } catch (flyError) {
                                    console.error('飞行到计划位置失败:', flyError);
                                }
                            } else {
                                console.warn('计划中没有有效的相机位置信息，跳过自动飞行');
                            }
                        };
                        
                        // 方法1: 检查 tileset 是否已经准备好
                        if (tileset.ready) {
                            console.log('Tileset 已经准备就绪');
                            handleTilesetReady();
                        } 
                        // 方法2: 使用 readyPromise（如果可用）
                        else if (tileset.readyPromise && typeof tileset.readyPromise.then === 'function') {
                            console.log('使用 readyPromise 等待加载完成');
                            try {
                                await tileset.readyPromise;
                                handleTilesetReady();
                            } catch (promiseError) {
                                console.error('readyPromise 失败:', promiseError);
                                // 降级处理
                                setTimeout(handleTilesetReady, 2000);
                            }
                        }
                        // 方法3: 使用事件监听
                        else if (tileset.readyEvent && typeof tileset.readyEvent.addEventListener === 'function') {
                            console.log('使用 readyEvent 监听加载完成');
                            tileset.readyEvent.addEventListener(() => {
                                handleTilesetReady();
                            });
                        }
                        // 方法4: 降级处理 - 延时执行
                        else {
                            console.log('使用延时方案等待 tileset 加载');
                            setTimeout(() => {
                                if (tileset.ready) {
                                    handleTilesetReady();
                                } else {
                                    console.warn('Tileset 可能未完全加载，尝试执行飞行操作');
                                    handleTilesetReady();
                                }
                            }, 2000); // 等待2秒
                        }
                        
                        return tileset;
                        
                    } catch (error) {
                        console.error('加载 tileset 失败:', error);
                        
                        // 提供更详细的错误信息
                        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                            console.error('网络请求失败，请检查 URL 是否可访问:', url);
                            console.error('建议检查：');
                            console.error('1. 服务器是否运行在 http://localhost:8080');
                            console.error('2. tileset.json 文件是否存在');
                            console.error('3. 是否存在 CORS 跨域问题');
                        } else if (error.message.includes('JSON') || error.message.includes('parse')) {
                            console.error('tileset.json 格式错误，请检查文件内容');
                        } else if (error.message.includes('Invalid tileset')) {
                            console.error('tileset 数据格式不符合 3D Tiles 规范');
                        } else {
                            console.error('未知错误:', error.message);
                        }
                        
                        throw error;
                    }
                }

                // 加载固定的 Cesium Ion tileset (ID: 96188) 和地形
                const loadFixedTileset = async () => {
                    try {
                        // console.log('加载固定的 Cesium Ion tileset (ID: 96188)');
                        // const fixedTileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
                        // viewerRef.current.scene.primitives.add(fixedTileset);
                        viewerRef.current.scene.setTerrain(
                            new Cesium.Terrain(
                              Cesium.CesiumTerrainProvider.fromIonAssetId(1),
                            ),
                          );
                        console.log('固定 tileset 加载成功');
                    } catch (error) {
                        console.error('加载固定 tileset 失败:', error);
                        // 即使固定 tileset 加载失败，也不影响整体功能
                    }
                };

                // 设置初始相机位置
                if (plan.camera && plan.camera.position && Array.isArray(plan.camera.position) && plan.camera.position.length >= 2) {
                    const [longitude, latitude] = plan.camera.position;
                    let height = 5000; // 默认高度5000米
                    
                    if (plan.camera.position.length >= 3) {
                        height = plan.camera.position[2];
                    } else if (plan.camera.height) {
                        height = plan.camera.height;
                    }
                    
                    console.log(`设置初始相机位置: 经度${longitude.toFixed(6)}, 纬度${latitude.toFixed(6)}, 高度${height}m`);
                    
                    // 设置初始相机位置
                    viewerRef.current.camera.setView({
                        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                        orientation: {
                            heading: plan.camera.heading ? Cesium.Math.toRadians(plan.camera.heading) : Cesium.Math.toRadians(0),
                            pitch: plan.camera.pitch ? Cesium.Math.toRadians(plan.camera.pitch) : Cesium.Math.toRadians(-30),
                            roll: plan.camera.roll ? Cesium.Math.toRadians(plan.camera.roll) : 0
                        }
                    });
                }

                // 加载固定的 tileset
                loadFixedTileset();

                // 只有当存在tileset_url时才加载自定义tileset
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