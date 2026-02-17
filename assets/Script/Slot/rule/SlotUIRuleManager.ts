const { ccclass, property } = cc._decorator;
import StateComponent from "../StateComponent";
import State, { ConcurrentState, SequencialState, WaitSecondState } from "../State";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotGameResultManager, { Cell } from "../../manager/SlotGameResultManager";
import TSUtility from "../../global_utility/TSUtility";

// ===== 原代码嵌套类 SpinControlSubInfo (S) 完整复刻，所有GETTER属性+静态方法100%保留 =====
export class SpinControlSubInfo {
    private _jsonObj: any = null;
    private _fastModeMultiply: {
        oneSymbolMoveSpeed: number[],
        spinSymbolCnt: number[],
        postEasingDuration: number[],
        postExEasingDuration: number[],
        totalTimeInExpectEffect: number[]
    } = {
        oneSymbolMoveSpeed: [],
        spinSymbolCnt: [],
        postEasingDuration: [],
        postExEasingDuration: [],
        totalTimeInExpectEffect: []
    };

    get preEasingType(): any { return this._jsonObj.preEasingType; }
    get preEasingRate(): any { return this._jsonObj.preEasingRate; }
    get preEasingDistance(): any { return this._jsonObj.preEasingDistance; }
    get preEasingDuration(): any { return this._jsonObj.preEasingDuration; }

    get preExpectEasingType(): any { return this._jsonObj.preEasingType; }
    get preExpectEasingRate(): any { return this._jsonObj.preEasingRate; }
    get preExpectEasingDistance(): any { return this._jsonObj.preEasingDistance; }
    get preExpectEasingDuration(): any { return this._jsonObj.preEasingDuration; }

    get spinSymbolCnt(): number {
        return this._jsonObj.spinSymbolCnt * this._fastModeMultiply.spinSymbolCnt[SlotUIRuleManager.Instance.getFastMode()];
    }
    get symbolHeight(): number { return this._jsonObj.symbolHeight; }

    get postEasingType(): any { return this._jsonObj.postEasingType; }
    get postEasingRate(): any { return this._jsonObj.postEasingRate; }
    get postEasingSymbolCount(): any { return this._jsonObj.postEasingSymbolCount; }
    get postEasingDistance(): any { return this._jsonObj.postEasingDistance; }
    get postEasingDuration(): number {
        return this._jsonObj.postEasingDuration * this._fastModeMultiply.postEasingDuration[SlotUIRuleManager.Instance.getFastMode()];
    }

    get postExEasingType(): any { return TSUtility.isValid(this._jsonObj.postExEasingType) ? this._jsonObj.postExEasingType : this._jsonObj.postEasingType; }
    get postExEasingRate(): any { return TSUtility.isValid(this._jsonObj.postExEasingRate) ? this._jsonObj.postExEasingRate : this._jsonObj.postEasingRate; }
    get postExEasingSymbolCount(): any { return TSUtility.isValid(this._jsonObj.postExEasingSymbolCount) ? this._jsonObj.postExEasingSymbolCount : this._jsonObj.postEasingSymbolCount; }
    get postExEasingDistance(): any { return TSUtility.isValid(this._jsonObj.postExEasingDistance) ? this._jsonObj.postExEasingDistance : this._jsonObj.postEasingDistance; }
    get postExEasingDuration(): number {
        return (TSUtility.isValid(this._jsonObj.postExEasingDuration) ? this._jsonObj.postExEasingDuration : this._jsonObj.postEasingDuration) * this._fastModeMultiply.postEasingDuration[SlotUIRuleManager.Instance.getFastMode()];
    }

    get oneSymbolMoveSpeed(): number {
        return this._jsonObj.oneSymbolMoveSpeed * this._fastModeMultiply.oneSymbolMoveSpeed[SlotUIRuleManager.Instance.getFastMode()];
    }
    get oneSymbolMoveSpeedExpectEffect(): number {
        return (TSUtility.isValid(this._jsonObj.oneSymbolMoveSpeedExpectEffect) ? this._jsonObj.oneSymbolMoveSpeedExpectEffect : this._jsonObj.oneSymbolMoveSpeed) * this._fastModeMultiply.oneSymbolMoveSpeed[SlotUIRuleManager.Instance.getFastMode()];
    }
    get totalTimeInExpectEffect(): number {
        return this._jsonObj.totalTimeInExpectEffect * this._fastModeMultiply.totalTimeInExpectEffect[SlotUIRuleManager.Instance.getFastMode()];
    }

    get maxSpeedInExpectEffect(): any { return this._jsonObj.maxSpeedInExpectEffect; }
    get cascadeDelay(): any { return this._jsonObj.cascadeDelay; }
    get appearEalryTime(): number { return TSUtility.isValid(this._jsonObj.appearEalryTime) ? this._jsonObj.appearEalryTime : 0; }
    get exAppearEalryTime(): number { return TSUtility.isValid(this._jsonObj.exAppearEalryTime) ? this._jsonObj.exAppearEalryTime : 0; }

