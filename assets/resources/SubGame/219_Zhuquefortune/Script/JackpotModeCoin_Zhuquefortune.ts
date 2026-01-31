import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Jackpot 模式硬币组件
 * 负责单个硬币的状态切换、动画播放、鼠标交互事件处理
 */
@ccclass("JackpotModeCoin_Zhuquefortune")
export default class JackpotModeCoin_Zhuquefortune extends cc.Component {
    // 硬币核心动画组件（绑定所有硬币相关动画剪辑）
    @property(cc.Animation)
    public coin_Animation: cc.Animation | null = null;

    // 翻转后 Jackpot 类型显示节点数组（对应 4 种 Jackpot 类型）
    @property([cc.Node])
    public flip_jackpot_Nodes: cc.Node[] = [];

    // 翻转后 Jackpot 后续显示节点数组（对应 4 种 Jackpot 类型）
    @property([cc.Node])
    public after_jackpot_Nodes: cc.Node[] = [];

    // 私有变量：是否启用硬币交互
    public _isEnable: boolean = true;

    // 私有变量：是否处于事件执行中（防止重复交互）
    public _isEvent: boolean = false;

    // 私有变量：鼠标进入回调函数
    private _enterFunc: (() => void) | null = null;

    // 私有变量：鼠标离开回调函数
    private _leaveFunc: (() => void) | null = null;

    // 私有变量：当前硬币对应的 Jackpot 类型（-1 表示未初始化）
    public _jackpotType: number = -1;

    // 私有变量：是否处于双重选中状态
    public _doublePlay: boolean = false;

