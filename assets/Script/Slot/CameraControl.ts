const { ccclass, property } = cc._decorator;
import CameraFollower from "./CameraFollower";
import AutoScalingAdjuster from "../AutoScalingAdjuster";
import ViewResizeManager from "../global_utility/ViewResizeManager";
import TSUtility from "../global_utility/TSUtility";

/** 相机缩放状态枚举 */
export enum CameraZoomState {
    ZoomIn = 1,
    ZoomOut = 2
}

/** 相机位置状态枚举 */
export enum CameraPositionState {
    Up = 1,
    Down = 2
}

@ccclass
export default class CameraControl extends cc.Component {
    // ====== 序列化属性 (原JS的@property配置，保持序列化能力) ======
    @property([cc.Node])
    public nodes: cc.Node[] = [];

    @property
    public yOffset: number = 0;

    // ====== 常量配置 (原JS硬编码常量，提取为类成员常量) ======
    public static readonly nDefaultZoomInRatio: number = 1;
    public static readonly nDefaultZoomOutRatio: number = 0.8;
    public static readonly ORDER_TYPE_TOPPOS_CENTER: string = "ORDER_TYPE_TOPPOS_CENTER";
    public static readonly ORDER_TYPE_TOPPOS_BOTTOM: string = "ORDER_TYPE_TOPPOS_BOTTOM";

    // ====== 单例实例 ======
    public static Instance: CameraControl = null;

    // ====== 私有成员变量 (原JS所有私有属性，补全初始化值+类型) ======
    private pivotTopFramePosY: number = 250;
    private canvasHeight: number = 720;
    public scaleAdjuster: AutoScalingAdjuster = null;

    private nDefaultDownZoomOutYPosition: number = 39;
    private nDefaultDownZoomInYPosition: number = 0;
    private nDefaultUpYZoomOutPosition: number = 810;
    private nDefaultUpYZoomInPosition: number = 836;
    private nDefaultUpYBottomPosition: number = 476;
    private nDefaultUpYZoomOut_YOffset: number = 0;
    private nDefaultUpYZoomIn_YOffset: number = 0;

    private nOriginalUpYZoomOutPosition: number = 810;
    private nOriginalUpYZoomInPosition: number = 836;
    private nOriginalUpYBottomPosition: number = 476;

    private currentDefaultPosition: cc.Vec2 = cc.v2(0, 0);
    private eStateOfCameraPosition: CameraPositionState = CameraPositionState.Down;
    private bFlagSwipe: boolean = true;
    private _scrollAction: cc.Action = null;

    private onStartScrollUp: Function = null;
    private onStartScrollDown: Function = null;
    private callbackScrollUp: Function = null;
    private callbackScrollDown: Function = null;

    private bFlagZoom: boolean = true;
    private eStateOfChangeZoomRatio: CameraZoomState = CameraZoomState.ZoomIn;
    private nTargetZoomRatio: number = 0;
    private nStartZoomRatio: number = 0;
    private nChangeZoomRatioTime: number = 1;
    private nStartTimeZoom: number = 0;

    public orderTypeTopPos: string = CameraControl.ORDER_TYPE_TOPPOS_BOTTOM;
    public flagApplyTestCode: boolean = true;
    public useDefaultUpYZoomPosition: boolean = true;
    public useResolutionCorrection: boolean = false;

    private _flagScrollActionAvailable: boolean = true;
    private _handlers: any[] = [];

    // ====== 访问器 (原JS的get/set封装，TS原生实现) ======
    public get flagScrollActionAvailable(): boolean {
        return this._flagScrollActionAvailable;
    }

    public set flagScrollActionAvailable(value: boolean) {
        this._flagScrollActionAvailable = value;
    }

    // ====== 生命周期回调 (原JS完整保留) ======
    onLoad() {
        CameraControl.Instance = this;
        this.refreshCameraControl();
    }

    onDestroy() {
        if (CameraControl.Instance === this) {
            CameraControl.Instance = null;
        } else {
            cc.error("CameraControl.Instance onDestroy error");
        }
    }