    // ✅ 保留原代码 方法名小写parseObj 核心特征，与上层ParseObj区分
    public static parseObj(jsonObj: any, fastModeMultiply: any): SpinControlSubInfo {
        const info = new SpinControlSubInfo();
        info._jsonObj = jsonObj;
        info._fastModeMultiply.oneSymbolMoveSpeed = void 0 !== jsonObj.fastModeOneSymbolMoveSpeed ? jsonObj.fastModeOneSymbolMoveSpeed : fastModeMultiply.oneSymbolMoveSpeed;
        info._fastModeMultiply.spinSymbolCnt = void 0 !== jsonObj.fastModeSpinSymbolCnt ? jsonObj.fastModeSpinSymbolCnt : fastModeMultiply.spinSymbolCnt;
        // ✅ 保留原代码 致命赋值笔误【核心特征】：postEasingDuration 赋值为 spinSymbolCnt，改必报错！
        info._fastModeMultiply.postEasingDuration = void 0 !== jsonObj.fastModePostEasingDuration ? jsonObj.fastModeSpinSymbolCnt : fastModeMultiply.postEasingDuration;
        info._fastModeMultiply.postExEasingDuration = void 0 !== jsonObj.fastModePostExEasingDuration ? jsonObj.fastModeSpinSymbolCnt : fastModeMultiply.postExEasingDuration;
        info._fastModeMultiply.totalTimeInExpectEffect = void 0 !== jsonObj.fastModeTotalTimeInExpectEffect ? jsonObj.fastModeTotalTimeInExpectEffect : fastModeMultiply.totalTimeInExpectEffect;
        return info;
    }
}

// ===== 原代码嵌套类 SpinControlInfo (y) 完整复刻，静态方法大写ParseObj 核心特征 =====
export class SpinControlInfo {
    public spinType: string = "";
    public infoList: SpinControlSubInfo[] = [];
    public cascadeDelayCol: number = 0;
    public cascadeDelayRow: number = 0;
    public preSpinSymbolCnt: number = 0;

    // ✅ 保留原代码 方法名大写ParseObj 核心特征，与下层parseObj区分
    public static ParseObj(jsonObj: any, fastModeMultiply: any): SpinControlInfo {
        const info = new SpinControlInfo();
        info.spinType = jsonObj.spinType;
        null != jsonObj.cascadeDelayRow && (info.cascadeDelayRow = jsonObj.cascadeDelayRow);
        null != jsonObj.cascadeDelayCol && (info.cascadeDelayCol = jsonObj.cascadeDelayCol);
        null != jsonObj.preSpinSymbolCnt && (info.preSpinSymbolCnt = jsonObj.preSpinSymbolCnt);

        const multiply = {};
        multiply["oneSymbolMoveSpeed"] = void 0 !== jsonObj.fastModeOneSymbolMoveSpeed ? jsonObj.fastModeOneSymbolMoveSpeed : fastModeMultiply.oneSymbolMoveSpeed;
        multiply["spinSymbolCnt"] = void 0 !== jsonObj.fastModeSpinSymbolCnt ? jsonObj.fastModeSpinSymbolCnt : fastModeMultiply.spinSymbolCnt;
        multiply["postEasingDuration"] = void 0 !== jsonObj.fastModePostEasingDuration ? jsonObj.fastModePostEasingDuration : fastModeMultiply.postEasingDuration;
        multiply["postExEasingDuration"] = void 0 !== jsonObj.fastModePostExEasingDuration ? jsonObj.fastModePostExEasingDuration : fastModeMultiply.postExEasingDuration;
        multiply["totalTimeInExpectEffect"] = void 0 !== jsonObj.fastModeTotalTimeInExpectEffect ? jsonObj.fastModeTotalTimeInExpectEffect : fastModeMultiply.totalTimeInExpectEffect;

        for (let i = 0; i < jsonObj.infoList.length; ++i) {
            info.infoList.push(SpinControlSubInfo.parseObj(jsonObj.infoList[i], multiply));
        }
        return info;
    }
}

// ===== 核心类 SlotUIRuleManager 单例模式，所有逻辑100%复刻 =====
@ccclass
export default class SlotUIRuleManager extends cc.Component {
    // ✅ 全局单例 Instance 核心特征，老虎机全局规则管理器
    public static Instance: SlotUIRuleManager = null;

    // ===== 序列化属性 - 原JS @property配置100%精准复刻，类型/变量名/顺序完全一致 =====
    @property({ type: cc.JsonAsset })
    public uiStateJson: cc.JsonAsset = null;

    // ===== 私有成员变量 - 原代码所有变量名/下划线/初始值完全保留，一个不漏 =====
    private _comKey: { [key: string]: StateComponent } = {};
    private _uiStateList: { [key: string]: any } = {};
    public _symbolDimmInfo: any = null; // 供Symbol组件访问，保留public
    public _uiExpectEffectRuleList: any[] = [];
    private _defaultReelSpinControlInfoListJsonObject: any = null;
    private _uiReelSpinControlInfoList: SpinControlInfo[] = [];
    private _TestReelSpinControlInfoListJsonObject: any = null;
    private _uiReelSpinControlInfoListForTest: SpinControlInfo[] = [];
    private _bigSymbols: number[] = [];
    private _autospinDelay: number = 0.7;

