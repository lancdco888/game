import FeatureInfo_DragonOrbs from "./FeatureInfo_DragonOrbs";
import MovingOrbComponents_DragonOrbs from "./MovingOrbComponents_DragonOrbs";

const { ccclass, property } = cc._decorator;


/**
 * 龙珠游戏功能信息组件
 * 管理功能信息初始化/重置、移动球符号创建、Jackpot计数更新、倍数更新、特效播放/停止等核心逻辑
 */
@ccclass()
export default class FeatureComponents_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 功能信息组件数组（对应红/蓝/绿三种龙珠） */
    @property([FeatureInfo_DragonOrbs])
    public featureInfos: FeatureInfo_DragonOrbs[] = [];

    /** 移动球组件（创建/控制龙珠移动） */
    @property(MovingOrbComponents_DragonOrbs)
    public movingCompoenents: MovingOrbComponents_DragonOrbs | null = null;

    // ===================== 私有常量（与原JS一致） =====================
    /** Jackpot符号列表（96/94/92分别对应红/蓝/绿龙珠） */
    private _jackpotSymbolList: number[] = [96, 94, 92];

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 初始化所有功能信息组件
     */
    public setItem(): void {
        // 遍历初始化每个功能信息组件
        for (let i = 0; i < this.featureInfos.length; i++) {
            this.featureInfos[i].init();
        }
    }

    /**
     * 重置指定状态的功能信息组件
     * @param stateKey 状态标识（对应base/freeSpin_red/blue/green）
     */
    public reset(stateKey: string): void {
        // 遍历找到匹配状态的组件并重置
        for (let i = 0; i < this.featureInfos.length; i++) {
            if (stateKey === this.featureInfos[i].stateKey) {
                this.featureInfos[i].reset();
                break; // 找到后退出循环，避免无效遍历
            }
        }
    }

    /**
     * 创建移动球符号（委托给移动球组件）
     * @param startPos 起始位置
     * @param endPos 结束位置
     * @param symbolId 符号ID（对应_jackpotSymbolList中的值）
     */
    public movingOrbSymbol(startPos: any, endPos: any, symbolId: number): void {
        // 获取符号在Jackpot列表中的索引（红=0/蓝=1/绿=2）
        const orbIndex = this._jackpotSymbolList.indexOf(symbolId);
        // 创建球并绑定计数更新回调
        this.movingCompoenents?.createOrb(symbolId, startPos, endPos, orbIndex, this.updateCnt.bind(this));
    }

    /**
     * 免费旋转模式下更新计数
     * @param symbolId 符号ID
     */
    public updateCntInFreeSpin(symbolId: number): void {
        const orbIndex = this._jackpotSymbolList.indexOf(symbolId);
        // 索引有效时更新对应功能信息的免费旋转计数
        if (orbIndex >= 0 && orbIndex < this.featureInfos.length) {
            this.featureInfos[orbIndex].addCntInFreeSpin();
        }
    }

    /**
     * 更新基础模式下的计数
     * @param symbolId 符号ID
     */
    public updateCnt(symbolId: number): void {
        const orbIndex = this._jackpotSymbolList.indexOf(symbolId);
        // 索引有效时更新对应功能信息的基础计数
        if (orbIndex >= 0 && orbIndex < this.featureInfos.length) {
            this.featureInfos[orbIndex].addCnt();
        }
    }

    /**
     * 更新指定状态的倍数
     * @param stateKey 状态标识（对应base/freeSpin_red/blue/green）
     */
    public updateMultiplier(stateKey: string): void {
        // 遍历找到匹配状态的组件并增加倍数
        for (let i = 0; i < this.featureInfos.length; i++) {
            if (this.featureInfos[i].stateKey === stateKey) {
                this.featureInfos[i].addMultiplier();
                break; // 找到后退出循环
            }
        }
    }

    /**
     * 播放指定状态的特效（其他状态置灰）
     * @param stateKey 状态标识（对应base/freeSpin_red/blue/green）
     */
    public featureFxPlay(stateKey: string): void {
        // 遍历处理所有功能信息组件
        for (let i = 0; i < this.featureInfos.length; i++) {
            const info = this.featureInfos[i];
            if (info.stateKey === stateKey) {
                info.featureFxPlay(); // 匹配状态播放特效
            } else {
                info.setDim(true); // 非匹配状态置灰
            }
        }
    }

    /**
     * 停止所有功能信息组件的特效（取消置灰）
     */
    public featureFxStop(): void {
        // 遍历停止特效并取消置灰
        for (let i = 0; i < this.featureInfos.length; i++) {
            this.featureInfos[i].featureFxStop();
            this.featureInfos[i].setDim(false);
        }
    }
}