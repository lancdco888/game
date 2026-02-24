import GameComponents_Base from "../../game/GameComponents_Base";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏核心组件管理类
 * 继承自基础组件管理类，负责管理所有游戏核心组件节点，提供金额格式化工具方法
 */
@ccclass('GameComponents_BeeLovedJars')
export default class GameComponents_BeeLovedJars extends GameComponents_Base {
    // ===================== 游戏核心组件节点 =====================
    // 入场组件节点
    @property({
        type: cc.Node,
        displayName: "入场组件节点",
        tooltip: "游戏入场相关的UI/逻辑组件节点"
    })
    enteranceComponent: cc.Node | null = null;

    // 通用UI组件节点
    @property({
        type: cc.Node,
        displayName: "通用UI组件节点",
        tooltip: "游戏全局通用UI组件节点"
    })
    uiComponent: cc.Node | null = null;

    // 奖池组件节点
    @property({
        type: cc.Node,
        displayName: "奖池组件节点",
        tooltip: "Jackpot奖池金额显示/更新组件节点"
    })
    potComponent: cc.Node | null = null;

    // Jackpot胜利特效组件节点
    @property({
        type: cc.Node,
        displayName: "Jackpot胜利特效节点",
        tooltip: "中Jackpot时播放胜利特效的组件节点"
    })
    jackpotWinFxComponent: cc.Node | null = null;

    // Jackpot模式组件节点
    @property({
        type: cc.Node,
        displayName: "Jackpot模式组件节点",
        tooltip: "Jackpot模式控制逻辑组件节点"
    })
    jackpotModeComponent: cc.Node | null = null;

    // Lock&Roll模式超大奖弹窗节点
    @property({
        type: cc.Node,
        displayName: "LnR超大奖弹窗节点",
        tooltip: "Lock&Roll模式中Grande Jackpot的弹窗节点"
    })
    grandeJackpotPopup_LockNRoll: cc.Node | null = null;

    // 超大奖（Grande）弹窗节点
    @property({
        type: cc.Node,
        displayName: "超大奖弹窗节点",
        tooltip: "常规模式中Grande Jackpot的弹窗节点"
    })
    grandeJackpotPopup: cc.Node | null = null;

    // 大奖（Major）弹窗节点
    @property({
        type: cc.Node,
        displayName: "大奖弹窗节点",
        tooltip: "中Major Jackpot的弹窗节点"
    })
    majorJackpotPopup: cc.Node | null = null;

    // 中奖（Minor）弹窗节点
    @property({
        type: cc.Node,
        displayName: "中奖弹窗节点",
        tooltip: "中Minor Jackpot的弹窗节点"
    })
    minorJackpotPopup: cc.Node | null = null;

    // 小奖（Mini）弹窗节点
    @property({
        type: cc.Node,
        displayName: "小奖弹窗节点",
        tooltip: "中Mini Jackpot的弹窗节点"
    })
    miniJackpotPopup: cc.Node | null = null;

    // Jackpot显示特效节点
    @property({
        type: cc.Node,
        displayName: "Jackpot显示特效节点",
        tooltip: "Jackpot金额更新/展示的特效节点"
    })
    jackpotDisplayFx: cc.Node | null = null;

    // 免费旋转选择弹窗节点
    @property({
        type: cc.Node,
        displayName: "免费旋转选择弹窗节点",
        tooltip: "Free Spin模式选择奖励的弹窗节点"
    })
    freeSpinChoosePopup: cc.Node | null = null;

    // 免费旋转重触发弹窗节点
    @property({
        type: cc.Node,
        displayName: "免费旋转重触发弹窗节点",
        tooltip: "Free Spin重触发时的提示弹窗节点"
    })
    freeSpinRetriggerPopup: cc.Node | null = null;

    // 免费旋转重置弹窗节点（注：原代码拼写Reust，保留以兼容调用方）
    @property({
        type: cc.Node,
        displayName: "免费旋转重置弹窗节点",
        tooltip: "Free Spin重置时的提示弹窗节点"
    })
    freeSpinReustPopup: cc.Node | null = null;

    // 免费旋转顶部UI节点
    @property({
        type: cc.Node,
        displayName: "免费旋转顶部UI节点",
        tooltip: "Free Spin模式的顶部UI组件节点"
    })
    freeSpinTopUI: cc.Node | null = null;

    // Lock&Roll模式结果弹窗节点
    @property({
        type: cc.Node,
        displayName: "LnR结果弹窗节点",
        tooltip: "Lock&Roll模式结束时显示结果的弹窗节点"
    })
    lockNRollResultPopup: cc.Node | null = null;