    // ====== 静态方法 (原JS的静态移除处理器方法) ======
    public static RemoveHandler(target: any): void {
        if (TSUtility.isValid(CameraControl.Instance)) {
            CameraControl.Instance._removeHandler(target);
        }
    }

    // ====== 所有业务方法 (按原JS顺序完整转换，逻辑无任何改动) ======
    setOrderTypeTopPos(type: string): void {
        this.orderTypeTopPos = type;
    }

    setUseResolutionCorrection(flag: boolean): void {
        this.useResolutionCorrection = flag;
        cc.log("setUseResolutionCorrection " + flag);
    }

    refreshCameraControl(): void {
        this.scaleAdjuster = this.getComponent(AutoScalingAdjuster);
        if (this.scaleAdjuster != null) {
            this.scaleAdjuster.initRatio();
            const oldPivot = this.pivotTopFramePosY;
            this.pivotTopFramePosY = Math.abs(this.scaleAdjuster.getPivotPosY("topFrame"));
            cc.log("pivotTopFramePosY change " + oldPivot + " - " + this.pivotTopFramePosY);
        }
        this.refreshPosition();
        for (let i = 0; i < this.nodes.length; ++i) {
            const node = this.nodes[i];
            if (node.getComponent(CameraFollower) == null) {
                node.addComponent(CameraFollower);
            }
        }
    }

    addHandler(handler: any): void {
        this._handlers.push(handler);
    }

    _removeHandler(target: any): void {
        const index = this._handlers.indexOf(target);
        if (index !== -1) {
            this._handlers.splice(index, 1);
        }
    }

    initCameraControl(downPos: cc.Vec2, upPos: cc.Vec2): void {
        if (this.flagApplyTestCode === false) {
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            if (canvas.node.getContentSize().height > 806 + 2 * (720 - upPos.y)) {
                upPos.y = 720 - (canvas.node.getContentSize().height - 806) / 2;
                upPos.x = upPos.y - 16;
            }
        }
        this.nOriginalUpYZoomOutPosition = upPos.x;
        this.nOriginalUpYZoomInPosition = upPos.y;
        this.nOriginalUpYBottomPosition = upPos.y - 360;
        this.nDefaultDownZoomOutYPosition = downPos.x;
        this.nDefaultDownZoomInYPosition = downPos.y;
        this.refreshDefaultPosition();
    }

    setUseDefaultUpYZoomPosition(flag: boolean): void {
        cc.log("setUseDefaultUpYZoomPosition " + flag);
        this.useDefaultUpYZoomPosition = flag;
    }

    refreshDefaultPosition(): void {
        if (this.scaleAdjuster) {
            const scaleFactor = this.scaleAdjuster.getScaleFactor("topFrame");
            this.nDefaultUpYZoomOutPosition = this.changePosYUsingTopFrameScaleFactor(this.nOriginalUpYZoomOutPosition);
            this.nDefaultUpYZoomInPosition = this.changePosYUsingTopFrameScaleFactor(this.nOriginalUpYZoomInPosition);
            
            if (this.useResolutionCorrection) {
                let offset = 0;
                if (CameraControl.Instance.scaleAdjuster) {
                    offset = CameraControl.Instance.scaleAdjuster.getResolutionRatio() * CameraControl.Instance.yOffset;
                }
                this.nDefaultUpYZoomOutPosition += offset;
                this.nDefaultUpYZoomInPosition += offset;
            }

            if (ViewResizeManager.Instance().isVirtualPortrait()) {
                this.nDefaultUpYZoomOutPosition -= 120;
                this.nDefaultUpYZoomInPosition -= 120;
            }

            cc.log("refreshDefaultPosition0 " + this.nOriginalUpYZoomOutPosition + "/" + this.nOriginalUpYZoomInPosition + "}");
            cc.log("refreshDefaultPosition1 " + this.nDefaultUpYZoomOutPosition + "/" + this.nDefaultUpYZoomInPosition + "}");
            
            if (this.useDefaultUpYZoomPosition) {
                this.nDefaultUpYZoomOutPosition -= this.nDefaultUpYZoomOut_YOffset * scaleFactor;
                this.nDefaultUpYZoomInPosition -= this.nDefaultUpYZoomIn_YOffset * scaleFactor;
            }

            this.nDefaultUpYBottomPosition = this.changePosYUsingTopFrameScaleFactor(this.nOriginalUpYBottomPosition);
            cc.log("refreshDefaultPosition2 " + this.nDefaultUpYZoomOutPosition + "/" + this.nDefaultUpYZoomInPosition + "/" + this.nDefaultUpYBottomPosition);
            this.setCurrentDefaultPosition(cc.v2(0, this.getPositionYWithZoomFactor()));
        }
    }

