import SlotSoundController from '../../Slot/SlotSoundController';
import SymbolAni from '../../Slot/SymbolAni';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotManager from '../../manager/SlotManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import JackpotSymbol_RainbowPearl from './JackpotSymbol_RainbowPearl';

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl 移动光效组件
 * 核心功能：播放顶部/底部移动光效动画、控制音效、清理光效节点、更新底部奖金UI
 */
@ccclass('MovingLightComponent_RainbowPearl')
export default class MovingLightComponent_RainbowPearl extends cc.Component {
    //#region 组件引用
    /** 顶部光效目标节点（光效最终移动到的位置） */
    @property({ type: cc.Node })
    public targetTop: cc.Node | null = null;

    /** 底部光效目标节点（光效最终移动到的位置） */
    @property({ type: cc.Node })
    public targetBottom: cc.Node | null = null;

    /** 光效动画根节点（所有光效节点的父节点） */
    @property({ type: cc.Node })
    public rootAnis: cc.Node | null = null;

    /** 底部UI动画组件（奖金展示动画） */
    @property({ type: cc.Animation })
    public aniBottomUI: cc.Animation | null = null;
    //#endregion

    /**
     * 播放顶部移动光效
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param symbolType 符号类型（90/91=Jackpot；92/93=倍数）
     * @param prize 奖金/倍数值（仅92/93类型需要，默认0）
     */
    public playMoveLightWithTop(
        col: number,
        row: number,
        symbolType: number,
        prize: number = 0
    ): void {
        if (!this.rootAnis || !this.targetTop) return;

        // 1. Jackpot符号（90/91）光效逻辑
        if (symbolType === 90 || symbolType === 91) {
            // 从符号池获取光效节点（96为顶部光效符号ID）
            const lightNode = SymbolPoolManager.instance.getSymbolAni(96);
            if (!lightNode) return;

            // 设置光效初始位置（5列×3行布局）
            lightNode.setPosition(186 * col - 372, 157 - 157 * row);
            this.rootAnis.addChild(lightNode);

            // 播放光效基础动画
            const symbolAniComp = lightNode.getComponent(SymbolAni);
            symbolAniComp?.playAnimation();

            // 计算目标偏移量（光效移动到targetTop的偏移）
            const offsetX = this.targetTop.x - lightNode.x;
            const offsetY = this.targetTop.y - lightNode.y;

            // 设置Jackpot符号移动锚点并播放移动动画
            const jackpotSymbolComp = lightNode.getComponent(JackpotSymbol_RainbowPearl);
            if (jackpotSymbolComp?.movePivot) {
                jackpotSymbolComp.movePivot.x = 0;
                jackpotSymbolComp.movePivot.y = 0;
                jackpotSymbolComp.movePivot.runAction(cc.sequence(
                    cc.delayTime(0.33), // 延迟330ms
                    cc.moveTo(0.58, offsetX, offsetY).easing(cc.easeBackIn()) // 0.58秒移动，带回弹缓动
                ));
            }

            // 播放光效音效
            SlotSoundController.Instance().playAudio("LockAndRollCoinSave", "FX");
        }
        // 2. 倍数符号（92/93）光效逻辑
        else if (symbolType === 92 || symbolType === 93) {
            // 从符号池获取光效节点（92为倍数光效符号ID）
            const lightNode = SymbolPoolManager.instance.getSymbolAni(92);
            if (!lightNode) return;

            // 设置光效初始位置
            lightNode.setPosition(186 * col - 372, 157 - 157 * row);
            this.rootAnis.addChild(lightNode);

            // 设置倍数符号奖金信息
            const jackpotSymbolComp = lightNode.getComponent(JackpotSymbol_RainbowPearl);
            jackpotSymbolComp?.setCenterInfoRainbowPearl(5, prize);

            // 计算目标偏移量
            const offsetX = this.targetTop.x - lightNode.x;
            const offsetY = this.targetTop.y - lightNode.y;

            // 设置移动锚点并播放移动动画
            if (jackpotSymbolComp?.movePivot) {
                jackpotSymbolComp.movePivot.x = offsetX;
                jackpotSymbolComp.movePivot.y = offsetY;
                // 播放光效基础动画
                const symbolAniComp = lightNode.getComponent(SymbolAni);
                symbolAniComp?.playAnimation();
                // 播放移动动画（反向移动：从目标偏移→0,0）
                jackpotSymbolComp.movePivot.runAction(cc.sequence(
                    cc.delayTime(0.33),
                    cc.moveTo(0.58, 0, 0).easing(cc.easeBackIn())
                ));
            }

            // 播放光效音效
            SlotSoundController.Instance().playAudio("LockAndRollCoinSave", "FX");
        }
    }

    /**
     * 播放底部移动光效（结果奖金展示）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param totalWin 总奖金金额
     */
    public playMoveLightWithBottom(col: number, row: number, totalWin: number): void {
        if (!this.rootAnis || !this.targetBottom) return;

        // 从符号池获取光效节点（96为底部光效符号ID）
        const lightNode = SymbolPoolManager.instance.getSymbolAni(96);
        if (!lightNode) return;

        // 设置光效初始位置
        lightNode.setPosition(186 * col - 372, 157 - 157 * row);
        this.rootAnis.addChild(lightNode);

        // 播放光效基础动画
        const symbolAniComp = lightNode.getComponent(SymbolAni);
        symbolAniComp?.playAnimation();

        // 计算目标偏移量
        const offsetX = this.targetBottom.x - lightNode.x;
        const offsetY = this.targetBottom.y - lightNode.y;

        // 设置Jackpot符号移动锚点
        const jackpotSymbolComp = lightNode.getComponent(JackpotSymbol_RainbowPearl);
        if (jackpotSymbolComp?.movePivot) {
            jackpotSymbolComp.movePivot.x = 0;
            jackpotSymbolComp.movePivot.y = 0;

            // 播放光效音效
            SlotSoundController.Instance().playAudio("LockAndRollCoinPayout", "FX");
            SlotSoundController.Instance().playAudio("FreespinCoinPayout", "FX");

            // 播放移动动画 + 回调（更新底部UI）
            jackpotSymbolComp.movePivot.runAction(cc.sequence(
                cc.delayTime(0.33), // 延迟330ms
                cc.moveTo(0.58, offsetX, offsetY).easing(cc.easeBackIn()), // 0.58秒移动
                cc.callFunc(() => {
                    // 播放底部UI动画
                    this.aniBottomUI?.play();
                    // 更新底部奖金文本（仅当奖金≥0时）
                    if (totalWin >= 0) {
                        SlotManager.Instance.bottomUIText?.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
                        SlotManager.Instance.bottomUIText?.setWinMoney(totalWin);
                    }
                })
            ));
        }
    }

    /**
     * 清理所有光效动画节点（释放到符号池）
     */
    public clearAllAnis(): void {
        if (!this.rootAnis) return;

        // 遍历根节点所有子节点，释放到符号池
        const childCount = this.rootAnis.childrenCount;
        for (let i = 0; i < childCount; i++) {
            if (this.rootAnis.children[0]) {
                SymbolPoolManager.instance.releaseSymbolAni(this.rootAnis.children[0]);
            }
        }
    }
}