const { ccclass, property } = cc._decorator;
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import { Utility } from "../global_utility/Utility";


@ccclass
export default class ChangeNumberComponent extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，变量名/类型/默认值/顺序完全一致 核心保留 =====
    @property({ type: cc.Label })
    public label: cc.Label = null;          // 绑定的数字显示标签

    @property({ type: Number })
    public totalchangetime: number = 1;     // 默认总滚动时长(秒)

    @property({ type: Number })
    public changetimetick: number = 0.1;    // ✅ 核心保留：时间片间隔 0.1秒，数值滚动帧率基石，改必卡顿！

    @property({ type: cc.Boolean })
    public useComma: boolean = false;       // 是否启用千分位逗号格式化

    // ===== 私有成员变量 - 原代码所有变量完整复刻，类型注解精准，默认值一致 =====
    public currentNumber: number = 0;       // 当前显示数值
    public prifix: string = "";             // 数值前缀文本
    private _targetNode: cc.Node = null;    // 联动缩放的目标节点
    private _targetScale: number = 0;       // 目标缩放比例
    private _standardNumber: number = 0;    // 缩放阈值：超过该数值触发节点放大
    private _charPostFix: string = null;    // 数值后缀文本 (如: x, %, coins)

    // ===== 生命周期回调 - 原逻辑完全复刻，初始化赋值+判空，核心保留 =====
    onLoad(): void {
        if (null != this.label && void 0 !== this.label) {
            null == this._charPostFix 
                ? this.setNumber(this.currentNumber) 
                : this.setNumberWithChar(this.currentNumber, this._charPostFix);
        }
    }

    // ===== 基础数值设置 - 无后缀，支持前缀+千分位格式化，核心基础方法 =====
    setNumber(num: number): void {
        this.currentNumber = num;
        // ✅ 保留原代码 节点缩放联动逻辑：数值达标放大，否则恢复原尺寸
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        // 千分位格式化开关
        this.label.string = !this.useComma 
            ? this.prifix + num.toString() 
            : this.prifix + CurrencyFormatHelper.formatNumber(num);
    }

    // ===== 设置数值前缀文本，赋值后刷新显示 =====
    setPrifix(str: string): void {
        this.prifix = str;
        if (null != this.label && void 0 !== this.label) {
            null == this._charPostFix 
                ? this.setNumber(this.currentNumber) 
                : this.setNumberWithChar(this.currentNumber, this._charPostFix);
        }
    }

    // ===== 带后缀的数值设置 - 核心重载方法，老虎机倍率/奖金常用 =====
    setNumberWithChar(num: number, postFix: string): void {
        this.currentNumber = num;
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        this.label.string = !this.useComma 
            ? num.toString() + postFix 
            : CurrencyFormatHelper.formatNumber(num) + postFix;
        this._charPostFix = postFix;
    }

    // ===== 快捷赋值当前数值（无后缀） =====
    setCurrentNumber(num: number): void {
        this.currentNumber = num;
        this.setNumber(this.currentNumber);
    }

    // ===== 快捷赋值当前数值（带后缀） =====
    setCurrentNumberWithChar(num: number, postFix: string): void {
        this.currentNumber = num;
        this.setNumberWithChar(this.currentNumber, postFix);
    }

    // ===== 超长数值自动省略格式化 - 自适应省略位数 =====
    setNumberFormatEllips(num: number): void {
        this.currentNumber = num;
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        const ellipsisCnt = CurrencyFormatHelper.getEllipsisCount(num);
        this.label.string = ellipsisCnt > 3 
            ? CurrencyFormatHelper.formatEllipsisNumber(num, ellipsisCnt - 3) 
            : CurrencyFormatHelper.formatNumber(num);
    }

    // ===== 超长数值格式化 - 自定义省略位数 =====
    setNumberFormatEllipsWithCnt(num: number, ellipsisCnt: number): void {
        this.currentNumber = num;
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        this.label.string = CurrencyFormatHelper.formatEllipsisNumber(num, ellipsisCnt);
    }

    // ===== 快捷赋值超长数值 - 自适应省略 =====
    setCurrentNumberFormatEllips(num: number): void {
        this.currentNumber = num;
        this.setNumberFormatEllips(this.currentNumber);
    }

    // ===== 快捷赋值超长数值 - 自定义省略位数 =====
    setCurrentNumberFormatEllipsWithCnt(num: number, ellipsisCnt: number): void {
        this.currentNumber = num;
        this.setNumberFormatEllipsWithCnt(this.currentNumber, ellipsisCnt);
    }

    // ===== 获取当前显示数值 =====
    getCurrentNumber(): number {
        return this.currentNumber;
    }

    // ===== 超长数值格式化 - 小数点位数约束 重载1 =====
    setCurrentNumberWitformatEllipsisNumberUsingDotUnderPointCount(num: number, pointCnt: number): void {
        this.currentNumber = num;
        this.setNumberFormatEllipsisNumberUsingDotUnderPointCount(this.currentNumber, pointCnt);
    }

    // ===== 超长数值格式化 - 小数点位数约束 核心方法 =====
    setNumberFormatEllipsisNumberUsingDotUnderPointCount(num: number, pointCnt: number): void {
        this.currentNumber = num;
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        this.label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(num, pointCnt);
    }

    // ===== 超长数值格式化 - 小数点最大位数约束 =====
    setNumberFormatEllipsisNumberUsingDotMaxCount(num: number, maxPointCnt: number): void {
        this.currentNumber = num;
        if (null != this._targetNode) {
            this._targetNode.setScale(num >= this._standardNumber ? cc.v2(this._targetScale, this._targetScale) : cc.v2(1, 1));
        }
        this.label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(num, maxPointCnt);
    }

    // ===== 核心动画1 - 纯数值滚动动画【无后缀】，老虎机奖金滚动主入口，原逻辑100%复刻 =====
    playChangeNumber(startNum: number, targetNum: number, callback?: () => void, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setCurrentNumber(startNum);

        // ✅ 核心保留：每帧增长逻辑 + 随机波动系数(.9*random+.1)，奖金滚动有快慢变化，视觉更流畅！
        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setCurrentNumber(currShowNum);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setCurrentNumber(targetNum);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画2 - 带后缀数值滚动动画，倍率/奖金带单位专用 =====
    playChangeNumberWithChar(startNum: number, targetNum: number, callback?: () => void, postFix?: string, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setCurrentNumberWithChar(startNum, postFix);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setCurrentNumberWithChar(currShowNum, postFix);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setCurrentNumberWithChar(targetNum, postFix);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画3 - 超长数值滚动 + 自定义省略位数 =====
    playChangeNumberFormatEllipsWithElipsisCnt(startNum: number, targetNum: number, ellipsisCnt: number, callback?: () => void, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setCurrentNumberFormatEllipsWithCnt(startNum, ellipsisCnt);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setCurrentNumberFormatEllipsWithCnt(currShowNum, ellipsisCnt);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setCurrentNumberFormatEllips(targetNum);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画4 - 超长数值滚动 + 小数点约束 重载1 =====
    playChangeNumberFormatEllipsisNumber(startNum: number, targetNum: number, ellipsisCnt: number, callback?: () => void, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setCurrentNumberFormatEllipsWithCnt(startNum, ellipsisCnt);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setCurrentNumberFormatEllipsWithCnt(currShowNum, ellipsisCnt);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setCurrentNumberFormatEllipsWithCnt(targetNum, ellipsisCnt);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画5 - 超长数值滚动 + 自适应省略位数 =====
    playChangeNumberFormatEllips(startNum: number, targetNum: number, callback?: () => void, ellipsisCnt?: number, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setCurrentNumberFormatEllipsWithCnt(startNum, ellipsisCnt);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setCurrentNumberFormatEllipsWithCnt(currShowNum, ellipsisCnt);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setCurrentNumberFormatEllips(targetNum);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画6 - 超长数值滚动 + 小数点最大位数约束 =====
    playChangeNumberFormatEllipsisNumberUsingDotMaxCount(startNum: number, targetNum: number, maxPointCnt: number, callback?: () => void, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setNumberFormatEllipsisNumberUsingDotMaxCount(startNum, maxPointCnt);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setNumberFormatEllipsisNumberUsingDotMaxCount(currShowNum, maxPointCnt);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setNumberFormatEllipsisNumberUsingDotMaxCount(targetNum, maxPointCnt);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 核心动画7 - 超长数值滚动 + 小数点位数约束 =====
    playChangeNumberFormatEllipsisNumberUsingDotUnderPointCount(startNum: number, targetNum: number, pointCnt: number, callback?: () => void, customTime?: number): void {
        const self = this;
        this.node.stopAllActions();
        const totalTime = null == customTime ? this.totalchangetime : customTime;
        
        let tickIndex = 0;
        const totalTick = totalTime / this.changetimetick;
        const tickCount = Math.floor(totalTick);
        const numStep = Math.abs(targetNum - startNum) / totalTick;

        this.setNumberFormatEllipsisNumberUsingDotUnderPointCount(startNum, pointCnt);

        const tickFunc = cc.callFunc(() => {
            let addNum = numStep * tickIndex;
            addNum = Math.floor(addNum + numStep * (.9 * Math.random() + .1));
            if (targetNum < startNum) addNum *= -1;
            
            let currShowNum = startNum + addNum;
            currShowNum = Utility.getDisplayJackpotMoney(self.currentNumber, currShowNum);
            self.setNumberFormatEllipsisNumberUsingDotUnderPointCount(currShowNum, pointCnt);
            tickIndex++;
        });

        const repeatSeq = cc.repeat(cc.sequence(tickFunc, cc.delayTime(this.changetimetick)), tickCount);
        const endFunc = cc.callFunc(() => {
            self.setNumberFormatEllipsisNumberUsingDotUnderPointCount(targetNum, pointCnt);
            null != callback && callback();
        });

        this.node.runAction(cc.sequence(repeatSeq, endFunc));
    }

    // ===== 设置数值联动缩放配置 - 奖金达标放大特效，老虎机核心视觉反馈 =====
    SetNumberScaleTarget(targetNode: cc.Node, targetScale: number, standardNum: number): void {
        this.node.stopAllActions();
        this._targetNode = targetNode;
        this._targetScale = targetScale;
        this._standardNumber = standardNum;
    }

    // ===== 强制停止所有数值滚动动画 =====
    stopChangeNumber(): void {
        this.node.stopAllActions();
    }
}