const { ccclass, property } = cc._decorator;

/**
 * 老虎机加载弹窗的子预制体组件
 * 作用：控制老虎机的普通Banner图/高级Banner图/普通边框的显示与隐藏
 */
@ccclass("LoadingSlotPrefabComponent")
export default class LoadingSlotPrefabComponent extends cc.Component {
    // ====================== Cocos 序列化绑定属性 ======================
    /** 老虎机普通Banner图精灵 */
    @property(cc.Sprite)
    public bannerNormal: cc.Sprite = null!;

    /** 老虎机高级/套装Banner图精灵 */
    @property(cc.Sprite)
    public bannerSuite: cc.Sprite = null!;

    /** 老虎机普通边框精灵 */
    @property(cc.Sprite)
    public frameNormal: cc.Sprite = null!;

    // ====================== 核心业务方法 ======================
    /**
     * 清空/隐藏所有老虎机的图片和边框
     * 原JS逻辑完全保留：判空后隐藏对应节点
     */
    public clear(): void {
        this.bannerNormal && (this.bannerNormal.node.active = false);
        this.bannerSuite && (this.bannerSuite.node.active = false);
        this.frameNormal && (this.frameNormal.node.active = false);
    }
}