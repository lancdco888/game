// Cocos 2.x 标准头部解构写法 (指定要求)
const { ccclass, property } = cc._decorator;

// 导入所有依赖模块 - 路径与原代码完全一致 无修改
import SDefine from "./global_utility/SDefine";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";

@ccclass
export default class ThrillJackpotMoneyDisplay extends cc.Component {
    /** 序列化绑定：大奖金额显示的文本标签数组 */
    @property([cc.Label])
    public jackpot_Label: cc.Label[] = [];

    /** 存储上一帧的大奖金额，用于金额数字渐变过渡 */
    private prevJackpotMoney: number[] = [];

    /** 金额更新开关-私有变量 */
    private _isActiveUpdate: boolean = true;

    /**
     * 金额自动更新的开关 存取器 (原代码完整保留的 get/set)
     * 外部可通过 .isActiveUpdate = true/false 控制是否刷新金额
     */
    public get isActiveUpdate(): boolean {
        return this._isActiveUpdate;
    }

    public set isActiveUpdate(value: boolean) {
        this._isActiveUpdate = value;
    }

    // ===================== 生命周期 =====================
    onLoad() {
        // 初始化上一帧金额数组，匹配标签数量
        for (let i = 0; i < this.jackpot_Label.length; i++) {
            // 获取对应id的大奖信息 (id = 索引+1)
            const jackpotInfo = SlotJackpotManager.Instance().getThrillJackpotInfo(i + 1);
            let jackpotNum = 0;
            if (jackpotInfo != null) {
                jackpotNum = Math.floor(jackpotInfo.getJackpotForDisplay());
            }
            this.prevJackpotMoney.push(jackpotNum);
        }
        // 立即执行一次金额刷新
        this.updateJackpotMoneyScedule();
        // 开启定时器循环刷新金额，使用全局配置的刷新间隔
        this.schedule(this.updateJackpotMoneyScedule, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
    }

    onDestroy() {
        // 销毁时取消所有定时器，防止内存泄漏 (原代码核心逻辑)
        this.unscheduleAllCallbacks();
    }

    // ===================== 核心业务方法 =====================
    /**
     * 定时器调度的刷新回调方法
     * 受控更新：只有开启状态时才执行金额刷新
     */
    updateJackpotMoneyScedule() {
        if (this._isActiveUpdate) {
            this.setAllCurrentJackpotMoney();
        }
    }

    /**
     * 设置单个标签的大奖金额文本
     * @param index 标签数组索引
     * @param money 要显示的金额数值
     */
    setJackpotMoney(index: number, money: number) {
        // 有效性校验，防止空指针报错
        if (TSUtility.isValid(this.jackpot_Label[index])) {
            // 金额数字千分位格式化显示
            this.jackpot_Label[index].string = CurrencyFormatHelper.formatNumber(money);
        }
    }

    /**
     * 遍历所有标签，刷新全部大奖的最新金额 (核心方法)
     * 包含：获取最新金额、金额渐变过渡、赋值文本、缓存上一帧金额
     */
    setAllCurrentJackpotMoney() {
        for (let i = 0; i < this.jackpot_Label.length; i++) {
            const targetLabel = this.jackpot_Label[i];
            if (targetLabel == null) continue;

            // 获取对应id的大奖数据
            const jackpotInfo = SlotJackpotManager.Instance().getThrillJackpotInfo(i + 1);
            if (jackpotInfo == null) {
                cc.log(`have not jdk info ${i + 1}`);
                return;
            }

            // 获取当前最新的大奖展示金额
            let currJackpotMoney = jackpotInfo.getJackpotForDisplay();
            // 调用全局工具类做金额数字的平滑渐变过渡
            currJackpotMoney = Utility.getDisplayJackpotMoney(this.prevJackpotMoney[i], currJackpotMoney);
            // 更新文本显示
            this.setJackpotMoney(i, currJackpotMoney);
            // 缓存当前金额为上一帧金额，用于下一帧渐变
            this.prevJackpotMoney[i] = Math.floor(currJackpotMoney);
        }
    }
}