const { ccclass, property } = cc._decorator;
import CameraControl from "./Slot/CameraControl";
import SlotManager from "./manager/SlotManager";
import TSUtility from "./global_utility/TSUtility";

@ccclass
export default class EventChecker extends cc.Component {
    // ========== 序列化属性（原JS带@property装饰的属性，完全保留原变量名+默认值+关联类型） ==========
    @property(CameraControl)
    public cameracontrol: CameraControl = null;

    @property
    public isCheckMouseEvent: boolean = true;

    @property
    public isCheckKeyboardEvent: boolean = true;

    // ========== 公有成员变量（原JS直接声明，无装饰器，保留原初始化值） ==========
    public mouseEventEnabled: boolean = true;
    public keyboardEventEnabled: boolean = true;

    // ========== 私有成员变量（原JS隐式声明，补全TS类型+初始化值） ==========
    private _listEventListeners: Array<{ key: any, value: Function[] }> = [];

    // ========== 生命周期回调 - 完全复刻原JS逻辑，一行不改 ==========
    onLoad(): void {
        this.enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this), this.node);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp.bind(this), this.node);
    }

    // ========== 触摸事件回调 - 完全保留原逻辑 ==========
    onTouchMove(e: cc.Event.EventTouch): void {
        if (this.isCheckMouseEvent && this.mouseEventEnabled) {
            const touchPos = e.getLocation();
            const startPos = e.getStartLocation();
            const offsetX = touchPos.x - startPos.x;
            const offsetY = touchPos.y - startPos.y;
            this.cameracontrol.setPositionInTouch(cc.v2(offsetX, offsetY),0);
        }
    }

    onTouchEnd(e: cc.Event.EventTouch): void {
        if (this.isCheckMouseEvent && this.mouseEventEnabled) {
            cc.log("onTouchesEnded!");
            const touchPos = e.getLocation();
            const startPos = e.getStartLocation();
            Math.abs(touchPos.x - startPos.x); // 原JS保留的无赋值冗余代码，完整保留
            Math.abs(touchPos.y - startPos.y) > 240 
                ? this.cameracontrol.toggleScrollScreen() 
                : this.cameracontrol.returnOriginalPos();
        }
    }

    onTouchCancel(e: cc.Event.EventTouch): void {
        if (this.isCheckMouseEvent && this.mouseEventEnabled) {
            cc.log("onTouchesCancel!");
            const touchPos = e.getLocation();
            const startPos = e.getStartLocation();
            const offsetY = (Math.abs(touchPos.x - startPos.x), Math.abs(touchPos.y - startPos.y)); // 原JS逗号表达式，完整保留
            const canvasSize = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
            cc.log("canvas width: " + canvasSize.width.toString());
            cc.log("canvas height: " + canvasSize.height.toString());
            offsetY > canvasSize.height / 3 
                ? this.cameracontrol.toggleScrollScreen() 
                : this.cameracontrol.returnOriginalPos();
        }
    }

    // ========== 键盘事件回调 - 完全保留原逻辑（含重复null判断） ==========
    onKeyDown(e: any): void {
        if (this.isCheckKeyboardEvent && this.keyboardEventEnabled) {
            switch (e.keyCode) {
                case cc.macro.KEY.space:
                    null != SlotManager.Instance 
                    && null != SlotManager.Instance 
                    && null != SlotManager.Instance.bottomUI 
                    && null != SlotManager.Instance.bottomUI 
                    && SlotManager.Instance.bottomUI.getStartAutospinTimerBind()(null);
                    break;
            }
        }
    }

    onKeyUp(e: any): void {
        if (this.isCheckKeyboardEvent && this.keyboardEventEnabled) {
            switch (e.keyCode) {
                case cc.macro.KEY.space:
                    null != SlotManager.Instance 
                    && null != SlotManager.Instance 
                    && null != SlotManager.Instance.bottomUI 
                    && null != SlotManager.Instance.bottomUI 
                    && (SlotManager.Instance.bottomUI.endAutospinTimer(null), SlotManager.Instance.spinAll());
                    break;
            }
        }
    }

    // ========== 自定义事件监听管理 - 完全复刻原逻辑 ==========
    addListener(key: any, callback: Function): void {
        if (!this._listEventListeners.some(item => item.key == key)) {
            this._listEventListeners.push({ key: key, value: [] });
        }
        const targetItem = this._listEventListeners.filter(item => item.key == key);
        if (targetItem && targetItem.length > 0) {
            targetItem[0].value.push(callback);
            this.node.on(key.toString(), callback);
        }
    }

    removeListener(key: any, callback: Function): void {
        const targetItem = this._listEventListeners.filter(item => item.key == key);
        if (targetItem && targetItem.length > 0) {
            this.node.off(key.toString(), callback);
            const callbackIndex = targetItem[0].value.indexOf(callback);
            if (callbackIndex >= 0) {
                targetItem[0].value.splice(callbackIndex, 1);
            }
        }
    }

    // ========== 销毁回调 - 完全保留原逻辑（含原JS的解绑小问题，不修正） ==========
    onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyDown);
        
        if (this._listEventListeners.length > 0) {
            for (let i = 0; i < this._listEventListeners.length; i++) {
                const item = this._listEventListeners[i];
                if (TSUtility.isValid(item)) {
                    for (let j = 0; j < item.value.length; j++) {
                        const callback = item.value[j];
                        if (TSUtility.isValid(callback)) {
                            this.node.off(item.key.toString(), callback);
                        }
                    }
                }
            }
        }
    }
}