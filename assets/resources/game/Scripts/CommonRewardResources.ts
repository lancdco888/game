const { ccclass, property } = cc._decorator;

import FireHoseSender, { FHLogType } from '../../../Script/FireHoseSender';
import UserInfo from '../../../Script/User/UserInfo';
import CommonSoundSetter from '../../../Script/global_utility/CommonSoundSetter';
import TSUtility from '../../../Script/global_utility/TSUtility';
import HeroManager from '../../../Script/manager/HeroManager';
import SoundManager from '../../../Script/manager/SoundManager';
import CommonRewardAction from './CommonRewardAction';
/** 奖励枚举模块（复用之前定义的枚举） */
import * as CommonRewardEnum from './CommonRewardEnum';
import { CommonRewardActionType } from './CommonRewardEnum';
import CommonRewardNodes from './CommonRewardNodes';


// 实际项目中请替换为真实导入路径
// import FireHoseSender from '../../../global_utility/Network/FireHoseSender';
// import SoundManager from '../../../slot_common/Script/SlotCommon/SoundManager';
// import UserInfo from '../../User/UserInfo';
// import CommonSoundSetter from '../../../global_utility/CommonSoundSetter';
// import HeroManager from '../../Utility/HeroManager';
// import TSUtility from '../../../global_utility/TSUtility';
// import CommonRewardAction from './Action/CommonRewardAction';
// import * as CommonRewardEnum from './CommonRewardEnum';
// import CommonRewardNodes from './CommonRewardNodes';

// ===================== 奖励资源管理组件 =====================
/**
 * 奖励系统-资源管理组件
 * 功能：加载奖励预制体、拼接奖励节点名称、管理奖励动作实例、播放奖励音效
 */
@ccclass()
export default class CommonRewardResources extends cc.Component {
    /** 奖励节点根节点（实例化的奖励预制体添加到该节点下） */
    @property({
        type: Node,
        displayName: '奖励根节点',
        tooltip: '所有奖励预制体实例化后添加到该节点'
    })
    public nodeRewardRoot: cc.Node = null;

    /** 移动根节点（奖励节点移动动画的根节点） */
    @property({
        type: Node,
        displayName: '移动根节点',
        tooltip: '奖励节点移动动画的父节点'
    })
    public nodeMoveRoot: cc.Node  = null;

    /** 奖励节点池管理实例 */
    @property({
        type: CommonRewardNodes,
        displayName: '奖励节点池',
        tooltip: '管理奖励节点的对象池实例'
    })
    public commonRewardNodes: CommonRewardNodes = null;

    /** 音效设置器（管理奖励相关音效） */
    @property({
        type: CommonSoundSetter,
        displayName: '音效设置器',
        tooltip: '提供奖励音效的AudioClip获取'
    })
    public soundSetter: CommonSoundSetter | null = null;

    // ===================== 核心异步方法 =====================
    /**
     * 批量获取奖励动作实例数组
     * @param actionInfoList 奖励动作信息列表
     * @param extraParam 额外参数
     * @returns 奖励动作组件实例数组
     */
    public async getRewardActionArray(actionInfoList: any[], extraParam: any): Promise<any[]> {
        const actionList: any[] = [];

        // 遍历所有动作信息，逐个获取奖励动作实例
        for (let i = 0; i < actionInfoList.length; i++) {
            const actionInfo = actionInfoList[i];
            const rewardAction = await this.getRewardAction(actionInfo, extraParam);
            
            if (TSUtility.isValid(rewardAction)) {
                actionList.push(rewardAction);
            }
        }

        return actionList;
    }

