import DialogBase, { DialogState } from "../../../Script/DialogBase";
import FireHoseSender, { FHLogType } from "../../../Script/FireHoseSender";
import GameCommonSound from "../../../Script/GameCommonSound";
import { Utility } from "../../../Script/global_utility/Utility";

const { ccclass, property } = cc._decorator;


/**
 * PowerGem老虎机信息弹窗组件 (多页切换+滑动交互)
 * PowerGemInfoPopup
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemInfoPopup extends DialogBase {
    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: cc.Button, displayName: "左箭头按钮" })
    public btnLeftArrow: cc.Button = null;

    @property({ type: cc.Button, displayName: "右箭头按钮" })
    public btnRightArrow: cc.Button = null;

    @property({ type: [cc.Node], displayName: "页面节点数组" })
    public arrPage: cc.Node[] = [];

    @property({ type: cc.Toggle, displayName: "分页Toggle模板" })
    public togglePage: cc.Toggle = null;

    @property({ type: cc.Node, displayName: "触摸滑动节点" })
    public nodeTouch: cc.Node = null;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _numPageIndex: number = 0;
    private _arrPageToggle: cc.Toggle[] = [];

    // ===================== 静态方法 【弹窗实例获取】 =====================
    /**
     * 获取PowerGemInfoPopup实例
     * @param callback 获取完成回调 (error, instance)
     */
    public static getPopup(callback: (error: Error, instance: PowerGemInfoPopup) => void): void {
        const resPath = "Service/01_Content/PowerGem/PowerGemInfoPopup";
        cc.loader.loadRes(resPath, (error: Error, prefab: cc.Prefab) => {
            if (error) {
                // 错误日志上报
                const err = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err));
                callback && callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupInstance = popupNode.getComponent(PowerGemInfoPopup);
                popupNode.active = false;
                callback(null, popupInstance);
            }
        });
    }

    // ===================== 生命周期/核心方法 【1:1还原原JS逻辑】 =====================
    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 初始化弹窗基类
        this.initDailogBase();

        // 绑定左右箭头点击事件
        this.btnLeftArrow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemInfoPopup", "onClick_Left", ""));
        this.btnRightArrow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemInfoPopup", "onClick_Right", ""));

        // 绑定触摸滑动事件
        this.nodeTouch.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
        this.nodeTouch.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));

        // 初始化分页Toggle（第0页）
        this._arrPageToggle.push(this.togglePage);
        this.togglePage.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemInfoPopup", "onClick_Page", "0"));

        // 动态创建剩余分页Toggle
        for (let i = 1; i < this.arrPage.length; ++i) {
            const toggleNode = cc.instantiate(this.togglePage.node);
            const toggleComp = toggleNode.getComponent(cc.Toggle);
            
            // 添加到父节点
            this.togglePage.node.parent.addChild(toggleNode);
            
            // 绑定点击事件
            toggleComp.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemInfoPopup", "onClick_Page", i.toString()));
            
            // 加入Toggle数组
            this._arrPageToggle.push(toggleComp);
        }
    }

    /**
     * 打开弹窗
     * @returns 弹窗实例
     */
    public open(): PowerGemInfoPopup {
        // 播放打开音效
        GameCommonSound.playFxOnce("pop_etc");

        // 打开弹窗（带淡入动画），完成后设置第0页
        this._open(cc.fadeIn(0.25), true, () => {
            this.setPage(0);
        });

        return this;
    }

    /**
     * 获取最大页数
     * @returns 页面总数
     */
    public getMaxPage(): number {
        return this.arrPage.length;
    }

    /**
     * 设置当前显示页面
     * @param pageIndex 页面索引
     */
    public setPage(pageIndex: number): void {
        // 更新当前页面索引
        this._numPageIndex = pageIndex;

        // 控制所有页面节点显隐
        for (let i = 0; i < this.arrPage.length; ++i) {
            this.arrPage[i].active = i === pageIndex;
        }

        // 选中当前分页Toggle
        this._arrPageToggle[pageIndex].isChecked = true;

        // 控制左右箭头显隐
        this.btnLeftArrow.node.active = !(pageIndex <= 0);
        this.btnRightArrow.node.active = !(pageIndex >= this.getMaxPage() - 1);
    }

    /**
     * 触摸结束事件（滑动切换页面）
     * @param event 触摸事件
     */
    public onTouchEnd(event: cc.Event.EventTouch): void {
        this.handleTouchSlide(event);
    }

    /**
     * 触摸取消事件（滑动切换页面）
     * @param event 触摸事件
     */
    public onTouchCancel(event: cc.Event.EventTouch): void {
        this.handleTouchSlide(event);
    }

    /**
     * 处理触摸滑动逻辑（复用代码）
     * @param event 触摸事件
     */
    private handleTouchSlide(event: cc.Event.EventTouch): void {
        // 获取触摸起始和结束位置
        const endPos = event.getLocation();
        const startPos = event.getStartLocation();
        
        // 计算X轴滑动距离
        const deltaX = endPos.x - startPos.x;
        const touchSize = this.nodeTouch.getContentSize();

        // 滑动距离不足阈值时不处理
        if (Math.abs(deltaX) <= touchSize.width / 3) {
            return;
        }

        // 向右滑动（上一页）
        if (deltaX > touchSize.width / 3 && this._numPageIndex > 0) {
            this.setPage(this._numPageIndex - 1);
        }
        // 向左滑动（下一页）
        else if (deltaX < -touchSize.width / 3 && this._numPageIndex < this.arrPage.length - 1) {
            this.setPage(this._numPageIndex + 1);
        }
    }

    /**
     * 分页Toggle点击事件
     * @param event 事件对象
     * @param customEventData 自定义事件数据（页面索引）
     */
    public onClick_Page(event: cc.Event, customEventData: string): void {
        const pageIndex = parseInt(customEventData);
        
        // 索引不同时切换页面并播放音效
        if (this._numPageIndex !== pageIndex) {
            GameCommonSound.playFxOnce("btn_etc");
            this.setPage(pageIndex);
        }
    }

    /**
     * 左箭头点击事件
     */
    public onClick_Left(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._numPageIndex - 1);
    }

    /**
     * 右箭头点击事件
     */
    public onClick_Right(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._numPageIndex + 1);
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        if (this.isStateClose()) {
            return;
        }

        // 移除触摸事件监听
        this.nodeTouch.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
        this.nodeTouch.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel.bind(this));

        // 清除所有调度器
        this.unscheduleAllCallbacks();
        
        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);
        
        // 清理资源
        this.clear();
        
        // 关闭弹窗（带淡出动画）
        this._close(cc.fadeOut(0.15));
    }
}