// 保留原项目所有依赖导入，路径与原代码完全一致
import TSUtility from "./global_utility/TSUtility";
import PopupManager from "./manager/PopupManager";
import ServiceInfoManager from "./ServiceInfoManager";
import UIScrollViewData from "./UIScrollViewData";
import UIScrollViewHorizontal from "./UIScrollViewHorizontal";
import UISwipe from "./UISwipe";
import UserInfo from "./User/UserInfo";
import MessageRoutingManager from "./message/MessageRoutingManager";
import LobbyScene from "./LobbyScene";
import LobbyUIBase, { LobbyUIType } from "./LobbyUIBase";
import LobbyUI_SlotScrollView from "./LobbyUI_SlotScrollView";
import LobbySlotBannerInfo, { SlotBannerType } from "./LobbySlotBannerInfo";
import { LobbySceneUIType } from "./SceneInfo";

const { ccclass, property } = cc._decorator;

/**
 * 大厅核心横向滚动容器管理类
 * 负责大厅SLOT Banner的渲染、滚动、定位、滑动切换、消息响应等核心逻辑
 */
@ccclass()
export default class LobbyScrollView extends cc.Component {
    // ===== 私有核心成员变量 =====
    private _scrollView: UIScrollViewHorizontal = null;
    private _arrUIScrollViewData: UIScrollViewData[] = [];
    private _arrSlotBannerInfo: any[] = [];

    // ===== 只读属性 - 与原代码完全一致 =====
    public get typeScene(): LobbySceneUIType {
        return LobbySceneUIType.NONE;
    }

    public get scrollView(): cc.ScrollView {
        return this._scrollView.scrollView;
    }

    public get arrUIScrollViewData(): UIScrollViewData[] {
        return this._arrUIScrollViewData;
    }

    public get arrSlotBannerInfo(): any[] {
        return this._arrSlotBannerInfo;
    }

    public get scrollOffset(): number {
        return !TSUtility.isValid(this._scrollView) ? 0 : this._scrollView.offset.x;
    }

    
    onLoad(): void {
        this._scrollView = this.getComponent(UIScrollViewHorizontal);
        
        // 注册所有消息监听
        const msgMgr = MessageRoutingManager.instance();
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_MOVE_SCROLL_TO_INDEX, this.eventMoveToIndex.bind(this), this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_MOVE_SCROLL_TO_OFFSET, this.eventMoveToOffset.bind(this), this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_MOVE_SCROLL_TO_BANNER, this.eventMoveToBanner.bind(this), this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_MOVE_SCROLL_TO_SLOT, this.eventMoveToSlot.bind(this), this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_REFRESH_ALL_BANNER_ITEM, this.onRefresh.bind(this), this);

        // 注册用户信息变更监听
        const userInfo = UserInfo.instance();
        // userInfo.addListenerTarget(UserInfo.MSG.UPDATE_VIP_POINT, this.onRefresh.bind(this), this);
        // userInfo.addListenerTarget(UserInfo.MSG.UPDATE_PURCHASE_INFO, this.onRefresh.bind(this), this);