    /**
     * 组件加载完成（绑定鼠标进入/离开事件）
     */
    public onLoad(): void {
        if (!this.node) return;
        const self = this;

        // 绑定鼠标进入事件（放大硬币、执行进入回调）
        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            // 校验进入回调有效性
            const isEnterFuncValid = TSUtility.isValid(self._enterFunc);
            
            // 启用状态且非事件执行中，放大硬币并执行回调
            if (self._isEnable === true && self._isEvent === false) {
                self.node.scale = 1.2;
                if (isEnterFuncValid && self._enterFunc) {
                    self._enterFunc();
                }
            } else {
                // 恢复硬币默认缩放
                self.node.scale = 1;
            }
        }, this);

        // 绑定鼠标离开事件（恢复默认缩放、执行离开回调）
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            // 校验离开回调有效性
            const isLeaveFuncValid = TSUtility.isValid(self._leaveFunc);
            
            // 恢复硬币默认缩放
            self.node.scale = 1;
            if (isLeaveFuncValid && self._leaveFunc) {
                self._leaveFunc();
            }
        }, this);
    }

    /**
     * 初始化硬币（恢复默认状态、播放闲置动画、隐藏 Jackpot 显示节点）
     * @param enterFunc 鼠标进入回调函数
     * @param leaveFunc 鼠标离开回调函数
     */
    public initCoin(enterFunc?: () => void, leaveFunc?: () => void): void {
        if (!this.coin_Animation) return;

        // 1. 重置硬币状态变量
        this._isEnable = true;
        this._jackpotType = -1;
        this._doublePlay = false;
        this.node.scale = 1;

        // 2. 绑定鼠标回调函数
        this._enterFunc = enterFunc || null;
        this._leaveFunc = leaveFunc || null;

        // 3. 播放默认闲置动画（翻转前）
        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Idle_Before_Flip_1_Ani", 0);

        // 4. 隐藏所有 Jackpot 类型显示节点
        for (let i = 0; i < this.flip_jackpot_Nodes.length; i++) {
            this.flip_jackpot_Nodes[i].active = false;
        }

        for (let i = 0; i < this.after_jackpot_Nodes.length; i++) {
            this.after_jackpot_Nodes[i].active = false;
        }
    }

    /**
     * 晃动硬币（播放晃动动画，营造交互氛围）
     */
    public shakeCoin(): void {
        if (!this.coin_Animation) return;

        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Idle_Before_Flip_2_Ani", 0);
    }

    /**
     * 双重选中硬币（播放双重匹配动画，标记双重选中状态）
     */
    public doubleSelectCoin(): void {
        if (!this.coin_Animation || this._doublePlay === true) return;

        // 取消所有未执行的定时器，标记双重选中状态
        this.unscheduleAllCallbacks();
        this._doublePlay = true;

        // 播放双重匹配动画
        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_2Match_Ani", 0);
    }

    /**
     * 翻转选中硬币（播放选中翻转动画，显示对应 Jackpot 类型节点）
     * @param jackpotType Jackpot 类型索引（0-3）
     */
    public flipCoin(jackpotType: number): void {
        if (!this.coin_Animation) return;

        // 1. 重置硬币状态，记录 Jackpot 类型
        this._isEnable = false;
        this._jackpotType = jackpotType;
        this.node.scale = 1;

        // 2. 处理 "jackpot_super" 子游戏的类型偏移（索引+1）
        let targetJackpotType = jackpotType;
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        if (currentSubGameKey === "jackpot_super") {
            targetJackpotType++;
        }

        // 3. 边界判断：防止数组越界
        if (targetJackpotType >= this.flip_jackpot_Nodes.length || targetJackpotType >= this.after_jackpot_Nodes.length) {
            cc.warn(`Jackpot 类型索引 ${targetJackpotType} 超出节点数组长度`);
            return;
        }

        // 4. 播放选中翻转动画，显示对应 Jackpot 节点
        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Flip_Select_Ani", 0);

        this.flip_jackpot_Nodes[targetJackpotType].active = true;
        this.after_jackpot_Nodes[targetJackpotType].active = true;

        // 5. 延迟 1 秒播放翻转后闲置动画
        this.scheduleOnce(() => {
            this.showIdleCoin();
        }, 1);
    }

    /**
     * 显示翻转后闲置硬币（播放选中后的闲置动画）
     */
    public showIdleCoin(): void {
        if (!this.coin_Animation) return;

        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Idle_After_Flip_Ani_Select", 0);
    }

    /**
     * 中奖硬币（播放中奖动画，禁用交互）
     */
    public winCoin(): void {
        if (!this.coin_Animation) return;

        this._isEnable = false;
        this.unscheduleAllCallbacks();

        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Win_Ani", 0);
    }

    /**
     * 未选中硬币翻转（播放未选中翻转动画，显示对应 Jackpot 类型节点）
     * @param jackpotType Jackpot 类型索引（0-3）
     */
    public noneSelectCoin(jackpotType: number): void {
        if (!this.coin_Animation) return;

        // 1. 禁用硬币交互
        this._isEnable = false;

        // 2. 处理 "jackpot_super" 子游戏的类型偏移（索引+1）
        let targetJackpotType = jackpotType;
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        if (currentSubGameKey === "jackpot_super") {
            targetJackpotType++;
        }

        // 3. 边界判断：防止数组越界
        if (targetJackpotType >= this.flip_jackpot_Nodes.length || targetJackpotType >= this.after_jackpot_Nodes.length) {
            cc.warn(`Jackpot 类型索引 ${targetJackpotType} 超出节点数组长度`);
            return;
        }

        // 4. 播放未选中翻转动画，显示对应 Jackpot 节点
        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Flip_NoSelect_Ani", 0);

        this.flip_jackpot_Nodes[targetJackpotType].active = true;
        this.after_jackpot_Nodes[targetJackpotType].active = true;
    }

    /**
     * 变暗硬币（播放未中奖变暗动画，禁用交互）
     */
    public dimmedCoin(): void {
        if (!this.coin_Animation) return;

        this._isEnable = false;

        this.coin_Animation.stop();
        this.coin_Animation.play("Coin_Dimd_After_Flip_Ani", 0);
    }
}