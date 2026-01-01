const { ccclass } = cc._decorator;
import State from "./Slot/State";

@ccclass
export default class SymbolAnimationModule_Base extends cc.Component {

    /** 播放符号动画 - 基类空实现 子类重写 */
    public playAnimationSymbol(col: number, row: number, symbolId: number, aniName?: string, reelMachine?: any, isLoop?: boolean): cc.Node | null {
        return null;
    }

    /** 强制播放符号动画 - 基类空实现 子类重写 */
    public mustPlayAnimationSymbol(col: number, row: number, symbolId: number, aniName?: string, reelMachine?: any, isLoop?: boolean): cc.Node | null {
        return null;
    }

    /** 绝对坐标播放符号动画 - 基类空实现 子类重写 */
    public playAnimationSymbolAbsoluteCoordinate(col: number, row: number, symbolId: number, aniName?: string): cc.Node | null {
        return null;
    }

    /** 绝对坐标强制播放符号动画 - 基类空实现 子类重写 */
    public mustPlayAnimationSymbolAbsoluteCoordinate(col: number, row: number, symbolId: number, aniName?: string): cc.Node | null {
        return null;
    }

    /** 获取停止所有动画的状态机 - 基类空实现 子类重写 */
    public getStopAllAnimationSymbolState(): State | null {
        return null;
    }

    /** 停止所有符号动画 - 基类空实现 子类重写 */
    public stopAllAnimationSymbol(): void { }

    /** 暂停所有符号动画 - 基类空实现 子类重写 */
    public pauseAllAnimationSymbol(): void { }

    /** 停止所有动画(排除指定列表) - 基类空实现 子类重写 */
    public stopAllAnimationSymbolExceptList(symbolIds: number[]): void { }

    /** 重置符号动画Z轴层级排序 - 基类空实现 子类重写 */
    public resetZorderSymbolAnimation(): void { }

}