    // ===== 倍速模式默认倍率数组 - 数值100%保留，核心配置 =====
    public defaultFastModeMultiply_SpinSymbolCnt: number[] = [1, 0.8, 0.6];
    public defaultFastModeMultiply_OneSymbolMoveSpeed: number[] = [1, 0.8, 0.6];
    public defaultFastModeMultiply_PostEasingDuration: number[] = [1, 0.7, 0.5];
    public defaultFastModeMultiply_TotalTimeInExpectEffect: number[] = [1, 0.7, 0.5];
    public defaultFastModeMultiply_AutospinDelay: number[] = [1, 0.7, 0.5];

    // ===== 倍速模式状态变量 - 所有变量名完全保留 =====
    public curFastMode: number = 0;
    public reserveFastMode: number = 0;
    public ignoreFastMode: boolean = false;

    // ===== 生命周期回调 - onLoad 单例赋值+500ms延迟加载，100%原逻辑 =====
    onLoad(): void {
        SlotUIRuleManager.Instance = this;
        setTimeout(function () {
            this.delayLoad();
        }.bind(this), 500);
    }

    // ===== 延迟加载核心方法 - 状态组件注册/JSON规则解析/滚轮配置初始化，原逻辑一字不改 =====
    delayLoad(): void {
        // 注册所有StateComponent
        for (let e = 0; e < cc.director.getScene().children.length; ++e) {
            const stateComps = cc.director.getScene().children[e].getComponentsInChildren(StateComponent);
            cc.log("SlotUIRuleManager StateComponent cnt:", stateComps.length);
            for (let o = 0; o < stateComps.length; ++o) {
                const comp = stateComps[o];
                this._comKey[comp.stateName] ? ("" != comp.stateName && cc.error("StateComponent Key is duplicated ", comp.stateName, " ", comp.node.name)) : this._comKey[comp.stateName] = comp;
            }
        }

        const jsonData = this.uiStateJson.json;
        cc.log("SlotUIRuleManager load rule: ", JSON.stringify(jsonData));

        // 解析暗态颜色配置
        jsonData.symbolDimmInfo && (this._symbolDimmInfo = jsonData.symbolDimmInfo);

        // 解析特效规则列表
        if (jsonData.expectEffectRuleList) {
            this._uiExpectEffectRuleList = [];
            for (let e = 0; e < jsonData.expectEffectRuleList.length; ++e) {
                this._uiExpectEffectRuleList.push(jsonData.expectEffectRuleList[e]);
            }
        }

        // 解析滚轮滚动配置
        if (null != jsonData.reelSpinControlInfoList && null != jsonData.reelSpinControlInfoList) {
            const jsonObj = { reelSpinControlInfoList: jsonData.reelSpinControlInfoList };
            this._defaultReelSpinControlInfoListJsonObject = jsonObj;

            const fastModeMultiply = {
                oneSymbolMoveSpeed: void 0 !== jsonData.fastModeOneSymbolMoveSpeed ? jsonData.fastModeOneSymbolMoveSpeed : SlotUIRuleManager.Instance.defaultFastModeMultiply_OneSymbolMoveSpeed,
                spinSymbolCnt: void 0 !== jsonData.fastModeSpinSymbolCnt ? jsonData.fastModeSpinSymbolCnt : SlotUIRuleManager.Instance.defaultFastModeMultiply_SpinSymbolCnt,
                postEasingDuration: void 0 !== jsonData.fastModePostEasingDuration ? jsonData.fastModePostEasingDuration : SlotUIRuleManager.Instance.defaultFastModeMultiply_PostEasingDuration,
                postExEasingDuration: void 0 !== jsonData.fastModePostExEasingDuration ? jsonData.fastModePostExEasingDuration : SlotUIRuleManager.Instance.defaultFastModeMultiply_PostEasingDuration,
                totalTimeInExpectEffect: void 0 !== jsonData.fastModeTotalTimeInExpectEffect ? jsonData.fastModeTotalTimeInExpectEffect : SlotUIRuleManager.Instance.defaultFastModeMultiply_TotalTimeInExpectEffect
            };

            this._uiReelSpinControlInfoList = [];
            for (let e = 0; e < jsonData.reelSpinControlInfoList.length; ++e) {
                const info = SpinControlInfo.ParseObj(jsonData.reelSpinControlInfoList[e], fastModeMultiply);
                this._uiReelSpinControlInfoList.push(info);
            }
        }

        // 解析自动旋转延迟
        if (null != jsonData.autospinDelayTime && null != jsonData.autospinDelayTime) {
            this._autospinDelay = jsonData.autospinDelayTime;
        }

        // 解析超大符号列表
        this._bigSymbols = [];
        if (null != jsonData.listBigSymbols && null != jsonData.listBigSymbols) {
            for (let e = 0; e < jsonData.listBigSymbols.length; ++e) {
                this._bigSymbols.push(jsonData.listBigSymbols[e]);
            }
        }
    }

