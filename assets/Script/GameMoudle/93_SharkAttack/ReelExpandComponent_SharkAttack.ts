import SlotSoundController from '../../Slot/SlotSoundController';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SharkAttackManager from './SharkAttackManager';

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏滚轮扩展组件
 * 负责判断滚轮扩展特效触发条件、播放扩展/收缩动画、控制水流特效与音效（保留原拼写错误以兼容）
 */
@ccclass('ReelExpandComponent_SharkAttack')
export default class ReelExpandComponent_SharkAttack extends cc.Component {
    // 水流出现动画组件（注意：原文件拼写错误watarAppear，保留以兼容）
    @property({ type: cc.Animation })
    watarAppear: cc.Animation = null!;

    // 水流循环动画组件
    @property({ type: cc.Animation })
    waterLoop: cc.Animation = null!;

    // 是否正在显示水流特效
    private _showingWaterEffect: boolean = false;

    // 当前总扩展行数
    private _currentTotalExpandRow: number = 0;

    // 当前行步骤
    private _currentRowStep: number = 0;

    /**
     * 判断是否正在显示滚轮扩展特效（注意：原文件拼写错误showig，保留以兼容）
     * @returns boolean 是否显示扩展特效
     */
    isShowigExpandReelEffect(): boolean {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        
        // 校验历史窗口有效性
        if (TSUtility.isValid(lastHistoryWindows)) {
            // 遍历前2个滚轮窗口，检查是否有71-73的符号（扩展触发符号）
            for (let t = 0; t < 2; ++t) {
                let symbolCount = 0;
                const window = lastHistoryWindows.GetWindow(t);
                
                for (let o = 2; o < window.size; ++o) {
                    const symbol = window.getSymbol(o);
                    if (symbol >= 71 && symbol <= 73) {
                        symbolCount++;
                    }
                }

                // 无触发符号则返回false
                if (symbolCount === 0) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 检查滚轮扩展状态，触发扩展特效逻辑
     */
    getCheckExpandState(): void {
        const self = this;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let isExpand = true;

        // 遍历前2个滚轮窗口，验证扩展触发条件
        for (let o = 0; o < 2; ++o) {
            let symbolCount = 0;
            const window = lastHistoryWindows.GetWindow(o);
            
            for (let i = 2; i < window.size; ++i) {
                const symbol = window.getSymbol(i);
                if (symbol >= 71 && symbol <= 73) {
                    symbolCount++;
                }
            }

            // 无触发符号则取消扩展
            if (symbolCount === 0) {
                isExpand = false;
                break;
            }
        }

        // 满足扩展条件则执行特效逻辑
        if (isExpand) {
            this.playWaterAppear();
            this._showingWaterEffect = true;

            // 计算扩展行数并调度扩展动画
            for (let o = 1; o >= 0 && lastHistoryWindows.GetWindow(2).getSymbol(o) > -1; --o) {
                this._currentTotalExpandRow++;
                this.scheduleOnce(() => {
                    self.playReelExpandEffect();
                }, 0.5 * this._currentTotalExpandRow + 1 * this._currentTotalExpandRow);
            }
        }
    }

    /**
     * 播放滚轮扩展动画
     */
    playReelExpandEffect(): void {
        this._currentRowStep++;
        // 播放滚轮扩展音效
        SlotSoundController.Instance().playAudio("ReelExpanding", "FX");

        // 拼接扩展动画名（Reel_2_Expand / Reel_3_Expand 等）
        const animName = `Reel_${this._currentRowStep + 1}_Expand`;
        this.getComponent(cc.Animation)!.play(animName);

        // 更新滚轮预期特效
        SharkAttackManager.getInstance().changeReelExpectEffect(2, this._currentRowStep);
    }

    /**
     * 播放水流出现特效
     */
    playWaterAppear(): void {
        const self = this;
        // 播放水流扩展行循环音效
        SlotSoundController.Instance().playAudio("ReelExpandingAddRow", "FXLoop");
        
        // 激活并播放水流出现动画
        this.watarAppear.node.active = true;
        this.watarAppear.play();

        // 0.1秒后播放水流循环动画
        this.scheduleOnce(() => {
            self.playWaterLoop();
        }, 0.1);
    }

    /**
     * 播放水流循环特效
     */
    playWaterLoop(): void {
        this.waterLoop.node.active = true;
        this.waterLoop.play();
    }

    /**
     * 停止水流循环特效，播放消失动画
     */
    stopWaterLoop(): void {
        const self = this;
        // 仅在显示水流特效时执行停止逻辑
        if (this._showingWaterEffect) {
            // 停止水流扩展行音效
            SlotSoundController.Instance().stopAudio("ReelExpandingAddRow", "FXLoop");
            // 停止循环动画，播放消失动画
            this.waterLoop.stop();
            this.watarAppear.play("Reel_Expand_Water_Disappear_Ani");

            // 0.1秒后隐藏水流出现节点
            this.scheduleOnce(() => {
                self.watarAppear.node.active = false;
            }, 0.1);
        }
    }

    /**
     * 重置滚轮状态，播放收缩动画
     */
    resetReel(): void {
        // 有扩展行时播放收缩动画
        if (this._currentRowStep > 0) {
            // 播放滚轮收缩音效
            SlotSoundController.Instance().playAudio("ReelReduction", "FX");
            // 拼接收缩动画名（Reel_2_Contract / Reel_3_Contract 等）
            const animName = `Reel_${this._currentRowStep + 1}_Contract`;
            this.getComponent(cc.Animation)!.play(animName);
        }

        // 重置所有状态变量
        this._showingWaterEffect = false;
        this._currentTotalExpandRow = 0;
        this._currentRowStep = 0;
    }
}