import HundredDollarManager from './HundredDollarManager';
import GameComponents_HundredDollar from './GameComponents_HundredDollar';
import State from '../../Slot/State';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotManager from '../../manager/SlotManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';

const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机奖励游戏组件
 * 负责奖励游戏的交互逻辑、动画播放、音效控制和奖励计算
 */
@ccclass()
export default class BonusGameComponent_HundredDollar extends cc.Component {
    /** 接受奖励按钮 */
    @property({
        type: cc.Button,
        displayName: "接受奖励按钮"
    })
    public btnTakeOffer: cc.Button | null = null;

    /** 再试一次按钮 */
    @property({
        type: cc.Button,
        displayName: "再试一次按钮"
    })
    public btnTryAgain: cc.Button | null = null;

    /** 接受奖励按钮动画 */
    @property({
        type: cc.Animation,
        displayName: "接受奖励按钮动画"
    })
    public aniTakeOffer: cc.Animation | null = null;

    /** 再试一次按钮动画 */
    @property({
        type: cc.Animation,
        displayName: "再试一次按钮动画"
    })
    public aniTryAgain: cc.Animation | null = null;

    /** 顶部文本节点数组（提示、选择、奖励信息等） */
    @property({
        type: [cc.Node],
        displayName: "顶部文本节点数组"
    })
    public rootsTopTexts: cc.Node[] = [];

    /** 当前奖励金额标签 */
    @property({
        type: cc.Label,
        displayName: "当前奖励金额标签"
    })
    public labelCurrentOffer: cc.Label | null = null;

    /** 剩余次数标签 */
    @property({
        type: cc.Label,
        displayName: "剩余次数标签"
    })
    public labelOfferLeft: cc.Label | null = null;

    // 内部状态变量
    private bonusGameStateCallback: Function | null = null; // 奖励游戏状态回调
    private _showInfoState: number = 0; // 信息显示状态（0/1 切换文本）
    private _flagPlayRetryAni: boolean = false; // 重试动画播放标记

    /**
     * 组件加载时初始化
     */
    onLoad(): void {
        // 初始化按钮状态和UI
        this.setButtonInteractiveState(false);
        this.setShowButtonChoiceEffect(false);
        this.clearCurrentOfferInfo();
    }

    /**
     * 创建并返回奖励游戏状态对象
     * @returns 奖励游戏状态实例
     */
    playBonusGameState(): State {
        const bonusState = new State();
        
        bonusState.addOnStartCallback(() => {
            this.node.stopAllActions();
            this.bonusGameStateCallback = () => {
                bonusState.setDone();
                this.bonusGameStateCallback = null;
            };
            this.playGame();
        });

        return bonusState;
    }

    /**
     * 开始奖励游戏逻辑
     */
    playGame(): void {
        this.clearCurrentOfferInfo();
        SlotSoundController.Instance().playAudio("IntroBGM", "FX");
        
        // 播放顶部UI开始动画
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        gameComponents.topUI.playStartAni();
        
        this._flagPlayRetryAni = false;
        
        // 3秒后触发再试一次逻辑
        this.scheduleOnce(() => {
            this.onClickTryAgain();
        }, 3);
    }

    /**
     * 再试一次后的处理逻辑
     */
    processAfterTryAgain(): void {
        // 获取奖励游戏状态
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        // 显示当前奖励次数提示
        this.showOfferCountAlert(bonusGameState.spinCnt);

        if (!this._flagPlayRetryAni) {
            this._flagPlayRetryAni = true;
            this.playShowDollarLamp();
        } else {
            // 播放重试动画和音效
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
            gameComponents.topUI.playRetryAni();
            SlotSoundController.Instance().playAudio("BonusGameTryAgain", "FX");
            
            this.scheduleOnce(() => {
                this.playShowDollarLamp();
            }, 0.7);
        }
    }

    /**
     * 接受奖励后的处理逻辑
     */
    processAfterTakeOffer(): void {
        this.showCurrentOfferInfoText();
        if (this.bonusGameStateCallback) {
            this.bonusGameStateCallback();
        }
    }

