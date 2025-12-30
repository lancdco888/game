const { ccclass, property } = cc._decorator;
import CameraControl from "./CameraControl";

@ccclass
export default class CameraFollower extends cc.Component {
    // ========== 序列化属性（原JS的@property，完全保留原变量名+默认值，注意原拼写 Ratido 非 Ratio） ==========
    @property
    public followRatidoX: number = 1;

    @property
    public followRatidoY: number = 1;

    // ========== 私有成员变量（原JS隐式声明，补全类型+初始化值） ==========
    private _cameraFollower: CameraControl = null;
    private _prevScale: number = 1;
    private _startPos: cc.Vec2 = null;
    private _prevCameraPos: cc.Vec2 = null;

    // ========== 生命周期回调 - 完全复刻原JS逻辑 ==========
    start(): void {
        this._cameraFollower = CameraControl.Instance;
        let cameraScale = this._cameraFollower.node.scale;
        cameraScale = cameraScale === 0 ? 0.01 : cameraScale;

        this._startPos = this.node.getPosition().clone();
        this._prevCameraPos = this._cameraFollower.node.getPosition().clone();
        this._prevScale = cameraScale;

        const cameraPos = this._cameraFollower.node.getPosition();
        this.node.setPosition(
            this._startPos.x + (this._startPos.x - cameraPos.x) * this.followRatidoX * cameraScale,
            this._startPos.y + (this._startPos.y - cameraPos.y) * this.followRatidoY * cameraScale
        );
        this.node.scale = cameraScale;
    }

    // ========== 帧更新回调 - 完全复刻原JS逻辑 ==========
    update(): void {
        const cameraPos = this._cameraFollower.node.getPosition();
        const cameraScale = this._cameraFollower.node.scale;

        if (!this._prevCameraPos.equals(cameraPos) || this._prevScale !== cameraScale) {
            const scale = cameraScale === 0 ? 0.01 : cameraScale;
            this.node.setPosition(
                this._startPos.x + (this._startPos.x - cameraPos.x) * this.followRatidoX * scale,
                this._startPos.y + (this._startPos.y - cameraPos.y) * this.followRatidoY * scale
            );
            this.node.scale = scale;
            this._prevCameraPos = cameraPos.clone();
            this._prevScale = scale;
        }
    }
}