import TSUtility from "../../../Script/global_utility/TSUtility";

const { ccclass, property } = cc._decorator; // 沿用指定的装饰器导出方式

/**
 * 老虎机底部UI基类
 * 提供免费旋转UI控制、下注相关基础方法（子类可重写）
 */
@ccclass()
export default class BottomUI extends cc.Component {
    // ========== 组件绑定（对应原代码的property装饰器） ==========
    @property(cc.Node)
    rootOfFreeSpinUI_2: cc.Node = null;        // 免费旋转UI根节点2
    @property(cc.Node)
    rootOfFreespinUI: cc.Node = null;          // 免费旋转UI根节点
    @property(cc.Node)
    freeSpinLayoutNode: cc.Node = null;        // 免费旋转布局节点
    @property(cc.Label)
    labelTotalFreespinCount: cc.Label = null;  // 免费旋转总次数标签
    @property(cc.Label)
    labelPastFreespinCount: cc.Label = null;   // 已用免费旋转次数标签
    @property(cc.Label)
    labelRemainFreespinCount: cc.Label = null; // 剩余免费旋转次数标签
    @property(cc.Label)
    labelMultiplierCount: cc.Label = null;     // 免费旋转倍率标签

    // ========== 业务状态 ==========
    bottomUIInterface: any = null; // 底部UI接口实例（由子类传入，暂定义为any）

    // ========== 生命周期 & 初始化 ==========
    /**
     * 扩展初始化底部UI（由子类调用）
     * @param interfaceIns 底部UI接口实例
     */
    initBottomUI_EX(interfaceIns: any): void {
        this.bottomUIInterface = interfaceIns;
    }

    /**
     * 初始化UI（空实现，子类可重写）
     */
    initUI(): void {}

    /**
     * 启动自动旋转计时器（空实现，子类可重写）
     */
    startAutospinTimer(): void {}

    /**
     * 结束自动旋转计时器（空实现，子类可重写）
     */
    endAutospinTimer(): void {}

    /**
     * 设置自动旋转阻止标记（适配TS默认参数）
     * @param flag 是否阻止自动旋转（默认false）
     */
    setBlockAutoEvent(flag: boolean = false): void {}

    // ========== 免费旋转（Freespin）UI控制核心方法 ==========
    /**
     * 显示免费旋转UI
     */
    showFreespinUI(): void {
        if (this.rootOfFreespinUI) {
            this.rootOfFreespinUI.active = true;
        }
    }

    /**
     * 显示免费旋转UI 2
     */
    showFreeSpinUI_2(): void {
        if (this.rootOfFreeSpinUI_2) {
            this.rootOfFreeSpinUI_2.active = true;
        }
    }

    /**
     * 设置免费旋转倍率显示状态
     * @param isShow 是否显示倍率
     */
    setShowFreespinMultiplier(isShow: boolean): void {
        const multiplierNode = this.rootOfFreespinUI?.getChildByName("Multiplier");
        if (multiplierNode) {
            multiplierNode.active = isShow;
        }
    }

    /**
     * 隐藏免费旋转UI
     */
    hideFreespinUI(): void {
        if (this.rootOfFreespinUI) {
            this.rootOfFreespinUI.active = false;
        }
        if (this.rootOfFreeSpinUI_2) {
            this.rootOfFreeSpinUI_2.active = false;
        }
    }

    /**
     * 设置免费旋转总次数
     * @param count 总次数
     */
    setTotalFreespinCount(count: number): void {
        if (!this.labelTotalFreespinCount) return;

        // 设置主标签文本
        this.labelTotalFreespinCount.string = count.toString();
        // 同步所有子节点中的Label文本
        const labelComps = this.labelTotalFreespinCount.getComponentsInChildren(cc.Label);
        for (let i = 0; i < labelComps.length; ++i) {
            labelComps[i].string = count.toString();
        }
    }

    /**
     * 设置已用免费旋转次数
     * @param count 已用次数
     */
    setPastFreespinCount(count: number): void {
        if (!this.labelPastFreespinCount) return;

        // 设置主标签文本
        this.labelPastFreespinCount.string = count.toString();
        // 同步所有子节点中的Label文本
        const labelComps = this.labelPastFreespinCount.getComponentsInChildren(cc.Label);
        for (let i = 0; i < labelComps.length; ++i) {
            labelComps[i].string = count.toString();
        }
    }

