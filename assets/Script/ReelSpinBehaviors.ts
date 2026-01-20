
const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 路径/顺序 与原JS完全一致，无任何改动
import State from "./Slot/State";
import Reel from "./Slot/Reel";
import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import SlotReelSpinStateManager from "./Slot/SlotReelSpinStateManager";
import Symbol from "./Slot/Symbol";
import SlotUIRuleManager from "./Slot/rule/SlotUIRuleManager";
import SlotGameResultManager from "./manager/SlotGameResultManager";
import SlotSoundController from "./Slot/SlotSoundController";
import SlotManager, { SpecialSymbolInfo } from "./manager/SlotManager";
import ReelController_Base from "./ReelController_Base";
import TSUtility from "./global_utility/TSUtility";


/**
 * 滚轮旋转行为数据封装 - 缓动信息
 * 与原JS构造函数1:1属性对应，初始化值完全一致
 */
export class EasingInfo {
    public easingType: string = "";
    public easingRate: number = 0;
    public easingDistance: number = 0;
    public easingDuration: number = 0;
    public onEasingStartFuncList: Function[] = [];
}

/**
 * 老虎机滚轮旋转行为核心管理类 (单例模式)
 * 封装所有滚轮的旋转/停止/预旋转/无限旋转/对抗旋转/下落消除等行为逻辑 + 缓动算法
 */
@ccclass
export default class ReelSpinBehaviors {
    // ===================== 单例模式核心 - 与原JS完全一致 无任何改动 =====================
    private static _instance: ReelSpinBehaviors = null;
    public static get Instance(): ReelSpinBehaviors {
        if (this._instance == null) {
            this._instance = new ReelSpinBehaviors();
        }
        return this._instance;
    }
    public static Destroy(): void {
        if (this._instance != null) {
            this._instance = null;
        }
    }

    // ===================== 普通模式 - 预旋转(上下抖动)状态 =====================
    public getPreSpinUpDownState(reelCom: Reel, windowData: any, subGameKey: string): State {
        const state = new State("test");
        let action = null;

        state.addOnStartCallback(() => {
            if (!reelCom.node.active) {
                state.setDone();
                return;
            }

            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelCom.originalYPos = reelCom.node.y;
            reelCom.setParentAllSymbolsToSymbolLayer();

            let easingType = null;
            let easingRate = null;
            let duration = null;
            let distance = null;
            let symbolSpeed = null;

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                easingType = spinCtrl.preEasingType;
                easingRate = spinCtrl.preEasingRate;
                duration = spinCtrl.preEasingDuration;
                distance = spinCtrl.preEasingDistance;
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            }

            if (duration <= 0) {
                state.setDone();
                return;
            }

            const easeAct = this.getEaseAction(easingType, easingRate);
            const moveDown = cc.moveBy(duration, new cc.Vec2(0, distance)).easing(easeAct);
            const moveUp = cc.moveBy(symbolSpeed / 5, new cc.Vec2(0, -distance));

             // 动画完成回调
            const callFunc = cc.callFunc(() => {
                state.setDone();
            });


            action = reelCom.node.runAction(cc.sequence(moveDown, moveUp,callFunc)); 
                //cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            // if (action && !action.isDone()) {
            //     reelCom.node.stopAction(action);
            // }

            null == action || action.isDone() || reelCom.node.stopAction(action)
        });