    refreshPosition(): void {
        const pos = this.getCurrentDefaultPositionWithOffset();
        this.node.x = pos.x;
        this.node.y = pos.y;
    }

    setDefaultUpYZoomYOffset(outOffset: number, inOffset: number): void {
        this.nDefaultUpYZoomOut_YOffset = outOffset;
        this.nDefaultUpYZoomIn_YOffset = inOffset;
    }

    getTopFrameScaleFactor(): number {
        if (!this.scaleAdjuster) return 1;
        const scale = this.scaleAdjuster.getScaleFactor("topFrame");
        return 1 + (scale - 1) * (this.pivotTopFramePosY / (this.canvasHeight / 2));
    }

    toggleScrollScreen(duration: number = 0.5, easing?: cc.Action): void {
        if (this.eStateOfCameraPosition === CameraPositionState.Down) {
            this.scrollUpScreen(duration, easing);
        } else if (this.eStateOfCameraPosition === CameraPositionState.Up) {
            this.scrollDownScreen(duration, easing);
        }
    }

    isScrolling(): boolean {
        return this.bFlagSwipe === false;
    }

    setScreenTop(): void {
        if (this._scrollAction) {
            this.node.stopAction(this._scrollAction);
            this._scrollAction = null;
        }
        this.eStateOfCameraPosition = CameraPositionState.Up;
        this.setCurrentDefaultPosition(cc.v2(0, this.getPositionYWithZoomFactor()));
        const pos = this.getCurrentDefaultPositionWithOffset();
        this.node.setPosition(pos);
        cc.log("setScreenTop " + pos.x + ", " + pos.y);
        this.bFlagSwipe = true;
        
        if (this.callbackScrollUp) this.callbackScrollUp();
        for (let i = 0; i < this._handlers.length; ++i) {
            const handler = this._handlers[i];
            if (TSUtility.isValid(handler)) handler.onScrollUp();
        }
    }

    setScreenBottom(): void {
        if (this._scrollAction) {
            this.node.stopAction(this._scrollAction);
            this._scrollAction = null;
        }
        this.eStateOfCameraPosition = CameraPositionState.Down;
        this.setCurrentDefaultPosition(cc.v2(0, this.getPositionYWithZoomFactor()));
        const pos = this.getCurrentDefaultPositionWithOffset();
        this.node.setPosition(pos);
        this.bFlagSwipe = true;
        
        if (this.callbackScrollDown) this.callbackScrollDown();
        for (let i = 0; i < this._handlers.length; ++i) {
            const handler = this._handlers[i];
            if (TSUtility.isValid(handler)) handler.onScrollDown();
        }
    }

