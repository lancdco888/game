/** 状态机核心基类 + 三个子类：并发状态/顺序状态/延时状态 完整转换 */
export class State {
    // ===== 私有成员变量 - 原JS隐式声明 下划线命名+初始值 100%完全复刻，包括布尔值!0=TRUE / !1=FALSE =====
    public _done: boolean = false;
    public name: string = "";
    public fnStart: Function = null;
    public _onStart: Function[] = [];
    private _onDoAction: Function[] = [];
    private _onEnd: Function[] = [];
    private _isSkip: boolean = false;
    private _setSkipFlagDuringPlay: Function = null;
    private _flagCanSkipByBeforeStatesSkipFlag: boolean = true;
    private _flagSkipActive: boolean = false;

    // ===== 构造函数 - 原JS构造逻辑完全复刻，包含闭包绑定setSkipFlagDuringPlay =====
    constructor() {
        const self = this;
        this.setSkipFlagDuringPlay = function (isSkip: boolean) {
            self._isSkip = isSkip;
            self._flagSkipActive && self.setDone();
        };
    }

    // ===== 所有GET/SET访问器 - 原JS Object.defineProperty 完美复刻，功能完全一致 =====
    get isSkip(): boolean {
        return this._isSkip;
    }
    set isSkip(val: boolean) {
        this._isSkip = val;
    }

    get setSkipFlagDuringPlay(): Function {
        return this._setSkipFlagDuringPlay;
    }
    set setSkipFlagDuringPlay(val: Function) {
        this._setSkipFlagDuringPlay = val;
    }

    get flagCanSkipByBeforeStatesSkipFlag(): boolean {
        return this._flagCanSkipByBeforeStatesSkipFlag;
    }
    set flagCanSkipByBeforeStatesSkipFlag(val: boolean) {
        this._flagCanSkipByBeforeStatesSkipFlag = val;
    }

    get flagSkipActive(): boolean {
        return this._flagSkipActive;
    }
    set flagSkipActive(val: boolean) {
        this._flagSkipActive = val;
    }

    // ===== 基类所有方法 - 原逻辑一字不改，包含冗余双层null校验/松散相等判断/日志打印 =====
    Destroy(): void {
        this.removeAllCallback();
        this.setDone();
    }

    setName(name: string): void {
        this.name = name;
    }

    addOnStartCallback(cb: Function): void {
        this._onStart.push(cb);
    }

    addFrontOnStartCallback(cb: Function): void {
        this._onStart.splice(0, 0, cb);
    }

    addOnEndCallback(cb: Function): void {
        this._onEnd.push(cb);
    }

    removeAllCallback(): void {
        this._onStart.length = 0;
        this._onEnd.length = 0;
    }

    onStart(isSkip?: boolean): void {
        this._done = false;
        if (null != isSkip && null != isSkip && this._flagCanSkipByBeforeStatesSkipFlag && isSkip) {
            this._isSkip = true;
            this._flagSkipActive && this.setDone();
        } else {
            if (this._onStart) {
                for (let i = 0; i < this._onStart.length; ++i) {
                    this._onStart[i]();
                }
            }
            null != this.fnStart && this.fnStart(this.setDone.bind(this));
        }
    }

    onEnd(): void {
        if (this._onEnd) {
            for (let i = 0; i < this._onEnd.length; ++i) {
                this._onEnd[i]();
            }
        }
    }

    isDone(): boolean {
        return this._done;
    }

    setDone(): void {
        if (!this._done) {
            this._done = true;
            this.onEnd();
        } else {
            cc.log("State Error setDone ", this.name);
        }
    }
}

/** 并发状态子类 - 继承State，原逻辑完全复刻 */
export class ConcurrentState extends State {
    public subStates: State[] = [];
    public name: string = "ConcurrentState";

    constructor() {
        super();
        const self = this;
        this.setSkipFlagDuringPlay = function (isSkip: boolean) {
            self.isSkip = isSkip;
            for (let i = 0; i < self.subStates.length; ++i) {
                !self.subStates[i].isDone() && self.subStates[i].setSkipFlagDuringPlay(isSkip);
            }
        };
    }

    Destroy(): void {
        for (let i = 0; i < this.subStates.length; ++i) {
            this.subStates[i].Destroy();
        }
    }

    onStart(isSkip?: boolean): void {
        this._done = false;
        this.flagCanSkipByBeforeStatesSkipFlag && (this.isSkip = isSkip);
        if (this._onStart) {
            for (let i = 0; i < this._onStart.length; ++i) {
                this._onStart[i]();
            }
        }
        if (0 != this.subStates.length) {
            for (let i = 0; i < this.subStates.length; ++i) {
                null != isSkip && null != isSkip && this.flagCanSkipByBeforeStatesSkipFlag && isSkip
                    ? this.subStates[i].onStart(true)
                    : this.subStates[i].onStart();
            }
        } else {
            this.setDone();
        }
    }