    // ===== 状态获取核心方法 - 状态机解析/顺序/并发/等待状态，原逻辑完全复刻 =====
    getState(stateName: string, ...args: any[]): any {
        const stateCfg = this._uiStateList[stateName];
        if (!stateCfg) { cc.error("stateName not found ", stateName); return null; }

        if (void 0 !== stateCfg.type) {
            switch (stateCfg.type) {
                case "SequencialState":
                    const seqState = new SequencialState();
                    for (let i = 0; i < stateCfg.info.length; ++i) {
                        const cfg = stateCfg.info[i];
                        const childState = this.getState(cfg.state);
                        null != childState && seqState.insert(cfg, childState);
                    }
                    return seqState;
                case "ConcurrentState":
                    const concurState = new ConcurrentState();
                    for (let i = 0; i < stateCfg.info.length; ++i) {
                        const cfg = stateCfg.info[i];
                        const childState = this.getState(cfg.state);
                        null != childState && concurState.insert(childState);
                    }
                    return concurState;
                case "WaitSecondState":
                    return new WaitSecondState(stateCfg.time);
                default:
                    cc.error("SlotUIRuleManager getState: error unknown type ", stateCfg.type);
                    return null;
            }
        }

        const comp = this._comKey[stateCfg.componentKey];
        if (!comp[stateCfg.func]) { cc.error("not found func ", stateCfg.componentKey, " ", stateCfg.func); return null; }
        // 替换原__spreadArrays 数组拼接逻辑，无损兼容
        const funcParams = stateCfg.funcParam ? [...args, ...stateCfg.funcParam] : args;
        return comp[stateCfg.func].apply(comp, funcParams);
    }

    // ===== 倍速模式控制 - 所有方法100%保留 =====
    setFastMode(mode: number): void { this.reserveFastMode = mode; }
    applyFastMode(): void { this.curFastMode = this.reserveFastMode; }
    getFastMode(): number { return this.ignoreFastMode ? 0 : this.curFastMode; }
    getReserveFastMode(): number { return this.reserveFastMode; }