    scrollUpScreen(duration: number, easing?: cc.Action): void {
        if (this.flagScrollActionAvailable) {
            this.bFlagSwipe = false;
            if (this._scrollAction) {
                this.node.stopAction(this._scrollAction);
                this._scrollAction = null;
            }
            this.eStateOfCameraPosition = CameraPositionState.Up;
            this.setCurrentDefaultPosition(cc.v2(0, this.getPositionYWithZoomFactor()));
            const targetPos = this.getCurrentDefaultPositionWithOffset();
            let moveAction = cc.moveTo(duration, targetPos);
            if (easing) moveAction = moveAction.easing(easing);

            const callFunc = cc.callFunc(() => {
                this.node.setPosition(targetPos.clone());
                this.bFlagSwipe = true;
                if (this.callbackScrollUp) this.callbackScrollUp();
                for (let i = 0; i < this._handlers.length; ++i) {
                    const handler = this._handlers[i];
                    if (TSUtility.isValid(handler)) handler.onScrollUp();
                }
            });

            if (this.onStartScrollUp) this.onStartScrollUp();
            for (let i = 0; i < this._handlers.length; ++i) {
                const handler = this._handlers[i];
                if (TSUtility.isValid(handler)) handler.onStartScrollUp();
            }

            this._scrollAction = this.node.runAction(cc.sequence(moveAction, callFunc));
        }
    }

    scrollDownScreen(duration: number, easing?: cc.Action): void {
        if (this.flagScrollActionAvailable) {
            this.bFlagSwipe = false;
            if (this._scrollAction) {
                this.node.stopAction(this._scrollAction);
                this._scrollAction = null;
            }
            this.eStateOfCameraPosition = CameraPositionState.Down;
            this.setCurrentDefaultPosition(cc.v2(0, this.getPositionYWithZoomFactor()));
            const targetPos = this.getCurrentDefaultPositionWithOffset();
            let moveAction = cc.moveTo(duration, targetPos);
            if (easing) moveAction = moveAction.easing(easing);

            const callFunc = cc.callFunc(() => {
                this.node.setPosition(targetPos);
                this.bFlagSwipe = true;
                if (this.callbackScrollDown) this.callbackScrollDown();
                for (let i = 0; i < this._handlers.length; ++i) {
                    const handler = this._handlers[i];
                    if (TSUtility.isValid(handler)) handler.onScrollDown();
                }
            });

            if (this.onStartScrollDown) this.onStartScrollDown();
            for (let i = 0; i < this._handlers.length; ++i) {
                const handler = this._handlers[i];
                if (TSUtility.isValid(handler)) handler.onStartScrollDown();
            }

            this._scrollAction = this.node.runAction(cc.sequence(moveAction, callFunc));
        }
    }

    scrollScreenToCenterPositionY(duration: number, posY: number, easing?: cc.Action): void {
        this.bFlagSwipe = false;
        if (this._scrollAction) {
            this.node.stopAction(this._scrollAction);
            this._scrollAction = null;
        }
        this.eStateOfCameraPosition = CameraPositionState.Down;
        const scaleFactor = this.scaleAdjuster.getScaleFactor("topFrame");
        const targetY = Math.round(posY * scaleFactor);
        let moveAction = cc.moveTo(duration, 0, targetY);
        if (easing) moveAction = moveAction.easing(easing);

        const callFunc = cc.callFunc(() => {
            this.bFlagSwipe = true;
        });

        this._scrollAction = this.node.runAction(cc.sequence(moveAction, callFunc));
    }

    scrollScreenToBottomPositionY(duration: number, posY: number, easing?: cc.Action): void {
        this.bFlagSwipe = false;
        if (this._scrollAction) {
            this.node.stopAction(this._scrollAction);
            this._scrollAction = null;
        }
        this.eStateOfCameraPosition = CameraPositionState.Down;
        const scaleFactor = this.scaleAdjuster.getScaleFactor("topFrame");
        let targetY = Math.round((posY + this.pivotTopFramePosY) * scaleFactor - this.pivotTopFramePosY);
        targetY += this.canvasHeight / 2;
        let moveAction = cc.moveTo(duration, 0, targetY);
        if (easing) moveAction = moveAction.easing(easing);

        const callFunc = cc.callFunc(() => {
            this.bFlagSwipe = true;
        });

        this._scrollAction = this.node.runAction(cc.sequence(moveAction, callFunc));
    }