        return state;
    }

    // ===================== 普通模式 - 滚轮移动到目标符号列表(核心方法) =====================
    public getReelMoveStateWithLastSymbolListNew(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo, symbolInfoList: any[] = null, specialInfoList: any[] = null): State {
        const state = new State();
        let action = null;
        let symbolIdx = 0;
        let infoIdx = 0;
        let specialIdx = 0;
        let symbolHeight = 0;
        let symbolSpeed = 0;

        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolHeight = spinCtrl.symbolHeight;
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            const lastSymbol = reelCom.getLastSymbol();
            const lastSymbolY = reelCom.getPositionY(lastSymbol.node.y);
            const bufferOffset = reelCom.bufferRow * symbolHeight;

            let targetY: number;
            let easeDistance: number;
            if (easingInfo) {
                targetY = lastSymbolY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferOffset;
                easeDistance = easingInfo.easingDistance;
            } else {
                targetY = lastSymbolY + symbolList.length * symbolHeight - bufferOffset;
            }

            const moveTime = Math.abs(symbolSpeed * (targetY / symbolHeight));
            const moveAct = cc.moveBy(moveTime, new cc.Vec2(0, -targetY));
            let easeAct = null;

            if (easingInfo) {
                const easeFunc = this.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easeAct = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easeDistance)).easing(easeFunc);
            }

            // 符号ID回调
            reelCom.setNextSymbolIdCallback(() => {
                if (symbolIdx >= symbolList.length) return void 0;
                const symbolId = symbolList[symbolIdx];
                symbolIdx++;
                return symbolId;
            });

            // 符号信息回调
            reelCom.setNextSymbolInfoCallback(() => {
                let info = null;
                if (symbolInfoList && symbolInfoList.length > infoIdx) {
                    info = symbolInfoList[infoIdx];
                    infoIdx++;
                }
                return info;
            });

            // 特殊符号信息回调
            reelCom.setNextSpecialInfoCallback(() => {
                let info = new SpecialSymbolInfo(0);
                if (specialInfoList && specialInfoList.length > specialIdx) {
                    info = specialInfoList[specialIdx];
                    specialIdx++;
                }
                return info;
            });

            const endCall = cc.callFunc(() => state.setDone());
            if (!easeAct) {
                action = reelCom.node.runAction(cc.sequence(moveAct, endCall));
            } else if (easingInfo.onEasingStartFuncList.length > 0) {
                const easeStartCall = cc.callFunc(() => {
                    for (let i = 0; i < easingInfo.onEasingStartFuncList.length; i++) {
                        easingInfo.onEasingStartFuncList[i]();
                    }
                });
                action = reelCom.node.runAction(cc.sequence([moveAct, easeStartCall, easeAct, endCall]));
            } else {
                action = reelCom.node.runAction(cc.sequence([moveAct, easeAct, endCall]));
            }
        });

        state.addOnEndCallback(() => {
            reelCom.node.stopAction(action);
            // 补全剩余符号
            while (symbolIdx < symbolList.length) {
                if (symbolIdx < symbolList.length) {
                    const symbolId = symbolList[symbolIdx];
                    symbolInfoList && symbolInfoList.length > infoIdx && symbolInfoList[infoIdx];
                    reelCom.pushSymbolAtTopOfReel(symbolId, null);
                } else {
                    cc.error("invalid status tweenAction ");
                }
                symbolIdx++;
                infoIdx++;
            }
            reelCom.processAfterStopSpin();
        });

        return state;
    }

    // ===================== 普通模式 - 滚轮移动到目标符号列表(含空白符号) =====================
    public getReelMoveStateWithLastSymbolListContainBlankSymbolNew(reelCom: Reel, symbolList: any[], reelStrip: any, easingInfo: EasingInfo, subGameKey: string, symbolInfoList: any[] = null, specialInfoList: any[] = null): State {
        const state = new State();
        let action = null;
        let symbolIdx = 0;
        let infoIdx = 0;
        let specialIdx = 0;
        let symbolHeight = 0;
        let symbolSpeed = 0;

        if (easingInfo) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolHeight = spinCtrl.symbolHeight;
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            if (symbolList.length === 0) return;

            const lastSymbol = reelCom.getLastSymbol();
            const lastSymbolY = reelCom.getPositionY(lastSymbol.node.y);
            const bufferOffset = reelCom.bufferRow * symbolHeight;

            // 空白符号补位规则
            if (lastSymbol.symbolId === 0 && symbolList[0] === 0) {
                const randomIdx = Math.floor(Math.random() * reelStrip.length);
                symbolList = [reelStrip[randomIdx]].concat(symbolList);
                symbolInfoList && (symbolInfoList = [null].concat(symbolInfoList));
                specialInfoList && (specialInfoList = [new SpecialSymbolInfo(0)].concat(specialInfoList));
            } else if (lastSymbol.symbolId !== 0 && symbolList[0] !== 0) {
                symbolList = [0].concat(symbolList);
                symbolInfoList && (symbolInfoList = [null].concat(symbolInfoList));
                specialInfoList && (specialInfoList = [new SpecialSymbolInfo(0)].concat(specialInfoList));
            }

            let targetY: number;
            let easeDistance: number;
            if (easingInfo) {
                targetY = lastSymbolY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferOffset;
                easeDistance = easingInfo.easingDistance;
            } else {
                targetY = lastSymbolY + symbolList.length * symbolHeight - bufferOffset;
            }

            const moveTime = symbolSpeed * (targetY / symbolHeight);
            const moveAct = cc.moveBy(moveTime, new cc.Vec2(0, -targetY));
            let easeAct = null;

            if (easingInfo) {
                const easeFunc = this.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easeAct = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easeDistance)).easing(easeFunc);
            }

            // 符号ID回调
            reelCom.setNextSymbolIdCallback(() => {
                if (symbolIdx < symbolList.length) {
                    const symbolId = symbolList[symbolIdx];
                    symbolIdx++;
                    return symbolId;
                }
                return void 0;
            });

            // 符号信息回调
            symbolInfoList && reelCom.setNextSymbolInfoCallback(() => {
                let info = null;
                if (symbolInfoList && symbolInfoList.length > infoIdx) {
                    info = symbolInfoList[infoIdx];
                    infoIdx++;
                }
                return info;
            });

            // 特殊符号信息回调
            specialInfoList && reelCom.setNextSpecialInfoCallback(() => {
                let info = new SpecialSymbolInfo(0);
                if (specialInfoList && specialInfoList.length > specialIdx) {
                    info = specialInfoList[specialIdx];
                    specialIdx++;
                }
                return info;
            });

            const endCall = cc.callFunc(() => state.setDone(), reelCom);
            if (!easeAct) {
                action = reelCom.node.runAction(cc.sequence([moveAct, endCall]));
            } else if (easingInfo.onEasingStartFuncList.length > 0) {
                const easeStartCall = cc.callFunc(() => {
                    for (let i = 0; i < easingInfo.onEasingStartFuncList.length; i++) {
                        easingInfo.onEasingStartFuncList[i]();
                    }
                });
                action = reelCom.node.runAction(cc.sequence([moveAct, easeStartCall, easeAct, endCall]));
            } else {
                action = reelCom.node.runAction(cc.sequence([moveAct, easeAct, endCall]));
            }
        });

        state.addOnEndCallback(() => {
            reelCom.node.stopAction(action);
            // 补全剩余符号
            while (symbolIdx < symbolList.length) {
                if (symbolIdx < symbolList.length) {
                    const symbolId = symbolList[symbolIdx++];
                    reelCom.pushSymbolAtTopOfReel(symbolId);
                } else {
                    cc.error("invalid status tweenAction ");
                }
                symbolIdx++;
            }
            reelCom.processAfterStopSpin();
        });

        return state;
    }

    // ===================== 普通模式 - 无限旋转状态 =====================
    public getInfiniteSpinState(reelCom: Reel, reelStrip: any, subGameKey: string, speed: number = null, isReset: number = null, symbolIdx: number = null): State {
        const state = new State();
        const reelData = reelStrip.getReel(reelCom.reelindex);
        let symbolSpeed = 0;
        let symbolHeight = 0;

        reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);
        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            symbolHeight = spinCtrl.symbolHeight;
        }

        speed && (symbolSpeed = speed);
        if (isReset === 0) {
            symbolIdx ? reelData.setNextSymbolIndex(symbolIdx) : reelData.setNextSymbolIndex(0);
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            reelCom.schedule((dt) => {
                const moveY = dt / symbolSpeed * symbolHeight;
                reelCom.node.y = reelCom.node.y - moveY;
            }, 0.01);
        });

        state.addOnEndCallback(() => {
            const moveY = 0.02 / symbolSpeed * symbolHeight;
            reelCom.node.y = reelCom.node.y - moveY;
            reelCom.unscheduleAllCallbacks();
        });

        return state;
    }

    // ===================== 普通模式 - 无限旋转状态(预响应结果版) =====================
    public getInfiniteSpinStatePreResponseResult(reelCom: Reel, subGameKey: string, speed: number = null, isReset: number = null, symbolIdx: number = null): State {
        const state = new State();
        const reelData = SlotGameRuleManager.Instance.getReelInfoPreResponseResult(subGameKey, reelCom.reelindex);
        let symbolSpeed = 0;
        let symbolHeight = 0;

        reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);
        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            symbolHeight = spinCtrl.symbolHeight;
        }

        speed && (symbolSpeed = speed);
        if (isReset === 0) {
            symbolIdx ? reelData.setNextSymbolIndex(symbolIdx) : reelData.setNextSymbolIndex(0);
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            reelCom.schedule((dt) => {
                const moveY = dt / symbolSpeed * symbolHeight;
                reelCom.node.y = reelCom.node.y - moveY;
            }, 0.01);
        });

        state.addOnEndCallback(() => {
            const moveY = 0.02 / symbolSpeed * symbolHeight;
            reelCom.node.y = reelCom.node.y - moveY;
            reelCom.unscheduleAllCallbacks();
        });

        return state;
    }

    // ===================== 普通模式 - 有限旋转状态 =====================
    public getFiniteSpinState(reelCom: Reel, reelStrip: any, duration: number, subGameKey: string, speed: number = null, symbolList: any = null, symbolIdx: number = null): State {
        const state = new State();
        const reelData = reelStrip.getReel(reelCom.reelindex);
        let symbols = reelData.symbols;
        let randomIdx = Math.floor(Math.random() * reelData.getSymbolSize());
        let symbolSpeed = 0;
        let symbolHeight = 0;

        symbolList && (symbols = symbolList);
        symbolIdx && (randomIdx = symbolIdx);
        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            symbolHeight = spinCtrl.symbolHeight;
        }

        speed && (symbolSpeed = speed);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelCom.setNextSymbolIdCallback(() => {
                if (symbols[randomIdx] === 0 && reelCom.getLastSymbol().symbolId === 0) {
                    randomIdx = (randomIdx + 1) % symbols.length;
                } else if (symbols[randomIdx] !== 0 && reelCom.getLastSymbol().symbolId !== 0) {
                    randomIdx = (randomIdx + 1) % symbols.length;
                }
                const symbolId = symbols[randomIdx];
                randomIdx = (randomIdx + 1) % symbols.length;
                return symbolId;
            });

            let totalDt = 0;
            reelCom.schedule((dt) => {
                const moveY = symbolSpeed / dt * symbolHeight;
                reelCom.node.y = reelCom.node.y - moveY;
                totalDt += dt;
                if (totalDt > duration) {
                    reelCom.unscheduleAllCallbacks();
                    reelCom.resetPositionOfReelComponents();
                    state.setDone();
                }
            }, 0.01);
        });

        state.addOnEndCallback(() => {
            reelCom.unscheduleAllCallbacks();
        });

        return state;
    }

    // ===================== 普通模式 - 符号渐隐为空状态 =====================
    public getShowLastSymbolToBlank(reelCom: Reel, reelStrip: any, duration: number, subGameKey: string): State {
        const state = new State();
        const reelData = reelStrip.getReel(reelCom.reelindex);
        const symbolHeight = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex].symbolHeight;

        reelCom.setNextSymbolIdCallback(() => {
            if (reelData.getNextSymbolId() === 0 && reelCom.getLastSymbol().symbolId === 0) {
                reelData.increaseNextSymbolIndex();
            } else if (reelData.getNextSymbolId() !== 0 && reelCom.getLastSymbol().symbolId !== 0) {
                reelData.increaseNextSymbolIndex();
            }
            const symbolId = reelData.getNextSymbolId();
            reelData.increaseNextSymbolIndex();
            return symbolId;
        });

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            const moveY = reelCom.getLastSymbol().symbolId === 0 ? 2 * symbolHeight : 3 * symbolHeight;
            const moveAct = cc.moveBy(duration, new cc.Vec2(0, -moveY));
            const endCall = cc.callFunc(() => state.setDone());
            reelCom.node.runAction(cc.sequence([moveAct, cc.delayTime(duration), endCall]));
        });

        return state;
    }

    // ===================== 普通模式 - 旋转至停止前状态(标准版) =====================
    public getReelSpinStateUntileStopBeforeReel(reelControllers: any[], reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);
        
        if (!TSUtility.isValid(reelData)) cc.log("break");
        reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            let totalDelay = 0;
            let symbolSpeed = 0;
            let symbolHeight = 0;

            // 累加前置滚轮延迟
            for (let i = 0; i < reelControllers.length; i++) {
                const targetReel = reelControllers[i].getComponent(Reel);
                if (targetReel.node.active && targetReel.reelindex < reelCom.reelindex) {
                    totalDelay += targetReel.getReelSpinTime(subGameKey);
                    totalDelay += targetReel.getReelStopTime(subGameKey);
                }
            }

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                symbolHeight = spinCtrl.symbolHeight;
            }

            const moveTimeRate = totalDelay / symbolSpeed;
            const moveAct = cc.moveBy(totalDelay, new cc.Vec2(0, -moveTimeRate * symbolHeight));
            
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
        });

        return state;
    }

    // ===================== 普通模式 - 旋转至停止前状态(升级版 Renewal) =====================
    public getReelSpinStateUntileStopBeforeReelRenewal(reelControllers: any[], reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);
        
        reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            let totalDelay = 0;
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            let symbolSpeed = 0;
            let symbolHeight = 0;

            // 累加前置滚轮延迟
            for (let i = 0; i < reelControllers.length; i++) {
                const targetReel = reelControllers[i].getComponent(Reel);
                if (targetReel.node.active && targetReel.reelindex < reelCom.reelindex) {
                    totalDelay += targetReel.getReelSpinTimeRenewal(reelControllers, spinRequestTime, subGameKey);
                    totalDelay += targetReel.getReelStopTime(subGameKey);
                }
            }

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                symbolHeight = spinCtrl.symbolHeight;
            }

            const moveTimeRate = totalDelay / symbolSpeed;
            const moveAct = cc.moveBy(totalDelay, new cc.Vec2(0, -moveTimeRate * symbolHeight));
            
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
        });

        return state;
    }

    // ===================== 普通模式 - 当前滚轮旋转状态(标准版) =====================
    public getReelSpinStateCurrentReel(reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);
            let spinTime = 0;
            let symbolSpeed = 0;
            let maxSpeed = 0;

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                maxSpeed = spinCtrl.maxSpeedInExpectEffect;
            }

            spinTime = reelCom.getReelSpinTime(subGameKey);
            const useSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelCom.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) ? maxSpeed : symbolSpeed;
            const moveCount = Math.floor(spinTime / useSpeed);
            const moveAct = cc.moveBy(spinTime, new cc.Vec2(0, -moveCount * reelCom.symbolHeight));

            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
            reelCom.update();
            if (reelCom.reelindex == SlotGameRuleManager.Instance._slotWindows.size - 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    // ===================== 普通模式 - 当前滚轮旋转状态(升级版 Renewal) =====================
    public getReelSpinStateCurrentReelRenewal(reelControllers: any[], reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelData.checkBlankSymbolAndControlNextSymbolIndex(reelCom);
            let spinTime = 0;
            let symbolSpeed = 0;
            let maxSpeed = 0;
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                maxSpeed = spinCtrl.maxSpeedInExpectEffect;
            }

            spinTime = reelCom.getReelSpinTimeRenewal(reelControllers, spinRequestTime,subGameKey);
            const useSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelCom.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) ? maxSpeed : symbolSpeed;
            const moveCount = Math.floor(spinTime / useSpeed);
            const moveAct = cc.moveBy(spinTime, new cc.Vec2(0, -moveCount * reelCom.symbolHeight));

            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
            reelCom.update();
            if (reelCom.reelindex == SlotGameRuleManager.Instance._slotWindows.size - 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    // ===================== 核心工具 - 缓动函数工厂(18种cc原生缓动算法 1:1复刻) =====================
    public getEaseAction(easingType: string, easingRate: number): any {
        let easeFunc = null;
        switch (easingType) {
            case "easeOut": easeFunc = cc.easeOut(easingRate); break;
            case "easeIn": easeFunc = cc.easeIn(easingRate); break;
            case "easeInOut": easeFunc = cc.easeInOut(easingRate); break;
            case "easeBackIn": easeFunc = cc.easeBackIn(); break;
            case "easeBackOut": easeFunc = cc.easeBackOut(); break;
            case "easeBackInOut": easeFunc = cc.easeBackInOut(); break;
            case "easeBounceIn": easeFunc = cc.easeBounceIn(); break;
            case "easeBounceOut": easeFunc = cc.easeBounceOut(); break;
            case "easeBounceInOut": easeFunc = cc.easeBounceInOut(); break;
            case "easeElasticIn": easeFunc = cc.easeElasticIn(easingRate); break;
            case "easeElasticOut": easeFunc = cc.easeElasticOut(easingRate); break;
            case "easeElasticInOut": easeFunc = cc.easeElasticInOut(easingRate); break;
            case "easeExponentialIn": easeFunc = cc.easeExponentialIn(); break;
            case "easeExponentialOut": easeFunc = cc.easeExponentialOut(); break;
            case "easeExponentialInOut": easeFunc = cc.easeExponentialInOut(); break;
            default: easeFunc = null; break;
        }
        return easeFunc;
    }

    // ===================== 静态工具方法 - 获取结果符号列表 =====================
    public static getResultSymbolList(windowData: any, reelCom: Reel, dummySymbolList: any[]): any[] {
        const symbolList = new Array();
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }
        for (let i = windowData.size - 1; i >= 0; --i) {
            symbolList.push(windowData.getSymbol(i));
        }
        symbolList.length;
        for (let i = 0; i < offset; ++i) {
            symbolList.push(dummySymbolList[Math.floor(Math.random() * dummySymbolList.length)]);
        }
        return symbolList;
    }

    // ===================== 静态工具方法 - 获取结果符号列表(含空白符号) =====================
    public static getResultSymbolListWithBlank(windowData: any, reelCom: Reel, dummySymbolList: any[]): any[] {
        const symbolList = new Array();
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }
        for (let i = windowData.size - 1; i >= 0; --i) {
            const symbol = windowData.getSymbol(i);
            symbolList.push(symbol);
        }
        for (let i = symbolList.length - 1, j = 0; j < offset; ++j) {
            if (symbolList[i] === 0) {
                if (j % 2 === 0) {
                    const randomIdx = Math.floor(Math.random() * dummySymbolList.length);
                    symbolList.push(dummySymbolList[randomIdx]);
                } else {
                    symbolList.push(0);
                }
            } else {
                if (j % 2 !== 0) {
                    const randomIdx = Math.floor(Math.random() * dummySymbolList.length);
                    symbolList.push(dummySymbolList[randomIdx]);
                } else {
                    symbolList.push(0);
                }
            }
        }
        return symbolList;
    }

    // ===================== 下落消除 - 滚轮旋转状态 =====================
    public getCascadeReelSpinState(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo = null): State {
        const state = new State();
        let action = null;
        let symbolHeight = 0;
        let symbolSpeed = 0;
        let cascadeColDelay = 0;
        let cascadeRowDelay = 0;

        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolHeight = spinCtrl.symbolHeight;
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            cascadeColDelay = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).cascadeDelayCol;
            cascadeRowDelay = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).cascadeDelayRow;
        }

        Math.abs(symbolSpeed * symbolHeight);

        state.addOnStartCallback(() => {
            // 符号重排
            let fillIdx = 0;
            for (let i = reelCom.visibleRow - 1; i >= 0; --i) {
                if (reelCom.symbolArray[i]) {
                    if (i !== reelCom.visibleRow - 1 - fillIdx) {
                        reelCom.symbolArray[reelCom.visibleRow - 1 - fillIdx] = reelCom.symbolArray[i];
                        reelCom.symbolArray[i] = null;
                    }
                    fillIdx++;
                }
            }

            // 生成空白符号节点
            const blankIdxList = [];
            for (let i = reelCom.visibleRow - 1; i >= 0; --i) {
                if (!reelCom.symbolArray[i]) {
                    const symbolId = symbolList[i];
                    reelCom.symbolArray[i] = reelCom.getSymbolNode(symbolId, null);
                    reelCom.node.addChild(reelCom.symbolArray[i]);
                    reelCom.symbolArray[i].x = 0;
                    reelCom.symbolArray[i].y = (reelCom.visibleRow + 1) * reelCom.symbolHeight / 2;
blankIdxList.push(i);
                }
            }

            // 下落动作编排
            const endCall = cc.callFunc(() => {
                let completeCount = 0;
                const playFallAnim = (rowIdx: number) => {
                    const targetY = -rowIdx * reelCom.symbolHeight;
                    if (reelCom.symbolArray[rowIdx].y !== targetY) {
                        const symbolNode = reelCom.symbolArray[rowIdx];
                        const symbolId = symbolNode.getComponent(Symbol).symbolId;
                        symbolNode.runAction(cc.sequence(
                            cc.delayTime(completeCount),
                            cc.moveTo(symbolSpeed, 0, targetY),
                            cc.callFunc(() => {
                                SlotSoundController.Instance().playAudio("ReelStop", "FX");
                                const reelCtrl = reelCom.getComponent(ReelController_Base);
                                if (blankIdxList.indexOf(rowIdx) === -1) {
                                    reelCtrl.processSymbolCascadeEnd(rowIdx, symbolId, false, () => {
                                        completeCount++;
                                        if (completeCount === reelCom.visibleRow) state.setDone();
                                    });
                                } else {
                                    reelCtrl.processSymbolCascadeEnd(rowIdx, symbolId, true, () => {
                                        completeCount++;
                                        if (completeCount === reelCom.visibleRow) state.setDone();
                                    });
                                }
                            })
                        ));
                    } else {
                        completeCount++;
                        if (completeCount === reelCom.visibleRow) state.setDone();
                    }
                    completeCount += cascadeColDelay * SlotManager.Instance.reelMachine.reels.length + cascadeRowDelay;
                };

                for (let i = reelCom.visibleRow - 1; i >= 0; --i) {
                    playFallAnim(i);
                }
            });

            action = reelCom.node.runAction(cc.sequence(cc.delayTime(cascadeColDelay * reelCom.reelindex), endCall));
        });

        state.addOnEndCallback(() => {
            reelCom.node.stopAction(action);
            for (let i = reelCom.visibleRow - 1; i >= 0; --i) {
                const targetY = -i * reelCom.symbolHeight;
                reelCom.symbolArray[i].y = targetY;
            }
        });

        return state;
    }

    // ===================== 对抗模式 - 预旋转(上下抖动)状态 =====================
    public getOppositionPreSpinDownUpState(reelCom: Reel, windowData: any, subGameKey: string): State {
        const state = new State();
        let action = null;

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_UP);
            reelCom.originalYPos = reelCom.node.y;
            let easingType = null;
            let easingRate = null;
            let duration = null;
            let distance = null;
            let symbolSpeed = null;

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                easingType = spinCtrl.preEasingType;
                easingRate = spinCtrl.preEasingRate;
                duration = spinCtrl.preEasingDuration;
                distance = spinCtrl.preEasingDistance;
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            }

            if (duration <= 0) {
                state.setDone();
                return;
            }

            const easeAct = this.getEaseAction(easingType, easingRate);
            const moveDown = cc.moveBy(duration, new cc.Vec2(0, -distance)).easing(easeAct);
            const moveUp = cc.moveBy(symbolSpeed / 5, new cc.Vec2(0, +distance));
            action = reelCom.node.runAction(cc.sequence(moveDown, moveUp, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
        });

        return state;
    }

    // ===================== 对抗模式 - 无限旋转状态 =====================
    public getOppositionInfiniteSpinState(reelCom: Reel, reelStrip: any, subGameKey: string, speed: number = null, isReset: number = null, symbolIdx: number = null): State {
        const state = new State();
        const reelData = reelStrip.getReel(reelCom.reelindex);
        let symbolSpeed = 0;
        let symbolHeight = 0;

        reelData.checkBlankSymbolAndControlNextSymbolIndexOpossitionReel(reelCom);
        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
            symbolHeight = spinCtrl.symbolHeight;
        }

        speed && (symbolSpeed = speed);
        if (isReset === 0) {
            symbolIdx ? reelData.setNextSymbolIndex(symbolIdx) : reelData.setNextSymbolIndex(0);
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_UP);
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            reelCom.schedule((dt) => {
                const moveY = dt / symbolSpeed * symbolHeight;
                reelCom.node.y = reelCom.node.y + moveY;
            }, 0.01);
        });

        state.addOnEndCallback(() => {
            const moveY = 0.02 / symbolSpeed * symbolHeight;
            reelCom.node.y = reelCom.node.y + moveY;
            reelCom.unscheduleAllCallbacks();
        });

        return state;
    }

    // ===================== 对抗模式 - 旋转至停止前状态 =====================
    public getReelOppositionSpinStateUntileStopBeforeReel(reelControllers: any[], reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);
        
        reelData.checkBlankSymbolAndControlNextSymbolIndexOpossitionReel(reelCom);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_UP);
            let totalDelay = 0;
            let symbolSpeed = 0;
            let symbolHeight = 0;

            // 累加前置滚轮延迟
            for (let i = 0; i < reelControllers.length; i++) {
                const targetReel = reelControllers[i].getComponent(Reel);
                if (targetReel.node.active && targetReel.reelindex < reelCom.reelindex) {
                    totalDelay += targetReel.getReelSpinTime(subGameKey);
                    totalDelay += targetReel.getReelStopTime(subGameKey);
                }
            }

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                symbolHeight = spinCtrl.symbolHeight;
            }

            const moveTimeRate = totalDelay / symbolSpeed;
            const moveAct = cc.moveBy(totalDelay, new cc.Vec2(0, moveTimeRate * symbolHeight));
            
            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndexOppossition();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
        });

        return state;
    }

    // ===================== 对抗模式 - 当前滚轮旋转状态 =====================
    public getReelOppositionSpinStateCurrentReel(reelCom: Reel, reelStrip: any, subGameKey: string): State {
        const state = new State();
        let action = null;
        const reelData = reelStrip.getReel(reelCom.reelindex);

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_UP);
            reelData.checkBlankSymbolAndControlNextSymbolIndexOpossitionReel(reelCom);
            let spinTime = 0;
            let symbolSpeed = 0;
            let maxSpeed = 0;

            if (subGameKey) {
                const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
                symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
                maxSpeed = spinCtrl.maxSpeedInExpectEffect;
            }

            spinTime = reelCom.getReelSpinTime(subGameKey);
            const useSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelCom.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) ? maxSpeed : symbolSpeed;
            const moveCount = Math.floor(spinTime / useSpeed);
            const moveAct = cc.moveBy(spinTime, new cc.Vec2(0, moveCount * reelCom.symbolHeight));

            reelCom.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndexOppossition();
                return symbolId;
            });

            action = reelCom.node.runAction(cc.sequence(moveAct, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(() => {
            if (action && !action.isDone()) {
                reelCom.node.stopAction(action);
            }
            reelCom.update();
            if (reelCom.reelindex == SlotGameRuleManager.Instance._slotWindows.size - 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    // ===================== 对抗模式 - 滚轮移动到目标符号列表(核心方法) =====================
    public getReelOppositionMoveStateWithLastSymbolListNew(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo, symbolInfoList: any[] = null, specialInfoList: any[] = null): State {
        const state = new State();
        let action = null;
        let symbolIdx = symbolList.length;
        let infoIdx = symbolList.length;
        let specialIdx = TSUtility.isValid(specialInfoList) ? specialInfoList.length : 0;
        let symbolHeight = 0;
        let symbolSpeed = 0;

        if (subGameKey) {
            const spinCtrl = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
            symbolHeight = spinCtrl.symbolHeight;
            symbolSpeed = spinCtrl.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            reelCom.setReelSpinDirection(Reel.SPINDIRECTION_UP);
            const firstSymbol = reelCom.getFirstSymbolForOppositionReel();
            const lastSymbol = reelCom.getLastSymbol();
            const firstSymbolY = reelCom.getPositionY(firstSymbol.node.y);
            const lastSymbolY = reelCom.getPositionY(lastSymbol.node.y);
            const bufferOffset = reelCom.bufferRow * symbolHeight;

            let targetY: number;
            let easeDistance: number;
            if (easingInfo) {
                targetY = symbolList.length * symbolHeight + (bufferOffset - lastSymbolY) - easingInfo.easingDistance;
                easeDistance = easingInfo.easingDistance;
            } else {
                targetY = symbolList.length * symbolHeight + (bufferOffset - lastSymbolY);
            }

            const moveTime = Math.abs(symbolSpeed * (targetY / symbolHeight));
            const moveAct = cc.moveBy(moveTime, new cc.Vec2(0, targetY));
            let easeAct = null;

            if (easingInfo) {
                const easeFunc = this.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easeAct = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, easeDistance)).easing(easeFunc);
            }

            // 符号ID回调 (倒序)
            reelCom.setNextSymbolIdCallback(() => {
                if (symbolIdx - 1 < 0) return void 0;
                const symbolId = symbolList[symbolIdx - 1];
                symbolIdx--;
                return symbolId;
            });

            // 符号信息回调 (倒序)
            reelCom.setNextSymbolInfoCallback(() => {
                let info = null;
                if (symbolInfoList && infoIdx - 1 >= 0) {
                    info = symbolInfoList[infoIdx - 1];
                    infoIdx--;
                }
                return info;
            });

            // 特殊符号信息回调 (倒序)
            reelCom.setNextSpecialInfoCallback(() => {
                let info = null;
                if (specialInfoList && specialIdx - 1 >= 0) {
                    info = specialInfoList[specialIdx - 1];
                    specialIdx--;
                }
                return info;
            });

            const endCall = cc.callFunc(() => state.setDone());
            if (!easeAct) {
                action = reelCom.node.runAction(cc.sequence(moveAct, endCall));
            } else if (easingInfo.onEasingStartFuncList.length > 0) {
                const easeStartCall = cc.callFunc(() => {
                    for (let i = 0; i < easingInfo.onEasingStartFuncList.length; i++) {
                        easingInfo.onEasingStartFuncList[i]();
                    }
                });
                action = reelCom.node.runAction(cc.sequence([moveAct, easeStartCall, easeAct, endCall]));
            } else {
                action = reelCom.node.runAction(cc.sequence([moveAct, easeAct, endCall]));
            }
        });

        state.addOnEndCallback(() => {
            reelCom.node.stopAction(action);
            // 补全剩余符号 (倒序)
            while (symbolIdx > 0) {
                if (symbolIdx > 0) {
                    const symbolId = symbolList[symbolIdx - 1];
                    symbolInfoList && symbolInfoList.length > infoIdx && symbolInfoList[infoIdx];
                    reelCom.pushSymbolAtBottomOfReel(symbolId, null);
                } else {
                    cc.error("invalid status tweenAction ");
                }
                symbolIdx--;
                infoIdx--;
            }
            reelCom.processAfterStopSpin();
        });

        return state;
    }
}