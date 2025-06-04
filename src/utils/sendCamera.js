
export function sendCamera(ws, camera) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
        id    : crypto.randomUUID(),
        action: 'update_camera',
        data  : camera.toJSON()          // toJSON 里必须是上面的正确代码
    }));
}