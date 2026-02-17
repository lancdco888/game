const { ccclass, property } = cc._decorator;
import Symbol from "./Symbol";
import SymbolPoolManager from "../manager/SymbolPoolManager";
import SlotUIRuleManager from "./rule/SlotUIRuleManager";
import SlotGameResultManager from "../manager/SlotGameResultManager";
import ReelShaderEffect from "../UI/ReelShaderEffect";
import TSUtility from "../global_utility/TSUtility";
import SlotManager, { SpecialType } from "../manager/SlotManager";

@ccclass
export default class Reel extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，类型/变量名/默认值完全一致，一个不漏 =====
    @property({ type: Number })
    public reelindex: number = 0;

    @property({ type: Number })
    public symbolHeight: number = 0;

    @property({ type: cc.Node })
    public expectEffect: cc.Node = null;

    @property({ type: Number })
    public visibleRow: number = 3;

    @property({ type: Number })
    public bufferRow: number = 2;

    @property({ type: ReelShaderEffect })
    public shaderEffect: ReelShaderEffect = null;

    @property({ type: cc.Boolean })
    public symbolsReverseOrder: boolean = false;

    @property({ type: cc.Node })
    public rootOverSizeSymbols: cc.Node = null;

    // ===== 公有成员变量 - 原JS直接声明，变量名/初始值完全保留 =====
    public originalYPos: number = 0;
    public reelCol: number = 0;
    public totalRowCnt: number = 0;
    public symbolArray: cc.Node[] = [];
    public directionSpinReel: number = Reel.SPINDIRECTION_DOWN;
    public indexCheckStartOverSizeSymbol: number = 0;

    // ===== 回调函数变量 - 原JS隐式声明，补全TS类型，变量名完全保留 =====
    public customGetSymbolNode: Function = null;
    public _getNextSymbolId: Function = null;
    public _getNextSymbolInfo: Function = null;
    public _getNextSpecialInfo: Function = null;

    // ===== 静态常量 - 原JS类上挂载的常量，100%保留名称+值，核心滚动方向标识 =====
    public static readonly SPINDIRECTION_DOWN: number = 0;
    public static readonly SPINDIRECTION_UP: number = 1;

    // ===== 生命周期回调 - onLoad 原逻辑一字不改，特效隐藏+初始坐标记录 =====
    onLoad(): void {
        null != this.expectEffect && (this.expectEffect.active = false);
        this.originalYPos = this.node.y;
    }

    // ===== 核心初始化方法 - 符号数组填充/节点挂载/坐标设置，原逻辑完全复刻，含所有冗余判断 =====
    invalidate(symbolIds: number[], startIdx: number, reelCol: number, winSymbols?: any, specialSymbols?: any): void {
        this.reelCol = reelCol;
        this.visibleRow;
        this.bufferRow;
        if (null != winSymbols && null != winSymbols && -1 != symbolIds.indexOf(0)) {
            const midWinSymbol = winSymbols[(winSymbols.size - this.visibleRow) / 2];
            const currSymbol = symbolIds[startIdx % symbolIds.length];
            (0 != currSymbol && 0 == midWinSymbol || 0 == currSymbol && 0 != midWinSymbol) && ++startIdx;
        }

        for (let r = this.visibleRow + this.bufferRow - 1; r >= -this.bufferRow; --r) {
            let symbolId = symbolIds[(symbolIds.length + startIdx + r) % symbolIds.length];
            if (null != winSymbols && null != winSymbols && r >= (this.visibleRow - winSymbols.size) / 2 && r <= this.visibleRow - 1 + (winSymbols.size - this.visibleRow) / 2) {
                this.visibleRow;
                winSymbols.size;
                null != winSymbols.getSymbol(r + (winSymbols.size - this.visibleRow) / 2) && (symbolId = winSymbols.getSymbol(r + (winSymbols.size - this.visibleRow) / 2));
            }

            let specialInfo = null;
            if (null != specialSymbols && null != specialSymbols && r >= (this.visibleRow - specialSymbols.length) / 2 && r <= this.visibleRow - 1 + (specialSymbols.length - this.visibleRow) / 2) {
                null != specialSymbols[r + (specialSymbols.length - this.visibleRow) / 2] && (specialInfo = specialSymbols[r + (specialSymbols.length - this.visibleRow) / 2]);
            } else {
                specialInfo = null;
            }

            const symbolNode = this.getSymbolNode(symbolId, specialInfo);
            this.node.addChild(symbolNode);
            this.node.getComponent("WaveEffect") && this.node.getComponent("WaveEffect")._use();
            this.node.getComponent("ReelCurvedEffect") && this.node.getComponent("ReelCurvedEffect").setProgram(symbolNode);
            symbolNode.setPosition(0, -this.symbolHeight * r);
            this.symbolArray.splice(0, 0, symbolNode);
        }
        this.resetAllSiblingIndex();
    }

    // ===== 生命周期回调 - start 原逻辑不变，计算总行数 =====
    start(): void {
        this.totalRowCnt = this.visibleRow + 2 * this.bufferRow;
    }

    // ===== 获取最后一个符号 - 原逻辑+错误日志完全保留 =====
    getLastSymbol(): Symbol {
        if (0 == this.node.childrenCount) {
            cc.error("getLastSymbol: empty children");
            return null;
        }
        return this.symbolArray[0].getComponent(Symbol);
    }

    // ===== 获取反向滚轮第一个符号 - 原逻辑+错误日志完全保留，日志文本都不变 =====
    getFirstSymbolForOppositionReel(): Symbol {
        if (0 == this.node.childrenCount) {
            cc.error("getLastSymbol: empty children");
            return null;
        }
        return this.symbolArray[this.symbolArray.length - 1].getComponent(Symbol);
    }

    // ===== 符号坐标校验 - 原参数默认值写法保留，核心判断逻辑不变 =====
    checkSymbolYPosition(node: cc.Node, row: number, offset: number = 0): boolean {
        return -(row + 1) * this.symbolHeight < node.y && node.y <= -row * this.symbolHeight + offset;
    }

    // ===== 符号替换 - 核心逻辑完全复刻，符号池复用/节点删除/层级重置 =====
    changeSymbol(row: number, symbolId: number, specialInfo: any = null): void {
        let targetNode: cc.Node = null;
        for (let a = 0; a < this.symbolArray.length; ++a) {
            targetNode = this.symbolArray[a];
            if (this.checkSymbolYPosition(targetNode, row, 0.001)) {
                const newSymbolNode = this.getSymbolNode(symbolId, specialInfo);
                const siblingIdx = targetNode.getSiblingIndex();
                const parentNode = targetNode.parent;

                newSymbolNode.x = targetNode.x;
                newSymbolNode.y = targetNode.y;
                !TSUtility.isValid(parentNode) ? this.node.insertChild(newSymbolNode, siblingIdx) : parentNode.insertChild(newSymbolNode, siblingIdx);
                newSymbolNode.active = true;
                this.applyShader(newSymbolNode);
                targetNode.removeFromParent();
                this.symbolArray.splice(a, 1, newSymbolNode);
                this.resetAllSiblingIndex();
                SymbolPoolManager.instance.releaseSymbol(targetNode.getComponent(Symbol));
                break;
            }
        }
    }

    // ===== 普通符号替换 - 原逻辑完全复刻，坐标重置+符号池释放 =====
    changeNormalSymbol(row: number, symbolId: number, specialInfo: any = null): void {
        this.resetPositionOfReelComponents();
        for (let o = 0; o < this.symbolArray.length; ++o) {
            const targetNode = this.symbolArray[o];
            if (targetNode.y <= -row * this.symbolHeight && targetNode.y > -(row + 1) * this.symbolHeight) {
                const newSymbolNode = this.getSymbolNode(symbolId, specialInfo);
                const siblingIdx = targetNode.getSiblingIndex();

                newSymbolNode.parent = null;
                this.node.insertChild(newSymbolNode, siblingIdx);
                newSymbolNode.active = true;
                newSymbolNode.x = 0;
                newSymbolNode.y = targetNode.y;
                this.applyShader(newSymbolNode);
                targetNode.removeFromParent();
                this.symbolArray.splice(o, 1, newSymbolNode);
                this.resetAllSiblingIndex();
                SymbolPoolManager.instance.releaseSymbol(targetNode.getComponent(Symbol));
                break;
            }
        }
    }

    // ===== 层级重置核心方法 - 原逻辑完全复刻，反向排序/ZOrder判断，无任何优化 =====
    resetAllSiblingIndex(): void {
        let currNode: cc.Node, prevNode: cc.Node;
        for (let n = 0; n < this.symbolArray.length; ++n) {
            currNode = !this.symbolsReverseOrder ? this.symbolArray[this.symbolArray.length - n - 1] : this.symbolArray[n];
            if (n > 0) {
                if (!this.symbolsReverseOrder) {
                    prevNode = this.symbolArray[this.symbolArray.length - n];
                    prevNode.getComponent(Symbol).zOrder >= currNode.getComponent(Symbol).zOrder ? currNode.setSiblingIndex(prevNode.getSiblingIndex()) : currNode.setSiblingIndex(n);
                } else {
                    prevNode = this.symbolArray[n - 1];
                    prevNode.getComponent(Symbol).zOrder >= currNode.getComponent(Symbol).zOrder ? currNode.setSiblingIndex(prevNode.getSiblingIndex()) : currNode.setSiblingIndex(n);
                }
            } else {
                currNode.setSiblingIndex(n);
            }
        }
    }

    // ===== 获取全局坐标 - 原逻辑完全复刻，Vec2创建+坐标转换 =====
    getGlobalPosition(row: number): cc.Vec2 {
        const pos = new cc.Vec2;
        const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, -this.symbolHeight * row));
        pos.x = worldPos.x;
        pos.y = worldPos.y;
        return pos;
    }

    // ===== Y坐标计算 - 原逻辑不变 =====
    getPositionY(y: number): number {
        return y + this.node.y - this.originalYPos;
    }

    // ===== 隐藏指定行符号 - 原逻辑+返回值不变 =====
    hideSymbolInRow(row: number): boolean {
        let targetNode: cc.Node, isHide = false;
        for (let o = 0; o < this.symbolArray.length; ++o) {
            targetNode = this.symbolArray[o];
            if (targetNode.y <= -row * this.symbolHeight && targetNode.y > -(row + 1) * this.symbolHeight) {
                targetNode.active = false;
                isHide = true;
                break;
            }
        }
        return isHide;
    }

    // ===== 显示指定行符号 - 原逻辑不变 =====
    showSymbolInRow(row: number): void {
        let targetNode: cc.Node;
        for (let n = 0; n < this.symbolArray.length; ++n) {
            targetNode = this.symbolArray[n];
            if (targetNode.y <= -row * this.symbolHeight && targetNode.y > -(row + 1) * this.symbolHeight) {
                targetNode.active = true;
                break;
            }
        }
    }

    // ===== 设置所有符号颜色 - 原逻辑不变 =====
    setSymbolColor(color: cc.Color): void {
        for (let t = 0; t < this.symbolArray.length; ++t) {
            this.symbolArray[t].color = color;
        }
    }

    // ===== 设置符号暗态激活 - 原参数默认值写法保留 =====
    setSymbolsDimmActive(isActive: boolean, delay: number = 0): void {
        for (let n = 0; n < this.symbolArray.length; ++n) {
            this.symbolArray[n].getComponent(Symbol).setDimmActive(isActive, delay);
        }
    }

    // ===== 显示所有符号 - 原逻辑不变 =====
    showAllSymbol(): void {
        for (let e = 0; e < this.symbolArray.length; ++e) {
            this.symbolArray[e].active = true;
        }
    }

    // ===== 获取指定行符号 - 原逻辑+错误日志完全保留 =====
    getSymbol(row: number): cc.Node {
        if (row < 0 || this.visibleRow < row) {
            cc.error("getSymbol Invalid row index ", row);
            return null;
        }
        return this.symbolArray[this.bufferRow + row];
    }

    // ===== 获取滚轮滚动时间 - 原逻辑不变 =====
    getReelSpinTime(winLineIdx: number|string): number {
        let totalTime, moveSpeed, spinCnt;
        const spinInfo = SlotUIRuleManager.Instance.getSpinControlInfo(winLineIdx).infoList[this.reelindex];
        totalTime = spinInfo.totalTimeInExpectEffect;
        moveSpeed = spinInfo.oneSymbolMoveSpeed;
        spinCnt = spinInfo.spinSymbolCnt;
        return SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) ? totalTime : moveSpeed * spinCnt;
    }

    // ===== 获取滚轮滚动时间(重载) - 原逻辑完全复刻，含所有变量/判断 =====
    getReelSpinTimeRenewal(nodeList: any[], elapsedTime: number, winLineIdx: string): number {
        let totalTime, moveSpeed, spinCnt, spinTime = 0;
        var control = SlotUIRuleManager.Instance.getSpinControlInfo(winLineIdx)
        const spinInfo = control.infoList[this.reelindex];
    

        totalTime = spinInfo.totalTimeInExpectEffect;
        moveSpeed = spinInfo.oneSymbolMoveSpeed;
        spinCnt = spinInfo.spinSymbolCnt;
        spinTime = SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, SlotManager.Instance.getReelStopWindow()) ? totalTime : moveSpeed * spinCnt;

        let targetComp, targetReelIdx = -1;
        for (let f = 0; f < nodeList.length; ++f) {
            targetComp = nodeList[f].getComponent(Reel);
            if (1 == targetComp.node.active) {
                targetReelIdx = targetComp.reelindex;
                break;
            }
        }
        return targetReelIdx == this.reelindex && (elapsedTime > (spinTime += this.getPreSpinTime(winLineIdx)) ? spinTime = 0 : spinTime -= elapsedTime), spinTime;
    }

    // ===== 获取滚轮停止时间 - 原双层null校验保留，核心特征！ =====
    getReelStopTime(winLineIdx: number|string): number {
        let stopTime;
        if (null != winLineIdx && null != winLineIdx) {
            const spinInfo = SlotUIRuleManager.Instance.getSpinControlInfo(winLineIdx).infoList[this.reelindex];
            spinInfo.oneSymbolMoveSpeed;
            stopTime = spinInfo.postEasingDuration;
        }
        return stopTime;
    }

    // ===== 获取预滚动时间 - 原双层null校验保留，核心特征！ =====
    getPreSpinTime(winLineIdx: string|number): number {
        let preTime = 0, preSpinCnt = 0;
        if (null != winLineIdx && null != winLineIdx) {
            const spinInfo = SlotUIRuleManager.Instance.getSpinControlInfo(winLineIdx);
            preSpinCnt = spinInfo.preSpinSymbolCnt;
            preTime = spinInfo.infoList[this.reelindex].oneSymbolMoveSpeed;
        }
        return preTime * preSpinCnt;
    }

    // ===== 重置滚轮所有组件坐标 - 核心逻辑不变 =====
    resetPositionOfReelComponents(): void {
        this.node.y = this.originalYPos;
        for (let e = 0; e < this.symbolArray.length; ++e) {
            this.symbolArray[e].y = (this.bufferRow - e) * this.symbolHeight;
        }
    }

    // ===== 设置滚轮X坐标 - 原逻辑不变 =====
    setPositionXOfReelComponents(x: number): void {
        for (let t = 0; t < this.symbolArray.length; ++t) {
            this.symbolArray[t].x = x;
        }
    }

    // ===== 应用着色器 - 原逻辑不变 =====
    applyShader(node: cc.Node): void {
        this.shaderEffect && this.shaderEffect.setProgram(node);
    }

    // ===== 设置着色器参数 - 原逻辑不变 =====
    setShaderValue(key: string, value: any): void {
        this.shaderEffect && this.shaderEffect.setValue(key, value);
    }

    // ===== 绑定回调函数 - 三个回调全保留，变量名不变 =====
    setNextSymbolIdCallback(cb: Function): void { 
        this._getNextSymbolId = cb; 
    }
    
    setNextSymbolInfoCallback(cb: Function): void { 
        this._getNextSymbolInfo = cb; 
    }

    setNextSpecialInfoCallback(cb: Function): void { 
        this._getNextSpecialInfo = cb; 
    }

    // ===== 核心帧更新 - 滚轮滚动/符号池复用逻辑，100%原逻辑复刻，重中之重！ =====
    update(): void {
        if (this._getNextSymbolId && 0 != this.symbolArray.length) {
            if (this.directionSpinReel == Reel.SPINDIRECTION_DOWN) {
                let e = this.symbolArray[this.symbolArray.length - 1];
                for (; this.getPositionY(e.y) < -this.symbolHeight * (this.visibleRow + this.bufferRow / 2);) {
                    const lastSymbol = this.getLastSymbol();
                    const nextSymbolId = this._getNextSymbolId();
                    let specialInfo = null;

                    if (this._getNextSymbolInfo && (specialInfo = this._getNextSymbolInfo())) { }
                    if (void 0 === nextSymbolId) break;

                    const newSymbolNode = this.getSymbolNode(nextSymbolId, specialInfo);
                    if (TSUtility.isValid(this._getNextSpecialInfo)) {
                        const specialData = this._getNextSpecialInfo(SpecialType.FEVER);
                        TSUtility.isValid(specialData) && specialData.checkSpecialType(SpecialType.FEVER) && SlotManager.Instance.setSymbolSpecialInfo(newSymbolNode, this.symbolHeight);
                    }

                    newSymbolNode.x = 0;
                    newSymbolNode.y = lastSymbol.node.y + this.symbolHeight;
                    this.node.addChild(newSymbolNode);
                    lastSymbol.zOrder;
                    newSymbolNode.getComponent(Symbol).zOrder;
                    !this.symbolsReverseOrder ? lastSymbol.zOrder >= newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex()) : lastSymbol.zOrder > newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex());
                    this.applyShader(newSymbolNode);
                    this.symbolArray.pop();
                    this.symbolArray.splice(0, 0, newSymbolNode);
                    this.node.removeChild(e);
                    e.parent = null;
                    SymbolPoolManager.instance.releaseSymbol(e.getComponent(Symbol));
                    e = this.symbolArray[this.symbolArray.length - 1];
                }
            } else if (this.directionSpinReel == Reel.SPINDIRECTION_UP) {
                for (let e = this.symbolArray[0]; this.getPositionY(e.y) > this.symbolHeight * (this.bufferRow / 2);) {
                    const firstSymbol = this.getFirstSymbolForOppositionReel();
                    const nextSymbolId = this._getNextSymbolId();
                    let specialInfo = null;

                    if (this._getNextSymbolInfo && (specialInfo = this._getNextSymbolInfo())) { }
                    if (void 0 === nextSymbolId) break;

                    const newSymbolNode = this.getSymbolNode(nextSymbolId, specialInfo);
                    TSUtility.isValid(this._getNextSpecialInfo) && (() => {
                        const specialData = this._getNextSpecialInfo();
                        TSUtility.isValid(specialData) && specialData.checkSpecialType(SpecialType.FEVER) && SlotManager.Instance.setSymbolSpecialInfo(newSymbolNode, this.symbolHeight);
                    })();

                    newSymbolNode.x = 0;
                    newSymbolNode.y = firstSymbol.node.y - this.symbolHeight;
                    this.node.addChild(newSymbolNode);
                    firstSymbol.zOrder;
                    newSymbolNode.getComponent(Symbol).zOrder;
                    !this.symbolsReverseOrder ? firstSymbol.zOrder >= newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(firstSymbol.node.getSiblingIndex()) : firstSymbol.zOrder > newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(firstSymbol.node.getSiblingIndex());
                    this.applyShader(newSymbolNode);
                    this.symbolArray.splice(0, 1);
                    this.symbolArray.push(newSymbolNode);
                    this.node.removeChild(e);
                    e.parent = null;
                    SymbolPoolManager.instance.releaseSymbol(e.getComponent(Symbol));
                    e = this.symbolArray[0];
                }
            }
        }
    }

    // ===== 顶部添加符号 - 原参数默认值+符号池复用逻辑不变 =====
    pushSymbolAtTopOfReel(symbolId: number, specialInfo: any = null): void {
        const lastSymbol = this.getLastSymbol();
        const newSymbolNode = this.getSymbolNode(symbolId, specialInfo);

        newSymbolNode.x = 0;
        newSymbolNode.y = lastSymbol.node.y + this.symbolHeight;
        this.node.addChild(newSymbolNode);
        lastSymbol.zOrder >= newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex());
        this.applyShader(newSymbolNode);

        const delNode = this.symbolArray[this.symbolArray.length - 1];
        this.symbolArray.pop();
        this.symbolArray.splice(0, 0, newSymbolNode);
        this.node.removeChild(delNode);
        delNode.parent = null;
        SymbolPoolManager.instance.releaseSymbol(delNode.getComponent(Symbol));
    }

    // ===== 获取符号节点 - 原逻辑+错误日志完全保留 =====
    getSymbolNode(symbolId: number, specialInfo: any): cc.Node {
        let symbolNode: cc.Node;
        if (null == this.customGetSymbolNode) {
            symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
            TSUtility.isValid(symbolNode) || cc.error("not found symbolId: ", symbolId);
        } else {
            symbolNode = this.customGetSymbolNode(symbolId, specialInfo);
        }
        return symbolNode;
    }

    // ===== 绑定自定义符号获取函数 - 原逻辑不变 =====
    setCustomFuncGetSymbolNode(cb: Function): void {
        this.customGetSymbolNode = cb;
    }

    // ===== 设置滚动方向 - 原逻辑不变 =====
    setReelSpinDirection(dir: number): void {
        this.directionSpinReel = dir;
    }

    // ===== 底部添加符号 - 原参数默认值+符号池复用逻辑不变 =====
    pushSymbolAtBottomOfReel(symbolId: number, specialInfo: any = null): void {
        const firstSymbol = this.getFirstSymbolForOppositionReel();
        const newSymbolNode = this.getSymbolNode(symbolId, specialInfo);

        newSymbolNode.x = 0;
        newSymbolNode.y = firstSymbol.node.y - this.symbolHeight;
        this.node.addChild(newSymbolNode);
        firstSymbol.zOrder >= newSymbolNode.getComponent(Symbol).zOrder && newSymbolNode.setSiblingIndex(firstSymbol.node.getSiblingIndex());
        this.applyShader(newSymbolNode);

        const delNode = this.symbolArray[0];
        this.symbolArray.splice(0, 1);
        this.symbolArray.push(newSymbolNode);
        this.node.removeChild(delNode);
        delNode.parent = null;
        SymbolPoolManager.instance.releaseSymbol(delNode.getComponent(Symbol));
    }

    // ===== 判断滚轮是否未激活 - 原松散判断保留 0 == xxx =====
    isDeActiveReel(): boolean {
        return !this.node.active;
    }

    // ===== 发送特殊模式消息 - 原双层null校验保留，核心特征！ =====
    sendSpecialModeMessage(): void {
        for (let e = 0, t = this.node.children; e < t.length; e++) {
            t[e].emit("sendSpecialModeMessage", SpecialType.FEVER);
        }
        if (null != this.rootOverSizeSymbols && null != this.rootOverSizeSymbols) {
            for (let n = 0, o = this.rootOverSizeSymbols.children; n < o.length; n++) {
                o[n].emit("sendSpecialModeMessage", SpecialType.FEVER);
            }
        }
    }

    // ===== 重置符号父节点 - 原逻辑不变 =====
    setParentAllSymbolsToSymbolLayer(): void {
        for (let e = 0; e < this.symbolArray.length; ++e) {
            this.symbolArray[e].parent != this.node && TSUtility.moveToNewParent(this.symbolArray[e], this.node);
        }
        this.resetPositionOfReelComponents();
        this.resetAllSiblingIndex();
    }

    // ===== 滚动停止后处理 - 核心逻辑不变 =====
    processAfterStopSpin(): void {
        this.resetPositionOfReelComponents();
        this.processCheckOverSizeSymbol();
    }

    // ===== 超大符号检测 - 原逻辑完全复刻 =====
    processCheckOverSizeSymbol(): void {
        let targetSymbol: cc.Node, startIdx = this.indexCheckStartOverSizeSymbol;
        this.resetPositionOfReelComponents();
        this.resetAllSiblingIndex();
        for (let n = startIdx; n < this.visibleRow; ++n) {
            targetSymbol = this.getSymbol(n);
            null != this.rootOverSizeSymbols && SlotUIRuleManager.Instance.isOverSizeSymbol(targetSymbol.getComponent(Symbol).symbolId) && (
                TSUtility.moveToNewParentBySelfPostion(targetSymbol, this.rootOverSizeSymbols),
                this.onOverSizeSortFunction()
            );
        }
    }

    // ===== 指定行超大符号检测 - 原逻辑不变 =====
    processCheckOverSizeSymbolByRow(): void {
        let targetSymbol: cc.Node, startIdx = this.indexCheckStartOverSizeSymbol;
        for (let t = startIdx; t < this.visibleRow; ++t) {
            targetSymbol = this.getSymbol(t);
            null != this.rootOverSizeSymbols && SlotUIRuleManager.Instance.isOverSizeSymbol(targetSymbol.getComponent(Symbol).symbolId) && (
                TSUtility.moveToNewParentBySelfPostion(targetSymbol, this.rootOverSizeSymbols),
                this.onOverSizeSortFunction()
            );
        }
    }

    // ===== 超大符号排序 - 原排序函数一字不改，核心特征！ =====
    onOverSizeSortFunction(): void {
        TSUtility.isValid(this.rootOverSizeSymbols) && this.rootOverSizeSymbols.children.sort(function (a: cc.Node, b: cc.Node) {
            const aSymbol = a.getComponent(Symbol);
            const bSymbol = b.getComponent(Symbol);
            return aSymbol.zOrder > bSymbol.zOrder ? 1 : aSymbol.zOrder < bSymbol.zOrder ? -1 :
                Math.floor(a.position.x) > Math.floor(b.position.x) || Math.floor(a.position.y) < Math.floor(b.position.y) ? 1 : -1;
        });
    }

    // ===== 自定义暗态激活 - 原参数默认值写法保留 =====
    setCustomDimmActive(isActive: boolean, type: number, delay: number = 0): void {
        for (let o = 0; o < this.symbolArray.length; ++o) {
            this.symbolArray[o].getComponent(Symbol).setCustomDimmActive(isActive, type, delay);
        }
    }

    // ===== 设置超大符号检测起始索引 - 原逻辑不变 =====
    setIndexCheckStartOverSizeSymbol(idx: number): void {
        this.indexCheckStartOverSizeSymbol = idx;
    }
}