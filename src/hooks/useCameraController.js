// hooks/useCameraController.js
import { useEffect, useRef } from 'react';

export default function useCameraController(camera, {
    dom          = window,        // 监听对象
    sensitivity  = 0.15,          // °/px
    moveSpeed    = 2.5,           // 单位/秒
} = {}) {

    const pressedRef = useRef(false);
    const lastPosRef = useRef([0, 0]);

    /* 鼠标拖动旋转 */
    useEffect(() => {
        const onMouseDown = e => {
            pressedRef.current = true;
            lastPosRef.current = [e.clientX, e.clientY];
            dom.requestPointerLock?.();           // 可选：锁指针
        };
        const onMouseUp   = () => {
            pressedRef.current = false;
            document.exitPointerLock?.();
        };
        const onMouseMove = e => {
            if (!pressedRef.current) return;
            const dx = e.movementX ?? (e.clientX - lastPosRef.current[0]);
            const dy = e.movementY ?? (lastPosRef.current[1] - e.clientY); // 屏幕 Y 反向
            lastPosRef.current = [e.clientX, e.clientY];
            camera.rotateFPS(dx * sensitivity, dy * sensitivity);
        };

        dom.addEventListener('mousedown', onMouseDown);
        dom.addEventListener('mouseup',   onMouseUp);
        dom.addEventListener('mousemove', onMouseMove);
        return () => {
            dom.removeEventListener('mousedown', onMouseDown);
            dom.removeEventListener('mouseup',   onMouseUp);
            dom.removeEventListener('mousemove', onMouseMove);
        };
    }, [camera, dom, sensitivity]);

    /* 键盘 WASD + Space/Ctrl 移动 */
    useEffect(() => {
        let keys = new Set();
        const onKeyDown = e => keys.add(e.code);
        const onKeyUp   = e => keys.delete(e.code);

        let last = performance.now();
        const loop = now => {
            const dt = (now - last) / 1000; // 秒
            last = now;
            const s = moveSpeed * dt;
            if (keys.has('KeyW')) camera.moveForward( s);
            if (keys.has('KeyS')) camera.moveForward(-s);
            if (keys.has('KeyD')) camera.moveRight(  s);
            if (keys.has('KeyA')) camera.moveRight( -s);
            if (keys.has('Space')) camera.moveUp(  s);
            if (keys.has('ShiftLeft')) camera.moveUp(-s);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup',   onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup',   onKeyUp);
        };
    }, [camera, moveSpeed]);
}