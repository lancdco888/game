const { ccclass, property } = cc._decorator;
import SlotUIRuleManager from "./rule/SlotUIRuleManager";

@ccclass
export default class Symbol extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，类型/变量名/默认值/顺序完全一致，一个不漏 =====
    @property({ type: Number })
    public symbolId: number = 0;

    @property({ type: cc.Sprite })
    public symbolImg: cc.Sprite = null;

    @property({ type: Number })
    public zOrder: number = 0;

    @property({ type: cc.Node })
    public dimm: cc.Node = null;

    @property({ type: [cc.Node] })
    public listNodeExceptChangeColor: cc.Node[] = [];

    @property({ type: cc.Boolean })
    public ignoreSetDimmColor: boolean = false;

    @property({ type: Number })
    public customDimmR: number = -1;

    @property({ type: Number })
    public customDimmG: number = -1;

    @property({ type: Number })
    public customDimmB: number = -1;

    @property({ type: Number })
    public customDimmA: number = -1;

    // ===== 生命周期回调 - onLoad 原逻辑为空，严格保留空方法 =====
    onLoad(): void { }

    // ===== 核心暗态激活方法 - 原逻辑一字不改，含默认参数写法/松散判空/颜色规则，重中之重 =====
    setDimmActive(isActive: boolean, delay?: number): void {
        void 0 === delay && (delay = 0);
        let targetNode = this.node;

        if (null != this.dimm) {
            if (isActive) {
                for (let o = 0; o < this.node.children.length; ++o) {
                    this.node.children[o].active = false;
                }
                this.dimm.active = true;
                targetNode = this.dimm;
            } else {
                for (let o = 0; o < this.node.children.length; ++o) {
                    this.node.children[o].active = true;
                }
                this.dimm.active = false;
            }
        }

        if (!this.ignoreSetDimmColor) {
            let r = 127, g = 127, b = 127, a = 127;
            if (SlotUIRuleManager.Instance._symbolDimmInfo) {
                r = SlotUIRuleManager.Instance._symbolDimmInfo.r;
                g = SlotUIRuleManager.Instance._symbolDimmInfo.g;
                b = SlotUIRuleManager.Instance._symbolDimmInfo.b;
                a = SlotUIRuleManager.Instance._symbolDimmInfo.a;
            }

            -1 != this.customDimmA && (a = this.customDimmA);
            -1 != this.customDimmR && (r = this.customDimmR);
            -1 != this.customDimmG && (g = this.customDimmG);
            -1 != this.customDimmB && (b = this.customDimmB);

            const targetColor = new cc.Color(r, g, b, a);
            if (isActive) {
                this.searchAllChildNodeChangeColor(targetNode, targetColor, delay, isActive);
            } else {
                const normalColor = new cc.Color(255, 255, 255, 255);
                this.searchAllChildNodeChangeColor(targetNode, normalColor, delay, isActive);
            }
        }
    }

    // ===== 颜色变更例外判断 - 原逻辑不变，松散判断数组索引 =====
    isInExceptListChangeColor(node: cc.Node): boolean {
        return -1 != this.listNodeExceptChangeColor.indexOf(node);
    }

    // ===== 递归子节点颜色变更 - 原逻辑完全复刻，含所有组件类型/龙骨特殊处理，核心方法 =====
    searchAllChildNodeChangeColor(targetNode: cc.Node, targetColor: cc.Color, delay: number, isDimmActive: boolean): void {
        void 0 === delay && (delay = 0);
        void 0 === isDimmActive && (isDimmActive = false);

        // Sprite组件颜色变更
        const sprites = targetNode.getComponentsInChildren(cc.Sprite);
        for (let i = 0; i < sprites.length; ++i) {
            this.changeNodeColor(sprites[i].node, targetColor, delay);
        }

        // Animation组件颜色变更
        const animations = targetNode.getComponentsInChildren(cc.Animation);
        for (let i = 0; i < animations.length; ++i) {
            this.changeNodeColor(animations[i].node, targetColor, delay);
        }

        // 龙骨组件颜色变更 + 透明度预乘处理【原逻辑核心特征保留】
        const skeletons = targetNode.getComponentsInChildren(sp.Skeleton);
        for (let i = 0; i < skeletons.length; ++i) {
            this.changeNodeColor(skeletons[i].node, targetColor, delay) && (skeletons[i].premultipliedAlpha = !isDimmActive);
        }

        // Label组件颜色变更
        const labels = targetNode.getComponentsInChildren(cc.Label);
        for (let i = 0; i < labels.length; ++i) {
            this.changeNodeColor(labels[i].node, targetColor, delay);
        }

        // 根节点透明度同步
        targetNode.opacity = targetColor.getA();
    }

    // ===== 单个节点颜色变更 - 【保留原代码笔误核心特征：tintTo(R,G,R)】，改必报错！ =====
    changeNodeColor(node: cc.Node, targetColor: cc.Color, delay: number): boolean {
        void 0 === delay && (delay = 0);
        if (!this.isInExceptListChangeColor(node)) {
            if (0 == delay) {
                node.stopAllActions();
                node.color = targetColor;
            } else {
                // 原代码原生笔误：第三个参数是 R 不是 B，严格保留，这是项目原始逻辑！
                node.runAction(cc.tintTo(delay, targetColor.getR(), targetColor.getG(), targetColor.getR()));
                node.runAction(cc.fadeTo(delay, targetColor.getA()));
            }
            return true;
        }
        return false;
    }

    // ===== 自定义暗态激活 - 原逻辑完全复刻，含默认参数/自定义颜色规则，无任何改动 =====
    setCustomDimmActive(isActive: boolean, customColor: cc.Color|number, delay: number): void {
        void 0 === customColor && (customColor = new cc.Color(127, 127, 127, 127));
        void 0 === delay && (delay = 0);
        let targetNode = this.node;

        if (null != this.dimm) {
            if (isActive) {
                for (let a = 0; a < this.node.children.length; ++a) {
                    this.node.children[a].active = false;
                }
                this.dimm.active = true;
                targetNode = this.dimm;
            } else {
                for (let a = 0; a < this.node.children.length; ++a) {
                    this.node.children[a].active = true;
                }
                this.dimm.active = false;
            }
        }

        if (!this.ignoreSetDimmColor) {
            if (isActive) {
                this.searchAllChildNodeChangeColor(targetNode, customColor, delay, isActive);
            } else {
                const normalColor = new cc.Color(255, 255, 255, 255);
                this.searchAllChildNodeChangeColor(targetNode, normalColor, delay, isActive);
            }
        }
    }
}