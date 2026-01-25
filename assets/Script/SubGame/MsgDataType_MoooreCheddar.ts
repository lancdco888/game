const { ccclass } = cc._decorator;


    // ================= 基础消息类 =================
    export class GAME_MSG {
        public name: string = "";
        public callback: Function | null = null;

        /**
         * 校验回调函数是否有效
         * @param cb 待校验的回调函数
         * @returns 有效函数或 null
         */
        protected checkCallback(cb: Function | null): Function | null {
            return cb && typeof cb === "function" ? cb : null;
        }
    }

    // ================= 奖励选择相关枚举 =================
    export enum PICK_NAME {
        PRE_EFFECT = "onPickPreEffect",    // 奖励选择前置特效
        START = "onPickStart",            // 奖励选择开始
        RECOVERY = "onRecovery",          // 奖励选择恢复
        RESULT = "onPickResult",          // 奖励选择结果
        ROLLUP = "onResultRollup",        // 奖励金额滚动
        END = "onPickEnd"                 // 奖励选择结束
    }

    // ================= 奖励选择前置特效消息 =================
    @ccclass("PickPreEffect")
    export class PICK_PRE_EFFECT extends GAME_MSG {
        /**
         * 初始化前置特效消息
         * @param callback 回调函数
         */
        public onInit(callback: Function | null): void {
            this.name = PICK_NAME.PRE_EFFECT;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 奖励选择开始消息 =================
    @ccclass("PickStart")
    export class PICK_START extends GAME_MSG {
        /**
         * 初始化奖励选择开始消息
         * @param callback 回调函数
         */
        public onInit(callback: Function | null): void {
            this.name = PICK_NAME.START;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 奖励选择恢复消息 =================
    @ccclass("PickRecovery")
    export class PICK_RECOVERY extends GAME_MSG {
        public select_index: number = 0;  // 选中索引
        public result_index: number = 0;  // 结果索引
        public win_pay: number = 0;       // 赢得金额

        /**
         * 初始化奖励选择恢复消息
         * @param selectIndex 选中索引
         * @param resultIndex 结果索引
         * @param winPay 赢得金额
         * @param callback 回调函数
         */
        public onInit(selectIndex: number, resultIndex: number, winPay: number, callback: Function = null): void {
            this.name = PICK_NAME.RECOVERY;
            this.select_index = selectIndex;
            this.result_index = resultIndex;
            this.win_pay = winPay;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 奖励选择结果消息 =================
    @ccclass("PickResult")
    export class PICK_RESULT extends GAME_MSG {
        public result_index: number = -1; // 结果索引
        public add_pick: boolean = false; // 是否追加选择

        /**
         * 初始化奖励选择结果消息
         * @param resultIndex 结果索引（默认 -1）
         * @param addPick 是否追加选择（默认 false）
         * @param callback 回调函数
         */
        public onInit(resultIndex: number = -1, addPick: boolean = false, callback: Function | null = null): void {
            this.name = PICK_NAME.RESULT;
            this.result_index = resultIndex;
            this.add_pick = addPick;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 奖励金额滚动消息 =================
    @ccclass("PickRollup")
    export class PICK_ROLLUP extends GAME_MSG {
        public reward: number = 0; // 奖励金额

        /**
         * 初始化奖励金额滚动消息
         * @param reward 奖励金额（默认 0）
         * @param callback 回调函数
         */
        public onInit(reward: number = 0, callback: Function | null = null): void {
            this.name = PICK_NAME.ROLLUP;
            this.reward = reward;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 奖励选择结束消息 =================
    @ccclass("PickEnd")
    export class PICK_END extends GAME_MSG {
        /**
         * 初始化奖励选择结束消息
         * @param callback 回调函数
         */
        public onInit(callback: Function | null): void {
            this.name = PICK_NAME.END;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 说明信息相关枚举 =================
    export enum INFO_NAME {
        EXPLANE = "onExplaneMsg" // 说明消息
    }

    // ================= 说明消息 =================
    @ccclass("ExplaneMsg")
    export class EXPLANE_MSG extends GAME_MSG {
        public jackpot: number = -1;        // Jackpot 类型
        public jackpot_count: number = 0;   // Jackpot 数量
        public money: number = 0;           // 金额

        /**
         * 初始化说明消息
         * @param jackpot Jackpot 类型（默认 -1）
         * @param jackpotCount Jackpot 数量（默认 0）
         * @param money 金额（默认 0）
         * @param callback 回调函数
         */
        public onInit(jackpot: number = -1, jackpotCount: number = 0, money: number = 0, callback: Function | null = null): void {
            this.name = INFO_NAME.EXPLANE;
            this.jackpot = jackpot;
            this.jackpot_count = jackpotCount;
            this.money = money;
            this.callback = this.checkCallback(callback);
        }
    }

    // ================= 侧边角色动画枚举 =================
    export enum SIDE_ANI {
        IDLE = 0,          // 闲置
        EXPECT_WIN = 1,    // 期待赢奖
        EXPECT_FEATURE = 2,// 期待触发特色玩法
        TRIGGER = 3,       // 触发
        SNICKER = 4,       // 窃笑
        START = 5,         // 开始
        LOOP = 6,          // 循环
        END = 7            // 结束
    }

    // ================= Jackpot 消息 =================
    @ccclass("JackpotMsg")
    export class JACKPOT_MSG extends GAME_MSG {
        public flag: boolean = false;       // 显示/隐藏标记
        public jackpot_key: string = "";    // Jackpot 标识
        public jackpot_subid: number = -1;  // Jackpot 子ID
        public reward: number = 0;          // 奖励金额

        /**
         * 初始化 Jackpot 消息
         * @param flag 显示/隐藏标记（默认 false）
         * @param jackpotKey Jackpot 标识（默认 ""）
         * @param jackpotSubId Jackpot 子ID（默认 -1）
         * @param reward 奖励金额（默认 0）
         * @param callback 回调函数
         */
        public onInit(
            flag: boolean = false,
            jackpotKey: string = "",
            jackpotSubId: number = -1,
            reward: number = 0,
            callback: Function | null = null
        ): void {
            this.name = "onJackpotUI";
            this.flag = flag;
            this.jackpot_key = jackpotKey;
            this.jackpot_subid = jackpotSubId;
            this.reward = reward;
            this.callback = this.checkCallback(callback);
        }
    }