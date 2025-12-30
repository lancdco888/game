import SlotGameRuleManager, { SlotWindows } from "./manager/SlotGameRuleManager";
const { ccclass } = cc._decorator;

/**
 * 子游戏配置数据类 (纯数据类，非节点组件，无需挂载到节点上)
 */
@ccclass
export default class SubGame {
    // ====================== 所有成员属性声明 + 原逻辑默认值 ======================
    public physicalReelStripsKey: string | null = null;
    public physicalReelStripsKeys: string[] | null = null;
    public reelStripsType: string | number | null = null;
    public maxGauge: number = 0;
    public entranceWindow: SlotWindows | null = null;
    public bet: boolean = false;
    public physicalReelWRCDefaultNo: number = 0;
    reelStripsKey: any;

    // ====================== 核心初始化方法 - 与原逻辑完全一致 ======================
    public init(config: any): void {
        // 初始化 物理卷轴条Key
        if (config.physicalReelStripsKey != null && config.physicalReelStripsKey != null) {
            this.physicalReelStripsKey = config.physicalReelStripsKey;
        } else {
            this.physicalReelStripsKey = null;
        }

        // 初始化 物理卷轴条Key数组 (非数组则转为数组)
        if (config.physicalReelStripsKeys != null && config.physicalReelStripsKeys != null) {
            this.physicalReelStripsKeys = Array.isArray(config.physicalReelStripsKeys) 
                ? config.physicalReelStripsKeys 
                : [config.physicalReelStripsKeys];
        } else {
            this.physicalReelStripsKeys = null;
        }

        // 初始化 卷轴条类型
        if (config.reelStripsType != null && config.reelStripsType != null) {
            this.reelStripsType = config.reelStripsType;
        } else {
            this.reelStripsType = null;
        }

        // 初始化 最大计量值
        if (config.maxGauge != null && config.maxGauge != null) {
            this.maxGauge = config.maxGauge;
        } else {
            this.maxGauge = 0;
        }

        // 初始化 进入窗口配置 (核心复杂逻辑 完全保留原写法)
        if (config.entranceWindow != null && config.entranceWindow != null) {
            const windowLenArr: number[] = [];
            for (let n = 0; n < config.entranceWindow.length; ++n) {
                windowLenArr.push(config.entranceWindow[n].length);
            }
            this.entranceWindow = new SlotWindows(windowLenArr);
            
            for (let n = 0; n < this.entranceWindow.size; ++n) {
                const windowItem = this.entranceWindow.GetWindow(n);
                for (let o = 0; o < windowItem.size; ++o) {
                    windowItem.setSymbol(o, config.entranceWindow[n][o]);
                }
            }
        } else {
            this.entranceWindow = null;
        }

        // 初始化 投注标识
        if (config.bet != null && config.bet != null) {
            this.bet = config.bet;
        } else {
            this.bet = false;
        }

        // 初始化 物理卷轴默认编号
        if (config.physicalReelWRCDefaultNo != null && config.physicalReelWRCDefaultNo != null) {
            this.physicalReelWRCDefaultNo = config.physicalReelWRCDefaultNo;
        } else {
            this.physicalReelWRCDefaultNo = 0;
        }
    }
}