    /**
     * 批量设置免费旋转次数（总次数/已用次数/剩余次数）
     * @param pastCount 已用次数
     * @param totalCount 总次数
     */
    setFreespinCount(pastCount: number, totalCount: number): void {
        // 设置总次数和已用次数
        this.setTotalFreespinCount(totalCount);
        this.setPastFreespinCount(pastCount);

        // 更新免费旋转布局
        if (TSUtility.isValid(this.freeSpinLayoutNode)) {
            const layoutComp = this.freeSpinLayoutNode.getComponent(cc.Layout);
            if (TSUtility.isValid(layoutComp)) {
                cc.log(this.freeSpinLayoutNode.active); // 保留原代码的日志输出
                layoutComp.updateLayout(); // 刷新布局
            }
        }

        // 设置剩余次数
        if (this.labelRemainFreespinCount) {
            this.labelRemainFreespinCount.string = (totalCount - pastCount).toString();
        }
    }

    /**
     * 设置免费旋转倍率
     * @param value 倍率值（如2表示2倍）
     */
    setMultiplier(value: number): void {
        if (this.labelMultiplierCount) {
            this.labelMultiplierCount.string = `x${value.toString()}`;
        }
    }

    // ========== 空实现方法（子类可重写） ==========
    /**
     * 添加最大下注解锁特效（空实现）
     * @param param1 特效参数1（原代码未定义具体类型）
     * @param param2 特效参数2（默认null）
     */
    addMaxBettingUnlockEffect(param1: any, param2: any = null): void {}

    /**
     * 隐藏锁定下注弹窗（空实现）
     */
    hideLockChangeTotalBetPopup(): void {}

    /**
     * 设置按钮激活状态（空实现，子类重写）
     */
    setButtonActiveState(): void {}

    /**
     * 设置单线下注按钮交互状态（空实现，子类重写）
     */
    setChangeBetPerLineBtnInteractable(isInteractable: boolean): void {}

    /**
     * 设置最大下注按钮交互状态（空实现，子类重写）
     */
    setChangeMaxBetBtnInteractable(isInteractable: boolean): void {}

    /**
     * 设置根节点激活状态
     * @param isActive 是否激活
     */
    setNodeActive(isActive: boolean): void {
        this.node.active = isActive;
    }

    /**
     * 清理资源（空实现）
     */
    onClear(): void {}

    /**
     * 设置自动旋转次数（空实现，子类重写）
     */
    setAutoSpinCount(count: number): void {}

    /**
     * 设置单线下注按钮交互标记（空实现，子类重写）
     */
    setInteractableFlagForBetPerLineBtns(flag: number): void {}

    /**
     * 设置最大下注按钮交互标记（空实现，子类重写）
     */
    setInteractableFlagForMaxbetBtn(flag: number): void {}

    /**
     * 获取旋转按钮（空实现，子类重写）
     * @returns null（基类默认返回null）
     */
    getSpinBtn(): cc.Button {
        return null;
    }

    /**
     * 获取停止按钮（空实现，子类重写）
     * @returns null（基类默认返回null）
     */
    getStopBtn(): cc.Button {
        return null;
    }

    /**
     * 获取支付表按钮（空实现，子类重写）
     * @returns null（基类默认返回null）
     */
    getPayTableBtn(): cc.Button {
        return null;
    }

    /**
     * 设置旋转按钮交互状态（空实现，子类重写）
     */
    setInteractableSpinBtn(btn: cc.Button, isInteractable: boolean): void {}

    /**
     * 设置禁用下注按钮的自定义逻辑（空实现，子类重写）
     */
    setProcessIsDisableChangeBetBtn(func: () => boolean): void {}

    /**
     * 锁定总下注增大（空实现，子类重写）
     */
    setLockChangeTotalBetBigger(flag: boolean, betPerLine?: number, tipStr?: string, addX?: number, addY?: number): void {}

    /**
     * 锁定总下注修改（空实现，子类重写）
     */
    setLockChangeTotalBet(flag: boolean, betPerLine?: number, tipStr?: string, addX?: number, addY?: number): void {}

    /**
     * 获取自动旋转计时器绑定函数（空实现，子类重写）
     * @returns null（基类默认返回null）
     */
    getStartAutospinTimerBind(): void {
        return null;
    }

    /**
     * 支付表按钮点击事件（空实现，子类重写）
     */
    onClickPaytableBtn(): void {}

    /**
     * 获取根节点
     * @returns 组件挂载的根节点
     */
    getRootNode(): cc.Node {
        return this.node;
    }

    /**
     * 获取已用免费旋转次数标签
     * @returns 标签组件实例
     */
    getLabelPastFreespinCount(): cc.Label {
        return this.labelPastFreespinCount;
    }
}