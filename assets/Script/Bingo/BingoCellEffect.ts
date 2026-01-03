const { ccclass, property } = cc._decorator;

import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";

@ccclass('BingoCellEffect')
export default class BingoCellEffect extends cc.Component {
    @property(cc.Node)
    public effectNode: cc.Node = null;

    @property(cc.Node)
    public effectHandNode: cc.Node = null;

    @property(cc.Node)
    public effectNode2: cc.Node = null;

    @property(cc.Node)
    public effectHandNode2: cc.Node = null;

    // 单例对象
    private static _instance: BingoCellEffect = null;

    // 获取单例
    public static instance(): BingoCellEffect {
        return this._instance;
    }

    onLoad() {
        BingoCellEffect._instance = this;
        this.effectNode.active = false;
        this.effectNode2.active = false;
    }

    onDestroy() {
        BingoCellEffect._instance = null;
    }

    /**
     * 播放格子特效
     * @param targetNode 目标节点
     * @param type 特效类型 0-第一个特效 1-第二个特效
     */
    public onEffect(targetNode: cc.Node, type: number) {
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const nodePos = this.effectNode.parent.convertToNodeSpaceAR(worldPos);
        
        if (type === 0) {
            this.effectHandNode.active = (!ServerStorageManager.getAsBoolean(StorageKeyType.COMPLETE_BINGO));
            this.effectNode.setPosition(nodePos);
            this.effectNode.active = true;
        } else {
            this.effectHandNode2.active = (!ServerStorageManager.getAsBoolean(StorageKeyType.COMPLETE_BINGO));
            this.effectNode2.setPosition(nodePos);
            this.effectNode2.active = true;
        }
    }

    /**
     * 关闭格子特效
     * @param type 特效类型 0-第一个特效 1-第二个特效
     */
    public offEffect(type: number) {
        if (type === 0) {
            this.effectNode.active = false;
        } else {
            this.effectNode2.active = false;
        }
    }
}