import GameComponents_Base from "../../game/GameComponents_Base";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;


/**
 * 朱雀财富游戏组件管理类
 * 继承自基础GameComponents_Base，负责管理游戏各类核心组件、Jackpot符号ID、大数格式化等功能
 */
@ccclass()
export default class GameComponents_Zhuquefortune extends GameComponents_Base {
    // ===== 编辑器可配置组件节点（对应原JS的property定义，补充TS类型）=====
    /** 入口组件节点 */
    @property(cc.Node)
    public enteranceComponent: cc.Node = null;

    /** 奖池组件节点 */
    @property(cc.Node)
    public potComponent: cc.Node = null;

    /** UI组件节点 */
    @property(cc.Node)
    public uiComponent: cc.Node = null;

    /** 预期特效组件节点 */
    @property(cc.Node)
    public expectComponent: cc.Node = null;

    /** Jackpot模式根节点 */
    @property(cc.Node)
    public jackpotModeNode: cc.Node = null;

    /** 剩余次数显示节点 */
    @property(cc.Node)
    public remainCount: cc.Node = null;

    /** Jackpot模式启动弹窗节点 */
    @property(cc.Node)
    public jackpotModeStartPopup: cc.Node = null;

    /** 超级Jackpot模式启动弹窗节点 */
    @property(cc.Node)
    public superJackpotModeStartPopup: cc.Node = null;

    /** Jackpot结果弹窗节点 */
    @property(cc.Node)
    public jackpotResultPopup: cc.Node = null;

    /** 锁组件节点 */
    @property(cc.Node)
    public lockComponent: cc.Node = null;

    /** Lock&Roll剩余次数UI节点 */
    @property(cc.Node)
    public lockNRollRemainUI: cc.Node = null;

    /** Lock&Roll启动弹窗节点 */
    @property(cc.Node)
    public lockNRollStartPopup: cc.Node = null;

    /** Lock&Roll结果弹窗节点 */
    @property(cc.Node)
    public lockNRollResultPopup: cc.Node = null;

    /** Lock&Roll剩余次数节点 */
    @property(cc.Node)
    public lockNRoll_RemainCount: cc.Node = null;

    // ===== 私有业务成员（补充TS类型注解，保留原核心逻辑）=====
    /** Jackpot符号ID（默认90，根据子游戏密钥动态更新） */
    private _jackpotSymbolID: number = 90;

    // ===== 公共业务方法（实现朱雀专属组件管理逻辑）=====
    /**
     * 获取当前Jackpot符号ID
     * @returns 当前Jackpot符号ID数值
     */
    public getjackpotSymbolID(): number {
        return this._jackpotSymbolID;
    }

    /**
     * 根据下一个子游戏密钥设置Jackpot符号ID
     * 不同子游戏对应不同的Jackpot符号ID（91-95，默认90）
     */
    public setJackpotSymbolID(): void {
        // 获取下一个子游戏密钥，补充可选链避免单例为空报错
        const nextSubGameKey = SlotGameResultManager.Instance?.getNextSubGameKey() || "";

        // 根据子游戏密钥匹配对应的Jackpot符号ID
        this._jackpotSymbolID = nextSubGameKey === "lockNRoll_mini" ? 91
            : nextSubGameKey === "lockNRoll_minor" ? 92
            : nextSubGameKey === "lockNRoll_major" ? 93
            : nextSubGameKey === "lockNRoll_mega" ? 94
            : nextSubGameKey === "lockNRoll_grand" ? 95
            : 90;
    }

    /**
     * 大数格式化（带单位缩写：K/M/B/T），处理正负数值，保留1位小数（小于10时）
     * @param num 需要格式化的数值
     * @returns 格式化后的字符串（如：1.2K、5B、-3.7M）
     */
    public formatEllipsisNumber(num: number): string {
        // 1. 处理正负号和绝对值
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";
        // 提前声明格式化临时变量，修复原JS中变量l提前使用的问题
        let formattedNum: number = 0;

        // 2. 按数值量级分档处理
        if (absNum >= 1e12) { // 万亿级（T）
            formattedNum = absNum / 1e12;
            return this.formatNumberWithUnit(formattedNum, sign, "T");
        } else if (absNum >= 1e9) { // 十亿级（B）
            formattedNum = absNum / 1e9;
            return this.formatNumberWithUnit(formattedNum, sign, "B");
        } else if (absNum >= 1e6) { // 百万级（M）
            formattedNum = absNum / 1e6;
            return this.formatNumberWithUnit(formattedNum, sign, "M");
        } else if (absNum >= 1e3) { // 千级（K）
            formattedNum = absNum / 1e3;
            return this.formatNumberWithUnit(formattedNum, sign, "K");
        } else { // 普通数值（无单位）
            return `${sign}${Math.floor(absNum)}`;
        }
    }

    // ===== 私有辅助方法（抽离大数格式化公共逻辑，提升代码复用性）=====
    /**
     * 辅助方法：数值+单位格式化（统一处理小数和整数显示逻辑）
     * @param num 分档后的数值
     * @param sign 正负号字符串
     * @param unit 单位缩写（K/M/B/T）
     * @returns 带单位的格式化字符串
     */
    private formatNumberWithUnit(num: number, sign: string, unit: string): string {
        if (num >= 10) {
            // 数值大于等于10时，显示整数单位
            return `${sign}${Math.floor(num)}${unit}`;
        } else {
            // 数值小于10时，保留1位小数，去除末尾多余的0
            const fixedNum = Math.floor(10 * num) / 10;
            const displayNum = fixedNum % 1 === 0 ? Math.floor(fixedNum) : fixedNum.toFixed(1);
            return `${sign}${displayNum}${unit}`;
        }
    }
}