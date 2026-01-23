import ChangeNumberComponent from "../../../Script/Slot/ChangeNumberComponent";
import SlotReelSpinStateManager from "../../../Script/Slot/SlotReelSpinStateManager";
import State from "../../../Script/Slot/State";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import LangLocaleManager from "../../../Script/manager/LangLocaleManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";

const { ccclass, property } = cc._decorator; // 沿用指定的装饰器导出方式
/**
 * 底部UI文本类型枚举
 * 对应不同场景的底部提示文本
 */
export enum BottomTextType {
    EnterGame = 0,                  // 进入游戏
    SpinReel = 1,                   // 旋转滚轮
    TriggerScatter = 2,             // 触发散射
    IncreaseWinMoneyDefault = 3,    // 默认增加胜利金额
    IncreaseWinMoneyFreespin = 4,   // 免费旋转增加胜利金额
    CustomData = 5,                 // 自定义数据
    BetMultiplier = 6,              // 投注乘数
    TriggerBonus = 7                // 触发奖金游戏
}

/**
 * 底部UI文本管理组件（BottomUIText）
 * 负责底部所有文本/金额的显示、格式化、动画、多语言、分辨率适配等
 */
@ccclass()
export default class BottomUIText extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Node)
    public rootTextInfo: cc.Node = null; // 底部文本根节点（用于缩放适配）

    @property(cc.Label)
    public totalBetMoney: cc.Label = null; // 总投注金额标签

    @property(cc.Node)
    public totalBetCaption: cc.Node = null; // 总投注标题节点

    @property(cc.Node)
    public averagebetNode: cc.Node = null; // 平均投注节点

    @property(cc.Label)
    public totalMoney: cc.Label = null; // 总金币标签

    @property(cc.Label)
    public winMoney: cc.Label = null; // 胜利金额标签

    @property(cc.Label)
    public winText: cc.Label = null; // 胜利文本标签（如WELCOME/GOOD LUCK）

    @property(cc.Label)
    public linePays: cc.Label = null; // 线路奖金标签

    @property(cc.Node)
    public winCaption: cc.Node = null; // 胜利标题节点

    @property(cc.Node)
    public winEffect: cc.Node = null; // 胜利特效节点

    @property(cc.Label)
    public bottomTextInfo: cc.Label = null; // 底部信息文本标签

    @property()
    public useEllipsisTotalBet: boolean = false; // 是否使用省略格式显示总投注

    @property(cc.Sprite)
    public winImg: cc.Sprite = null; // 胜利图标

    @property()
    public winMoneyUseCenter: boolean = false; // 胜利金额是否居中显示

    @property(cc.Node)
    public coinTargetBigWinEffectInFreespin: cc.Node | null = null; // 免费旋转大胜利金币特效目标

    @property(cc.Node)
    public winDisplayAni_1: cc.Node = null; // 胜利显示动画1

    @property(cc.Node)
    public winDisplayAni_2: cc.Node = null; // 胜利显示动画2

    @property(cc.Animation)
    public coinEffectOfWinCoinArea: cc.Animation = null; // 胜利区域金币特效动画

    @property
    public isControlWinMoneyLabelPosition: boolean = true; // 是否控制胜利金额标签位置

    // ================= 私有配置属性 =================
    private defaultRootPosY: number = -240; // 根节点默认Y坐标
    private defaultFontSizeBottomTextInfo: number = 0; // 底部信息文本默认字体大小
    private originalWinMoneyPos: cc.Vec2 | null = null; // 胜利金额标签原始位置
    private bottomUiInterface: any = null; // 底部UI接口（外部传入）
    private supportVideoFrame: boolean = false; // 是否支持视频帧适配
    private onSetMyMoneyCallback: ((label: cc.Label) => void) | null = null; // 设置总金币回调
    private onSetTotalBetMoneyCallback: ((label: cc.Label) => void) | null = null; // 设置总投注回调

    // ================= 生命周期函数 =================
    onLoad() {
        // 保存胜利金额标签原始位置 + 底部信息文本默认字体大小
        if (this.winMoney) {
            this.originalWinMoneyPos = this.winMoney.node.getPosition().clone();
        }
        if (this.bottomTextInfo) {
            this.defaultFontSizeBottomTextInfo = this.bottomTextInfo.fontSize;
        }
    }

    onDestroy() {
        // 调用底部UI接口的销毁回调
        if (this.bottomUiInterface) {
            this.bottomUiInterface.onDestroy_BottomUIText(this);
        }
    }

    // ================= 初始化 =================
    /**
     * 初始化UI
     * @param interfaceObj 底部UI接口对象
     */
    public initUI(interfaceObj: any): void {
        this.bottomUiInterface = interfaceObj;
        this.bottomUiInterface.onInitUI_BottomUIText(this);

        // 绑定金额变化事件
        this.node.on("changeMoneyState", this.setMoneyState.bind(this));
        // 注册游戏规则观察者
        SlotGameRuleManager.Instance.addObserver(this.node);

        // 初始化显示值
        this.setMyMoney();
        this.setTotalBetMoney();
        if (this.winMoney) {
            this.winMoney.string = CurrencyFormatHelper.formatNumber(0);
        }
        this.setWinText("WELCOME");
        this.showWinEffect(false);

        // 非正式服时，绑定总投注/平均投注节点的作弊面板触发事件
        if (this.totalBetMoney && !TSUtility.isLiveService()) {
            this.totalBetMoney.node.on(cc.Node.EventType.TOUCH_END, () => {
                SlotManager.Instance.toggleCheatObject();
            }, this);
            if (this.averagebetNode) {
                this.averagebetNode.on(cc.Node.EventType.TOUCH_END, () => {
                    SlotManager.Instance.toggleCheatObject();
                }, this);
            }
        }

        // 初始化金币特效状态
        if (this.coinEffectOfWinCoinArea) {
            this.coinEffectOfWinCoinArea.stop();
            this.coinEffectOfWinCoinArea.node.active = false;
        }
    }

    // ================= 核心获取方法 =================
    /**
     * 获取大胜利金币特效目标节点（免费旋转场景）
     * @returns 目标节点
     */
    public getCoinTargetBigWinEffectInFreespin(): cc.Node | null {
        return this.coinTargetBigWinEffectInFreespin;
    }

    /**
     * 获取胜利金额标签
     * @returns 胜利金额Label
     */
    public getWinMoneyLabel(): cc.Label | null {
        return this.winMoney;
    }

    // ================= 回调设置 =================
    /**
     * 设置总金币更新回调
     * @param callback 回调函数
     */
    public setOnSetMyMoney(callback: ((label: cc.Label) => void) | null): void {
        this.onSetMyMoneyCallback = callback;
    }

    /**
     * 设置总投注金额更新回调
     * @param callback 回调函数
     */
    public setOnSetTotalBetMoney(callback: ((label: cc.Label) => void) | null): void {
        this.onSetTotalBetMoneyCallback = callback;
    }

    // ================= 金额显示 =================
    /**
     * 设置总金币显示
     */
    public setMyMoney(): void {
        if (!this.onSetMyMoneyCallback) {
            const userMoney = SlotManager.Instance.userInfoInterface.getUserMoney();
            if (this.totalMoney) {
                this.totalMoney.string = CurrencyFormatHelper.formatNumber(userMoney);
                // 根据金额大小调整字体
                this.totalMoney.fontSize = userMoney < 1e12 ? 35 : (userMoney < 1e14 ? 32 : 29);
            }
        } else {
            this.onSetMyMoneyCallback(this.totalMoney!);
        }
    }

    /**
     * 设置总投注金额显示
     */
    public setTotalBetMoney(): void {
        if (!this.onSetTotalBetMoneyCallback) {
            const maxBetLine = SlotGameRuleManager.Instance._maxBetLine;
            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLineApplyFeatureTotalBetRate100();
            const totalBet = maxBetLine * currentBetPerLine;

            if (this.totalBetMoney) {
                if (this.useEllipsisTotalBet) {
                    this.totalBetMoney.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet);
                } else {
                    this.totalBetMoney.string = CurrencyFormatHelper.formatNumber(totalBet);
                }
            }
        } else {
            this.onSetTotalBetMoneyCallback(this.totalBetMoney!);
        }
    }

    /**
     * 更新金额状态（总金币+总投注）
     */
    public setMoneyState(): void {
        this.setMyMoney();
        this.setTotalBetMoney();
    }

    // ================= 胜利特效控制 =================
    /**
     * 显示/隐藏胜利特效
     * @param show 是否显示
     * @param aniType 动画类型（0:动画1，1:动画2）
     */
    public showWinEffect(show: boolean, aniType: number = 0): void {
        if (!this.winEffect) return;

        this.winEffect.active = show;
        if (show) {
            // 显示对应动画
            this.winDisplayAni_1!.active = aniType === 0;
            if (this.winDisplayAni_1!.active) {
                this.winDisplayAni_1!.getComponent(cc.Animation)!.play();
            }

            this.winDisplayAni_2!.active = aniType === 1;
            if (this.winDisplayAni_2!.active) {
                this.winDisplayAni_2!.getComponent(cc.Animation)!.play();
            }
        } else {
            // 隐藏所有动画并停止播放
            this.winDisplayAni_1!.active = false;
            this.winDisplayAni_2!.active = false;
            this.winDisplayAni_1!.getComponent(cc.Animation)!.stop();
            this.winDisplayAni_2!.getComponent(cc.Animation)!.stop();
        }
    }

    // ================= 胜利金额/文本控制 =================
    /**
     * 获取胜利金额文本更新状态
     * @param winMoney 胜利金额
     * @param lineText 线路文本
     * @returns State对象
     */
    public getChangeWinMoneyTextState(winMoney: number, lineText?: string): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.setWinMoney(winMoney, lineText);
            // 支持视频帧时，设置多语言文本
            if (this.supportVideoFrame && lineText) {
                // const localizedText = LangLocaleManager.getInstance().getLocalizedText(lineText);
                // this.setBottomTextInfo(BottomTextType.CustomData, localizedText.text);
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 获取清空胜利金额文本状态
     * @returns State对象
     */
    public getClearWinMoneyTextState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (this.winMoney) {
                this.winMoney.string = "";
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 设置胜利金额显示
     * @param winMoney 胜利金额
     * @param lineText 线路文本
     */
    public setWinMoney(winMoney: number, lineText: string = ""): void {
        if (!this.winMoneyUseCenter) {
            this._activateWinNumber(true);
            this._activateWinText(false);
            lineText = lineText || "";

            if (this.winMoney) {
                this.winMoney.string = CurrencyFormatHelper.formatNumber(winMoney);
            }
            if (this.linePays) {
                this.linePays.string = lineText;
            }
        } else {
            this.setWinMoneyWithCenter(winMoney, lineText);
        }
    }

    /**
     * 居中显示胜利金额
     * @param winMoney 胜利金额
     * @param lineText 线路文本
     */
    public setWinMoneyWithCenter(winMoney: number, lineText: string = ""): void {
        this._activateWinNumber(true);

        // 控制胜利文本显隐
        if (this.isControlWinMoneyLabelPosition) {
            this._activateWinText(false);
        } else {
            this._activateWinText(!(lineText == null || lineText === ""), true);
        }

        // 处理线路文本为空的情况
        if (lineText == null || lineText === "") {
            this.winMoney!.node.setPosition(new cc.Vec2(this.originalWinMoneyPos!.x, this.originalWinMoneyPos!.y));
            lineText = "";
            this.linePays!.node.active = false;
        } else {
            // 调整胜利金额标签位置
            const posY = this.isControlWinMoneyLabelPosition 
                ? this.originalWinMoneyPos!.y + 5 
                : this.originalWinMoneyPos!.y;
            this.winMoney!.node.setPosition(new cc.Vec2(this.originalWinMoneyPos!.x, posY));
            this.linePays!.node.active = true;
        }

        // 设置金额和文本
        if (this.winMoney) {
            this.winMoney.string = CurrencyFormatHelper.formatNumber(winMoney);
        }
        if (this.linePays) {
            this.linePays.string = lineText;
        }
    }

    /**
     * 设置胜利文本（如WELCOME/GOOD LUCK）
     * @param text 文本内容
     */
    public setWinText(text: string): void {
        if (this.winText) {
            this._activateWinNumber(false);
            this._activateWinText(true);
            this.winText.string = text;
        } else if (this.supportVideoFrame && this.bottomTextInfo) {
            this.bottomTextInfo.string = text;
        }
    }

    /**
     * 激活胜利文本显示
     */
    public setActivateWinText(): void {
        if (this.winText) {
            this.winText.node.active = true;
            if (this.winMoney) {
                this.winMoney.node.active = false;
            }
        } else {
            console.log("BottomUIText.setActivateWinText: this.winText is null. check property!!!!");
        }
    }

    // ================= 辅助显隐控制 =================
    /**
     * 激活/隐藏胜利文本
     * @param active 是否激活
     * @param isLinePay  是否为线路奖金文本
     */
    private _activateWinText(active: boolean, isLinePay: boolean = false): void {
        if (this.winText) {
            this.winText.node.active = active;
        }
        if (this.winCaption) {
            this.winCaption.active = !isLinePay && !active;
        }
    }

    /**
     * 激活/隐藏胜利金额相关元素
     * @param active 是否激活
     */
    private _activateWinNumber(active: boolean): void {
        if (this.winMoney) {
            this.winMoney.node.active = active;
        }
        if (this.linePays) {
            this.linePays.node.active = active;
        }
        if (this.winImg) {
            this.winImg.node.active = active;
        }
    }

    // ================= 底部信息文本控制 =================
    /**
     * 设置是否支持视频帧适配
     * @param support 是否支持
     */
    public setSupportVideoFrame(support: boolean): void {
        console.log("setSupportVideoFrame", support);
        this.supportVideoFrame = support;
    }

    /**
     * 设置总投注省略格式显示
     * @param useEllipsis 是否使用省略格式
     */
    public setFlagForEllipsisTotalBet(useEllipsis: boolean): void {
        this.useEllipsisTotalBet = useEllipsis;
        this.setTotalBetMoney();
    }

    /**
     * 获取底部信息文本更新状态
     * @param type 文本类型
     * @param text 文本内容
     * @returns State对象
     */
    public getBottomInfoState(type: BottomTextType, text?: string): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.setBottomTextInfo(type, text);
            state.setDone();
        });
        return state;
    }

    /**
     * 设置底部信息文本（多语言+场景适配）
     * @param type 文本类型
     * @param text 自定义文本（仅CustomData类型生效）
     */
    public setBottomTextInfo(type: BottomTextType, text?: string): void {
        if (!this.bottomTextInfo) return;

        let displayText = "";
        const langManager = LangLocaleManager.getInstance();

        switch (type) {
            case BottomTextType.EnterGame:
                // 随机显示欢迎语/线路数
                const randomIdx = Math.floor(2 * Math.random());
                const paylinesType = SlotGameRuleManager.Instance.getPaylines().type;

                if (paylinesType === "allway" || paylinesType === "allway2") {
                    if (randomIdx === 0) {
                        const allWaysText = langManager.getLocalizedText("ALL WAYS");
                        displayText = allWaysText.text;
                    } else {
                        const welcomeText = langManager.getLocalizedText("Welcome to ${0}");
                        displayText = TSUtility.strFormat(welcomeText.text, SlotGameRuleManager.Instance.slotName);
                    }
                } else {
                    if (randomIdx === 0) {
                        const lineText = SlotGameRuleManager.Instance.getPaylines().paylines.length > 1 ? " LINES" : " LINE";
                        const playingText = langManager.getLocalizedText("PLAYING ${0}" + lineText);
                        displayText = TSUtility.strFormat(playingText.text, SlotGameRuleManager.Instance.getPaylines().paylines.length);
                    } else {
                        const welcomeText = langManager.getLocalizedText("Welcome to ${0}");
                        displayText = TSUtility.strFormat(welcomeText.text, SlotGameRuleManager.Instance.slotName);
                    }
                }
                break;

            case BottomTextType.SpinReel:
                if (SlotReelSpinStateManager.Instance.getFreespinMode()) {
                    const totalWinText = langManager.getLocalizedText("TOTAL WIN");
                    displayText = totalWinText.text;
                } else {
                    const randomIdx = Math.floor(2 * Math.random());
                    if (randomIdx === 0) {
                        const goodLuckText = langManager.getLocalizedText("GOOD LUCK");
                        displayText = goodLuckText.text;
                    } else {
                        const currentBet = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                        const betMultiText = langManager.getLocalizedText("Bet Multiplier ${0}");
                        displayText = TSUtility.strFormat(betMultiText.text, CurrencyFormatHelper.formatNumber(currentBet));
                    }
                }
                break;

            case BottomTextType.TriggerScatter:
                const scatterText = langManager.getLocalizedText("FREE SPINS TRIGGERED");
                displayText = scatterText.text;
                break;

            case BottomTextType.TriggerBonus:
                const bonusText = langManager.getLocalizedText("BONUS GAME ACTIVATED");
                displayText = bonusText.text;
                break;

            case BottomTextType.IncreaseWinMoneyDefault:
            case BottomTextType.IncreaseWinMoneyFreespin:
                const winText = langManager.getLocalizedText("WIN");
                displayText = winText.text;
                break;

            case BottomTextType.CustomData:
                displayText = text || "";
                break;

            case BottomTextType.BetMultiplier:
                const currentBet = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                const betMultiText = langManager.getLocalizedText("Bet Multiplier ${0}");
                displayText = TSUtility.strFormat(betMultiText.text, CurrencyFormatHelper.formatNumber(currentBet));
                break;

            default:
                displayText = "";
                break;
        }

        // 根据文本长度调整字体大小
        this.bottomTextInfo.string = displayText;
        this.bottomTextInfo.fontSize = displayText.length > 32 
            ? this.defaultFontSizeBottomTextInfo - 1 
            : this.defaultFontSizeBottomTextInfo;
    }

    // ================= 动画与特效 =================
    /**
     * 播放胜利金额变化动画
     * @param start 起始值
     * @param end 结束值
     * @param callback 动画完成回调
     * @param playCoinEffect 是否播放金币特效
     * @param duration 动画时长（可选）
     */
    public playChangeWinMoney(
        start: number,
        end: number,
        callback?: () => void,
        playCoinEffect: boolean = false,
        duration?: number
    ): void {
        const changeNumberComp = this.winMoney!.node.getComponent(ChangeNumberComponent);
        changeNumberComp.playChangeNumber(start, end, () => {
            if (playCoinEffect) {
                this.playCoinEffectOfWinCoinArea();
            }
            callback && callback();
        }, duration);
    }

    /**
     * 停止胜利金额变化动画
     * @param finalNumber 最终显示的金额
     */
    public stopChangeWinMoney(finalNumber: number): void {
        const changeNumberComp = this.winMoney!.node.getComponent(ChangeNumberComponent);
        changeNumberComp.stopChangeNumber();
        if (finalNumber) {
            changeNumberComp.setNumber(finalNumber);
        }
    }

    /**
     * 播放胜利区域金币特效
     */
    public playCoinEffectOfWinCoinArea(): void {
        if (this.coinEffectOfWinCoinArea) {
            this.coinEffectOfWinCoinArea.node.active = true;
            this.coinEffectOfWinCoinArea.stop();
            this.coinEffectOfWinCoinArea.play();
        }
    }

    // ================= 视图适配 =================
    /**
     * 显示/隐藏平均投注文本
     * @param show 是否显示
     */
    public setShowAverageBetText(show: boolean): void {
        if (TSUtility.isValid(this.totalBetCaption) && TSUtility.isValid(this.totalBetMoney) && TSUtility.isValid(this.averagebetNode)) {
            this.totalBetCaption.active = !show;
            this.totalBetMoney.node.active = !show;
            this.averagebetNode.active = show;
        }
    }

    /**
     * 根据分辨率自动缩放底部UI
     */
    public setBottomUIAutoScaleByResoultion(): void {
        if (!SlotManager.Instance._scaleAdjuster || !this.rootTextInfo) return;

        // 获取Canvas尺寸
        const canvas = cc.Canvas.instance;
        const canvasSize = canvas.node.getContentSize();
        const ratio = (canvasSize.height / canvasSize.width - 9 / 16) / 0.1875;
        const clampedRatio = Math.min(Math.max(0, ratio), 1);

        // 查找底部UI缩放配置
        let scale = -1;
        let posY = -1;
        for (const info of SlotManager.Instance._scaleAdjuster.infos) {
            if (info.key === "bottomUIInfo") {
                scale = info.scale;
                posY = info.posY;
                break;
            }
        }

        // 应用缩放和位置调整
        if (scale !== -1 || posY !== -1) {
            const finalScale = cc.lerp(1, scale, clampedRatio);
            const finalPosY = cc.lerp(0, posY, clampedRatio);
            this.rootTextInfo.setScale(finalScale);
            this.rootTextInfo.y = this.defaultRootPosY + finalPosY;
        }
    }
}