import React, { useRef, useEffect } from 'react';
import WebRTCPlayer from '../WebRTCPlayer/WebRTCPlayer.jsx';
import Camera       from '../../core/Camera.js';
import useCameraController from '../../hooks/useCameraController.js';
import { sendCamera } from '../../utils/sendCamera.js';
import "../../assets/style.css"

export default function RenderWindow({ wsRef, isRendering }) {
    const camRef = useRef(new Camera());

    /* 创建相机一次 */
    useEffect(() => {
        camRef.current.lookAt([0, 0, 0]);
    }, []);

    /* 接入 FPS 控制器 */
    useCameraController(camRef.current, {
        dom: document.getElementById('render-canvas') ?? window, // 监听区域
    });

    /* 只有在渲染时才把相机状态定时同步给后端（30 fps） */
    useEffect(() => {
        if (!isRendering) {
            return; // 如果没有在渲染，不设置定时器
        }

        const id = setInterval(() => {
           sendCamera(wsRef.current, camRef.current);
        }, 33); // ≈30 fps

        return () => clearInterval(id);
    }, [wsRef, isRendering]); // 添加isRendering作为依赖

    return (
        <div id="render-canvas" className="z-10" style={{ width: '100%', height: '100%' }}>
            <WebRTCPlayer />
        </div>
    );
}