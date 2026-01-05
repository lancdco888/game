import TSUtility from '../global_utility/TSUtility';
import { SlotBannerTagType } from '../SlotBannerItemTag';
import LobbySlotBannerItem from '../LobbySlotBannerItem';
import SlotBannerItem from '../SlotBannerItem';

const { ccclass, property } = cc._decorator;

// HOT样式常量抽离 - 优化点
const TAG_OFFSET_X = 7;
const JACKPOT_SCALE = 1.08;
const JACKPOT_OFFSET_Y = -16;

/**
 * 大厅热门老虎机Banner列表项 - HOT版本
 * 继承自基础Banner项，拓展HOT标签样式+双布局切换逻辑
 */
@ccclass('LobbySlotBannerItem_HOT')
export default class LobbySlotBannerItem_HOT extends LobbySlotBannerItem {
    // ===== Cocos序列化属性 =====
    @property({ type: cc.Prefab, displayName: "Banner项预制体" })
    public prefab: cc.Prefab = null!;

    @property({ type: cc.Node, displayName: "4个Banner位根节点" })
    public node4SlotBanner: cc.Node = null!;

    @property({ type: cc.Node, displayName: "3个Banner位根节点" })
    public node3SlotBanner: cc.Node = null!;

    @property({ type: cc.Layout, displayName: "4位布局组件" })
    public layout4Slot: cc.Layout = null!;

    @property({ type: cc.Layout, displayName: "3位布局组件" })
    public layout3Slot: cc.Layout = null!;

    // ===== 私有成员变量 =====
    private readonly MAX_COUNT: number = 4; // 4位布局最大数量
    private _arr4SlotItemBanner: SlotBannerItem[] = []; // 4位Banner项实例池
    private _arr3SlotItemBanner: SlotBannerItem[] = []; // 3位Banner项实例池

    /**
     * 初始化方法 - 预创建所有Banner项实例+绑定HOT样式
     */
    public initialize(): void {
        // 初始化4个Banner位
        for (let i = 0; i < this.MAX_COUNT; ++i) {
            const bannerItem = this.createSlotBanner(this.prefab, this.layout4Slot.node);
            this._initHotBannerStyle(bannerItem);
            this._arr4SlotItemBanner.push(bannerItem);
        }
        // 初始化3个Banner位
        for (let i = 0; i < 3; ++i) {
            const bannerItem = this.createSlotBanner(this.prefab, this.layout3Slot.node);
            this._initHotBannerStyle(bannerItem);
            this._arr3SlotItemBanner.push(bannerItem);
        }
    }

    /**
     * 刷新方法 - 根据数据源更新UI
     */
    public refresh(): void {
        // 数据源判空：无效则隐藏所有布局
        if (!this.info || !TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            this.node4SlotBanner.active = false;
            this.node3SlotBanner.active = false;
            return;
        }

        // 自动切换布局
        this.node4SlotBanner.active = this.info.arrSlotBanner.length > 3;
        this.node3SlotBanner.active = this.info.arrSlotBanner.length <= 3;

        // 赋值4位布局数据 - 修复数组越界
        if (this.node4SlotBanner.active) {
            for (let i = 0; i < this.MAX_COUNT; ++i) {
                if (i < this.info.arrSlotBanner.length) {
                    this.setSlotBannerInfo(this.info.arrSlotBanner[i], this._arr4SlotItemBanner[i]);
                }
            }
        }

        // 赋值3位布局数据
        if (this.node3SlotBanner.active) {
            for (let i = 0; i < 3; ++i) {
                if (i >= this.info.arrSlotBanner.length) {
                    this._arr3SlotItemBanner[i].node.active = false;
                } else {
                    this._arr3SlotItemBanner[i].node.active = true;
                    this.setSlotBannerInfo(this.info.arrSlotBanner[i], this._arr3SlotItemBanner[i]);
                }
            }
        }
    }

    /**
     * 私有方法：统一初始化HOT版本Banner样式
     */
    private _initHotBannerStyle(bannerItem: SlotBannerItem): void {
        bannerItem.addHideTagType(SlotBannerTagType.HOT);
        bannerItem.nodeTagLeft.position = cc.v3(bannerItem.nodeTagLeft.position.x + TAG_OFFSET_X, bannerItem.nodeTagLeft.position.y);
        bannerItem.nodeTagRight.position = cc.v3(bannerItem.nodeTagRight.position.x - TAG_OFFSET_X, bannerItem.nodeTagRight.position.y);
        bannerItem.nodeJackpotParent.scale = JACKPOT_SCALE;
        bannerItem.nodeJackpotParent.position = cc.v3(bannerItem.nodeJackpotParent.position.x, bannerItem.nodeJackpotParent.position.y + JACKPOT_OFFSET_Y);
    }
}