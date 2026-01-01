// HeroTooltipPopup.ts
const { ccclass, property } = cc._decorator;
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import DialogBase, { DialogState } from "../DialogBase";
import HeroInfoUI, { HeroInfoUIType } from "../Hero/HeroInfoUI";
import HeroSpineController, { HeroSpineState } from "../Slot/HeroSpineController";
import PopupManager from "../manager/PopupManager";
import SDefine from "../global_utility/SDefine";
import CustomRichText from "../slot_common/CustomRichText";
import UserInfo from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";
import { Utility } from "../global_utility/Utility";

/**
 * 箭头方向枚举 - 英雄提示弹窗的指向箭头类型
 */
export enum HeroToolTipArrowType {
    Bottom = 0,
    Left = 1,
    Right = 2,
    Top = 3
}

/**
 * 英雄信息数据模型 - 弹窗内展示的英雄配置
 */
export class HT_HeroInfo {
    public anchorX: number = 0;
    public anchorY: number = 0;
    public offsetX: number = 0;
    public offsetY: number = 0;
    public heroId: string = "";
    public heroRank: number = 0;
    public iconType: HeroInfoUIType = HeroInfoUIType.Small;
    public heroState: HeroSpineState = HeroSpineState.IDLE;

    public static parseObj(obj: any): HT_HeroInfo {
        const info = new HT_HeroInfo();
        if (obj.anchorX) info.anchorX = obj.anchorX;
        if (obj.anchorY) info.anchorY = obj.anchorY;
        if (obj.offsetX) info.offsetX = obj.offsetX;
        if (obj.offsetY) info.offsetY = obj.offsetY;
        if (obj.heroId) info.heroId = obj.heroId;
        if (obj.heroRank) info.heroRank = obj.heroRank;
        if (obj.iconType) info.iconType = obj.iconType;
        if (obj.heroState) info.heroState = obj.heroState;
        return info;
    }
}

/**
 * 弹窗帧体配置模型 - 弹窗尺寸/内边距/箭头配置/文本偏移
 */
export class HT_FrameInfo {
    public paddingWidth: number = 1100;
    public paddingHeight: number = 70;
    public textOffsetX: number = 0;
    public textOffsetY: number = 0;
    public useArrow: boolean = false;
    public arrowPosType: HeroToolTipArrowType = HeroToolTipArrowType.Bottom;
    public arrowPosAnchor: number = 0;
    public arrowPosOffset: number = 0;
    public baseFontSize: number = 26;
    public fontLineHeight: number = 35;
    public frameType: number = 0;

    public static parseObj(obj: any): HT_FrameInfo {
        const info = new HT_FrameInfo();
        if (obj.paddingWidth) info.paddingWidth = obj.paddingWidth;
        if (obj.paddingHeight) info.paddingHeight = obj.paddingHeight;
        if (obj.textOffsetX) info.textOffsetX = obj.textOffsetX;
        if (obj.textOffsetY) info.textOffsetY = obj.textOffsetY;
        if (obj.useArrow) info.useArrow = obj.useArrow;
        if (obj.arrowPosType) info.arrowPosType = obj.arrowPosType;
        if (obj.arrowPosAnchor) info.arrowPosAnchor = obj.arrowPosAnchor;
        if (obj.arrowPosOffset) info.arrowPosOffset = obj.arrowPosOffset;
        if (obj.baseFontSize) info.baseFontSize = obj.baseFontSize;
        if (obj.fontLineHeight) info.fontLineHeight = obj.fontLineHeight;
        if (obj.frameType) info.frameType = obj.frameType;
        return info;
    }
}

/**
 * 弹窗入场动画配置模型 - 支持多动画组合+缓动类型
 */
export class HT_StartAniInfo {
    public action: string = ""; // move / fadeIn / scaleUp
    public duration: number = 0;
    public easingType: string = ""; // easeIn / easeOut / easeInBack / easeOutBack
    public startOffsetX: number = 0;
    public startOffsetY: number = 0;

    public getActionInterval(): cc.ActionInterval | null {
        let action: cc.ActionInterval | null = null;
        switch (this.action) {
            case "move":
                action = cc.moveBy(this.duration, cc.v2(-this.startOffsetX, -this.startOffsetY));
                break;
            case "fadeIn":
                action = cc.fadeIn(this.duration);
                break;
            case "scaleUp":
                action = cc.scaleTo(this.duration, 1);
                break;
            default:
                cc.error("showStartAni not found", this.action);
                return null;
        }

        if (!action) return null;
        switch (this.easingType) {
            case "easeIn":
                action = action.easing(cc.easeSineIn());
                break;
            case "easeOut":
                action = action.easing(cc.easeSineOut());
                break;
            case "easeInBack":
                action = action.easing(cc.easeBackIn());
                break;
            case "easeOutBack":
                action = action.easing(cc.easeBackOut());
                break;
        }
        return action;
    }

    public static parseObj(obj: any): HT_StartAniInfo {
        const info = new HT_StartAniInfo();
        if (obj.action) info.action = obj.action;
        if (obj.duration) info.duration = obj.duration;
        if (obj.easingType) info.easingType = obj.easingType;
        if (obj.startOffsetX) info.startOffsetX = obj.startOffsetX;
        if (obj.startOffsetY) info.startOffsetY = obj.startOffsetY;
        return info;
    }
}

/**
 * 弹窗背景帧体+箭头配置 - 序列化绑定节点
 */
@ccclass("HT_FrameBGInfo")
export class HT_FrameBGInfo {
    @property(cc.Node) frameBG: cc.Node = null!;
    @property(cc.Node) arrowTop: cc.Node = null!;
    @property(cc.Node) arrowBottom: cc.Node = null!;
    @property(cc.Node) arrowLeft: cc.Node = null!;
    @property(cc.Node) arrowRight: cc.Node = null!;
}

