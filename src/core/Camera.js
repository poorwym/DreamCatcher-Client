// core/Camera.js
import { vec3, quat } from 'gl-matrix';

const WORLD_UP        = [0, 1, 0];
const DEFAULT_FORWARD = [0, 0, -1];

export default class Camera {
    constructor(
        position    = [0, 0,  2],
        orientation = [0, 0,  0, 1],   // [x,y,z,w]
    ) {
        this.position    = vec3.clone(position);
        this.orientation = quat.normalize(quat.create(), orientation);

        // 缓存的方向向量
        this._forward = vec3.create();
        this._right   = vec3.create();
        this._up      = vec3.create();
        this._updateAxes();            // 初始化
    }

    /* ───────── 只读接口 ───────── */
    getPosition()    { return vec3.clone(this.position); }
    getOrientation() { return quat.clone(this.orientation); }
    getForward()     { return vec3.clone(this._forward);   }
    getRight()       { return vec3.clone(this._right);     }
    getUp()          { return vec3.clone(this._up);        }

    /* ───────── FPS-style 控制 ───────── */
    /** 向前/后移动（+前，−后）*/
    moveForward(d) { vec3.scaleAndAdd(this.position, this.position, this._forward, d); }

    /** 向右/左移动（+右，−左）*/
    moveRight(d)   { vec3.scaleAndAdd(this.position, this.position, this._right,   d); }

    /** 向上/下移动（+上，−下）*/
    moveUp(d)      { vec3.scaleAndAdd(this.position, this.position, this._up,      d); }

    /**
     * FPS 旋转：heading = Yaw（世界 Y），pitch = 俯仰（本地 Right）
     * @param {number} headingDeg ΔYaw，正值向右，看向东方向
     * @param {number} pitchDeg   ΔPitch，正值抬头
     */
    rotateFPS(headingDeg, pitchDeg) {
        if (headingDeg === 0 && pitchDeg === 0) return;

        // 1. 先算 yaw 四元数（绕世界 Y）
        const qYaw = quat.setAxisAngle(
            quat.create(),
            WORLD_UP,
            headingDeg * Math.PI / 180,
        );

        // 2. 由于 pitch 要绕“当前 right 轴”旋转，先实时求 right
        const rightAxis = vec3.transformQuat(vec3.create(), [1, 0, 0], this.orientation);
        const qPitch = quat.setAxisAngle(
            quat.create(),
            rightAxis,
            pitchDeg * Math.PI / 180,
        );

        /** C++ 是 `q = yaw * pitch * q`；在 gl-matrix 里保持相同顺序：*/
        quat.multiply(this.orientation, qPitch, this.orientation); // q ← pitch * q
        quat.multiply(this.orientation, qYaw,   this.orientation); // q ← yaw   * q
        quat.normalize(this.orientation, this.orientation);

        this._updateAxes();
    }

    /* ───────── 通用接口 ───────── */
    lookAt(target) {
        const dir = vec3.subtract(vec3.create(), target, this.position);
        if (vec3.len(dir) < 1e-6) return;
        vec3.normalize(dir, dir);
        quat.rotationTo(this.orientation, DEFAULT_FORWARD, dir);
        this._updateAxes();
    }

    toJSON() {
        return {
            focal_length : 60,
            position : Array.from(this.position),
            rotation : Array.from(this.orientation),
        };
    }

    /* ───────── 内部工具 ───────── */
    _updateAxes() {
        vec3.transformQuat(this._forward, DEFAULT_FORWARD, this.orientation); // 前
        vec3.normalize(this._forward, this._forward);

        vec3.cross(this._right, this._forward, WORLD_UP); // 右
        vec3.normalize(this._right, this._right);

        vec3.cross(this._up, this._right, this._forward); // 上（已正交）
        vec3.normalize(this._up, this._up);
    }
}