    processCheckSubStatesAreFinished(): void {
        let doneCount = 0;
        for (let i = 0; i < this.subStates.length; ++i) {
            this.subStates[i].isDone() && ++doneCount;
        }
        if (doneCount == this.subStates.length) {
            if (this.isDone()) {
                return void cc.log("ConcurrentState is Error");
            }
            this.setDone();
        }
    }

    insert(state: State): void {
        state.addOnEndCallback(this.processCheckSubStatesAreFinished.bind(this));
        this.subStates.push(state);
    }

    setDoneAllSubStates(): void {
        for (let i = 0; i < this.subStates.length; ++i) {
            this.subStates[i].setDone();
        }
    }
}

/** 顺序状态子类 - 继承State，原逻辑完全复刻，包含orders数组/索引curIdx */
export class SequencialState extends State {
    public subStates: State[] = [];
    public orders: number[] = [];
    public curIdx: number = 0;
    public name: string = "SequencialState";

    constructor() {
        super();
        const self = this;
        this.setSkipFlagDuringPlay = function (isSkip: boolean) {
            self.subStates[self.curIdx].setSkipFlagDuringPlay(isSkip);
        };
    }

    Destroy(): void {
        for (let i = 0; i < this.subStates.length; ++i) {
            this.subStates[i].Destroy();
        }
    }

    onStart(isSkip?: boolean): void {
        this._done = false;
        this.curIdx = 0;
        if (this._onStart) {
            for (let i = 0; i < this._onStart.length; ++i) {
                this._onStart[i]();
            }
        }
        this.subStates.length <= this.curIdx
            ? this.setDone()
            : (null != isSkip && null != isSkip && this.flagCanSkipByBeforeStatesSkipFlag
                ? this.subStates[this.curIdx].onStart(isSkip)
                : this.subStates[this.curIdx].onStart());
    }

    insert(order: number, state: State): void {
        for (let i = 0; i < this.orders.length; ++i) {
            if (order == this.orders[i]) {
                this.subStates.push(state);
                return;
            }
            if (order < this.orders[i]) {
                const concurrentState = new ConcurrentState();
                concurrentState.insert(state);
                this.subStates.splice(i, 0, concurrentState);
                this.orders.splice(i, 0, order);
                return void concurrentState.addOnEndCallback(this.processCheckSubStatesAreFinished.bind(this));
            }
        }
        const concurrentState = new ConcurrentState();
        concurrentState.insert(state);
        this.subStates.push(concurrentState);
        this.orders.push(order);
        concurrentState.addOnEndCallback(this.processCheckSubStatesAreFinished.bind(this));
    }

    processCheckSubStatesAreFinished(): void {
        if (this.subStates[this.curIdx].isDone()) {
            const isSkip = this.subStates[this.curIdx].isSkip;
            ++this.curIdx;
            if (this.subStates.length <= this.curIdx) {
                this.isSkip = isSkip;
                return void this.setDone();
            }
            this.subStates[this.curIdx].onStart(isSkip);
        }
    }
}

/** 延时状态子类 - 继承State，【重点保留原拼写错误_Haldle】，定时器逻辑完全复刻 */
export class WaitSecondState extends State {
    private _waitSecond: number = 0;
    private _timeHaldle: number = -1; // 原代码拼写错误：Haldle 非 Handle，严格保留！改必报错

    constructor(waitSecond: number) {
        super();
        const self = this;
        this._waitSecond = 0;
        this._timeHaldle = -1;
        this._waitSecond = 1000 * waitSecond;
        this.setSkipFlagDuringPlay = function (isSkip: boolean) {
            self.isSkip = isSkip;
            isSkip && self.flagSkipActive && (
                -1 != self._timeHaldle && clearTimeout(self._timeHaldle),
                self.setDone()
            );
        };
    }

    onStart(isSkip?: boolean): void {
        this._done = false;
        const self = this;
        this.flagCanSkipByBeforeStatesSkipFlag && (
            this.isSkip = isSkip,
            isSkip && this.flagSkipActive && (
                -1 != this._timeHaldle && clearTimeout(this._timeHaldle),
                this.setDone()
            )
        );
        this._timeHaldle = setTimeout(function () {
            self.setDone();
        }, this._waitSecond);
    }
}

// 默认导出基类，兼容之前组件的导入方式 import State from "../State"
export default State;