    // Lock组件节点
    @property({
        type: cc.Node,
        displayName: "Lock组件节点",
        tooltip: "Lock&Roll模式核心控制组件节点"
    })
    lockComponent: cc.Node | null = null;

    // 剩余次数组件节点
    @property({
        type: cc.Node,
        displayName: "剩余次数组件节点",
        tooltip: "Lock&Roll模式剩余旋转次数显示组件节点"
    })
    remainCount: cc.Node | null = null;

    // Lock&Roll顶部UI节点
    @property({
        type: cc.Node,
        displayName: "LnR顶部UI节点",
        tooltip: "Lock&Roll模式的顶部UI组件节点"
    })
    lockNRollTopUI: cc.Node | null = null;

    // 免费旋转显示组件节点
    @property({
        type: cc.Node,
        displayName: "免费旋转显示节点",
        tooltip: "Free Spin模式的核心显示组件节点"
    })
    freeSpinDisplay: cc.Node | null = null;

    // Lock&Roll显示组件节点
    @property({
        type: cc.Node,
        displayName: "LnR显示节点",
        tooltip: "Lock&Roll模式的核心显示组件节点"
    })
    lockNRollDisplay: cc.Node | null = null;

    // 基础模式显示组件节点
    @property({
        type: cc.Node,
        displayName: "基础模式显示节点",
        tooltip: "常规基础游戏模式的显示组件节点"
    })
    baseDisplay: cc.Node | null = null;

    // 移动奖励组件节点
    @property({
        type: cc.Node,
        displayName: "移动奖励组件节点",
        tooltip: "奖励收集时的移动动画组件节点"
    })
    movePrizeComponent: cc.Node | null = null;

    // 特色奖励组件节点
    @property({
        type: cc.Node,
        displayName: "特色奖励组件节点",
        tooltip: "游戏特色奖励（Feature Prize）控制组件节点"
    })
    featurePrizeComponent: cc.Node | null = null;

    // 超大奖期望特效节点
    @property({
        type: cc.Node,
        displayName: "超大奖期望特效节点",
        tooltip: "接近中Grande Jackpot时的提示特效节点"
    })
    grandJackpotExpect: cc.Node | null = null;

    // 超大奖失败特效节点
    @property({
        type: cc.Node,
        displayName: "超大奖失败特效节点",
        tooltip: "未中Grande Jackpot时的提示特效节点"
    })
    grandJackpotFailed: cc.Node | null = null;

    /**
     * 金额格式化工具方法（带单位缩写：K/M/B/T，保留1位小数）
     * @param num 待格式化的金额数字
     * @returns 格式化后的金额字符串（如 1234 → 1.2K，1500000 → 1.5M）
     */
    formatEllipsisNumber(num: number): string {
        // 空值/非数字安全处理
        if (isNaN(num)) return "0";

        const absNum = Math.abs(num); // 取绝对值（处理正负）
        const sign = num < 0 ? "-" : ""; // 符号位

        /**
         * 内部格式化函数：处理数字和单位拼接
         * @param value 归一化后的数字（如 1234 → 1.234）
         * @param unit 单位（K/M/B/T）
         * @returns 拼接后的字符串
         */
        const formatUnit = (value: number, unit: string): string => {
            // 数字≥10时，直接取整（如 10.5K → 10K）
            if (value >= 10) {
                return `${sign}${Math.floor(value)}${unit}`;
            }

            // 数字<10时，保留1位小数（处理末尾0：如 1.0K → 1K，1.2K → 1.2K）
            const fixed1 = Math.floor(10 * value) / 10;
            const hasDecimal = (Math.floor(100 * value) % 10) !== 0; // 检查是否有第二位小数
            const displayNum = hasDecimal ? fixed1.toFixed(1) : Math.floor(fixed1);
            return `${sign}${displayNum}${unit}`;
        };

        // 按数值范围匹配单位
        if (absNum >= 1e12) { // 万亿（T）
            return formatUnit(absNum / 1e12, "T");
        } else if (absNum >= 1e9) { // 十亿（B）
            return formatUnit(absNum / 1e9, "B");
        } else if (absNum >= 1e6) { // 百万（M）
            return formatUnit(absNum / 1e6, "M");
        } else if (absNum >= 1e3) { // 千（K）
            return formatUnit(absNum / 1e3, "K");
        } else { // 小于1000，直接取整
            return `${sign}${Math.floor(absNum)}`;
        }
    }
}