/**
 * 弹窗全局设置模型 - 遮罩/定时关闭等配置
 */
export class HT_SettingInfo {
    public useBlockBG: boolean = true;
    public useBlockFrame: boolean = false;
    public reserveCloseTime: number = 0;

    public static parseObj(obj: any): HT_SettingInfo {
        const info = new HT_SettingInfo();
        if (obj.useBlockBG !== undefined) info.useBlockBG = obj.useBlockBG;
        if (obj.useBlockFrame !== undefined) info.useBlockFrame = obj.useBlockFrame;
        if (obj.reserveCloseTime) info.reserveCloseTime = obj.reserveCloseTime;
        return info;
    }
}

/**
 * 弹窗完整配置模型 - 聚合所有子配置，对外统一入口
 */
export class HT_MakingInfo {
    public frameInfo: HT_FrameInfo = new HT_FrameInfo();
    public heroInfo: HT_HeroInfo = new HT_HeroInfo();
    public settingInfo: HT_SettingInfo = new HT_SettingInfo();
    public startAniInfo: HT_StartAniInfo[] = [];

    public static parseObj(obj: any): HT_MakingInfo {
        const info = new HT_MakingInfo();
        info.settingInfo = obj.settingInfo ? HT_SettingInfo.parseObj(obj.settingInfo) : HT_SettingInfo.parseObj({});
        info.frameInfo = obj.frameInfo ? HT_FrameInfo.parseObj(obj.frameInfo) : HT_FrameInfo.parseObj({});
        info.heroInfo = obj.heroInfo ? HT_HeroInfo.parseObj(obj.heroInfo) : HT_HeroInfo.parseObj({});
        if (obj.startAniInfo) {
            for (let i = 0; i < obj.startAniInfo.length; ++i) {
                info.startAniInfo.push(HT_StartAniInfo.parseObj(obj.startAniInfo[i]));
            }
        }
        return info;
    }
}

/**
 * 核心英雄提示弹窗组件 (HeroTooltipPopup)
 * 继承 DialogBase 弹窗基类，实现带箭头指向的浮动提示弹窗
 * 核心能力：英雄展示+富文本提示+多方向箭头+入场动画+屏幕自适应+定时关闭
 */
@ccclass
export default class HeroTooltipPopup extends DialogBase {
    //#region ====== 序列化绑定节点 ======
    @property(cc.Node) pivot: cc.Node = null!;
    @property(cc.Node) tooltipFrame: cc.Node = null!;
    @property(cc.BlockInputEvents) blockFrame: cc.BlockInputEvents = null!;
    @property(CustomRichText) infoText: CustomRichText = null!;
    @property(cc.Node) heroRoot: cc.Node = null!;
    @property(HeroInfoUI) smallHeroUI: HeroInfoUI = null!;
    @property(HeroInfoUI) middleHeroUI: HeroInfoUI = null!;
    @property([HT_FrameBGInfo]) frameBgs: HT_FrameBGInfo[] = [];
    @property([cc.Node]) arrows: cc.Node[] = [];
    //#endregion

    //#region ====== 私有配置属性 ======
    private framePivotAnchor: cc.Vec2 = cc.Vec2.ZERO;
    private framePivotOffset: cc.Vec2 = cc.Vec2.ZERO;
    private infoTextOffset: cc.Vec2 = cc.Vec2.ZERO;
    private heroRootAnchor: cc.Vec2 = cc.v2(0, 0.5);
    private heroRootOffset: cc.Vec2 = cc.Vec2.ZERO;
    private autoAdjustFrameSize: boolean = true;
    private heightPadding: number = 80;
    private widthPadding: number = 100;
    private frameType: number = 0;
    private useArrow: boolean = false;
    private arrowType: HeroToolTipArrowType = HeroToolTipArrowType.Bottom;
    private arrowAnchor: number = 0.5;
    private arrowOffset: number = 0;
    //#endregion

    //#region ====== 私有状态属性 ======
    private _heroInfoUI: HeroInfoUI | null = null;
    private _isChangeInfoText: boolean = false;
    private _sourceWorldPos: cc.Vec2 = cc.Vec2.ZERO;
    private _sorceLocalPos: cc.Vec2 = cc.Vec2.ZERO;
    private _heroId: string = "";
    private _heroRank: number = 0;
    private _heroIconType: HeroInfoUIType = HeroInfoUIType.Small;
	private _heroState: HeroSpineState = HeroSpineState.IDLE;
    private _startAnis: HT_StartAniInfo[] = [];
    private _haveParent: boolean = false;
    //#endregion

