// Camera.js
import { vec3, quat } from 'gl-matrix';

/** 默认前向 = 负 Z 轴 */
const DEFAULT_FORWARD = [0, 0, -1];

/**
 * 轻量级 Camera，只关心 position / orientation
 */
export default class Camera {
    /**
     * @param {vec3} [position]  初始位置
     * @param {quat} [orientation] 初始朝向四元数
     */
    constructor(
        position = [0, 0, 0],
        orientation = [0, 0, 0, 1],
    ) {
        this.position = vec3.clone(position);
        this.orientation = quat.normalize(quat.create(), orientation);
    }

    /* ──────────────── 读取接口 ──────────────── */
    getPosition()    { return vec3.clone(this.position); }
    getOrientation() { return quat.clone(this.orientation); }

    /* ──────────────── 写入接口 ──────────────── */
    setPosition(p)   { vec3.copy(this.position, p); }
    setOrientation(q){ quat.normalize(this.orientation, q); }

    /**
     * 让相机朝向目标点（保持 World-Up = Y+，无滚转）
     * @param {vec3} target 目标坐标
     */
    lookAt(target) {
        const dir = vec3.subtract(vec3.create(), target, this.position);
        if (vec3.len(dir) < 1e-6) return;          // 与目标重合时忽略
        vec3.normalize(dir, dir);

        // 计算将默认前向 (-Z) 旋转到 dir 的最短四元数
        quat.rotationTo(this.orientation, DEFAULT_FORWARD, dir);  //  [oai_citation:0‡glmatrix.net](https://glmatrix.net/docs/module-quat.html?utm_source=chatgpt.com)
    }

    /**
     * 平移
     * @param {vec3} delta 位移量
     */
    translate(delta) {
        vec3.add(this.position, this.position, delta);
    }

    /**
     * 增量旋转：`delta ⊗ current`
     * @param {quat} deltaQuat 归一化四元数
     */
    rotate(deltaQuat) {
        const dq = quat.normalize(quat.create(), deltaQuat);
        quat.multiply(this.orientation, dq, this.orientation);
        quat.normalize(this.orientation, this.orientation);
    }

    /** 导出给后端的 JSON 结构 */
    toJSON() {
        return {
            position: Array.from(this.position),
            rotation: Array.from(this.orientation),
        };
    }
}