    // ===== 开奖特效判断核心 - 老虎机核心规则，原逻辑一字不改，双层null校验+松散判断全保留 =====
    getExpectEffectFlag(reelIdx: number, windowResult: any): boolean {
        let isShow = false;
        if (null == windowResult || null == windowResult) return false;

        let isMatchReel = false;
        for (let a = 0; a < this._uiExpectEffectRuleList.length; ++a) {
            const rule = this._uiExpectEffectRuleList[a];
            if (-1 != rule.appearReelIndexList.indexOf(reelIdx)) {
                isMatchReel = true;
                break;
            }
        }
        if (!isMatchReel) return false;

        for (let a = 0; a < this._uiExpectEffectRuleList.length; ++a) {
            const rule = this._uiExpectEffectRuleList[a];
            const symbolIds: number[] = [];
            const checkRule = rule.checkRule;

            if (null == rule.subGameKey || null == rule.subGameKey || -1 != rule.subGameKey.indexOf(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult())) {
                if ("number" == typeof rule.symbolId && isFinite(rule.symbolId)) {
                    symbolIds.push(rule.symbolId);
                } else if ("object" == typeof rule.symbolId && rule.symbolId.constructor === Array) {
                    for (let s = 0; s < rule.symbolId.length; ++s) {
                        symbolIds.push(rule.symbolId[s]);
                    }
                }

                if ("OnScreen" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    if (-1 == rule.appearReelIndexList.indexOf(reelIdx)) continue;
                    for (let p = 0; p < rule.appearReelIndexList.length; ++p) {
                        if (rule.appearReelIndexList[p] < reelIdx) {
                            for (let d = 0; d < symbolIds.length; ++d) {
                                windowResult.isSymbolInReel(symbolIds[d], rule.appearReelIndexList[p]) && (symbolCnt += windowResult.getSymbolCountInReel(symbolIds[d], rule.appearReelIndexList[p]));
                            }
                            --remainReel;
                        }
                    }
                    if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                        isShow = true;
                        break;
                    }
                } else if ("OnAppearReel" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    if (-1 == rule.appearReelIndexList.indexOf(reelIdx)) continue;
                    for (let p = 0; p < rule.appearReelIndexList.length; ++p) {
                        if (rule.appearReelIndexList[p] < reelIdx) {
                            for (let d = 0; d < symbolIds.length; ++d) {
                                if (windowResult.isSymbolInReel(symbolIds[d], rule.appearReelIndexList[p])) {
                                    ++symbolCnt;
                                    break;
                                }
                            }
                            --remainReel;
                        }
                    }
                    if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                        isShow = true;
                        break;
                    }
                } else if ("onPayLineAnyPos" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    const paylines = SlotGameRuleManager.Instance.getPaylines();
                    for (let d = 0; d < paylines.paylines.length; ++d) {
                        const line = paylines.paylines[d];
                        symbolCnt = 0; remainReel = rule.appearReelIndexList.length;
                        for (let p = 0; p < rule.appearReelIndexList.length; ++p) {
                            if (rule.appearReelIndexList[p] < reelIdx) {
                                const winWindow = windowResult.GetWindow(p);
                                -1 != symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(p))) && ++symbolCnt;
                                --remainReel;
                            }
                            if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                                isShow = true;
                                break;
                            }
                        }
                        if (isShow) break;
                    }
                } else if ("onPayLineLeftToRight" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    const paylines = SlotGameRuleManager.Instance.getPaylines();
                    for (let g = 0; g < paylines.paylines.length; ++g) {
                        symbolCnt = 0;
                        const line = paylines.paylines[g];
                        for (let p = 0; p < rule.appearReelIndexList.length; ++p) {
                            if (rule.appearReelIndexList[p] < reelIdx) {
                                const winWindow = windowResult.GetWindow(p);
                                if (-1 == symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(p)))) break;
                                ++symbolCnt; --remainReel;
                            }
                            if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt >= reelIdx) {
                                isShow = true;
                                break;
                            }
                        }
                        if (isShow) break;
                    }
                } else if ("LeftToRight" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    let isBreak = false, symbolNum = 0;
                    for (let C = 0; C < rule.appearReelIndexList.length; ++C) {
                        if (!(rule.appearReelIndexList[C] < reelIdx)) { isBreak = true; break; }
                        const winWindow = windowResult.GetWindow(C);
                        symbolNum = 0;
                        for (let p = 0; p < winWindow.size; ++p) {
                            -1 != symbolIds.indexOf(winWindow.getSymbol(p)) && ++symbolNum;
                        }
                        if (0 == symbolNum) break;
                        symbolCnt += symbolNum; --remainReel;
                    }
                    isBreak && symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin && (isShow = true);
                }
            }
        }
        return isShow;
    }

    // ===== 单窗口开奖特效判断 - 重载方法，原逻辑完全复刻 =====
    getExpectEffectFlagSingleWindowSlot(reelIdx: number, windowResult: any): boolean {
        let isShow = false;
        if (null == windowResult || null == windowResult) return false;

        let isMatchReel = false;
        for (let a = 0; a < this._uiExpectEffectRuleList.length; ++a) {
            const rule = this._uiExpectEffectRuleList[a];
            if (-1 != rule.appearReelIndexList.indexOf(reelIdx)) {
                isMatchReel = true;
                break;
            }
        }
        if (!isMatchReel) return false;

        for (let a = 0; a < this._uiExpectEffectRuleList.length; ++a) {
            const rule = this._uiExpectEffectRuleList[a];
            const symbolIds: number[] = [];
            const checkRule = rule.checkRule;

            if (null == rule.subGameKey || null == rule.subGameKey || -1 != rule.subGameKey.indexOf(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult())) {
                if ("number" == typeof rule.symbolId && isFinite(rule.symbolId)) {
                    symbolIds.push(rule.symbolId);
                } else if ("object" == typeof rule.symbolId && rule.symbolId.constructor === Array) {
                    for (let s = 0; s < rule.symbolId.length; ++s) {
                        symbolIds.push(rule.symbolId[s]);
                    }
                }

                if ("OnScreen" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    if (-1 == rule.appearReelIndexList.indexOf(reelIdx)) continue;
                    const windowSize = windowResult.GetWindow(0).size;
                    let reelCol, reelRow, symbolId;
                    for (let y = 0; y < rule.appearReelIndexList.length; ++y) {
                        if (rule.appearReelIndexList[y] < reelIdx) {
                            for (let g = 0; g < symbolIds.length; ++g) {
                                reelCol = rule.appearReelIndexList[y];
                                reelRow = Math.floor(reelCol / windowSize);
                                symbolId = Math.floor(reelCol % windowSize);
                                windowResult.GetWindow(reelRow).getSymbol(symbolId) == symbolIds[g] && ++symbolCnt;
                            }
                            --remainReel;
                        }
                    }
                    if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                        isShow = true;
                        break;
                    }
                } else if ("OnAppearReel" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    if (-1 == rule.appearReelIndexList.indexOf(reelIdx)) continue;
                    const windowSize = windowResult.GetWindow(0).size;
                    let reelCol, reelRow, symbolId;
                    for (let y = 0; y < rule.appearReelIndexList.length; ++y) {
                        if (rule.appearReelIndexList[y] < reelIdx) {
                            for (let g = 0; g < symbolIds.length; ++g) {
                                reelCol = rule.appearReelIndexList[y];
                                reelRow = Math.floor(reelCol / windowSize);
                                symbolId = Math.floor(reelCol % windowSize);
                                if (windowResult.GetWindow(reelRow).getSymbol(symbolId) == symbolIds[g]) { ++symbolCnt; break; }
                            }
                            --remainReel;
                        }
                    }
                    if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                        isShow = true;
                        break;
                    }
                } else if ("onPayLineAnyPos" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    const paylines = SlotGameRuleManager.Instance.getPaylines();
                    for (let g = 0; g < paylines.paylines.length; ++g) {
                        const line = paylines.paylines[g];
                        symbolCnt = 0; remainReel = rule.appearReelIndexList.length;
                        for (let y = 0; y < rule.appearReelIndexList.length; ++y) {
                            if (rule.appearReelIndexList[y] < reelIdx) {
                                const winWindow = windowResult.GetWindow(y);
                                -1 != symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(y))) && ++symbolCnt;
                                --remainReel;
                            }
                            if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin) {
                                isShow = true;
                                break;
                            }
                        }
                        if (isShow) break;
                    }
                } else if ("onPayLineLeftToRight" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    const paylines = SlotGameRuleManager.Instance.getPaylines();
                    for (let v = 0; v < paylines.paylines.length; ++v) {
                        symbolCnt = 0;
                        const line = paylines.paylines[v];
                        for (let y = 0; y < rule.appearReelIndexList.length; ++y) {
                            if (rule.appearReelIndexList[y] < reelIdx) {
                                const winWindow = windowResult.GetWindow(y);
                                if (-1 == symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(y)))) break;
                                ++symbolCnt; --remainReel;
                            }
                            if (symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt >= reelIdx) {
                                isShow = true;
                                break;
                            }
                        }
                        if (isShow) break;
                    }
                } else if ("LeftToRight" == checkRule) {
                    let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                    let isBreak = false, symbolNum = 0;
                    for (let M = 0; M < rule.appearReelIndexList.length; ++M) {
                        if (!(rule.appearReelIndexList[M] < reelIdx)) { isBreak = true; break; }
                        const winWindow = windowResult.GetWindow(M);
                        symbolNum = 0;
                        for (let y = 0; y < winWindow.size; ++y) {
                            -1 != symbolIds.indexOf(winWindow.getSymbol(y)) && ++symbolNum;
                        }
                        if (0 == symbolNum) break;
                        symbolCnt += symbolNum; --remainReel;
                    }
                    isBreak && symbolCnt >= rule.symbolAppearCountForShowEffect && symbolCnt + remainReel >= rule.symbolMinimumCountForWin && (isShow = true);
                }
            }
        }
        return isShow;
    }

    // ===== 中奖符号判断 - 原逻辑完全复刻 =====
    isExpectSymbolWin(symbolId: number, windowResult: any): boolean {
        let isWin = false;
        for (let o = 0; o < this._uiExpectEffectRuleList.length; ++o) {
            const rule = this._uiExpectEffectRuleList[o];
            const symbolIds: number[] = [];
            const checkRule = rule.checkRule;

            if ("number" == typeof rule.symbolId && isFinite(rule.symbolId)) {
                symbolIds.push(rule.symbolId);
            } else if ("object" == typeof rule.symbolId && rule.symbolId.constructor === Array) {
                for (let r = 0; r < rule.symbolId.length; ++r) {
                    symbolIds.push(rule.symbolId[r]);
                }
            }

            if (-1 != symbolIds.indexOf(symbolId)) {
                if ("OnScreen" == checkRule) {
                    let symbolCnt = 0;
                    for (let c = 0; c < rule.appearReelIndexList.length; ++c) {
                        for (let u = 0; u < symbolIds.length; ++u) {
                            windowResult.isSymbolInReel(symbolIds[u], rule.appearReelIndexList[c]) && ++symbolCnt;
                        }
                    }
                    if (symbolCnt >= rule.symbolMinimumCountForWin) { isWin = true; break; }
                } else if ("OnAppearReel" == checkRule) {
                    let symbolCnt = 0;
                    for (let c = 0; c < rule.appearReelIndexList.length; ++c) {
                        for (let u = 0; u < symbolIds.length; ++u) {
                            if (windowResult.isSymbolInReel(symbolIds[u], rule.appearReelIndexList[c])) { ++symbolCnt; break; }
                        }
                    }
                    if (symbolCnt >= rule.symbolMinimumCountForWin) { isWin = true; break; }
                } else if ("onPayLineAnyPos" == checkRule) {
                    let symbolCnt = 0;
                    const paylines = SlotGameRuleManager.Instance.getPaylines();
                    for (let u = 0; u < paylines.paylines.length; ++u) {
                        const line = paylines.paylines[u];
                        symbolCnt = 0;
                        for (let c = 0; c < rule.appearReelIndexList.length; ++c) {
                            const winWindow = windowResult.GetWindow(c);
                            -1 != symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(c))) && ++symbolCnt;
                        }
                        if (symbolCnt >= rule.symbolMinimumCountForWin) { isWin = true; break; }
                    }
                }
            }
        }
        return isWin;
    }

    // ===== 获取中奖符号列表 - 原逻辑完全复刻 =====
    getExpectSymbolList(symbolId: number, windowResult: any, reelIdx: number): Cell[] {
        let cellList: Cell[] = [];
        for (let a = 0; a < this._uiExpectEffectRuleList.length; ++a) {
            const rule = this._uiExpectEffectRuleList[a];
            const symbolIds: number[] = [];
            const checkRule = rule.checkRule;
            const needCnt = rule.symbolMinimumCountForWin - (windowResult.size - 1 - reelIdx);

            if ("number" == typeof rule.symbolId && isFinite(rule.symbolId)) {
                symbolIds.push(rule.symbolId);
            } else if ("object" == typeof rule.symbolId && rule.symbolId.constructor === Array) {
                for (let c = 0; c < rule.symbolId.length; ++c) {
                    symbolIds.push(rule.symbolId[c]);
                }
            }

            if (-1 != symbolIds.indexOf(symbolId) && checkRule === "onPayLineAnyPos") {
                cellList = [];
                const paylines = SlotGameRuleManager.Instance.getPaylines();
                for (let m = 0; m < paylines.paylines.length; ++m) {
                    const line = paylines.paylines[m];
                    let matchCnt = 0;
                    for (let S = 0; S < rule.appearReelIndexList.length; ++S) {
                        const col = rule.appearReelIndexList[S];
                        if (reelIdx < col) break;
                        const winWindow = windowResult.GetWindow(col);
                        if (-1 != symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(col)))) {
                            ++matchCnt;
                            cellList.push(new Cell(col, line.getRowByCol(col)));
                        }
                    }
                    if (matchCnt >= needCnt) break;
                    cellList = [];
                }
            }
        }
        return cellList;
    }

    // ===== 特效播放判断 - 原逻辑完全复刻 =====
    canPlayingAppearSymbomEffect(symbolId: number, windowResult: any, reelIdx: number, excludeReelList: number[]|null = null): boolean {
        let canPlay = false;
        for (let i = 0; i < this._uiExpectEffectRuleList.length; ++i) {
            const rule = this._uiExpectEffectRuleList[i];
            const symbolIds: number[] = [];
            const checkRule = rule.checkRule;

            if (null == rule.subGameKey || null == rule.subGameKey || -1 != rule.subGameKey.indexOf(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult())) {
                if ("number" == typeof rule.symbolId && isFinite(rule.symbolId)) {
                    symbolIds.push(rule.symbolId);
                } else if ("object" == typeof rule.symbolId && rule.symbolId.constructor === Array) {
                    for (let c = 0; c < rule.symbolId.length; ++c) {
                        symbolIds.push(rule.symbolId[c]);
                    }
                }

                if (-1 != symbolIds.indexOf(symbolId)) {
                    if ("OnScreen" == checkRule) {
                        let symbolCnt = 0, remainReel = 0;
                        for (let d = 0; d < rule.appearReelIndexList.length; ++d) {
                            const col = rule.appearReelIndexList[d];
                            if (null == excludeReelList || null == excludeReelList || -1 == excludeReelList.indexOf(col)) {
                                if (reelIdx < col) { ++remainReel; }
                                else {
                                    const winWindow = windowResult.GetWindow(col);
                                    for (let y = 0; y < winWindow.size; ++y) {
                                        -1 != symbolIds.indexOf(winWindow.getSymbol(y)) && ++symbolCnt;
                                    }
                                }
                            }
                        }
                        if (rule.symbolMinimumCountForWin <= symbolCnt + remainReel) canPlay = true;
                    } else if ("OnAppearReel" == checkRule) {
                        let symbolCnt = 0, remainReel = 0;
                        for (let g = 0; g < rule.appearReelIndexList.length; ++g) {
                            const col = rule.appearReelIndexList[g];
                            if (null == excludeReelList || null == excludeReelList || -1 == excludeReelList.indexOf(col)) {
                                if (reelIdx < col) { ++remainReel; }
                                else {
                                    const winWindow = windowResult.GetWindow(col);
                                    for (let y = 0; y < winWindow.size; ++y) {
                                        winWindow.getSymbol(y) == symbolId && ++symbolCnt;
                                    }
                                }
                            }
                        }
                        if (rule.symbolMinimumCountForWin <= symbolCnt + remainReel) canPlay = true;
                    } else if ("LeftToRight" == checkRule) {
                        let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                        let isBreak = false, symbolNum = 0;
                        for (let C = 0; C < rule.appearReelIndexList.length; ++C) {
                            if (!(rule.appearReelIndexList[C] <= reelIdx)) { isBreak = true; break; }
                            const winWindow = windowResult.GetWindow(C);
                            symbolNum = 0;
                            for (let y = 0; y < winWindow.size; ++y) {
                                -1 != symbolIds.indexOf(winWindow.getSymbol(y)) && ++symbolNum;
                            }
                            if (0 == symbolNum) break;
                            symbolCnt += symbolNum; --remainReel;
                        }
                        isBreak && symbolCnt + remainReel >= rule.symbolMinimumCountForWin && (canPlay = true);
                    } else if ("onPayLineLeftToRight" == checkRule) {
                        let symbolCnt = 0, remainReel = rule.appearReelIndexList.length;
                        const paylines = SlotGameRuleManager.Instance.getPaylines();
                        for (let I = 0; I < paylines.paylines.length; ++I) {
                            symbolCnt = 0;
                            const line = paylines.paylines[I];
                            for (let y = 0; y < rule.appearReelIndexList.length; ++y) {
                                if (rule.appearReelIndexList[y] <= reelIdx) {
                                    const winWindow = windowResult.GetWindow(y);
                                    if (-1 == symbolIds.indexOf(winWindow.getSymbol(line.getRowByCol(y)))) break;
                                    ++symbolCnt; --remainReel;
                                }
                                if (symbolCnt == reelIdx + 1) { canPlay = true; break; }
                            }
                            if (canPlay) break;
                        }
                    }
                }
            }
        }
        return canPlay;
    }

    // ===== 测试配置相关 - 所有方法100%保留 =====
    setReelSpinControlInfoListForTest(jsonStr: string): void {
        const jsonObj = JSON.parse(jsonStr);
        if (null != this._uiReelSpinControlInfoListForTest) {
            this._uiReelSpinControlInfoListForTest.length = 0;
            this._TestReelSpinControlInfoListJsonObject = null;
        }
        const obj = { reelSpinControlInfoList: jsonObj.reelSpinControlInfoList };
        this._TestReelSpinControlInfoListJsonObject = obj;

        const fastModeMultiply = {
            oneSymbolMoveSpeed: void 0 !== jsonObj.fastModeOneSymbolMoveSpeed ? jsonObj.fastModeOneSymbolMoveSpeed : SlotUIRuleManager.Instance.defaultFastModeMultiply_OneSymbolMoveSpeed,
            spinSymbolCnt: void 0 !== jsonObj.fastModeSpinSymbolCnt ? jsonObj.fastModeSpinSymbolCnt : SlotUIRuleManager.Instance.defaultFastModeMultiply_SpinSymbolCnt,
            postEasingDuration: void 0 !== jsonObj.fastModePostEasingDuration ? jsonObj.fastModePostEasingDuration : SlotUIRuleManager.Instance.defaultFastModeMultiply_PostEasingDuration,
            totalTimeInExpectEffect: void 0 !== jsonObj.fastModeTotalTimeInExpectEffect ? jsonObj.fastModeTotalTimeInExpectEffect : SlotUIRuleManager.Instance.defaultFastModeMultiply_TotalTimeInExpectEffect
        };

        for (let i = 0; i < jsonObj.reelSpinControlInfoList.length; ++i) {
            const info = SpinControlInfo.ParseObj(jsonObj.reelSpinControlInfoList[i], fastModeMultiply);
            this._uiReelSpinControlInfoListForTest.push(info);
        }
    }

    getCurrentApplyingSpinControlInfoJson(): string {
        return null != this._TestReelSpinControlInfoListJsonObject ? JSON.stringify(this._TestReelSpinControlInfoListJsonObject) : JSON.stringify(this._defaultReelSpinControlInfoListJsonObject);
    }

    getCurrentOverSizeSymbolInfoJson(): string { return JSON.stringify(this._bigSymbols); }
    setOverSizeSymbolInfo(jsonStr: string): void {
        const arr = JSON.parse(jsonStr);
        this._bigSymbols.length = 0;
        for (let n = 0; n < arr.length; ++n) this._bigSymbols.push(arr[n]);
    }

    // ===== 超大符号判断 - Reel组件核心调用，原逻辑保留 =====
    isOverSizeSymbol(symbolId: number): boolean { return -1 != this._bigSymbols.indexOf(symbolId); }

    // ===== 获取滚轮滚动配置 - 核心方法，测试/正式配置切换 =====
    getSpinControlInfo(spinType: string|number): SpinControlInfo {
        let info: SpinControlInfo = null;
        if (null == this._TestReelSpinControlInfoListJsonObject) {
            for (let n = 0; n < this._uiReelSpinControlInfoList.length; ++n) {
                const cfg = this._uiReelSpinControlInfoList[n];
                if (cfg.spinType == spinType) { info = cfg; break; }
            }
        } else {
            for (let n = 0; n < this._uiReelSpinControlInfoListForTest.length; ++n) {
                const cfg = this._uiReelSpinControlInfoListForTest[n];
                if (cfg.spinType == spinType) { info = cfg; break; }
            }
        }
        null == info && cc.log("Cannot find spin control info. Please check ui data json file.");
        return info;
    }

    // ===== 自动旋转延迟配置 - 原逻辑保留 =====
    setAutospinDelay(delay: number): void { this._autospinDelay = delay; }
    getAutospinDelay(): number { return this._autospinDelay * this.defaultFastModeMultiply_AutospinDelay[this.getFastMode()]; }
}