    /**
     * 获取单个奖励动作实例（加载预制体并初始化）
     * @param actionInfo 奖励动作信息
     * @param extraParam 额外参数
     * @returns 奖励动作组件实例（加载失败返回null）
     */
    public getRewardAction(actionInfo: any, extraParam: any): Promise<any> {
        return new Promise((resolve) => {
            // 空值保护：动作信息无效直接返回null
            if (!TSUtility.isValid(actionInfo)) {
                resolve(null);
                return;
            }

            // 获取奖励节点预制体名称
            const prefabName = this.getRewardNodeName(actionInfo);
            if (prefabName.length <= 0) {
                resolve(null);
                return;
            }

            // 加载奖励预制体资源
            cc.loader.loadRes(prefabName, (error: Error | null, prefab: cc.Prefab) => {
                // 加载失败：上报日志并返回null
                if (error) {
                    const errorMsg = new Error(`cc.loader.loadRes fail ${prefabName}: ${JSON.stringify(error)}`);
                    FireHoseSender.Instance().sendAws(
                        FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
                    );
                    resolve(null);
                    return;
                }

                // 加载成功：实例化预制体
                if (!prefab) {
                    resolve(null);
                    return;
                }

                const rewardNode = cc.instantiate(prefab);
                if (!rewardNode) {
                    resolve(null);
                    return;
                }

                // 获取奖励动作组件并初始化
                const rewardActionComp = rewardNode.getComponent(CommonRewardAction);
                if (TSUtility.isValid(rewardActionComp)) {
                    // 初始化奖励动作组件
                    rewardActionComp.initialize(actionInfo, this, extraParam);
                    
                    // 将节点添加到根节点，初始隐藏
                    if (this.nodeRewardRoot) {
                        this.nodeRewardRoot.addChild(rewardNode);
                        rewardNode.setPosition(0, 0);
                        rewardNode.active = false;
                    }

                    resolve(rewardActionComp);
                } else {
                    // 组件不存在：销毁节点并返回null
                    rewardNode.destroy();
                    resolve(null);
                }
            });
        });
    }

