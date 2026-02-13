const { ccclass, property } = cc._decorator;

import InitSpineComponent from "../../InitSpineComponent";
import Symbol from "../../Slot/Symbol";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

/**
 * 超级七爆炸符号组件
 * 继承自基础Symbol类，扩展了暗态激活/取消的颜色、透明度处理逻辑
 */
@ccclass()
export default class Symbol_SuperSevenBlasts extends Symbol {


    /**
     * 设置暗态激活状态
     * @param e 是否激活暗态
     * @param t 颜色过渡时长（默认0，即立即生效）
     */
    setDimmActive(e: boolean, t: number = 0): void {
        let targetNode: cc.Node = this.node;

        // 处理暗态节点的显示/隐藏
        if (this.dimm) {
            if (e) {
                // 激活暗态：隐藏所有子节点，显示暗态节点
                for (let i = 0; i < this.node.children.length; ++i) {
                    this.node.children[i].active = false;
                }
                this.dimm.active = true;
                targetNode = this.dimm;
            } else {
                // 取消暗态：显示所有子节点，隐藏暗态节点
                for (let i = 0; i < this.node.children.length; ++i) {
                    this.node.children[i].active = true;
                }
                this.dimm.active = false;
            }
        }

        // 处理颜色和透明度（未忽略时）
        if (!this.ignoreSetDimmColor) {
            let targetColor: cc.Color;

            if (e) {
                // 激活暗态：设置自定义暗态颜色
                let r = 127, g = 127, b = 127, a = 127;
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                
                // 根据子游戏Key区分默认颜色
                if (subGameKey === 'base') {
                    r = 100;
                    g = 90;
                    b = 120;
                    a = 170;
                } else {
                    r = 100;
                    g = 90;
                    b = 160;
                    a = 240;
                }

                // 覆盖自定义颜色值
                if (this.customDimmA !== -1) a = this.customDimmA;
                if (this.customDimmR !== -1) r = this.customDimmR;
                if (this.customDimmG !== -1) g = this.customDimmG;
                if (this.customDimmB !== -1) b = this.customDimmB;

                targetColor = new cc.Color(r, g, b, a);

                // 批量修改所有子组件颜色
                this.setAllChildrenColor(targetNode, targetColor, t);
                // 设置节点整体透明度
                targetNode.opacity = a;
            } else {
                // 取消暗态：恢复默认白色
                targetColor = new cc.Color(255, 255, 255, 255);
                
                // 批量恢复所有子组件颜色
                this.setAllChildrenColor(targetNode, targetColor, t);
                // 恢复节点整体透明度
                targetNode.opacity = 255;
            }
        }
    }

    /**
     * 批量设置节点下所有指定组件的颜色
     * @param node 目标节点
     * @param color 目标颜色
     * @param duration 过渡时长
     */
    private setAllChildrenColor(node: cc.Node, color: cc.Color, duration: number): void {
        // 处理Sprite组件
        const sprites = node.getComponentsInChildren(cc.Sprite);
        sprites.forEach(sprite => this.changeNodeColor(sprite.node, color, duration));

        // 处理Animation组件
        const animations = node.getComponentsInChildren(cc.Animation);
        animations.forEach(anim => this.changeNodeColor(anim.node, color, duration));

        // 处理Spine组件（特殊处理premultipliedAlpha）
        const skeletons = node.getComponentsInChildren(sp.Skeleton);
        skeletons.forEach(skeleton => {
            const isChanged = this.changeNodeColor(skeleton.node, color, duration);
            if (isChanged) {
                skeleton.premultipliedAlpha = false;
            } else {
                const spineComp = skeleton.getComponent(InitSpineComponent);
                spineComp ? spineComp.setSpineInfo() : skeleton.premultipliedAlpha = true;
            }
            
        });

        // 处理Label组件
        const labels = node.getComponentsInChildren(cc.Label);
        labels.forEach(label => this.changeNodeColor(label.node, color, duration));
    }

    /**
     * 修改节点颜色（支持渐变）
     * @param node 目标节点
     * @param color 目标颜色
     * @param duration 渐变时长（0=立即生效）
     * @returns 是否成功修改
     */
    changeNodeColor(node: cc.Node, color: cc.Color, duration: number): boolean {
        if (!node) return false;
        
        if (duration > 0) {
            // 渐变修改颜色
            cc.tween(node).to(duration, { color }).start();
        } else {
            // 立即修改颜色
            node.color = color;
        }
        return true;
    }
}