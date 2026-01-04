const { ccclass, property } = cc._decorator;

import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import SoundManager from "../manager/SoundManager";
import FireHoseSender, { FHLogType } from "../FireHoseSender";

@ccclass
export default class CollectBingoBallEffect extends cc.Component {
    @property(cc.Animation)
    public anim: cc.Animation = null;

    @property(cc.Label)
    public cntLabel: cc.Label = null;

    // 静态全局变量 - 预制体模板 & 对象池 (完整保留原JS逻辑)
    public static template: cc.Prefab = null;
    public static nodePool: cc.NodePool = null;

    // ===================== 静态方法：获取特效节点 (懒加载+对象池复用) =====================
    public static getItem(callFunc: Function) {
        if (CollectBingoBallEffect.template === null) {
            // 预制体懒加载
            cc.loader.loadRes("Service/00_Common/CollectEffect/CollectBallEffect", (err, prefab) => {
                if (err) {
                    const error = new Error("cc.loader.loadRes fail CollectBingoBallEffect: %s".format(JSON.stringify(err)));
                    FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                    callFunc(err, null);
                    return;
                }
                CollectBingoBallEffect.template = prefab;
                const effectNode = cc.instantiate(prefab);
                callFunc(null, effectNode);
            });
        } else {
            // 已有模板 直接实例化
            const effectNode = cc.instantiate(CollectBingoBallEffect.template);
            callFunc(null, effectNode);
        }
    }

    // ===================== 核心静态方法：播放收集球特效 (坐标转换+文本赋值+主逻辑) =====================
    public static OpenEffect(num: number, targetNode: cc.Node, completeFunc?: Function) {
        // 目标节点 世界坐标 -> PopupManager节点 本地坐标 转换 (核心逻辑 精准保留)
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = PopupManager.Instance().node.convertToNodeSpaceAR(worldPos);

        // 优先从对象池获取节点
        const poolNode = CollectBingoBallEffect.getNode();
        if (poolNode) {
            poolNode.active = true;
            const effectCom = poolNode.getComponent(CollectBingoBallEffect);
            effectCom.cntLabel.string = `+${num.toString()}`;
            PopupManager.Instance().node.addChild(poolNode);
            poolNode.setPosition(localPos);
            return;
        }

        // 对象池无可用节点 加载新节点
        CollectBingoBallEffect.getItem((err, effectNode) => {
            if (err) {
                cc.error("invalid CollectBingoBallEffect.OpenEffect");
                return;
            }
            effectNode.active = true;
            const effectCom = effectNode.getComponent(CollectBingoBallEffect);
            PopupManager.Instance().node.addChild(effectNode);
            effectNode.setPosition(localPos);
            effectCom.cntLabel.string = `+${num.toString()}`;
            
            // 执行完成回调
            if (completeFunc !== undefined) {
                completeFunc();
            }
        });
    }

    // ===================== 静态异步方法：封装特效播放为Promise =====================
    public static async asyncOpenEffect(num: number, targetNode: cc.Node): Promise<boolean> {
        return new Promise((resolve) => {
            CollectBingoBallEffect.OpenEffect(num, targetNode, () => {
                resolve(true);
            });
        });
    }

    // ===================== 静态方法：从对象池获取节点 =====================
    public static getNode(): cc.Node {
        if (CollectBingoBallEffect.nodePool === null) {
            CollectBingoBallEffect.nodePool = new cc.NodePool();
        }
        return CollectBingoBallEffect.nodePool.size() === 0 ? null : CollectBingoBallEffect.nodePool.get();
    }

    // ===================== 静态方法：节点放回对象池 (复用核心) =====================
    public static putNode(node: cc.Node) {
        if (CollectBingoBallEffect.nodePool === null) {
            CollectBingoBallEffect.nodePool = new cc.NodePool();
        }
        node.removeFromParent();
        CollectBingoBallEffect.nodePool.put(node);
    }

    // ===================== 生命周期 =====================
    onEnable() {
        // 播放收集动画
        this.anim.play();
        // 延迟1秒 回收节点到对象池
        this.scheduleOnce(this.clear, 1);
        // 播放收集音效 (保留原JS的SoundManager判空逻辑)
        if (SoundManager.Instance()) {
            GameCommonSound.playFxOnce("get_bingoball");
        }
    }

    onDisable() {
        // 空方法 保留原JS结构
    }

    // ===================== 回收节点核心方法 =====================
    private clear() {
        this.node.active = false;
        CollectBingoBallEffect.putNode(this.node);
    }
}