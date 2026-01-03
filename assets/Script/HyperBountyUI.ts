const { ccclass, property } = cc._decorator;

import TSUtility from "./global_utility/TSUtility";

// ✅ 完整保留原JS的枚举类型 键值完全一致
export enum HyperBountyUIType {
    NONE = "NONE",
    DAILY = "DAILY",
    SEASON = "SEASON",
    PASS = "PASS",
    PASS_GAUGE = "PASS_GAUGE",
    TUTORIAL = "TUTORIAL"
}

@ccclass('HyperBountyUI')
export default class HyperBountyUI extends cc.Component {
    // 私有核心属性 - 弹窗容器引用
    private _popup: any = null;

    // ✅ 完整保留原JS的 Getter 属性封装 无任何修改
    get eType(): HyperBountyUIType {
        return this.getType();
    }

    get numRedDotCount(): number {
        return this.getRedDotCount();
    }

    // ===================== 初始化方法：绑定弹窗容器 + 创建UI =====================
    public initialize(popup: any): void {
        this._popup = popup;
        this.createUI();
    }

    // ===================== 虚方法：获取UI类型 子类重写 =====================
    public getType(): HyperBountyUIType {
        return HyperBountyUIType.NONE;
    }

    // ===================== 虚方法：创建UI 子类重写 =====================
    public createUI(): void { }

    // ===================== 虚方法：获取红点数量 子类重写 =====================
    public getRedDotCount(): number {
        return 0;
    }

    // ===================== 异步虚方法：更新UI 子类重写 (原生TS async语法) =====================
    public async updateUI(): Promise<void> {
        return Promise.resolve();
    }

    // ===================== 异步虚方法：关闭UI 子类重写 (原生TS async语法) =====================
    public async closeUI(): Promise<void> {
        return Promise.resolve();
    }

    // ===================== 异步方法：双倍奖励事件设置 ✅保留原参数默认值逻辑 =====================
    public async set2XEvent(isActive: boolean, isForce: boolean = false): Promise<void> {
        return Promise.resolve();
    }

    // ===================== 弹窗代理：更新新赛季推广弹窗 =====================
    public updateNewSeasonPromotion(): void {
        if (TSUtility.isValid(this._popup) && this._popup.isUpdateNewSeasonPromotion !== 0) {
            this._popup.updateNewSeasonPromotion();
        }
    }

    // ===================== 弹窗代理：获取指定类型的HyperBountyUI实例 =====================
    public getHyperBountyUI(type: HyperBountyUIType): any {
        if (!TSUtility.isValid(this._popup)) {
            return null;
        }
        return this._popup.getHyperBountyUI(type);
    }

    // ===================== 弹窗代理：切换标签页 =====================
    public changeTab(type: HyperBountyUIType): void {
        if (TSUtility.isValid(this._popup)) {
            this._popup.changeTab(type);
        }
    }

    // ===================== 弹窗代理：关闭弹窗 =====================
    public closePopup(): void {
        if (TSUtility.isValid(this._popup)) {
            this._popup.close();
        }
    }

    // ===================== 弹窗代理：设置游戏结果动作 =====================
    public setPlayResultAction(isPlay: boolean): void {
        if (TSUtility.isValid(this._popup)) {
            this._popup.setPlayResultAction(isPlay);
        }
    }

    // ===================== 弹窗代理：获取游戏结果动作状态 =====================
    public getPlayResultAction(): boolean {
        if (TSUtility.isValid(this._popup)) {
            return this._popup.isPlayResultAction;
        }
        return false;
    }
}