const { ccclass, property } = cc._decorator;

import TSUtility from '../global_utility/TSUtility';
import ServiceSlotDataManager from '../manager/ServiceSlotDataManager';
import SlotBannerItem_Long from './SlotBannerItem_Long';


/**
 * 老虎机横幅Spine组件
 * 继承自SlotBannerItem_Long，负责Spine类型横幅的资源加载、节点管理
 */
@ccclass()
export default class SlotBannerItem_Spine extends SlotBannerItem_Long {
    // ===== 组件属性（序列化） =====
    /** Spine根节点（挂载所有Spine实例） */
    @property(cc.Node)
    public nodeSpineRoot: cc.Node | null = null;


    // ===== 核心方法 =====
    /**
     * 设置空横幅（隐藏Spine，显示加载，重置状态）
     */
    public async setEmptyBanner(): Promise<void> {
        // 显示加载背景，隐藏Spine根节点
        if (this.nodeLoadingBG) this.nodeLoadingBG.active = true;
        if (this.nodeSpineRoot) this.nodeSpineRoot.active = false;
        
        // 取消所有定时回调
        this.unscheduleAllCallbacks();
        // 隐藏所有Tag和Jackpot节点
        this.setActiveAllTag(false);
        this.setActiveAllJackpot(false);
    }

    /**
     * 加载Slot横幅（完整流程）
     * 流程：显示加载 → 更新Jackpot → 更新Jackpot金额 → 更新超大奖励时间 → 加载Spine图片
     */
    public async loadSlotBanner(): Promise<void> {
        // 初始化加载状态
        if (this.nodeLoadingBG) this.nodeLoadingBG.active = true;
        if (this.nodeSpineRoot) this.nodeSpineRoot.active = false;
        this.unscheduleAllCallbacks();

        // 激活Jackpot和Tag父节点
        if (this.nodeJackpotParent) this.nodeJackpotParent.active = true;
        if (this.nodeTagParent) this.nodeTagParent.active = true;

        // 执行异步更新流程
        await this.updateJackpot();
        this.updateJackpotMoney();
        this.updateSupersizeItTime();
        await this.updateImage();
    }

    /**
     * 更新Spine图片（核心逻辑）
     * 1. 先检查是否有本地匹配的Spine节点
     * 2. 无匹配则异步加载Spine资源并实例化
     */
    public async updateImage(): Promise<void> {
        // 隐藏占位文本，重置当前URL
        if (this.lblDummy && this.lblDummy.node) this.lblDummy.node.active = false;
        this._strCurSlotBannerURL = "";

        // 显示加载，隐藏Spine根节点
        if (this.nodeLoadingBG) this.nodeLoadingBG.active = true;
        if (this.nodeSpineRoot) this.nodeSpineRoot.active = false;

        // 隐藏所有Spine子节点
        this.nodeSpineRoot?.children.forEach(child => {
            if (TSUtility.isValid(child)) child.active = false;
        });

        // 获取Slot资源数据
        const slotResData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._strSlotID);
        // 校验Slot ID有效性和资源数据有效性
        if (!ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) || !TSUtility.isValid(slotResData)) {
            // 无效则显示占位文本（Slot ID）
            if (this.lblDummy) {
                this.lblDummy.string = this._strSlotID;
                this.lblDummy.node.active = true;
            }
            return;
        }

        // 查找本地已存在的匹配Spine节点
        let isSpineFound = false;
        this.nodeSpineRoot?.children.forEach((child, index) => {
            if (!TSUtility.isValid(child)) return;
            
            child.active = false;
            // 匹配Spine名称则激活
            if (child.name && child.name.length > 0 && child.name === slotResData.spine) {
                if (this.nodeLoadingBG) this.nodeLoadingBG.active = false;
                if (this.nodeSpineRoot) this.nodeSpineRoot.active = true;
                child.active = true;
                isSpineFound = true;
            }
        });

        // 本地找到匹配Spine，直接返回
        if (isSpineFound) return;

        // 本地未找到，异步加载Spine资源
        this._strCurSlotBannerURL = slotResData.spineURL;
        await new Promise<void>((resolve) => {
            slotResData.loadSpine((spinePrefab: cc.Node | null, url: string) => {
                // 校验组件实例和Spine预制体有效性
                if (!TSUtility.isValid(this) || !TSUtility.isValid(spinePrefab)) {
                    resolve();
                    return;
                }

                // 校验横幅信息和URL匹配性
                if (!TSUtility.isValid(this._infoBanner)) {
                    resolve();
                    return;
                }

                // URL不匹配或为空，直接返回
                if (this._strCurSlotBannerURL !== url || this._strCurSlotBannerURL === "") {
                    resolve();
                    return;
                }

                // 加载成功，更新节点状态
                if (this.nodeLoadingBG) this.nodeLoadingBG.active = false;
                if (this.nodeSpineRoot) this.nodeSpineRoot.active = true;

                // 实例化Spine预制体并挂载到根节点
                const spineNode = cc.instantiate(spinePrefab);
                spineNode.name = slotResData.spine;
                spineNode.parent = this.nodeSpineRoot;
                spineNode.setPosition(cc.Vec2.ZERO);
                spineNode.setScale(1);

                resolve();
            });
        });
    }
}