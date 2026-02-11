const { ccclass, property } = cc._decorator;

@ccclass()
export default class PlaySpineAnimationOnActive_Zhuquefortune extends cc.Component {
    // 动画名称属性，对应原JS的animationName
    @property
    animationName: string = "";

    // 是否循环属性，对应原JS的bLoop
    @property
    bLoop: boolean = false;

    onLoad(): void {
        // 保持原逻辑，空方法
    }

    onEnable(): void {
        const skeleton = this.getComponent(sp.Skeleton);
        if (skeleton) { // 增加非空判断（原JS隐式容错，TS显式处理更规范，不改变核心逻辑）
            if (this.animationName === "") {
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                skeleton.premultipliedAlpha = false;
                skeleton.setAnimation(0, skeleton.defaultAnimation, this.bLoop);
            } else {
                skeleton.setAnimation(0, this.animationName, this.bLoop);
            }
        }
    }

    setAnimationName(name: string): void {
        this.animationName = name;
    }

    fromBeginningPlay(): void {
        const skeleton = this.getComponent(sp.Skeleton);
        if (skeleton) { // 增加非空判断（TS类型安全优化，不改变核心逻辑）
            if (this.animationName === "") {
                skeleton.setAnimation(0, skeleton.defaultAnimation, this.bLoop);
            } else {
                skeleton.setAnimation(0, this.animationName, this.bLoop);
            }
        }
    }
}