    // ===================== 核心工具方法 =====================
    /**
     * 拼接奖励节点预制体名称（核心逻辑，匹配原代码所有分支）
     * @param actionInfo 奖励动作信息
     * @returns 预制体名称（空字符串表示无效）
     */
    public getRewardNodeName(actionInfo: any): string {
        // 空值保护
        if (!TSUtility.isValid(actionInfo)) {
            return "";
        }

        // 基础预制体名称前缀
        let prefabName = "Service/00_Common/CommonRewardPopup/Reward/COMMONREWARD_";
        const actionType = actionInfo.getActionType();
        prefabName += actionType.toString();

        // 获取动作参数并处理不同类型的后缀
        const actionParam = actionInfo.getActionParam();
        if (TSUtility.isValid(actionParam)) {
            switch (actionType) {
                // 金币类型奖励
                case CommonRewardEnum.CommonRewardActionType.COIN:
                    let coinType = CommonRewardEnum.CommonRewardCoinType.NORMAL_4;
                    if (actionParam.imageType) {
                        coinType = actionParam.imageType;
                    }
                    prefabName += "_" + coinType.toString();
                    // 倍数≥2时添加_MULTIPLE后缀
                    if (actionParam.multiple && actionParam.multiple >= 2) {
                        prefabName += "_MULTIPLE";
                    }
                    break;

                // WonderBox类型奖励
                case CommonRewardEnum.CommonRewardActionType.WONDER_BOX:
                    if (actionParam.imageType) {
                        prefabName += "_" + actionParam.imageType.toString();
                    }
                    if (actionParam.rewardType) {
                        prefabName += "_" + actionParam.rewardType.toString();
                    }
                    break;

                // 礼品盒类型奖励
                case CommonRewardEnum.CommonRewardActionType.GIFT_BOX:
                    if (actionParam.imageType) {
                        prefabName += "_" + actionParam.imageType.toString();
                    }
                    break;

                // 卡包类型奖励
                case CommonRewardEnum.CommonRewardActionType.CARD_PACK:
                    let packCount = 0;
                    // 遍历pack_1到pack_5
                    for (let l = 1; l <= 5; l++) {
                        const pack = actionParam["pack_" + l];
                        if (TSUtility.isValid(pack) && pack.value.count > 0) {
                            packCount++;
                        }
                    }
                    prefabName += "_" + packCount;
                    break;

                // 英雄卡牌类型奖励
                case CommonRewardEnum.CommonRewardActionType.HERO_CARD:
                    if (actionParam.param) {
                        let heroKey = actionParam.param.name;
                        const rarity = actionParam.param.rarity;
                        const heroId = actionParam.param.id;

                        // 根据英雄ID获取英雄Key
                        if (TSUtility.isValid(heroId) && heroId > 0) {
                            heroKey = CommonRewardEnum.CommonRewardHeroInfo.getHeroName(heroId);
                        }

                        // // 获取用户英雄信息
                        // const userHeroInfo = UserInfo.instance().getUserHeroInfo();
                        // if (TSUtility.isValid(heroKey) && heroKey.length > 0 && TSUtility.isValid(userHeroInfo)) {
                        //     if (!userHeroInfo.hasHero(heroKey)) {
                        //         // 新英雄
                        //         prefabName += "_NEW";
                        //     } else {
                        //         // 已有英雄：判断是否升级
                        //         const heroInfo = userHeroInfo.getHeroInfo(heroKey);
                        //         const currentRank = heroInfo.rank;
                        //         const heroConfig = HeroManager.Instance().getHeroConfig(heroKey);
                        //         const newForce = heroInfo.force + rarity;
                        //         const newRank = heroConfig.getHeroLevel(newForce);

                        //         // 升级/战力提升后缀
                        //         prefabName += currentRank !== newRank ? "_RANK_UP" : "_FORCE_CHARGE";
                        //     }
                        // }
                    }
                    break;

                // 英雄类型奖励
                case CommonRewardEnum.CommonRewardActionType.HERO:
                    if (actionParam.param) {
                        prefabName += "_" + actionParam.param.type.toString();
                    }
                    break;

                // 随机Joker类型奖励
                case CommonRewardEnum.CommonRewardActionType.RANDOM_JOKER:
                    if (actionParam.param && actionParam.param.result) {
                        prefabName += "_RESULT";
                    }
                    break;
            }
        }

        // 特殊类型：跳过子标题/按钮后缀
        if (this.isExceptActionType(actionType)) {
            return prefabName;
        }

        // 添加子标题后缀
        const titleInfo = actionInfo.getTitleInfo();
        if (TSUtility.isValid(titleInfo) && titleInfo.getSubTitle()[0] !== CommonRewardEnum.CommonRewardSubTitleType.NONE) {
            prefabName += "_SUB";
        }

        // 添加按钮激活后缀
        if (actionInfo.getButtonActive()) {
            prefabName += "_BTN";
        }

        return prefabName;
    }

    /**
     * 判断是否为例外动作类型（无需添加子标题/按钮后缀）
     * @param actionType 奖励动作类型
     * @returns true=例外类型，false=非例外类型
     */
    public isExceptActionType(actionType: CommonRewardActionType): boolean {
        return actionType === CommonRewardEnum.CommonRewardActionType.HERO;
    }

    // ===================== 音效与辅助方法 =====================
    /**
     * 播放一次奖励音效
     * @param soundKey 音效Key
     */
    public playOnceSound(soundKey: string): void {
        if (this.soundSetter && TSUtility.isValid(this.soundSetter)) {
            const audioClip = this.soundSetter.getAudioClip(soundKey);
            SoundManager.Instance().playFxOnce(audioClip, 0, 1);
        }
    }

    /**
     * 获取奖励节点池实例
     * @returns 节点池实例
     */
    public getNodePool(): CommonRewardNodes | null {
        return this.commonRewardNodes;
    }

    /**
     * 获取移动根节点
     * @returns 移动根节点
     */
    public getMoveRoot(): cc.Node | null {
        return this.nodeMoveRoot;
    }
}