    /**
     * 播放美元灯效动画（核心奖励展示逻辑）
     */
    playShowDollarLamp(): void {
        // 获取奖励列表和倍率
        const rewardList = this.getBonusRewardList();
        const multiplier = this.getMultiplier();
        const lightIndex = [0, 0, 0, 0, 0, 0]; // 各档位灯效索引
        
        // 奖励列表升序排序
        rewardList.sort((a, b) => a - b);
        
        // 播放鼓点循环音效
        SlotSoundController.Instance().playAudio("BonusGameDrum", "FXLoop");

        let soundIndex = 0;
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        const rewardListRef = gameComponents.topUI._listReward;

        // 遍历奖励列表，播放对应灯效和音效
        for (let i = 0; i < rewardList.length; ++i) {
            const reward = rewardList[i];
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio(`BonusGameTrunon_${soundIndex.toString()}`, "FX");
                soundIndex++;

                // 根据奖励值激活对应档位的灯效
                if (reward === rewardListRef[0]) {
                    gameComponents.topUI.dollars_2[lightIndex[0]].setShowLight();
                    lightIndex[0]++;
                } else if (reward === rewardListRef[1]) {
                    gameComponents.topUI.dollars_4[lightIndex[1]].setShowLight();
                    lightIndex[1]++;
                } else if (reward === rewardListRef[2]) {
                    gameComponents.topUI.dollars_10[lightIndex[2]].setShowLight();
                    lightIndex[2]++;
                } else if (reward === rewardListRef[3]) {
                    gameComponents.topUI.dollars_20[lightIndex[3]].setShowLight();
                    lightIndex[3]++;
                } else if (reward === rewardListRef[4]) {
                    gameComponents.topUI.dollars_50[lightIndex[4]].setShowLight();
                    lightIndex[4]++;
                } else if (reward === rewardListRef[5]) {
                    gameComponents.topUI.dollars_100[lightIndex[5]].setShowLight();
                    lightIndex[5]++;
                }
            }, 0.8 * i);
        }

        // 处理倍率灯效
        if (multiplier === 4) {
            this.scheduleOnce(() => {
                gameComponents.topUI.brightMultiplier[0].active = true;
                gameComponents.topUI.brightMultiplier[1].active = true;
                SlotSoundController.Instance().playAudio(`BonusGameTrunon_${soundIndex.toString()}`, "FX");
                soundIndex++;
            }, 0.8 * rewardList.length);
        } else if (multiplier === 2) {
            this.scheduleOnce(() => {
                const randomIdx = Math.floor(2 * Math.random());
                gameComponents.topUI.brightMultiplier[randomIdx].active = true;
                SlotSoundController.Instance().playAudio(`BonusGameTrunon_${soundIndex.toString()}`, "FX");
                soundIndex++;
            }, 0.8 * rewardList.length);
        }

        // 计算总延迟时间
        const totalDelay = multiplier > 1 ? 0.8 * (rewardList.length + 1) : 0.8 * rewardList.length;

        // 显示奖励信息并激活按钮
        this.scheduleOnce(() => {
            this.setCurrentOfferInfo();
            this.setButtonInteractiveState(true);
            this.setShowInfoPanel();
            SlotSoundController.Instance().stopAudio("BonusGameDrum", "FXLoop");
        }, totalDelay);

        // 5秒后开始切换文本显示
        this.scheduleOnce(() => {
            this.setShowButtonChoiceEffect(true);
            this.showChooseBtnText();
            this._showInfoState = 1;
            
            // 每2秒切换一次文本（选择提示/奖励信息）
            this.schedule(() => {
                if (this._showInfoState === 0) {
                    this._showInfoState = 1;
                    this.showChooseBtnText();
                } else {
                    this._showInfoState = 0;
                    this.showCurrentOfferInfoText();
                }
            }, 2);
        }, totalDelay + 5);
    }

    /**
     * 获取奖励列表
     * @returns 奖励数值数组
     */
    getBonusRewardList(): number[] {
        const rewardList: number[] = [];
        const probResults = SlotGameResultManager.Instance.getProbResults();
        
        if (probResults) {
            for (let i = 0; i < probResults.length; ++i) {
                rewardList.push(probResults[i].prize);
            }
        }
        
        return rewardList;
    }

    /**
     * 获取奖励倍率
     * @returns 倍率值
     */
    getMultiplier(): number {
        const probResults = SlotGameResultManager.Instance.getProbResults();
        let multiplier = 1;
        
        if (probResults) {
            multiplier = probResults[0].multiplier;
        }
        
        return multiplier;
    }

    /**
     * 接受奖励按钮点击事件
     */
    onClickTakeOffer(): void {
        // 停止相关音效
        SlotSoundController.Instance().stopAudio("BonusGameWait", "FXLoop");
        SlotSoundController.Instance().stopAudio("BonusGameChoice", "FXLoop");
        SlotSoundController.Instance().playAudio("BonusGameButton", "FX");

        // 禁用按钮和特效
        this.setButtonInteractiveState(false);
        this.setShowButtonChoiceEffect(false);
        this.unscheduleAllCallbacks();

        // 获取奖励游戏状态
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        
        // 还有剩余次数则发送请求，否则直接处理结果
        if (bonusGameState.totalCnt - bonusGameState.spinCnt > 0) {
            HundredDollarManager.getInstance().sendBonusGameRequestHundredDollar([1], this.processAfterTakeOffer.bind(this));
        } else {
            this.processAfterTakeOffer();
        }
    }

    /**
     * 再试一次按钮点击事件
     */
    onClickTryAgain(): void {
        // 停止相关音效
        SlotSoundController.Instance().stopAudio("BonusGameWait", "FXLoop");
        SlotSoundController.Instance().stopAudio("BonusGameChoice", "FXLoop");
        SlotSoundController.Instance().playAudio("BonusGameButton", "FX");

        // 停止顶部UI动画，禁用按钮和特效
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        gameComponents.topUI.stopAni();
        
        this.setButtonInteractiveState(false);
        this.setShowButtonChoiceEffect(false);
        this.unscheduleAllCallbacks();

        // 发送再试一次请求
        HundredDollarManager.getInstance().sendBonusGameRequestHundredDollar([0], this.processAfterTryAgain.bind(this));
    }

    /**
     * 设置按钮交互状态
     * @param isInteractive 是否可交互
     */
    setButtonInteractiveState(isInteractive: boolean): void {
        if (this.btnTakeOffer) {
            this.btnTakeOffer.interactable = isInteractive;
        }

        if (this.btnTryAgain) {
            if (isInteractive) {
                const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
                const remainingCount = bonusGameState.totalCnt - bonusGameState.spinCnt;
                this.btnTryAgain.interactable = remainingCount > 0 && isInteractive;
                
                // 播放选择音效
                SlotSoundController.Instance().playAudio("BonusGameChoice", "FXLoop");
            } else {
                this.btnTryAgain.interactable = isInteractive;
            }
        }
    }

    /**
     * 设置按钮选择特效显示状态
     * @param isShow 是否显示
     */
    setShowButtonChoiceEffect(isShow: boolean): void {
        if (this.aniTakeOffer && this.aniTakeOffer.node) {
            this.aniTakeOffer.node.active = isShow;
        }

        if (this.aniTryAgain && this.aniTryAgain.node) {
            if (isShow) {
                const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
                const remainingCount = bonusGameState.totalCnt - bonusGameState.spinCnt;
                this.aniTryAgain.node.active = remainingCount > 0 && isShow;

                // 播放按钮动画
                if (this.aniTakeOffer) {
                    this.aniTakeOffer.stop();
                    this.aniTakeOffer.play("Btn_Take_Try_Fx_Ani");
                }
                if (this.aniTryAgain) {
                    this.aniTryAgain.stop();
                    this.aniTryAgain.play("Btn_Take_Try_Fx_Ani", 0.375);
                }

                // 播放等待音效
                SlotSoundController.Instance().playAudio("BonusGameWait", "FXLoop");
            } else {
                this.aniTryAgain.node.active = isShow;
            }
        }
    }

    /**
     * 清空当前奖励信息显示
     */
    clearCurrentOfferInfo(): void {
        if (this.labelCurrentOffer) {
            this.labelCurrentOffer.string = "";
        }
        if (this.labelOfferLeft) {
            this.labelOfferLeft.string = "";
        }
    }

    /**
     * 设置当前奖励信息显示
     */
    setCurrentOfferInfo(): void {
        const rewardList = this.getBonusRewardList();
        const multiplier = this.getMultiplier();
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        const remainingCount = bonusGameState.totalCnt - bonusGameState.spinCnt;

        // 计算总奖励金额
        let totalReward = 0;
        for (let i = 0; i < rewardList.length; ++i) {
            totalReward += rewardList[i];
        }
        totalReward *= multiplier;

        // 更新标签显示
        if (this.labelCurrentOffer) {
            this.labelCurrentOffer.string = totalReward.toString();
        }
        if (this.labelOfferLeft) {
            this.labelOfferLeft.string = remainingCount.toString();
        }
    }

    /**
     * 隐藏所有顶部文本
     */
    hideAllTopText(): void {
        for (let i = 0; i < this.rootsTopTexts.length; ++i) {
            if (this.rootsTopTexts[i]) {
                this.rootsTopTexts[i].active = false;
            }
        }
    }

    /**
     * 显示默认提示文本
     * @param text 提示文本（默认：GOOD LUCK!）
     */
    showDefaultAlert(text: string = "GOOD LUCK!"): void {
        this.hideAllTopText();
        if (this.rootsTopTexts[0]) {
            this.rootsTopTexts[0].active = true;
            const labelNode = this.rootsTopTexts[0].getChildByName("label");
            if (labelNode) {
                const label = labelNode.getComponent(cc.Label);
                if (label) {
                    label.string = text;
                }
            }
        }
    }

    /**
     * 显示选择按钮提示文本
     */
    showChooseBtnText(): void {
        this.hideAllTopText();
        if (this.rootsTopTexts[1]) {
            this.rootsTopTexts[1].active = true;
        }
    }

    /**
     * 显示当前奖励信息文本
     */
    showCurrentOfferInfoText(): void {
        this.hideAllTopText();
        if (this.rootsTopTexts[2]) {
            this.rootsTopTexts[2].active = true;
        }
    }

    /**
     * 显示奖励次数提示文本
     * @param count 次数（1-5）
     */
    showOfferCountAlert(count: number): void {
        this.hideAllTopText();
        if (this.rootsTopTexts[3]) {
            this.rootsTopTexts[3].active = true;
            const labelNode = this.rootsTopTexts[3].getChildByName("label");
            if (labelNode) {
                const label = labelNode.getComponent(cc.Label);
                if (label) {
                    switch (count) {
                        case 1: label.string = "FIRST OFFER"; break;
                        case 2: label.string = "SECOND OFFER"; break;
                        case 3: label.string = "THIRD OFFER"; break;
                        case 4: label.string = "FOURTH OFFER"; break;
                        case 5: label.string = "FINAL OFFER"; break;
                        default: label.string = ""; break;
                    }
                }
            }
        }
    }

    /**
     * 显示最终奖励结果信息
     */
    showResultInfo(): void {
        const rewardList = this.getBonusRewardList();
        const multiplier = this.getMultiplier();

        // 计算总奖励
        let totalReward = 0;
        for (let i = 0; i < rewardList.length; ++i) {
            totalReward += rewardList[i];
        }
        totalReward *= multiplier;

        // 显示结果文本
        this.hideAllTopText();
        if (this.rootsTopTexts[4]) {
            this.rootsTopTexts[4].active = true;
            const resultLabelNode = this.rootsTopTexts[4]
                .getChildByName("layout")
                ?.getChildByName("layoutResult")
                ?.getChildByName("labelOffer");
            
            if (resultLabelNode) {
                const resultLabel = resultLabelNode.getComponent(cc.Label);
                if (resultLabel) {
                    resultLabel.string = totalReward.toString();
                }
            }
        }
    }

    /**
     * 设置信息面板显示状态（最终结果/当前奖励）
     */
    setShowInfoPanel(): void {
        const bonusGameState = SlotGameResultManager.Instance.getSubGameState("bonusGame");
        if (bonusGameState.spinCnt === 5) {
            this.showResultInfo();
        } else {
            this.showCurrentOfferInfoText();
        }
    }
}