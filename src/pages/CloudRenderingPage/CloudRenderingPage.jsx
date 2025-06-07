import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import "../../assets/style.css"
import RenderWindow from "../../components/RenderWindow/RenderWindow.jsx";
import Background from "../../components/Background/Background.jsx";

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
        <div className="w-full h-full">
            <Background/>
            <div className="flex flex-col pt-32 justify-center items-center">
                {
                   ! isRendering ? (
                        <Button
                            variant="contained"
                            onClick={startRender}
                            className="w-1/2 m-4"
                            sx={{
                                backgroundColor: 'green',
                            }}
                        >
                            Start Rendering
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={stopRender}
                            className="w-1/2 m-4"
                            sx={{
                                backgroundColor: 'red'
                            }}
                        >
                            Stop Rendering
                        </Button>
                    )
                }
                <RenderWindow className="z-10 relative mt-3" wsRef={wsRef} isRendering={isRendering} />
            </div>
        </div>
    );
}

export default CloudRenderingPage;