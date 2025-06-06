import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import "../../assets/style.css"

function Background() {
    const mountRef = useRef();
    const frameId = useRef();

    // 获取CSS变量颜色值的函数
    const getCSSVariableColor = (variableName) => {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    };

    // 将十六进制颜色转换为THREE Vector3
    const hexToVector3 = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new THREE.Vector3(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            );
        }
        return new THREE.Vector3(0.1, 0.1, 0.2); // 默认深蓝色
    };

    useEffect(() => {
        const container = mountRef.current;
        
        // ✅ 高性能WebGL渲染器配置
        const renderer = new THREE.WebGLRenderer({ 
            antialias: false,
            powerPreference: "high-performance"
        });
        
        // ✅ 限制像素比例到最大1.25
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        
        // ✅ 使用2/3分辨率渲染
        const LOW_RES_FACTOR = 0.66;
        renderer.setSize(
            window.innerWidth * LOW_RES_FACTOR, 
            window.innerHeight * LOW_RES_FACTOR, 
            false
        );
        
        // ✅ CSS缩放到全屏，使用线性插值采样
        renderer.domElement.style.cssText = "width:100%;height:100%;image-rendering:auto;";
        container.appendChild(renderer.domElement);

        const scene   = new THREE.Scene();
        const camera  = new THREE.Camera();
        camera.position.z = 1;

        // 获取初始主题颜色
        const updateThemeColors = () => {
            const bgPrimary = getCSSVariableColor('--bg-primary');
            const textPrimary = getCSSVariableColor('--text-primary');
            const accentOrange = getCSSVariableColor('--accent-orange');
            const accentBlue = getCSSVariableColor('--accent-blue');
            const accentGreen = getCSSVariableColor('--accent-green');

            return {
                bgPrimary: hexToVector3(bgPrimary),
                textPrimary: hexToVector3(textPrimary),
                accentOrange: hexToVector3(accentOrange),
                accentBlue: hexToVector3(accentBlue),
                accentGreen: hexToVector3(accentGreen)
            };
        };

        const themeColors = updateThemeColors();

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                iTime:       { value: 0 },
                iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
                // 主题颜色uniform
                uBgPrimary:    { value: themeColors.bgPrimary },
                uTextPrimary:  { value: themeColors.textPrimary },
                uAccentOrange: { value: themeColors.accentOrange },
                uAccentBlue:   { value: themeColors.accentBlue },
                uAccentGreen:  { value: themeColors.accentGreen }
            },
            fragmentShader: `
            uniform float iTime;
            uniform vec3 iResolution;
            uniform vec3 uBgPrimary;
            uniform vec3 uTextPrimary;
            uniform vec3 uAccentOrange;
            uniform vec3 uAccentBlue;
            uniform vec3 uAccentGreen;

            void mainImage(out vec4 O, vec2 I) {
                O = vec4(0.0);  // ✅ 显式初始化
                float i = 0.0, z = fract(dot(I, sin(I))), d;
                
                // ✅ 使用固定循环次数优化性能
                const int ITER = 48;
                for (int idx = 0; idx < ITER; idx++) {
                    vec3 p = z * normalize(vec3(I + I, 0) - iResolution.xyy);
                    p.z += 6.;
                    for (d = 1.; d < 9.; d /= .8)
                        p += cos(p.yzx * d - iTime) / d;
                    z += d = .002 + abs(length(p) - .5) / 4e1;
                    
                    // 使用主题颜色创建渐变效果
                    vec3 color1 = mix(uBgPrimary, uTextPrimary, sin(z * 2.0 + iTime * 0.5) * 0.5 + 0.5);
                    vec3 color2 = mix(uAccentBlue, uAccentOrange, sin(z * 3.0 + iTime * 0.7) * 0.5 + 0.5);
                    vec3 color3 = mix(uAccentGreen, uTextPrimary, sin(z * 1.5 + iTime * 0.3) * 0.5 + 0.5);
                    
                    // 根据深度和时间混合不同颜色层
                    vec3 finalColor = mix(color1, color2, sin(z + iTime * 0.2) * 0.5 + 0.5);
                    finalColor = mix(finalColor, color3, sin(z * 0.8 + iTime * 0.4) * 0.3 + 0.3);
                    
                    O += vec4(finalColor, 1.0) * (sin(z + vec4(6, 2, 4, 0)) + 1.5) / d;
                }
                O = tanh(O / 7e3);
                
                // 添加基于背景颜色的轻微调色，增强主题感
                O.rgb = mix(O.rgb, uBgPrimary, 0.1);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy;
                vec4 col;
                mainImage(col, uv);
                gl_FragColor = col;
            }`,
            depthWrite: false,
        });
        scene.add(new THREE.Mesh(geometry, material));

        // 主题变化监听器
        const themeObserver = new MutationObserver(() => {
            const newColors = updateThemeColors();
            material.uniforms.uBgPrimary.value = newColors.bgPrimary;
            material.uniforms.uTextPrimary.value = newColors.textPrimary;
            material.uniforms.uAccentOrange.value = newColors.accentOrange;
            material.uniforms.uAccentBlue.value = newColors.accentBlue;
            material.uniforms.uAccentGreen.value = newColors.accentGreen;
        });

        // 监听document元素的data-theme属性变化
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        const onResize = () => {
            // ✅ 调整大小时也应用低分辨率因子
            renderer.setSize(
                window.innerWidth * LOW_RES_FACTOR, 
                window.innerHeight * LOW_RES_FACTOR, 
                false
            );
            material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
        };
        window.addEventListener('resize', onResize);

        /* ✅ 用 requestAnimationFrame 启动，让浏览器传递 time */
        const animate = (time) => {
            material.uniforms.iTime.value = time * 0.001;
            renderer.render(scene, camera);
            frameId.current = requestAnimationFrame(animate);
        };
        frameId.current = requestAnimationFrame(animate);

        /* ✅ 清理：停止循环 + 释放资源 */
        return () => {
            cancelAnimationFrame(frameId.current);
            window.removeEventListener('resize', onResize);
            themeObserver.disconnect();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);
    
    return (
        <div
            ref={mountRef}
            className="fixed inset-0 z-1 bg-primary"
        />
    );
}

export default Background;