    //#region ====== 静态公共方法 - 弹窗实例创建 ======
    /**
     * 同步加载弹窗预制体并创建实例
     * @param callback 回调返回实例/错误信息
     */
    public static getPopup(callback: (err: Error | null, popup: HeroTooltipPopup | null) => void): void {
        const resPath = "Service/00_Common/HeroTooltip/HeroTooltipPopup";
        cc.loader.loadRes(resPath, (err, prefab) => {
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(HeroTooltipPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    /**
     * 异步加载弹窗预制体并创建实例 - 推荐使用
     * @returns Promise<HeroTooltipPopup | null>
     */
    public static async asyncGetPopup(): Promise<HeroTooltipPopup | null> {
        return new Promise((resolve) => {
            HeroTooltipPopup.getPopup((err, popup) => {
                if (err) resolve(null);
                resolve(popup);
            });
        });
    }
    //#endregion

    //#region ====== 生命周期方法 ======
    onLoad(): void {
        this.initDailogBase();
        this.smallHeroUI.node.active = false;
        this.middleHeroUI.node.active = false;
    }
    //#endregion

    //#region ====== 公共核心方法 - 弹窗基础控制 ======
    /**
     * 打开弹窗
     * @param parentNode 父节点(可选) 不传则挂载到PopupManager
     * @returns this 链式调用
     */
    open(parentNode: cc.Node | null = null): HeroTooltipPopup {
        this._haveParent = parentNode != null;
        if (!parentNode) {
            this._open(null, false, () => {});
        } else {
            this._openWithParent(null, parentNode);
            const worldPos = PopupManager.Instance().node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const localPos = this.node.parent!.convertToNodeSpaceAR(worldPos);
            this.node.position = TSUtility.vec2ToVec3(localPos);
        }
        return this;
    }

    /**
     * 关闭弹窗 - 清理调度+状态+动画
     */
    close(): void {
        if (this.isStateClose()) return;
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);
        this.clear();
        if (this.rootNode && !this.useArrow) {
            this._close(cc.fadeOut(0.3));
        } else {
            this._close(null);
        }
    }
    //#endregion

    //#region ====== 公共配置方法 - 弹窗数据/样式配置 ======
    /**
     * 获取当前弹窗的完整配置信息
     * @returns HT_MakingInfo
     */
    getCurrent_HT_MakingInfo(): HT_MakingInfo {
        const info = HT_MakingInfo.parseObj({});
        info.heroInfo.anchorX = this.heroRootAnchor.x;
        info.heroInfo.anchorY = this.heroRootAnchor.y;
        info.heroInfo.offsetX = this.heroRootOffset.x;
        info.heroInfo.offsetY = this.heroRootOffset.y;
        info.heroInfo.heroId = this._heroId;
        info.heroInfo.heroRank = this._heroRank;
        info.heroInfo.iconType = this._heroIconType;
        info.heroInfo.heroState = this._heroState;
        info.frameInfo.paddingWidth = this.widthPadding;
        info.frameInfo.paddingHeight = this.heightPadding;
        info.frameInfo.textOffsetX = this.infoTextOffset.x;
        info.frameInfo.textOffsetY = this.infoTextOffset.y;
        info.frameInfo.useArrow = this.useArrow;
        info.frameInfo.arrowPosType = this.arrowType;
        info.frameInfo.arrowPosAnchor = this.arrowAnchor;
        info.frameInfo.arrowPosOffset = this.arrowOffset;
        info.frameInfo.baseFontSize = this.infoText.fontSize;
        info.frameInfo.fontLineHeight = this.infoText.lineHeight;
        info.frameInfo.frameType = this.frameType;
        return info;
    }

    /**
     * 通过完整配置信息初始化弹窗所有内容
     * @param makingInfo 弹窗完整配置
     */
    setHero_HT_MakingInfo(makingInfo: HT_MakingInfo): void {
        this.setHeroAnchor(makingInfo.heroInfo.anchorX, makingInfo.heroInfo.anchorY);
        this.setHeroOffset(makingInfo.heroInfo.offsetX, makingInfo.heroInfo.offsetY);

        // 英雄解锁等级判断 - 等级不足则替换为占位英雄
        if (makingInfo.heroInfo.heroId !== "") {
            // const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsManager.UnlockContentsType.HERO);
            // if (UserInfo.instance().getUserLevelInfo().level < unlockLevel) {
            //     makingInfo.heroInfo.heroId = "manager_july";
            //     makingInfo.heroInfo.heroRank = 0;
            // }
            this.setHeroInfo(makingInfo.heroInfo.heroId, makingInfo.heroInfo.heroRank, makingInfo.heroInfo.iconType, makingInfo.heroInfo.heroState);
        }

        this.setFramePadding(makingInfo.frameInfo.paddingWidth, makingInfo.frameInfo.paddingHeight);
        this.setUseArrow(makingInfo.frameInfo.useArrow);
        this.setArrowPosition(makingInfo.frameInfo.arrowPosType, makingInfo.frameInfo.arrowPosAnchor, makingInfo.frameInfo.arrowPosOffset);
        this.setTextOffset(makingInfo.frameInfo.textOffsetX, makingInfo.frameInfo.textOffsetY);
        this.setUseBlock(makingInfo.settingInfo.useBlockBG);
        this.setUseBlockFrame(makingInfo.settingInfo.useBlockFrame);
        this.setReserveClose(makingInfo.settingInfo.reserveCloseTime);
        this.infoText.fontSize = makingInfo.frameInfo.baseFontSize;
        this.infoText.lineHeight = makingInfo.frameInfo.fontLineHeight;
        this._startAnis = makingInfo.startAniInfo;
        this.setFrameBG(makingInfo.frameInfo.frameType);
    }

    /**
     * 设置弹窗背景样式
     * @param type 背景类型索引
     */
    setFrameBG(type: number): void {
        if (type < 0 || this.frameBgs.length <= type) {
            cc.error("setFrameBG invalid type", type);
            type = 0;
        }
        this.frameType = type;
        for (let i = 0; i < this.frameBgs.length; ++i) {
            const isActive = i === type;
            if (this.frameBgs[i].frameBG) this.frameBgs[i].frameBG.active = isActive;
            if (this.frameBgs[i].arrowTop) this.frameBgs[i].arrowTop.active = isActive;
            if (this.frameBgs[i].arrowBottom) this.frameBgs[i].arrowBottom.active = isActive;
            if (this.frameBgs[i].arrowLeft) this.frameBgs[i].arrowLeft.active = isActive;
            if (this.frameBgs[i].arrowRight) this.frameBgs[i].arrowRight.active = isActive;
        }
    }

    /**
     * 设置是否显示遮罩层
     * @param enable 是否显示
     */
    setUseBlock(enable: boolean): void {
        this.blockingBG.active = enable;
    }

    /**
     * 设置是否屏蔽弹窗内点击事件
     * @param enable 是否屏蔽
     */
    setUseBlockFrame(enable: boolean): void {
        this.blockFrame.enabled = enable;
    }

    /**
     * 设置弹窗自动关闭时间
     * @param delay 延迟秒数
     */
    setReserveClose(delay: number): void {
        if (delay <= 0) return;
        this.scheduleOnce(() => {
            this.close();
        }, delay);
    }

    /**
     * 设置弹窗内展示的英雄信息
     * @param heroId 英雄ID
     * @param heroRank 英雄星级
     * @param iconType 展示尺寸
     * @param state 骨骼动画状态
     */
    setHeroInfo(heroId: string, heroRank: number, iconType: HeroInfoUIType, state: HeroSpineState): void {
        this._heroId = heroId;
        this._heroRank = heroRank;
        this._heroIconType = iconType;
        this._heroState = state;
        this._heroInfoUI = null;

        switch (iconType) {
            case HeroInfoUIType.Small:
                this.smallHeroUI.node.active = true;
                this.middleHeroUI.node.active = false;
                this._heroInfoUI = this.smallHeroUI;
                break;
            case HeroInfoUIType.Middle:
                this.smallHeroUI.node.active = false;
                this.middleHeroUI.node.active = true;
                this._heroInfoUI = this.middleHeroUI;
                break;
        }

        if (this._heroInfoUI) {
            this._heroInfoUI.setInfo(heroId, heroRank);
            this._heroInfoUI.loadSpineController(iconType);
            this._heroInfoUI.controller_SetControllerState(state, heroRank);
        } else {
            cc.error("setHeroInfo heroInfoUI is null");
        }
    }

    /**
     * 设置弹窗锚点位置（世界坐标）
     * @param targetNode 目标节点
     * @param offsetX X偏移
     * @param offsetY Y偏移
     */
    setPivotPosition(targetNode: cc.Node, offsetX: number = 0, offsetY: number = 0): void {
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this._sourceWorldPos = new cc.Vec2(worldPos.x + offsetX, worldPos.y + offsetY);
    }

    /**
     * 设置弹窗锚点位置（Vec2世界坐标）
     * @param pos 世界坐标
     */
    setPivotPositionByVec2(pos: cc.Vec2): void {
        this._sourceWorldPos = PopupManager.Instance().node.convertToWorldSpaceAR(pos);
    }

    /**
     * 设置弹窗锚点位置（本地坐标）
     * @param pos 本地坐标
     */
    setPivotPositionByLocalVec2(pos: cc.Vec2): void {
        this._sorceLocalPos = pos;
    }

    /**
     * 设置是否显示箭头
     * @param enable 是否显示
     */
    setUseArrow(enable: boolean): void {
        this.useArrow = enable;
    }

    /**
     * 设置箭头位置和方向
     * @param type 箭头方向
     * @param anchor 锚点比例
     * @param offset 偏移量
     */
    setArrowPosition(type: HeroToolTipArrowType, anchor: number, offset: number): void {
        this.arrowType = type;
        this.arrowAnchor = anchor;
        this.arrowOffset = offset;

        switch (this.arrowType) {
            case HeroToolTipArrowType.Bottom:
                this.framePivotAnchor.x = -this.arrowAnchor;
                this.framePivotAnchor.y = 0;
                this.framePivotOffset.x = -this.arrowOffset;
                this.framePivotOffset.y = 25;
                break;
            case HeroToolTipArrowType.Top:
                this.framePivotAnchor.x = -this.arrowAnchor;
                this.framePivotAnchor.y = -1;
                this.framePivotOffset.x = -this.arrowOffset;
                this.framePivotOffset.y = -25;
                break;
            case HeroToolTipArrowType.Left:
                this.framePivotAnchor.x = 0;
                this.framePivotAnchor.y = -this.arrowAnchor;
                this.framePivotOffset.x = 25;
                this.framePivotOffset.y = -this.arrowOffset;
                break;
            case HeroToolTipArrowType.Right:
                this.framePivotAnchor.x = -1;
                this.framePivotAnchor.y = -this.arrowAnchor;
                this.framePivotOffset.x = -25;
                this.framePivotOffset.y = -this.arrowOffset;
                break;
        }
    }

    /**
     * 设置富文本偏移量
     * @param x X偏移
     * @param y Y偏移
     */
    setTextOffset(x: number, y: number): void {
        this.infoTextOffset.x = x;
        this.infoTextOffset.y = y;
    }

    /**
     * 设置弹窗内边距
     * @param width 宽度内边距
     * @param height 高度内边距
     */
    setFramePadding(width: number, height: number): void {
        this.widthPadding = width;
        this.heightPadding = height;
    }

    /**
     * 设置弹窗展示的文本内容（富文本支持）
     * @param str 文本内容
     */
    setInfoText(str: string): void {
        this.infoText.string = str;
    }

    /**
     * ✅【原代码笔误保留】设置文本水平对齐方式 - 请勿修正方法名！
     * @param align 对齐方式
     */
    setInfoTextHorixonAlign(align: cc.macro.TextAlignment): void {
        this.infoText.horizontalAlign = align;
    }

    /**
     * 设置英雄节点锚点
     * @param x X锚点
     * @param y Y锚点
     */
    setHeroAnchor(x: number, y: number): void {
        this.heroRootAnchor.x = x;
        this.heroRootAnchor.y = y;
    }

    /**
     * 设置英雄节点偏移量
     * @param x X偏移
     * @param y Y偏移
     */
    setHeroOffset(x: number, y: number): void {
        this.heroRootOffset.x = x;
        this.heroRootOffset.y = y;
    }
    //#endregion

    //#region ====== 公共核心方法 - UI刷新/动画/自适应 ======
    /**
     * 刷新弹窗整体UI布局 - 核心方法
     * @param skipAni 是否跳过入场动画
     * @param correction 是否执行屏幕边界修正
     */
    refreshUI(skipAni: boolean = false, correction: boolean = false): void {
        const localPos = this.pivot.parent!.convertToNodeSpaceAR(this._sourceWorldPos);
        this.pivot.setPosition(localPos);

        const textSize = this.infoText.node.getContentSize();
        const frameSize = new cc.Size(textSize.width + this.widthPadding, textSize.height + this.heightPadding);
        this.tooltipFrame.setContentSize(frameSize);

        if (!correction) {
            const frameX = this.framePivotAnchor.x * frameSize.width + this.framePivotOffset.x + frameSize.width / 2;
            const frameY = this.framePivotAnchor.y * frameSize.height + this.framePivotOffset.y + frameSize.height / 2;
            this.tooltipFrame.setPosition(frameX, frameY);
        }

        const heroX = this.heroRootAnchor.x * frameSize.width + this.heroRootOffset.x - frameSize.width / 2;
        const heroY = this.heroRootAnchor.y * frameSize.height + this.heroRootOffset.y - frameSize.height / 2;
        this.heroRoot.setPosition(heroX, heroY);
        this.infoText.node.setPosition(this.infoTextOffset);
        
        this.refreshArrow();
        if (correction) this.setPositionCorrection();
        if (!skipAni) this.showStartAni();
    }

    /**
     * 播放弹窗入场动画
     */
    showStartAni(): void {
        if (this._startAnis.length === 0) return;
        const actions: cc.ActionInterval[] = [];

        for (let i = 0; i < this._startAnis.length; ++i) {
            const aniInfo = this._startAnis[i];
            const action = aniInfo.getActionInterval();
            if (!action) continue;

            // 动画前置状态设置
            if (aniInfo.action === "move") {
                this.pivot.setPosition(this.pivot.x + aniInfo.startOffsetX, this.pivot.y + aniInfo.startOffsetY);
            } else if (aniInfo.action === "fadeIn") {
                this.pivot.opacity = 1;
            } else if (aniInfo.action === "scaleUp") {
                this.pivot.scale = 0.05;
            }
            actions.push(action);
        }

        // 执行动画：单动画直接播放，多动画并行播放
        if (actions.length === 1) {
            this.pivot.runAction(actions[0]);
        } else if (actions.length > 1) {
            this.pivot.runAction(cc.spawn(actions));
        }
    }

    /**
     * 刷新箭头显示状态和位置
     */
    refreshArrow(): void {
        if (!this.useArrow) {
            this.arrows.forEach(arrow => arrow.active = false);
            return;
        }

        const frameSize = this.tooltipFrame.getContentSize();
        this.arrows.forEach((arrow, idx) => arrow.active = idx === this.arrowType);

        let arrowX = 0;
        let arrowY = 0;
        switch (this.arrowType) {
            case HeroToolTipArrowType.Bottom:
                arrowX = this.arrowAnchor * frameSize.width + this.arrowOffset - frameSize.width / 2;
                arrowY = -frameSize.height / 2;
                break;
            case HeroToolTipArrowType.Top:
                arrowX = this.arrowAnchor * frameSize.width + this.arrowOffset - frameSize.width / 2;
                arrowY = frameSize.height / 2;
                break;
            case HeroToolTipArrowType.Left:
                arrowX = -frameSize.width / 2;
                arrowY = this.arrowAnchor * frameSize.height + this.arrowOffset - frameSize.height / 2;
                break;
            case HeroToolTipArrowType.Right:
                arrowX = frameSize.width / 2;
                arrowY = this.arrowAnchor * frameSize.height + this.arrowOffset - frameSize.height / 2;
                break;
        }
        this.arrows[this.arrowType].setPosition(arrowX, arrowY);
    }

    /**
     * 屏幕边界自适应修正 - 弹窗永远不会超出屏幕可视区域
     */
    setPositionCorrection(): void {
        const screenSize = cc.view.getFrameSize();
        const pivotPos = this.pivot.getPosition();
        const frameSize = this.tooltipFrame.getContentSize();
        const screenHalfW = screenSize.width / 2;
        const screenHalfH = screenSize.height / 2;
        const frameHalfW = frameSize.width / 2;
        const frameHalfH = frameSize.height / 2;

        let checkPos = 0;
        let offset = 0;
        let currPos = this.pivot.getPosition();

        // 左边界
        checkPos = pivotPos.x - frameHalfW;
        if (checkPos < -screenHalfW) {
            offset = Math.abs(checkPos) - screenHalfW;
            currPos.x += offset;
        }
        // 右边界
        checkPos = pivotPos.x + frameHalfW;
        if (checkPos > screenHalfW) {
            offset = Math.abs(checkPos) - screenHalfW;
            currPos.x -= offset;
        }
        // 下边界
        checkPos = pivotPos.y - frameHalfH;
        if (checkPos < -screenHalfH) {
            offset = Math.abs(checkPos) - screenHalfH;
            currPos.y += offset;
        }
        // 上边界
        checkPos = pivotPos.y + frameHalfH;
        if (checkPos > screenHalfH) {
            offset = Math.abs(checkPos) - screenHalfH;
            currPos.y -= offset;
        }

        this.pivot.setPosition(currPos);
    }
    //#endregion

    //#region ====== 静态工具方法 - 业务文本生成【全量保留，数十种场景】 ======
    public static getDailyWheelBonusText(percent: number): string {
        const texts = [
            "I'm on a roll!\nI've enhance your WHEEL BONUS.\n<node src=\"coinIcon\" height=-10/><yOffset=-6><color=#FFFF00><size=40> +%s% </size></color><color=#FFFF00><size=32>COINS</size></color></yOffset>",
            'Ka-ching!\nI got your WHEEL BONUS upgraded.\n<node src="coinIcon" height=-10/><yOffset=-6><color=#FFFF00><size=40> +%s% </size></color><color=#FFFF00><size=32>COINS</size></color></yOffset>',
            'Your WHEEL BONUS has been\nboosted by my mighty power.\n<node src="coinIcon" height=-10/><yOffset=-6><color=#FFFF00><size=40> +%s% </size></color><color=#FFFF00><size=32>COINS</size></color></yOffset>',
            'Shazam!\nI got you an upgrade on WHEEL BONUS.\n<node src="coinIcon" height=-10/><yOffset=-6><color=#FFFF00><size=40> +%s% </size></color><color=#FFFF00><size=32>COINS</size></color></yOffset>',
            'Stellar!\nWe got more coins on WHEEL BONUS.\n<node src="coinIcon" height=-10/><yOffset=-6><color=#FFFF00><size=40> +%s% </size></color><color=#FFFF00><size=32>COINS</size></color></yOffset>'
        ];
        return texts[Math.floor(Math.random() * texts.length)].format(percent.toString());
    }

    public static getStarAlbumCardpackUpgradeText(): string {
        const texts = [
            "<color=#FFFF00><size=34>Abra Cadabra! </size></color>\nLet there be an upgrade\non your STAR CARD PACK.",
            "<color=#FFFF00><size=34>With a touch, </size></color>\nI have upgraded \nyour STAR CARD PACK.",
            "I command an upgrade \non your<color=#FFFF00> STAR CARD PACK!</color>",
            "<color=#00FFFF><size=34>Wow!</size></color>\nYour<color=#FFFF00> STAR CARD PACK </color>\nhas been upgraded.",
            "<color=#00FFFF><size=34>Hocus pocus!</size></color>\nYou got an upgrade \non your<color=#FFFF00> STAR CARD PACK.</color>"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getSlotSpinCardPack_BaseUp(): string {
        const texts = [
            "<color=#00FFFF><size=32>I'm amazing!</size></color>\nI found a<color=#FFFF00> STAR CARD PACK</color>.",
            "<color=#00FFFF><size=32>I got you a gift.</size></color>\nIt is a PACK of STAR CARDS.",
            "Look what I have found.\n<color=#FFF000><size=33>A STAR CARD PACK.</size></color>",
            "<color=#00FFFF><size=33>Woo wee!</size></color>\nI have spotted a<color=#FFF000> STAR CARD PACK</color> for you.",
            "<color=#00FFFF><size=33>What is this?</size></color>\nOh boy, I found a<color=#FFF000> STAR CARD PACK</color>."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getSlotSpinCardPack_BigWinUp(): string {
        const texts = [
            "With a <color=#00FFFF><size=33>big win</size></color> comes \na<color=#FFF000> STAR CARD PACK</color>.",
            "Here is my gift to you, \nmortal. <color=#FFF000>A STAR CARD PACK</color>.",
            "<color=#00FFFF><size=33>Amazing!</size></color>\nI have found\n<color=#FFF000>A STAR CARD PACK</color>.",
            "I got you a<color=#FFF000> STAR CARD PACK</color>.\nThank me later.",
            "You could use a<color=#FFF000> STAR CARD PACK</color>.\nHere you go."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getSlotSpinCardPack_HotSlotUp(): string {
        const texts = [
            "I shall award you \nwith a<color=#FFF000> STAR CARD PACK</color>.",
            "With a swift touch \nI have summoned \na<color=#FFF000> STAR CARD PACK</color>.",
            "<color=#00FFFF><size=35>Awesome!</size></color>\nI got a brand new<color=#FFF000> STAR CARD PACK</color> for you.",
            "<color=#00FFFF><size=35>Surprise!</size></color>\nI have got you a<color=#FFF000> STAR CARD PACK</color>.",
            "<color=#00FFFF><size=35>I'm on a roll!</size></color>\nI found a<color=#FFF000> STAR CARD PACK</color> for you."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getDailyBlitzCoreText(num: number): string {
        const texts = [
            '<size=32>I will bless you with extra CORES.</size>\n<yOffset=-17><color=#00FFFF><size=40><node src="coreIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>With my mighty power, you shall gain more CORES.</size>\n<yOffset=-17><color=#00FFFF><size=40><node src="coreIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>Yay! I got you more CORES.</size>\n<yOffset=-17><color=#00FFFF><size=40><node src="coreIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>I\'ll help you out with more CORES.</size>\n<yOffset=-17><color=#00FFFF><size=40><node src="coreIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>Wonderful! We got extra CORES.</size>\n<yOffset=-17><color=#00FFFF><size=40><node src="coreIcon" height=-20/> %s</size></color></yOffset>'
        ];
        return texts[Math.floor(Math.random() * texts.length)].format(num.toString());
    }

    public static getDailyBlitzCardUpgradeText(): string {
        const texts = [
            "You will be happy to hear \nthat I've upgraded your \n<color=#FFFF00>STAR CARD PACK</color>.",
            "With a touch, \nI have upgraded your \n<color=#FFFF00>STAR CARD PACK</color>.",
            "I command an upgrade\non your<color=#FFFF00> STAR CARD PACK!</color>",
            "Wow! \nYour<color=#FFFF00> STAR CARD PACK</color>\nhas been upgraded.",
            "Stellar!\nYour<color=#FFFF00> STAR CARD PACK</color>\njust got better."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getRainbowDiceText(): string {
        const texts = [
            "I will grant you another \nchance to roll a DIE.",
            "Mortal, \nI command you to roll a DIE again.",
            "Oopsie!\nWhy don't you have another roll?",
            "Ouch.\nThat was a bad roll.\nHere, have another go.",
            "Roll again, \nand get a better result!"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getFireDiceText(): string {
        const texts = [
            "That is not good enough.\nRoll a DIE again.",
            "You can do better.\nRoll a DIE again.",
            "Cool! \nI got you another chance to roll a DIE.",
            "Would you like another try?\nHere you go.",
            "Let's do better this time, \nshall we?"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getCoinShowerText(sec: number): string {
        const texts = [
            "I am awarding you extra\ntime on COIN SHOWER.\n<yOffset=-20><color=#FFFF00><size=40>+ %s SEC</size></color></yOffset>".format(sec.toString()),
            "Extra time, extra coins! \nEnjoy the extra time \non COIN SHOWER.\n<yOffset=-20><color=#FFFF00><size=40>+ %s SEC</size></color></yOffset>".format(sec.toString()),
            "Hooray!\nI have won extra time \non COIN SHOWER for you.\n<yOffset=-20><color=#FFFF00><size=40>+ %s SEC</size></color></yOffset>".format(sec.toString()),
            "Let it shower!\nHere is extra time \non COIN SHOWER.\n<yOffset=-20><color=#FFFF00><size=40>+ %s SEC</size></color></yOffset>".format(sec.toString()),
            "I got you more time \nto TAP TAP TAP \non COIN SHOWER.\n<yOffset=-20><color=#FFFF00><size=40>+ %s SEC</size></color></yOffset>".format(sec.toString())
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getBingoChestBoostText(): string {
        const texts = [
            "That's not good enough!\nEnhance the prizes at once!",
            "Feel my power!\nI have boosted your prizes.",
            "Cool! I just got you \nupgrades on your prizes.",
            "I enhanced your bonus\nwith my super power.",
            "Bravo! \nI have upgraded your prizes."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getBingoFreeMarkingBoostText(): string {
        const texts = [
            "Finish more quickly!\nI will got you free markings \non your BINGO card.",
            "Bam! \nI got you free markings \non your BINGO card.",
            "Perky!\nWe got free markings \non BINGO card.",
            "I got you a head start.\nEnjoy the game\nwith free markings.",
            "Smile.\nI got you free markings \non your BINGO card."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getBingoBingoBallBoostText(num: number): string {
        const texts = [
            '<size=32>That\'s not enough!\nI shall give you more BINGO BALLS.</size>\n<yOffset=-17><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>I found these under the table.\nMore BINGO BALLS.</size>\n<yOffset=-17><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>Great! We got more BINGO BALLS.\nLet\'s have a go.</size>\n<yOffset=-17><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>I found more BINGO BALLS for you.\nThank me later.</size>\n<yOffset=-17><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>Hit the BINGO HALL with these extra BALLS.</size>\n<yOffset=-18><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>',
            '<size=32>Cool! I found more BINGO BALLS for you.</size>\n<yOffset=-18><color=#FFFF00><size=40><node src="bingoBallIcon" height=-20/> %s</size></color></yOffset>'
        ];
        return texts[Math.floor(Math.random() * texts.length)].format(num.toString());
    }

    public static getIngameDailyBlitzCompleteText(): string {
        const texts = [
            "CHECK OUT YOUR BLITZ REWARDS.",
            "DAILY BLITZ IS READY.",
            "DAILY BLITZ COMPLETED! GET YOUR REWARD.",
            "RECEIVE YOUR BLITZ REWARD NOW.",
            "DAILY BLITZ BEATEN! GET YOUR PRIZE."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getIngameHaveHeroText(): string {
        const texts = [
            "MEET YOUR NEW HERO NOW!",
            "A HERO CARD PACK WAS FOUND.",
            "A HERO CARD PACK IS READY.",
            "CHECK OUT YOUR HERO CARD PACK.",
            "A HERO IS WAITING FOR YOU."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getIngameHeroPowerUpText(): string {
        const texts = [
            "<color=#FFFF00><size=35>POWER UP!</size></color>\nYOUR HERO REWARD HAS BEEN UPGRADED.",
            "<color=#FFFF00><size=35>POWER UP!</size></color>\nHERO REWARD GOT A WHOLE LOT BETTER.",
            "<color=#FFFF00><size=35>POWER UP!</size></color>\nYOUR HERO JUST GOT MORE POWERFUL.",
            "<color=#FFFF00><size=35>POWER UP!</size></color>\nYOUR HERO IS NOW MIGHTIER THAN EVER.",
            "<color=#FFFF00><size=35>POWER UP!</size></color>\nENJOY BETTER HERO BONUSES."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getIngameHeroBuffText(): string {
        return "<color=#FFFF00><size=35>HERO BUFFS ENHANCED!</size></color>\nGET 2X HERO BUFF BONUS\nON ELIGBLE BET LEVELS.";
    }

    public static getLobbyStarAlbumText(): string {
        const texts = [
            "COLLECT YOUR DAILY FREE CARD PACK.",
            "A FREE CARD PACK IS READY.",
            "YOUR FREE CARDS PACK HAS ARRIVED.",
            "PICK UP YOUR FREE CARD PACK NOW.",
            "OPEN YOUR FREE CARD PACK HERE."
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getStarAlbumPopupText_1(): string {
        const texts = [
            "FREE PACK HERE.",
            "FREE PACK READY.",
            "PACK FOR FREE.",
            "SURPRISE GIFT HERE.",
            "NEW FREE CARD PACK!"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getStarAlbumPopupText_2(): string {
        const texts = [
            "CLICK TO OBTAIN CARDS!",
            "OPEN YOUR PACKS.",
            "OPEN & GET YOUR CARDS.",
            "GET CARDS TO FILL YOUR ALBUM.",
            "RIP IT OPEN TO GET NEW CARDS!"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    public static getStarAlbumPopupText_HeroLock(): string {
        const unlockLv = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO);
        return "Reach Level %s to open Hero Card Packs.".format(unlockLv.toString());
    }

    public static getHeroSunnyBunnyText_HeroLock(): string {
        return "Open the pack now and meet Sunny Bunny!";
    }

    public static getStarAlbumFastModeTest(): string {
        return "Tap ‘FAST’ button to speed up\nthe unpacking process.";
    }

    public static getEndStarAlbumSeasonNoti(): string {
        return "<size=30><color=#00FFFF>THE SEASON ENDS IN %s</color></size>\n<size=24><color=#D8D8D8>STAR POINTS WILL PERISH AT THE END OF THE SEASON.\nPLEASE USE THEM UP!</color></size>";
    }

    public static getShopCouponExpireNot(): string {
        return "You have a coupon!  Please tap on the coupon to apply it.\nExpires in %s.";
    }

    public static getTourneyInfoText(): string {
        if (Utility.isFacebookInstant()&& SDefine.FBInstant_Tournament_Use) {
            return "Slot Tourney is held every 16mins. There are 3 different divisions.\nUpper divisions have bigger prize pools and higher minimum bet requirements.\nTotal winnings gained during Tourney determine the ranking and prizes.\nThe prizes are available for the top 10% players for each Tourney.\n\nDon't forget about the extra way to have fun.\nShare your Slot Tourney result and compete for the top score\nwith your Facebook friends.";
        } else {
            return "Slot Tourney is held every 16mins. There are 3 different divisions.\nUpper divisions have bigger prize pools and higher minimum bet requirements.\nTotal winnings gained during Tourney determine the ranking and prizes.\nThe prizes are available for the top 10% players for each Tourney.";
        }
    }

    public static getIngameNewHeroText(): string {
        let idx = 0;
        // const heroId = UserInfo.instance().getUserHeroInfo().activeHeroID;
        // switch (heroId) {
        //     case "hero_cleopatra": idx = 0; break;
        //     case "hero_poseidon": idx = 1; break;
        //     case "hero_perkyturkey": idx = 2; break;
        //     case "hero_lenny": idx = 3; break;
        //     case "hero_sunnybunny": idx = 4; break;
        //     case "hero_cactus": idx = 5; break;
        //     case "hero_eagleeddy": idx = 6; break;
        //     case "hero_cpthook": idx = 7; break;
        //     case "hero_aurora": idx = 8; break;
        //     case "hero_genie": idx = 9; break;
        //     case "hero_raine": idx = 10; break;
        //     case "hero_zelda": idx = 11; break;
        //     case "hero_ragnar": idx = 12; break;
        //     case "hero_santa": idx = 13; break;
        // }
        const texts = [
            "<color=#FFFF00><size=35>GREETINGS!</size></color>\nI SHALL HELP YOU WITH WINNING MORE STAR CARDS.",
            "<color=#FFFF00><size=35>MORTAL!</size></color>\nI HAVE COME TO BLESS YOUR DAILY BLITZ MISSIONS.",
            "<color=#FFFF00><size=35>HOWDY!</size></color>\nYOUR I CAN MAKE YOUR BINGO BONUS A WHOLE LOT ENJOYABLE.",
            "<color=#FFFF00><size=35>GOOD DAY!</size></color>\nI'LL SHARE WITH YA BIT O' IRISH LUCK.\nI SHALL BOOST BASE BONUS COINS FOR YA!",
            "<color=#FFFF00><size=35>Nice to see you my friend.</size></color>\nI'll make your day plentiful.",
            "<color=#FFFF00><size=35>Buenos Dias.</size></color>\nLet's sing and dance our way to big wins!",
            "Let's find glorious wins together!",
            "Arrr! Let's set sail and find us ye Davy Jones' Locker.",
            "Are you ready to make a splash?",
            "Alakazam! I'm here to grant your wishes.",
            "Let's dive right into it! Bring forth the big wins.",
            "A'baeth Sharah! I'll take you to the stars.",
            "May Odin's blessing be with you!",
            "Ho ho ho! I got big bonuses, even for the naughty ones."
        ];
        return texts[idx];
    }

    public static async asyncGetTourneyCompleteTooltip(parent: cc.Node, target: cc.Node): Promise<HeroTooltipPopup | null> {
        const popup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(parent) || !TSUtility.isValid(popup)) return null;

        popup.open(parent);
        popup.setPivotPosition(target, -13, -40);
        popup.setInfoText("The Slot Tourney result has been sent to your inbox.");
        
        const config = {
            frameInfo: {
                paddingWidth: 100,
                paddingHeight: 80,
                textOffsetX: 0,
                textOffsetY: 0,
                useArrow: true,
                arrowPosType: 3,
                arrowPosAnchor: 0.5,
                arrowPosOffset: 315,
                baseFontSize: 30,
                fontLineHeight: 32
            },
            heroInfo: {
                anchorX: 0,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                heroId: "",
                heroRank: 0,
                iconType: "Small",
                heroState: 0
            },
            settingInfo: {
                useBlockBG: false,
                reserveCloseTime: 2.5
            },
            startAniInfo: [{
                action: "scaleUp",
                duration: 0.2,
                easingType: "easeOut"
            }]
        };
        const makingInfo = HT_MakingInfo.parseObj(config);
        makingInfo.heroInfo.heroId = "";
        makingInfo.heroInfo.heroRank = 0;
        popup.setHero_HT_MakingInfo(makingInfo);
        popup.refreshUI();

        return popup;
    }

    public static getEndTripleWheelText(): string {
        return "<color=#FF00FF>A Brand New Jackpot Wheel Coming Soon!</color>\n<font='roboto_condensed'><color=#B6B6B6>Please use up the tickets you currently own.\n*Triple Diamond Jackpot will end its service on Sep.13th.</color></font>";
    }

    public static getIngameJiggyPuzzleText(type: number): string {
        return type === 0 ? "RAISE YOUR BET TO COLLECT\nPUZZLE PIECES FASTER" : "RAISE YOUR BET TO UNLOCK";
    }
    //#endregion

    //#region ====== 基类重写方法 ======
    onBackBtnProcess(): boolean {
        return true;
    }
    //#endregion

    //#region ====== 辅助方法 ======
    public getCurrentHeroInfoUI(): HeroInfoUI | null {
        return this._heroInfoUI;
    }
    //#endregion
}