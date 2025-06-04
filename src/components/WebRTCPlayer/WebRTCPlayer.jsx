import React, { useEffect, useRef } from "react";

/** 创建 SDP offer 并等待 ICE 完成 */
async function createOfferSDP(pc) {
    pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await new Promise((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") resolve();
        };
    });

    return pc.localDescription.sdp;
}

function WebRTCPlayer() {
    const pcRef = useRef(null);      // 保存 PeerConnection 实例
    const videoRef = useRef(null);   // 保存 <video> 元素引用

    useEffect(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;     // 组件内访问
        window.pc = pc;         // 控制台调试：chrome://webrtc-internals 也能看到

        /** 远端轨道到来时绑定到 <video> */
        pc.addEventListener("track", (event) => {
            const [remoteStream] = event.streams;
            const videoEl = videoRef.current;
            if (videoEl && videoEl.srcObject !== remoteStream) {
                videoEl.srcObject = remoteStream;
                // 某些浏览器需要显式 play()
                videoEl.play().catch((e) => console.warn("autoplay 被拦截:", e));
            }
        });

        /** 主流程 */
        (async () => {
            try {
                const offerSDP = await createOfferSDP(pc);

                const res = await fetch("http://localhost:8889/mystream/whep", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/sdp",
                        Accept: "application/sdp",
                    },
                    body: offerSDP,
                });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}: ${await res.text()}`);

                const answerSdp = await res.text();
                await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
            } catch (err) {
                console.error("WebRTC 初始化失败:", err);
            }
        })();

        /** 组件卸载时收尾 */
        return () => {
            pc.close();
            window.pc = null;
        };
    }, []);

    return (
        <div>
            <video
                ref={videoRef}
                id="video"
                autoPlay
                playsInline
                controls
                muted
                style={{ width: "100%" }}
            />
        </div>
    );
}

export default WebRTCPlayer;