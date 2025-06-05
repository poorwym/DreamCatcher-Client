import React, { useEffect, useRef, useState } from 'react';
import Camera from '../../core/Camera.js';
import './CloudRenderingPage.css';
import Button from '@mui/material/Button';
import RenderWindow from "../../components/RenderWindow/RenderWindow.jsx";

function CloudRenderingPage() {

    // 保存 WebSocket 实例
    const wsRef = useRef(null);
    // 添加渲染状态
    const [isRendering, setIsRendering] = useState(false);

    // 页面加载即建立连接
    useEffect(() => {
        // 1. 创建连接
        const ws = new WebSocket('ws://localhost:9000');
        wsRef.current = ws;

        // 2. 连接成功
        ws.onopen = () => {
            console.log('WebSocket 已连接');
            // 如果需要，可先把摄像机参数或其他初始化信息发给服务端
            // ws.send(JSON.stringify({ type: 'init', cameraParams: camera.getParams?.() }));
        };

        // 3. 收到服务器消息
        ws.onmessage = (event) => {
            console.log('收到消息：', event.data);
            // 可以根据后端协议做进一步处理
        };

        ws.onerror = (err) => {
            console.error('WebSocket 发生错误：', err);
        };

        ws.onclose = () => {
            console.log('WebSocket 已关闭');
        };

        // 4. 组件卸载时关闭连接
        return () => {
            ws.close();
        };
    }, []); // 空依赖数组确保只执行一次

    // 点击按钮后向服务端发送开始渲染指令
    const startRender = () => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                id : crypto.randomUUID(),
                action : "start_render"
            }))
            // 设置渲染状态为true
            setIsRendering(true);
        } else {
            console.warn('WebSocket 尚未连接，无法发送 startRender');
        }
    };

    const stopRender = () => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                id : crypto.randomUUID(),
                action : "stop_render"
            }))
            // 设置渲染状态为false
            setIsRendering(false);
        } else {
            console.warn('WebSocket 尚未连接，无法发送 stopRender');
        }
    };

    return (
        <div>
            <Button variant="contained" onClick={startRender}>
                Start Rendering
            </Button>
            <Button variant="contained" onClick={stopRender}>
                Stop Rendering
            </Button>
            <RenderWindow wsRef={wsRef} isRendering={isRendering} />
        </div>
    );
}

export default CloudRenderingPage;