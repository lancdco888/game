const { ccclass, property } = cc._decorator;

// import MembersClassBoostUpManager from "../../ServiceInfo/MembersClassBoostUpManager";
// import MembersClassBoostUpNormalManager from "../../ServiceInfo/MembersClassBoostUpNormalManager";
import TSUtility from "../global_utility/TSUtility";

@ccclass
export default class MembersBoostUpPopupIntroEffect extends cc.Component {
    @property(cc.Node)
    public nodeCenterEffect: cc.Node = null;

    @property(cc.Node)
    public nodeUIEffect: cc.Node = null;

    // ===================== 生命周期 =====================
    onLoad() {
        // 初始化隐藏所有特效
        TSUtility.isValid(this.nodeCenterEffect) && (this.nodeCenterEffect.active = false);
        TSUtility.isValid(this.nodeUIEffect) && (this.nodeUIEffect.active = false);
    }

    // ===================== 核心方法：构建特效播放的动画序列 =====================
    public getActionPlayEffect(completeFunc: Function, type: number, isShowCenter: boolean = true): cc.Action {
        let actionArr: cc.FiniteTimeAction[] = null;
        const self = this;

        // // ===== 分支1: 会员等级提升 核心流程 =====
        // if (MembersClassBoostUpManager.instance().isRunningMembersBoostUpProcess() === 1) {
        //     if (TSUtility.isValid(this.nodeCenterEffect) || TSUtility.isValid(this.nodeUIEffect)) {
        //         actionArr = [];
        //     }
            
        //     // 中心特效播放 + 本地存储记录 + 延迟隐藏
        //     if (MembersClassBoostUpManager.instance().canShowCenterEffect(type) && TSUtility.isValid(this.nodeCenterEffect) && isShowCenter) {
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeCenterEffect.active = true;
        //             MembersClassBoostUpManager.instance().setEndTimeShowMembersClassBoostUpCenterEffectToLocalStorage(type);
        //         }));
        //         actionArr.push(cc.delayTime(3.5));
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeCenterEffect.active = false;
        //         }));
        //     }

        //     // UI标签特效播放 + 短延迟
        //     if (TSUtility.isValid(this.nodeUIEffect)) {
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeUIEffect.active = true;
        //         }));
        //         actionArr.push(cc.delayTime(0.67));
        //     }

        //     // 执行外部回调
        //     if (TSUtility.isValid(completeFunc)) {
        //         actionArr.push(cc.callFunc(() => {
        //             completeFunc();
        //         }));
        //     }
        // }
        // // ===== 分支2: 普通会员等级提升 拓展流程 =====
        // else if (MembersClassBoostUpNormalManager.instance().isRunningMembersBoostUpExpandProcess() === 1) {
        //     if (TSUtility.isValid(this.nodeCenterEffect) || TSUtility.isValid(this.nodeUIEffect)) {
        //         actionArr = [];
        //     }

        //     // 中心特效播放 + 本地存储记录 + 延迟隐藏
        //     if (MembersClassBoostUpNormalManager.instance().canShowCenterEffect(type) && TSUtility.isValid(this.nodeCenterEffect) && isShowCenter) {
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeCenterEffect.active = true;
        //             MembersClassBoostUpNormalManager.instance().setEndTimeShowMembersClassBoostUpExpandCenterEffectToLocalStorage(type);
        //         }));
        //         actionArr.push(cc.delayTime(3.5));
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeCenterEffect.active = false;
        //         }));
        //     }

        //     // UI标签特效播放 + 短延迟
        //     if (TSUtility.isValid(this.nodeUIEffect)) {
        //         actionArr.push(cc.callFunc(() => {
        //             self.nodeUIEffect.active = true;
        //         }));
        //         actionArr.push(cc.delayTime(0.67));
        //     }

        //     // 执行外部回调
        //     if (TSUtility.isValid(completeFunc)) {
        //         actionArr.push(cc.callFunc(() => {
        //             completeFunc();
        //         }));
        //     }
        // }

        // 返回组合的序列动画，无动画则返回null
        // return (actionArr != null && actionArr.length > 0) ? cc.sequence(actionArr) : null;
        return null;
    }

    // ===================== 对外调用：播放入场特效总流程 =====================
    public playIntroEffect(mainComplete: Function, type: number, endComplete: Function, isShowCenter: boolean = true) {
        const self = this;
        const playAction = this.getActionPlayEffect(mainComplete, type, isShowCenter) as any;
        
        if (playAction != null) {
            this.node.runAction(cc.sequence(playAction, cc.callFunc(() => {
                self.processCallback(endComplete);
            })));
        } else {
            this.processCallback(endComplete);
        }
    }

    // ===================== 快捷方法：直接显示UI标签特效 无延迟 =====================
    public showMembersClassBoostUpTagDirect(callback: Function) {
        TSUtility.isValid(this.nodeUIEffect) && (this.nodeUIEffect.active = true);
        TSUtility.isValid(callback) && callback();
    }

    // ===================== 统一回调执行方法：有效性校验封装 =====================
    public processCallback(callback: Function) {
        TSUtility.isValid(callback) && callback();
    }

    // ===================== 快捷方法：强制隐藏所有特效 =====================
    public hideAllEffect() {
        TSUtility.isValid(this.nodeCenterEffect) && (this.nodeCenterEffect.active = false);
        TSUtility.isValid(this.nodeUIEffect) && (this.nodeUIEffect.active = false);
    }
}