        // 添加上下滑动监听 - 切换大厅类型
        const swipeComp = this.node.addComponent(UISwipe);
        if (TSUtility.isValid(swipeComp)) {
            swipeComp.initialize(this._scrollView.node, true);
            swipeComp.funcUpSwipe = this.onSwipeUp.bind(this);
            swipeComp.funcDownSwipe = this.onSwipeDown.bind(this);
        }
    }

    // ===== Cocos生命周期 - 组件销毁 =====
    onDestroy(): void {
        this.unscheduleAllCallbacks();
        // 取消所有消息监听
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        // UserInfo.instance().removeListenerTargetAll(this);
    }

    // ===== 初始化滚动容器数据 =====
    public async initialize(data: any[]): Promise<void> {
        this._arrSlotBannerInfo = data;
        await this.updateScrollViewType();
    }

    // ===== 滚动到最左侧初始位置 =====
    public MoveToFirst(duration: number = 0): void {
        this._scrollView.scrollToOffset(new cc.Vec2(0, this._scrollView.offset.y), duration);
    }

    // ===== 刷新所有Banner数据 =====
    public onRefresh(): void {
        if (TSUtility.isValid(this._scrollView) && this._scrollView.arrItem.length !== 0) {
            this.clearBannerData();
            this.updateSlotBanner();
            this._scrollView.updateAllData(this._arrUIScrollViewData);
        }
    }

    // ===== 核心更新滚动容器数据 - 带动画遮罩 =====
    public async updateScrollViewType(offset: cc.Vec2 = cc.v2(0, 0)): Promise<void> {
        PopupManager.Instance().showBlockingBG(true);
        this._scrollView.clear();
        this._arrUIScrollViewData = [];
        
        this.updateSlotBanner();
        this._scrollView.addArray(this._arrUIScrollViewData);
        this._scrollView.scrollToOffset(offset, 0);
        
        PopupManager.Instance().showBlockingBG(false);
    }

    // ===== 滚动到下一页 =====
    public onMoveNextPage(): boolean {
        const nextIdx = this._scrollView.getNextPageIndex();
        const nextOffset = this._scrollView.getPageOffset(nextIdx);
        const maxOffsetX = this.scrollView.getMaxScrollOffset().x;
        this.scrollView.scrollToOffset(cc.v2(Math.min(maxOffsetX, nextOffset), 0), 0.25, true);
        return true;
    }

    // ===== 滚动到上一页 =====
    public onMovePrevPage(): boolean {
        const prevIdx = this._scrollView.getPrevPageIndex();
        const prevOffset = this._scrollView.getPageOffset(prevIdx);
        this.scrollView.scrollToOffset(cc.v2(Math.max(0, prevOffset), 0), 0.25, true);
        return true;
    }

    // ===== 虚方法 - 子类重写更新Banner =====
    public updateSlotBanner(): void {}

    // ===== 虚方法 - 子类重写更新Banner数据 =====
    public updateSlotBannerData(): void {}

    // ===== 清空Banner数据容器 =====
    public clearBannerData(): void {
        this._arrUIScrollViewData = [];
    }

    // ===== 核心方法 - 推入Banner数据到滚动容器 =====
    public pushBannerData(type: any, data: any = null): void {
        const bannerInfo = LobbySlotBannerInfo.getSlotBannerInfo(type);
        if (TSUtility.isValid(bannerInfo)) {
            bannerInfo.prefabSize = LobbyUI_SlotScrollView.Instance.objectPool.getPrefabSize(type);
            bannerInfo.setData(data);
            
            if (bannerInfo.available) {
                const scrollData = new UIScrollViewData(bannerInfo.prefabSize);
                if (TSUtility.isValid(scrollData)) {
                    scrollData.setData(bannerInfo);
                    this._arrUIScrollViewData.push(scrollData);
                }
            }
        }
    }

    // ===== 获取指定类型的SlotBanner信息 =====
    public getSlotBannerInfo(type: any): any[] {
        const bannerItem = this._arrSlotBannerInfo.find((item) => item.eType === type);
        let arrInfo = [];

        if (TSUtility.isValid(bannerItem) && TSUtility.isValid(bannerItem.arrInfo)) {
            arrInfo = bannerItem.arrInfo;
            // 热门SLOT特殊处理 - 洗牌随机排序
            if (type === SlotBannerType.HOT) {
                const hotBanner = this.getHotSlotBanner(arrInfo);
                if (hotBanner.length > 0) return hotBanner;
            }
        }
        return arrInfo;
    }

    // ===== 核心逻辑 - 热门SLOT洗牌随机排序 (原逻辑1:1复刻 重中之重) =====
    public getHotSlotBanner(arrData: any[]): any[] {
        if (!TSUtility.isValid(arrData) || arrData.length <= 0) return [];

        // 校验缓存的洗牌数组有效性
        if (ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT.length > 0) {
            for (let i = 0; i < ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT.length; i++) {
                const shuffleItem = ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT[i];
                if (!TSUtility.isValid(shuffleItem)) continue;

                const findItem = arrData.find(item => item.strSlotID === shuffleItem.strSlotID);
                if (TSUtility.isValid(findItem)) continue;
                
                ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT = [];
                break;
            }
        }

        // 重新洗牌并缓存
        if (ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT.length <= 0) {
            const copyArr = Array.from(arrData);
            let temp: any;
            // Fisher-Yates 洗牌算法
            for (let i = copyArr.length - 1; i > 0; --i) {
                const randomIdx = Math.floor(Math.random() * (i + 1));
                temp = [copyArr[randomIdx], copyArr[i]];
                copyArr[i] = temp[0];
                copyArr[randomIdx] = temp[1];
            }
            ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT = copyArr;
        }
        return ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT;
    }

    // ===== 消息回调 - 滚动到指定索引 =====
    private eventMoveToIndex(params: {index: number, duration?: number}): void {
        if (TSUtility.isValid(params)) {
            const idx = params.index;
            if (TSUtility.isValid(idx) && idx >= 0) {
                this.moveToIndex(idx, params.duration || 0.5);
            }
        }
    }

    // ===== 消息回调 - 滚动到指定偏移量 =====
    private eventMoveToOffset(params: {offset: number, duration?: number}): void {
        if (TSUtility.isValid(params)) {
            const offset = params.offset;
            if (TSUtility.isValid(offset)) {
                this._scrollView.scrollToOffset(new cc.Vec2(offset, this._scrollView.offset.y), params.duration || 0.5);
            }
        }
    }

    // ===== 消息回调 - 滚动到指定类型的Banner =====
    private eventMoveToBanner(params: {type: any, duration?: number}): void {
        if (TSUtility.isValid(params)) {
            const type = params.type;
            if (TSUtility.isValid(type)&& type !== SlotBannerType.NONE) {
                this.moveToBanner(type, params.duration || 0.5);
            }
        }
    }

    // ===== 消息回调 - 滚动到指定ID的Slot =====
    private eventMoveToSlot(params: {slotID: string, duration?: number}): void {
        if (TSUtility.isValid(params)) {
            const slotID = params.slotID;
            if (TSUtility.isValid(slotID) && slotID.length > 0) {
                this.moveToSlot(slotID, params.duration || 0.5);
            }
        }
    }

    // ===== 核心滚动定位 - 滚动到指定索引 (偏移量计算公式原封不动) =====
    public moveToIndex(index: number, duration: number = 0.5): void {
        if (!TSUtility.isValid(this._scrollView) || index < 0 || index >= this._arrUIScrollViewData.length) return;
        
        const scrollData = this._arrUIScrollViewData[index];
        if (TSUtility.isValid(scrollData)) {
            const targetOffset = this._scrollView.getOffsetToIndex(index) - this._scrollView.view.width / 2 + scrollData.itemSize.width / 2;
            this._scrollView.scrollToOffset(new cc.Vec2(-targetOffset, this._scrollView.offset.y), duration);
        }
    }

    // ===== 滚动定位 - 滚动到指定类型的Banner =====
    public moveToBanner(type: any, duration: number = 0.5): void {
        if (!TSUtility.isValid(this._scrollView)) return;
        
        const targetIdx = this._arrUIScrollViewData.findIndex((item) => {
            const itemData = item.itemData;
            return TSUtility.isValid(itemData)&& itemData.type === type;
        });
        if (targetIdx >= 0) this.moveToIndex(targetIdx, duration);
    }

    // ===== 滚动定位 - 滚动到指定ID的Slot =====
    public moveToSlot(slotID: string, duration: number = 0.5): void {
        if (!TSUtility.isValid(this._scrollView)) return;
        
        const targetIdx = this._arrUIScrollViewData.findIndex((item) => {
            const itemData = item.itemData;
            if (!TSUtility.isValid(itemData)) return false;
            if (itemData.type !== SlotBannerType.NORMAL && itemData.type !== SlotBannerType.DYNAMIC) return false;
            
            const findSlot = itemData.arrSlotBanner.find((slot) => !TSUtility.isValid(slot) && slot.strSlotID === slotID);
            return TSUtility.isValid(findSlot);
        });
        if (targetIdx >= 0) this.moveToIndex(targetIdx, duration);
    }

    // ===== 播放Banner打开动画 =====
    public playOpenAction(delay: number): void {
        const visibleItems = this._scrollView.arrVisibleItem;
        if (TSUtility.isValid(visibleItems) && visibleItems.length !==0) {
            for (let i = 0; i < visibleItems.length; i++) {
                const item = visibleItems[i];
                if (TSUtility.isValid(item)) {
                    // const banner = item.banner;
                    // if (TSUtility.isValid(banner)) banner.playOpenAction(delay);
                }
            }
        }
    }

    // ===== 切换大厅类型 =====
    public changeLobbyType(type: LobbySceneUIType): void {
        const sideMenuUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.SIDE_MENU);
        if (TSUtility.isValid(sideMenuUI)) {
            // switch(type) {
            //     case LobbySceneUIType.LOBBY: sideMenuUI.onClick_Home(); break;
            //     case LobbySceneUIType.SUITE: sideMenuUI.onClick_Suite(); break;
            //     case LobbySceneUIType.YOURS: sideMenuUI.onClick_Yours(); break;
            // }
        }
    }

    // ===== 上滑回调 - 切换上一级大厅 =====
    private onSwipeUp(): void {
        const targetType = LobbyScene.instance.UI.type - 1;
        if (targetType > 0) this.changeLobbyType(targetType);
    }

    // ===== 下滑回调 - 切换下一级大厅 =====
    private onSwipeDown(): void {
        const targetType = LobbyScene.instance.UI.type + 1;
        if (targetType < LobbySceneUIType.COUNT) this.changeLobbyType(targetType);
    }
}