    getPositionYWithZoomFactor(): number {
        if (this.eStateOfCameraPosition === CameraPositionState.Up) {
            if (this.orderTypeTopPos === CameraControl.ORDER_TYPE_TOPPOS_CENTER) {
                return this.eStateOfChangeZoomRatio === CameraZoomState.ZoomOut 
                    ? this.nDefaultUpYZoomOutPosition 
                    : this.nDefaultUpYZoomInPosition;
            }
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            let scale = 1;
            if (this.scaleAdjuster != null) scale = this.scaleAdjuster.getScaleFactor("topFrame");
            return this.nDefaultUpYBottomPosition + canvas.node.getContentSize().height / 2 / scale;
        }
        return this.eStateOfChangeZoomRatio === CameraZoomState.ZoomOut 
            ? this.nDefaultDownZoomOutYPosition 
            : this.nDefaultDownZoomInYPosition;
    }

    isOriginalPos(): boolean {
        let isOriginal = true;
        const targetPos = this.getCurrentDefaultPositionWithOffset();
        if (this.node.x !== targetPos.x || this.node.y !== targetPos.y) {
            isOriginal = false;
        }
        return isOriginal;
    }

    returnOriginalPos(): void {
        this.bFlagSwipe = false;
        var e = this.getCurrentDefaultPositionWithOffset()
            , t = e.x
            , n = e.y;
        this.node.runAction(cc.sequence(cc.moveTo(.3, cc.v2({
            x: t,
            y: n
        })), cc.callFunc(function() {
            this.node.position = cc.v2(t, n),
            this.bFlagSwipe = true
        }
        .bind(this))))
    }

    getYOffset(): number {
        return this.scaleAdjuster ? this.yOffset : 0;
    }

    getResolutionRatioYOffset(): number {
        return this.scaleAdjuster ? this.scaleAdjuster.getResolutionRatio() * this.yOffset : 0;
    }

    getPositionWithOffset(pos: cc.Vec2): cc.Vec2 {
        let offset = 0;
        if (this.scaleAdjuster) offset = this.scaleAdjuster.getResolutionRatio() * this.yOffset;
        return cc.v2(pos.x, pos.y - offset);
    }

    getCurrentDefaultPositionWithOffset(): cc.Vec2 {
        return this.getPositionWithOffset(this.currentDefaultPosition);
    }

    setCurrentDefaultPosition(pos: cc.Vec2): void {
        this.currentDefaultPosition = pos;
    }

    setPositionInTouch(pos: cc.Vec2, offsetY: number): void {
        const targetPos = this.getCurrentDefaultPositionWithOffset();
        if (this.eStateOfCameraPosition === CameraPositionState.Up) {
            if (offsetY >= 0) this.node.y = targetPos.y - offsetY;
        } else {
            if (offsetY <= 0) this.node.y = targetPos.y - offsetY;
        }
    }

    setZoomRatio(ratio: number): void {
        this.node.scale = ratio;
    }

    private _changeZoomRatio(duration: number, targetRatio: number, isScroll: boolean = true): void {
        if (this.bFlagZoom) {
            this.bFlagZoom = false;
            if (duration === 0) duration = 0.001;
            this.nStartTimeZoom = Date.now();
            this.nStartZoomRatio = this.node.scale;
            this.nChangeZoomRatioTime = duration;
            this.nTargetZoomRatio = targetRatio;
            this.schedule(this._updateZoomRatioSchedule, 0);
            if (isScroll) {
                if (this.eStateOfCameraPosition === CameraPositionState.Up) {
                    this.scrollUpScreen(duration);
                } else {
                    this.scrollDownScreen(duration);
                }
            }
        } else {
            cc.log("not working");
        }
    }

    private _updateZoomRatioSchedule(): void {
        let progress = (Date.now() - this.nStartTimeZoom) / this.nChangeZoomRatioTime / 1000;
        progress = Math.min(1, progress);
        this.node.scale = cc.misc.lerp(this.nStartZoomRatio, this.nTargetZoomRatio, progress);
        if (progress === 1) {
            this.bFlagZoom = true;
            this.unschedule(this._updateZoomRatioSchedule);
        }
    }

