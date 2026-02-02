import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import HoundComponent_HoundOfHades from "./HoundComponent_HoundOfHades";
import HoundOfHadesManager from "./HoundOfHadesManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 猎犬组件管理器
 * 管理蓝/红/绿三只猎犬的初始化、状态更新、动画触发等逻辑
 */
@ccclass('HoundsComponent_HoundOfHades')
export default class HoundsComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 编辑器绑定属性 ======
    @property(cc.Node)
    public blue_Hound: cc.Node = null;  // 蓝色猎犬节点

    @property(cc.Node)
    public red_Hound: cc.Node = null;    // 红色猎犬节点

    @property(cc.Node)
    public green_Hound: cc.Node = null;  // 绿色猎犬节点

    @property(cc.Node)
    public dim_Node: cc.Node = null;     // 遮罩节点（猎犬触发时使用）

    // ====== 私有成员变量 ======
    private _prev_Blue: number = 0;  // 蓝色猎犬罐值历史记录
    private _prev_Red: number = 0;   // 红色猎犬罐值历史记录
    private _prev_Green: number = 0; // 绿色猎犬罐值历史记录

    /**
     * 初始化猎犬组件
     * 读取游戏状态并设置猎犬初始罐值/禁用状态
     */
    initHound() {
        if (!this.blue_Hound || !this.red_Hound || !this.green_Hound) {
            console.warn('HoundsComponent: 猎犬节点未绑定');
            return;
        }

        // 获取各猎犬组件实例并初始化
        const blueHoundComp = this.blue_Hound.getComponent(HoundComponent_HoundOfHades);
        const redHoundComp = this.red_Hound.getComponent(HoundComponent_HoundOfHades);
        const greenHoundComp = this.green_Hound.getComponent(HoundComponent_HoundOfHades);
        
        blueHoundComp?.initHound();
        redHoundComp?.initHound();
        greenHoundComp?.initHound();

        // 读取基础游戏状态中的罐值
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        const bluePot = baseGameState.getGaugesValue("pot_blue_grade");
        const redPot = baseGameState.getGaugesValue("pot_red_grade");
        const greenPot = baseGameState.getGaugesValue("pot_green_grade");

        // 记录初始罐值
        this._prev_Blue = bluePot;
        this._prev_Red = redPot;
        this._prev_Green = greenPot;

        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const gameManager = HoundOfHadesManager.getInstance() as HoundOfHadesManager;

        // 基础模式：设置正常罐值
        if (nextSubGameKey === "base") {
            blueHoundComp?.setHoundPot(bluePot);
            redHoundComp?.setHoundPot(redPot);
            greenHoundComp?.setHoundPot(greenPot);
        } 
        // LockNRoll模式：根据宝石显示状态设置罐值/禁用
        else {
            // 蓝色猎犬
            if (gameManager.game_components.isShowBlueGem()) {
                this._prev_Blue = 4;
                blueHoundComp?.setHoundPot(4);
            } else {
                const adjustedBlue = bluePot === 3 ? 2 : bluePot;
                blueHoundComp?.setDisalbe(adjustedBlue); // 注：原代码拼写为setDisalbe，保持不变
            }

            // 红色猎犬
            if (gameManager.game_components.isShowRedGem()) {
                this._prev_Red = 4;
                redHoundComp?.setHoundPot(4);
            } else {
                const adjustedRed = redPot === 3 ? 2 : redPot;
                redHoundComp?.setDisalbe(adjustedRed);
            }

            // 绿色猎犬
            if (gameManager.game_components.isShowGreenGem()) {
                this._prev_Green = 4;
                greenHoundComp?.setHoundPot(4);
            } else {
                const adjustedGreen = greenPot === 3 ? 2 : greenPot;
                greenHoundComp?.setDisalbe(adjustedGreen);
            }
        }
    }

    /**
     * 判断是否需要更新猎犬状态
     * @returns 是否需要更新
     */
    isUpdateHound(): boolean {
        // 读取当前下注金额（原代码调用但未使用返回值，保留逻辑）
        SlotGameRuleManager.Instance.getCurrentBetPerLine();

        // 读取最新罐值
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        let bluePot = baseGameState.getGaugesValue("pot_blue_grade");
        let redPot = baseGameState.getGaugesValue("pot_red_grade");
        let greenPot = baseGameState.getGaugesValue("pot_green_grade");

        // LockNRoll模式下强制罐值为3
        const gameManager = HoundOfHadesManager.getInstance() as HoundOfHadesManager;
        if (gameManager.game_components.isShowBlueGem()) bluePot = 3;
        if (gameManager.game_components.isShowRedGem()) redPot = 3;
        if (gameManager.game_components.isShowGreenGem()) greenPot = 3;

        // 判断是否有罐值变化（且值>1）
        const isBlueChanged = this._prev_Blue !== bluePot && bluePot > 1;
        const isRedChanged = this._prev_Red !== redPot && redPot > 1;
        const isGreenChanged = this._prev_Green !== greenPot && greenPot > 1;

        return isBlueChanged || isRedChanged || isGreenChanged;
    }

    /**
     * 更新猎犬罐值状态
     * @param callback 所有更新完成后的回调函数
     */
    updateHound(callback?: () => void) {
        if (!this.blue_Hound || !this.red_Hound || !this.green_Hound) {
            callback?.();
            return;
        }

        // 读取当前下注金额（原代码调用但未使用返回值，保留逻辑）
        SlotGameRuleManager.Instance.getCurrentBetPerLine();

        // 获取最新罐值
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        let bluePot = baseGameState.getGaugesValue("pot_blue_grade");
        let redPot = baseGameState.getGaugesValue("pot_red_grade");
        let greenPot = baseGameState.getGaugesValue("pot_green_grade");

        // LockNRoll模式下强制罐值为3
        const gameManager = HoundOfHadesManager.getInstance() as HoundOfHadesManager;
        if (gameManager.game_components.isShowBlueGem()) bluePot = 3;
        if (gameManager.game_components.isShowRedGem()) redPot = 3;
        if (gameManager.game_components.isShowGreenGem()) greenPot = 3;

        // 标记各猎犬是否更新完成
        let isBlueDone = false;
        let isRedDone = false;
        let isGreenDone = false;
        let hasAnyUpdate = false;

        // 所有更新完成后的统一回调
        const onAllDone = () => {
            if (isBlueDone && isRedDone && isGreenDone && TSUtility.isValid(callback)) {
                callback();
                // 清空回调避免重复执行
                callback = undefined;
            }
        };

        // 获取猎犬组件实例
        const blueHoundComp = this.blue_Hound.getComponent(HoundComponent_HoundOfHades);
        const redHoundComp = this.red_Hound.getComponent(HoundComponent_HoundOfHades);
        const greenHoundComp = this.green_Hound.getComponent(HoundComponent_HoundOfHades);

        // 更新蓝色猎犬
        if (this._prev_Blue !== bluePot && blueHoundComp) {
            blueHoundComp.updatePot(this._prev_Blue, bluePot, () => {
                isBlueDone = true;
                onAllDone();
            });
            this._prev_Blue = bluePot;
            hasAnyUpdate = true;
        } else {
            isBlueDone = true;
        }

        // 更新红色猎犬
        if (this._prev_Red !== redPot && redHoundComp) {
            redHoundComp.updatePot(this._prev_Red, redPot, () => {
                isRedDone = true;
                onAllDone();
            });
            this._prev_Red = redPot;
            hasAnyUpdate = true;
        } else {
            isRedDone = true;
        }

        // 更新绿色猎犬
        if (this._prev_Green !== greenPot && greenHoundComp) {
            greenHoundComp.updatePot(this._prev_Green, greenPot, () => {
                isGreenDone = true;
                onAllDone();
            });
            this._prev_Green = greenPot;
            hasAnyUpdate = true;
        } else {
            isGreenDone = true;
        }

        // 无更新时直接执行回调
        if (!hasAnyUpdate && TSUtility.isValid(callback)) {
            callback();
        }
    }

    /**
     * 设置所有猎犬为闲置状态
     */
    idleHounds() {
        this.blue_Hound?.getComponent(HoundComponent_HoundOfHades)?.setIdle();
        this.red_Hound?.getComponent(HoundComponent_HoundOfHades)?.setIdle();
        this.green_Hound?.getComponent(HoundComponent_HoundOfHades)?.setIdle();
    }

    /**
     * 触发猎犬动画（移动到遮罩节点，播放触发音效）
     */
    triggerHounds() {
        if (!this.dim_Node) {
            console.warn('HoundsComponent: dim_Node未绑定');
            return;
        }

        // 读取当前下注金额（原代码调用但未使用返回值，保留逻辑）
        SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const gameManager = HoundOfHadesManager.getInstance() as HoundOfHadesManager;

        // 蓝色猎犬
        if (gameManager.game_components.isShowBlueGem()) {
            this.dim_Node.active = true;
            this.blue_Hound.getComponent(HoundComponent_HoundOfHades)?.setTrigger();
            this.blue_Hound.parent = this.dim_Node;
        } else {
            const bluePot = SlotGameResultManager.Instance.getSubGameState("base").getGaugesValue("pot_blue_grade");
            const adjustedBlue = bluePot === 3 ? 2 : bluePot;
            this.blue_Hound?.getComponent(HoundComponent_HoundOfHades)?.setDisalbe(adjustedBlue);
        }

        // 红色猎犬
        if (gameManager.game_components.isShowRedGem()) {
            this.dim_Node.active = true;
            this.red_Hound.getComponent(HoundComponent_HoundOfHades)?.setTrigger();
            this.red_Hound.parent = this.dim_Node;
        } else {
            const redPot = SlotGameResultManager.Instance.getSubGameState("base").getGaugesValue("pot_red_grade");
            const adjustedRed = redPot === 3 ? 2 : redPot;
            this.red_Hound?.getComponent(HoundComponent_HoundOfHades)?.setDisalbe(adjustedRed);
        }

        // 绿色猎犬
        if (gameManager.game_components.isShowGreenGem()) {
            this.dim_Node.active = true;
            this.green_Hound.getComponent(HoundComponent_HoundOfHades)?.setTrigger();
            this.green_Hound.parent = this.dim_Node;
        } else {
            const greenPot = SlotGameResultManager.Instance.getSubGameState("base").getGaugesValue("pot_green_grade");
            const adjustedGreen = greenPot === 3 ? 2 : greenPot;
            this.green_Hound?.getComponent(HoundComponent_HoundOfHades)?.setDisalbe(adjustedGreen);
        }

        // 播放猎犬触发音效
        SlotSoundController.Instance().playAudio("HoundTrigger", "FX");
    }

    /**
     * 将猎犬返回原父节点，隐藏遮罩
     */
    returnHounds() {
        // 恢复父节点
        this.blue_Hound.parent = this.node;
        this.red_Hound.parent = this.node;
        this.green_Hound.parent = this.node;
        // 隐藏遮罩
        this.dim_Node.active = false;
    }

    /**
     * 设置蓝色猎犬击中状态
     */
    setBlueHit() {
        this.blue_Hound?.getComponent(HoundComponent_HoundOfHades)?.setHit();
    }

    /**
     * 设置红色猎犬击中状态
     */
    setRedHit() {
        this.red_Hound?.getComponent(HoundComponent_HoundOfHades)?.setHit();
    }

    /**
     * 设置绿色猎犬击中状态
     */
    setGreenHit() {
        this.green_Hound?.getComponent(HoundComponent_HoundOfHades)?.setHit();
    }

    /**
     * 设置蓝色猎犬特色状态（注：原代码拼写为setFeatrue，保持不变）
     */
    setBlueFeature() {
        this.blue_Hound?.getComponent(HoundComponent_HoundOfHades)?.setFeatrue();
    }

    /**
     * 设置红色猎犬特色状态
     */
    setRedFeature() {
        this.red_Hound?.getComponent(HoundComponent_HoundOfHades)?.setFeatrue();
    }

    /**
     * 设置绿色猎犬特色状态
     */
    setGreenFeature() {
        this.green_Hound?.getComponent(HoundComponent_HoundOfHades)?.setFeatrue();
    }
}