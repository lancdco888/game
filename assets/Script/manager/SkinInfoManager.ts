const { ccclass } = cc._decorator;
import TSUtility from "../global_utility/TSUtility";

/**
 * 时效皮肤信息数据类 - 与原JS完全一致
 */
export class PeriodSkinInfo {
    public startDate: number = 0;
    public endDate: number = 0;
    public key: string = "";
    public skinType: number = 0;
}

/**
 * 皮肤信息管理类 - 全局单例核心类
 */
@ccclass
export default class SkinInfoManager {
    private static _instance: SkinInfoManager = null;
    private _seasonalSkins: Array<PeriodSkinInfo> = [];

    // 全局单例获取方法 - 原逻辑1:1还原
    public static Instance(): SkinInfoManager {
        if (SkinInfoManager._instance == null) {
            SkinInfoManager._instance = new SkinInfoManager();
        }
        return SkinInfoManager._instance;
    }

    /**
     * 初始化时效皮肤管理器
     * @param skinList 皮肤配置数组
     */
    public initSeasonalSkinManager(skinList: Array<any>): void {
        if (TSUtility.isValid(skinList)) {
            this._seasonalSkins = [];
            for (let i = 0; i < skinList.length; i++) {
                const skinInfo = this.initSkinInfo(skinList[i]);
                this._seasonalSkins.push(skinInfo);
            }
            // 按皮肤开始时间 升序排序 - 保留原排序逻辑完全不变
            this._seasonalSkins.sort(function(a: PeriodSkinInfo, b: PeriodSkinInfo) {
                const startA = a.startDate;
                const startB = b.startDate;
                return startA < startB ? -1 : startA > startB ? 1 : 0;
            });
        }
    }

    /**
     * 初始化单个皮肤信息数据
     * @param data 皮肤原始数据
     * @returns PeriodSkinInfo 实例
     */
    public initSkinInfo(data: any): PeriodSkinInfo {
        const skinInfo = new PeriodSkinInfo();
        skinInfo.skinType = data.skinType;
        skinInfo.startDate = data.startDate;
        skinInfo.endDate = data.endDate;
        skinInfo.key = data.key;
        return skinInfo;
    }

    /**
     * 获取当前生效中的所有皮肤信息列表
     * (筛选 开始时间<=当前时间<=结束时间 的皮肤)
     */
    public getActiveSkinInfoList(): Array<PeriodSkinInfo> {
        const nowUnixTime = TSUtility.getServerBaseNowUnixTime();
        const activeSkinList: Array<PeriodSkinInfo> = [];
        for (let i = 0; i < this._seasonalSkins.length; i++) {
            const skinInfo = this._seasonalSkins[i];
            if (skinInfo.startDate <= nowUnixTime && skinInfo.endDate >= nowUnixTime) {
                activeSkinList.push(skinInfo);
            }
        }
        return activeSkinList;
    }
}