import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import PlaySpineAnimationOnActive from "../../../../Script/SubGame/PlaySpineAnimationOnActive";
import TSUtility from "../../../../Script/global_utility/TSUtility";


const { ccclass, property } =cc._decorator;

/**
 * 哈迪斯之犬 - 单只猎犬组件
 * 管理单只猎犬的等级显示、动画播放、状态切换（闲置/击中/触发/禁用等）
 */
@ccclass()
export default class HoundComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 编辑器绑定属性 ======
    @property([cc.Node])
    public level_Nodes: cc.Node[] = [];      // 等级显示节点数组

    @property([cc.Animation])
    public level_Anis: cc.Animation[] = [];   // 等级动画组件数组

    @property([cc.Node])
    public levelUp_Nodes: cc.Node[] = [];    // 升级特效节点数组

    @property(cc.Node)
    public complete_Node: cc.Node = null;      // 满级节点

    @property([cc.Node])
    public disable_Nodes: cc.Node[] = [];    // 禁用状态节点数组

    @property(cc.Animation)
    public complete_Ani: cc.Animation = null;  // 满级动画组件

    @property([cc.Node])
    public idle_Spines: cc.Node[] = [];      // 闲置Spine动画节点数组

    /**
     * 初始化猎犬状态
     * 隐藏所有等级、升级、禁用、满级节点
     */
    initHound() {
        // 隐藏等级节点
        this.level_Nodes?.forEach(node => node.active = false);
        // 隐藏升级节点
        this.levelUp_Nodes?.forEach(node => node.active = false);
        // 隐藏禁用节点
        this.disable_Nodes?.forEach(node => node.active = false);
        // 隐藏满级节点
        this.complete_Node!.active = false; // 原代码直接使用，默认绑定
    }

    /**
     * 设置猎犬罐值（等级）
     * @param level 目标等级（1-4）
     */
    setHoundPot(level: number) {
        if (!this.level_Nodes || !this.levelUp_Nodes || !this.disable_Nodes || !this.level_Anis || !this.complete_Ani) {
            console.warn('HoundComponent: 动画/节点属性未绑定');
            return;
        }

        const targetLevel = level;
        
        // 隐藏所有升级节点
        this.levelUp_Nodes.forEach(node => node.active = false);
        // 隐藏所有禁用节点
        this.disable_Nodes.forEach(node => node.active = false);
        // 显示对应等级节点
        this.level_Nodes.forEach((node, idx) => node.active = targetLevel === idx);

        // 处理满级状态（等级4）
        const isMaxLevel = targetLevel === 4;
        this.complete_Node!.active = isMaxLevel;

        if (isMaxLevel) {
            // 播放满级闲置动画
            this.level_Anis[4].stop();
            this.level_Anis[4].play("TopUI_Level_5_idle");
            this.level_Anis[4].setCurrentTime(0);
            this.complete_Ani.stop();
            this.complete_Ani.play("TopUI_Level_5_idle");
        } else {
            // 播放1-3级闲置动画
            for (let i = 0; i < 3; i++) {
                this.level_Anis[i].stop();
                this.level_Anis[i].play("TopUI_Level_idle");
                this.level_Anis[i].setCurrentTime(0);
            }
            // 播放4级闲置动画（非满级）
            this.level_Anis[4].stop();
            this.level_Anis[4].play("TopUI_Level_4_idle");
            this.level_Anis[4].setCurrentTime(0);
        }
    }

    /**
     * 升级罐值（逐步升级，带动画）
     * @param fromLevel 起始等级
     * @param toLevel 目标等级
     * @param callback 升级完成后的回调
     */
    updatePot(fromLevel: number, toLevel: number, callback?: () => void) {
        let currentLevel = fromLevel;
        const self = this;

        // 递归升级逻辑
        const levelUpStep = () => {
            if (currentLevel < toLevel) {
                currentLevel++;
                self.setPotUpHound(currentLevel, levelUpStep);
            } else {
                // 升级完成，设置最终等级并执行回调
                self.setHoundPot(toLevel);
                if (TSUtility.isValid(callback)) {
                    callback();
                }
            }
        };

        // 启动第一步升级
        currentLevel++;
        this.setPotUpHound(currentLevel, levelUpStep);
    }

    /**
     * 播放升级特效
     * @param level 升级后的等级
     * @param callback 特效播放完成后的回调
     */
    setPotUpHound(level: number, callback?: () => void) {
        const levelUpIndex = this.getLevelUpIndex(level);
        if (levelUpIndex < 0) return;

        if (!this.level_Nodes || !this.disable_Nodes || !this.levelUp_Nodes) {
            callback?.();
            return;
        }

        // 隐藏等级节点
        this.level_Nodes.forEach(node => node.active = false);
        // 隐藏禁用节点
        this.disable_Nodes.forEach(node => node.active = false);
        // 显示对应升级节点
        this.levelUp_Nodes.forEach((node, idx) => node.active = levelUpIndex === idx);

        // 满级时显示满级节点
        this.complete_Node!.active = levelUpIndex === 3;

        // 播放升级音效
        SlotSoundController.Instance().playAudio("HoundLevelUp", "FX");

        // 延迟0.77秒执行回调
        this.scheduleOnce(() => {
            if (TSUtility.isValid(callback)) {
                callback();
            }
        }, 0.77);
    }

    /**
     * 将等级转换为升级节点索引
     * @param level 猎犬等级（1-4）
     * @returns 升级节点索引（0-3），无效等级返回-1
     */
    getLevelUpIndex(level: number): number {
        switch (level) {
            case 1: return 0;
            case 2: return 1;
            case 3: return 2;
            case 4: return 3;
            default: return -1;
        }
    }

    /**
     * 设置猎犬击中状态（播放击中动画）
     */
    setHit() {
        if (!this.level_Anis) return;

        // 取消闲置调度
        this.unschedule(this.setIdle);

        // 播放1-3级击中动画
        for (let i = 0; i < 3; i++) {
            this.level_Anis[i].stop();
            this.level_Anis[i].play("TopUI_Level_hit");
            this.level_Anis[i].setCurrentTime(0);
        }

        // 播放4级击中动画
        this.level_Anis[3].stop();
        this.level_Anis[3].play("TopUI_Level_4_hit");
        this.level_Anis[3].setCurrentTime(0);

        // 0.5秒后恢复闲置状态
        this.scheduleOnce(this.setIdle.bind(this), 0.5);
    }

    /**
     * 设置猎犬闲置状态（播放闲置动画）
     */
    setIdle() {
        if (!this.level_Anis || !this.idle_Spines) return;

        // 播放1-3级闲置动画
        for (let i = 0; i < 3; i++) {
            this.level_Anis[i].stop();
            this.level_Anis[i].play("TopUI_Level_idle");
            this.level_Anis[i].setCurrentTime(0);
        }

        // 播放4级闲置动画
        this.level_Anis[3].stop();
        this.level_Anis[3].play("TopUI_Level_4_idle");
        this.level_Anis[3].setCurrentTime(0);

        // 播放闲置Spine动画
        this.idle_Spines.forEach(node => {
            const spineComp = node.getComponent(PlaySpineAnimationOnActive);
            spineComp?.fromBeginningPlay();
        });
    }

    /**
     * 设置猎犬触发状态（播放触发动画）
     */
    setTrigger() {
        if (!this.levelUp_Nodes || !this.level_Nodes || !this.level_Anis || !this.complete_Ani) return;

        // 显示满级升级节点
        this.levelUp_Nodes.forEach((node, idx) => node.active = idx === 3);
        // 显示满级等级节点
        this.level_Nodes.forEach((node, idx) => node.active = idx === 4);

        // 播放满级出场动画
        this.level_Anis[4].stop();
        this.level_Anis[4].play("TopUI_Level_5_appear");
        this.level_Anis[4].setCurrentTime(0);

        // 显示满级节点并播放满级出场动画
        this.complete_Node!.active = true;
        this.complete_Ani.stop();
        this.complete_Ani.play("TopUI_Level_5_appear");
        this.complete_Ani.setCurrentTime(0);

        // 1.72秒后切换为满级闲置动画
        this.scheduleOnce(() => {
            this.level_Anis![4].stop();
            this.level_Anis![4].play("TopUI_Level_5_idle");
            this.level_Anis![4].setCurrentTime(0);
        }, 1.72);
    }

    /**
     * 设置猎犬特色状态（播放特色动画，注：原代码拼写为setFeatrue，保持不变）
     */
    setFeatrue() {
        if (!this.level_Anis || !this.complete_Ani) return;

        // 播放满级击中动画
        this.level_Anis[4].stop();
        this.level_Anis[4].play("TopUI_Level_5_hit");
        this.level_Anis[4].setCurrentTime(0);

        // 显示满级节点并播放满级击中动画
        this.complete_Node!.active = true;
        this.complete_Ani.stop();
        this.complete_Ani.play("TopUI_Level_5_hit");
        this.complete_Ani.setCurrentTime(0);

        // 0.5秒后恢复满级闲置动画
        this.scheduleOnce(() => {
            this.complete_Ani!.stop();
            this.complete_Ani!.play("TopUI_Level_5_idle");
            this.complete_Ani!.setCurrentTime(0);
            
            this.level_Anis![4].stop();
            this.level_Anis![4].play("TopUI_Level_5_idle");
            this.level_Anis![4].setCurrentTime(0);
        }, 0.5);
    }

    /**
     * 设置猎犬禁用状态（注：原代码拼写为setDisalbe，保持不变）
     * @param level 禁用等级
     */
    setDisalbe(level: number) {
        // 初始化状态后显示对应禁用节点
        this.initHound();
        this.disable_Nodes[level].active = true;
    }
}