    isZoomAction(): boolean {
        return !this.bFlagZoom;
    }

    cancelCurrentZoomAction(isSetTarget: boolean): void {
        if (this.isZoomAction()) {
            if (isSetTarget) this.node.scale = this.nTargetZoomRatio;
            this.bFlagZoom = true;
            this.unschedule(this._updateZoomRatioSchedule);
        }
    }

    zoomIn(duration: number): void {
        if (this.bFlagZoom) {
            this.eStateOfChangeZoomRatio = CameraZoomState.ZoomIn;
            this._changeZoomRatio(duration, CameraControl.nDefaultZoomInRatio);
        }
    }

    zoomOut(duration: number): void {
        if (this.bFlagZoom) {
            this.eStateOfChangeZoomRatio = CameraZoomState.ZoomOut;
            this._changeZoomRatio(duration, CameraControl.nDefaultZoomOutRatio);
        }
    }

    setZoomRelative(duration: number, ratio: number, cancelCurrent: boolean): void {
        if (cancelCurrent) this.cancelCurrentZoomAction(true);
        if (this.bFlagZoom) {
            const targetRatio = this.getCurrentDefaultZoomRatio() * ratio;
            this._changeZoomRatio(duration, targetRatio);
        } else {
            cc.error("camera zoom is working");
        }
    }

    resetZoomRelative(duration: number, cancelCurrent: boolean): void {
        if (cancelCurrent) this.cancelCurrentZoomAction(true);
        if (this.bFlagZoom) {
            const defaultRatio = this.getCurrentDefaultZoomRatio();
            this._changeZoomRatio(duration, defaultRatio);
        } else {
            cc.error("camera zoom is working");
        }
    }

    getCurrentDefaultZoomRatio(): number {
        return this.eStateOfChangeZoomRatio === CameraZoomState.ZoomIn 
            ? CameraControl.nDefaultZoomInRatio 
            : CameraControl.nDefaultZoomOutRatio;
    }

    toggleZoomRatio(): void {
        if (this.node.scale === CameraControl.nDefaultZoomInRatio) {
            this.zoomOut(0.3);
        } else {
            this.zoomIn(0.3);
        }
    }

    getAnimation(): cc.Animation {
        return this.getComponent(cc.Animation);
    }

    changePosYUsingTopFrameScaleFactor(posY: number): number {
        if (this.scaleAdjuster) {
            const scale = this.scaleAdjuster.getScaleFactor("topFrame");
            const lerpScale = cc.misc.lerp(1, scale, this.scaleAdjuster.getResolutionRatio());
            cc.log("changePosYUsingTopFrameScaleFactor " + posY + " - " + this.pivotTopFramePosY + " - " + lerpScale);
            return Math.round(posY * lerpScale);
        }
        return posY;
    }

    moveScreen(duration: number, targetPos: cc.Vec2, easing?: cc.Action): void {
        this.bFlagSwipe = false;
        if (this._scrollAction) {
            this.node.stopAction(this._scrollAction);
            this._scrollAction = null;
        }
        this.eStateOfCameraPosition = CameraPositionState.Down;
        this.setCurrentDefaultPosition(targetPos);
        const finalPos = this.getCurrentDefaultPositionWithOffset();
        let moveAction = cc.moveTo(duration, finalPos);
        if (easing) moveAction = moveAction.easing(easing);

        const callFunc = cc.callFunc(() => {
            this.node.setPosition(finalPos);
            this.bFlagSwipe = true;
        });

        this._scrollAction = this.node.runAction(cc.sequence(moveAction, callFunc));
    }

    getWorldPosition(): cc.Vec2 {
        const worldPos = new cc.Vec2();
        worldPos.x = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO).x;
        worldPos.y = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO).y;
        return worldPos;
    }
}