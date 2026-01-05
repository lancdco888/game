// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import CustomJackpotDataManager from "../manager/CustomJackpotDataManager";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import SlotBannerItem from "../SlotBannerItem";
import { Utility } from "../global_utility/Utility";

/**
 * 老虎机小尺寸横幅子项 (核心基础横幅单元)
 * 继承SlotBannerItem基类，核心功能：小尺寸横幅图加载/占位、奖金池(Jackpot)金额实时刷新、hover悬浮图赋值、加载中占位、空数据兜底，是所有小横幅的基础组件
 */
@ccclass
export default class SlotBannerItem_Small extends SlotBannerItem {
    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Node)
    public nodeLoadingBG: cc.Node = null!;

    @property(cc.Node)
    public nodeJackpot: cc.Node = null!;

    @property(cc.Sprite)
    public sprImage: cc.Sprite = null!;

    @property(cc.Sprite)
    public sprHoverImage: cc.Sprite = null!;

    @property(cc.Label)
    public lblDummy: cc.Label = null!;

    @property(cc.Label)
    public lblJackpot: cc.Label = null!;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    private _numPrevJackpotMoney: number = 0;
    private _strCurSlotBannerURL: string = "";

    // ===================== 核心方法 - 设置空横幅占位 (原逻辑完整保留，异步Promise+加载中状态，规则不变) =====================
    public async setEmptyBanner(): Promise<void> {
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }
        this.unscheduleAllCallbacks();
        this.lblDummy.node.active = false;
        this.setActiveAllTag(false);
        this.setActiveAllJackpot(false);
    }

    // ===================== 核心方法 - 加载老虎机横幅数据 (原逻辑完整保留，异步链式调用：更新奖金池→刷新奖金金额→加载图片) =====================
    public async loadSlotBanner(): Promise<void> {
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }
        this.unscheduleAllCallbacks();
        this.nodeTagParent.active = true;
        this.nodeJackpotParent.active = true;

        await this.updateJackpot();
        this.updateJackpotMoney();
        await this.updateImage();
    }

    // ===================== 核心异步方法 - 更新奖金池状态与金额 (原逻辑完整保留，奖金池类型判断/金额计算规则丝毫不差) =====================
    public async updateJackpot(): Promise<void> {
        this.nodeJackpot.active = false;
        this._numPrevJackpotMoney = 0;
        this._arrJackpotType = [];

        const jackpotMachineInfo = SlotJackpotManager.Instance().getSlotmachineInfo(this._numZoneID, this._strSlotID);
        const customJackpotSubId = CustomJackpotDataManager.instance().findCustomJackpotSubID(this._strSlotID);
        const customJackpotMoney = CustomJackpotDataManager.instance().findCustomJackpotMoney(this._strSlotID);
        let jackpotMoney: number = 0;

        // 非自定义奖金池 逻辑分支 - 按默认4类奖金池(GRAND/MEGA/MAJOR/MINOR)依次判断
        if (!TSUtility.isValid(customJackpotSubId)) {
            const isAddJackpot = ServiceSlotDataManager.ADD_JACKPOT_KEY.indexOf(this._strSlotID) !== -1;
            // 判断 GRAND 奖金池
            if (jackpotMachineInfo.isExistJackpotType(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_GRAND + 1 : SDefine.SLOT_JACKPOT_TYPE_GRAND)) {
                jackpotMoney = jackpotMachineInfo.getJackpotForLobbySlot(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_GRAND + 1 : SDefine.SLOT_JACKPOT_TYPE_GRAND);
                if (TSUtility.isValid(customJackpotMoney)) {
                    jackpotMoney += customJackpotMoney.getCustomJackpotMoney(isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_GRAND +1) : String(SDefine.SLOT_JACKPOT_TYPE_GRAND), this._numZoneID);
                }
                this._numPrevJackpotMoney = jackpotMoney;
                this.nodeJackpot.active = true;
                return;
            }
            // 判断 MEGA 奖金池
            if (jackpotMachineInfo.isExistJackpotType(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MEGA +1 : SDefine.SLOT_JACKPOT_TYPE_MEGA)) {
                jackpotMoney = jackpotMachineInfo.getJackpotForLobbySlot(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MEGA +1 : SDefine.SLOT_JACKPOT_TYPE_MEGA);
                if (TSUtility.isValid(customJackpotMoney)) {
                    jackpotMoney += customJackpotMoney.getCustomJackpotMoney(isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_MEGA +1) : String(SDefine.SLOT_JACKPOT_TYPE_MEGA), this._numZoneID);
                }
                this._numPrevJackpotMoney = jackpotMoney;
                this.nodeJackpot.active = true;
                return;
            }
            // 判断 MAJOR 奖金池
            if (jackpotMachineInfo.isExistJackpotType(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MAJOR +1 : SDefine.SLOT_JACKPOT_TYPE_MAJOR)) {
                jackpotMoney = jackpotMachineInfo.getJackpotForLobbySlot(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MAJOR +1 : SDefine.SLOT_JACKPOT_TYPE_MAJOR);
                if (TSUtility.isValid(customJackpotMoney)) {
                    jackpotMoney += customJackpotMoney.getCustomJackpotMoney(isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_MAJOR +1) : String(SDefine.SLOT_JACKPOT_TYPE_MAJOR), this._numZoneID);
                }
                this._numPrevJackpotMoney = jackpotMoney;
                this.nodeJackpot.active = true;
                return;
            }
            // 判断 MINOR 奖金池
            if (jackpotMachineInfo.isExistJackpotType(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MINOR +1 : SDefine.SLOT_JACKPOT_TYPE_MINOR)) {
                jackpotMoney = jackpotMachineInfo.getJackpotForLobbySlot(isAddJackpot ? SDefine.SLOT_JACKPOT_TYPE_MINOR +1 : SDefine.SLOT_JACKPOT_TYPE_MINOR);
                if (TSUtility.isValid(customJackpotMoney)) {
                    jackpotMoney += customJackpotMoney.getCustomJackpotMoney(isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_MINOR +1) : String(SDefine.SLOT_JACKPOT_TYPE_MINOR), this._numZoneID);
                }
                this._numPrevJackpotMoney = jackpotMoney;
                this.nodeJackpot.active = true;
                return;
            }
        } 
        // 自定义奖金池 逻辑分支
        else {
            const subIdList = customJackpotSubId.getSubIDList();
            for (let i = 0; i < subIdList.length; ++i) {
                if (customJackpotSubId.isExistJackpotType(jackpotMachineInfo, i)) {
                    jackpotMoney = customJackpotSubId.getJackpotForLobbySlot(jackpotMachineInfo, i);
                    if (TSUtility.isValid(customJackpotMoney)) {
                        jackpotMoney += customJackpotSubId.getCustomJackpotMoney(customJackpotMoney, i, this._numZoneID);
                    }
                    this._numPrevJackpotMoney = jackpotMoney;
                    this.nodeJackpot.active = true;
                    break;
                }
            }
        }
    }

    // ===================== 核心异步方法 - 加载小尺寸横幅图片 (原逻辑完整保留，图片加载/占位/容错规则精准还原) =====================
    public async updateImage(): Promise<void> {
        this.lblDummy.node.active = false;
        this._strCurSlotBannerURL = "";
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;
        if (TSUtility.isValid(this.sprHoverImage)) {
            this.sprHoverImage.spriteFrame = null;
        }

        const slotResData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._strSlotID);
        // 容错逻辑：老虎机ID无效/资源数据为空 → 显示占位文本(SlotID)
        if (!ServiceSlotDataManager.instance.isContainsSlotID(this._strSlotID) || !TSUtility.isValid(slotResData)) {
            this.lblDummy.string = this._strSlotID;
            this.lblDummy.node.active = true;
            return;
        }

        // 正常逻辑：加载小尺寸横幅图 + 悬浮图赋值为同一张图
        this._strCurSlotBannerURL = slotResData.smallURL;
        await new Promise<void>((resolve) => {
            slotResData.loadSmallImage((spriteFrame: cc.SpriteFrame, url: string) => {
                if (TSUtility.isValid(this) && TSUtility.isValid(spriteFrame) && TSUtility.isValid(this._infoBanner) && this._strCurSlotBannerURL === url && this._strCurSlotBannerURL !== "") {
                    this.nodeLoadingBG.active = false;
                    this.sprImage.spriteFrame = spriteFrame;
                    if (TSUtility.isValid(this.sprHoverImage)) {
                        this.sprHoverImage.spriteFrame = this.sprImage.spriteFrame;
                    }
                }
                resolve();
            });
        });
    }

    // ===================== 核心方法 - 实时刷新奖金池金额 (原逻辑完整保留，定时器循环刷新+金额格式化，数值规则无修改) =====================
    public updateJackpotMoney(): void {
        const self = this;
        if (!this.nodeJackpot.active) return;

        // 奖金池金额刷新逻辑体
        const refreshJackpotMoney = () => {
            const jackpotMachineInfo = SlotJackpotManager.Instance().getSlotmachineInfo(self._numZoneID, self._strSlotID);
            const customJackpotSubId = CustomJackpotDataManager.instance().findCustomJackpotSubID(self._strSlotID);
            let jackpotMoney = 0;
            let jackpotType = "";

            // 自定义奖金池金额计算
            if (TSUtility.isValid(customJackpotSubId)) {
                jackpotMoney = customJackpotSubId.getJackpotForLobbySlot(jackpotMachineInfo, 0);
                jackpotType = customJackpotSubId.getSubIDList()[0];
            } 
            // 默认奖金池金额计算
            else {
                const isGrandJackpot = ServiceSlotDataManager.JACKPOT_GRAND.indexOf(self._strSlotID) !== -1;
                const isAddJackpot = ServiceSlotDataManager.ADD_JACKPOT_KEY.indexOf(self._strSlotID) !== -1;
                jackpotType = isGrandJackpot 
                    ? (isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_GRAND +1) : String(SDefine.SLOT_JACKPOT_TYPE_GRAND))
                    : (isAddJackpot ? String(SDefine.SLOT_JACKPOT_TYPE_MEGA +1) : String(SDefine.SLOT_JACKPOT_TYPE_MEGA));
                jackpotMoney = jackpotMachineInfo.getJackpotForLobbySlot(jackpotType);
            }

            // 金额修正+格式化显示
            jackpotMoney = Utility.getDisplayJackpotMoney(self._numPrevJackpotMoney, jackpotMoney);
            const customJackpotMoney = CustomJackpotDataManager.instance().findCustomJackpotMoney(self._strSlotID);
            if (TSUtility.isValid(customJackpotMoney)) {
                if (TSUtility.isValid(customJackpotSubId)) {
                    jackpotMoney += customJackpotSubId.getCustomJackpotMoney(customJackpotMoney, 0, self._numZoneID);
                } else {
                    jackpotMoney += customJackpotMoney.getCustomJackpotMoney(jackpotType, self._numZoneID);
                }
            }
            
            self.lblJackpot.string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            self._numPrevJackpotMoney = jackpotMoney;
        };

        // 立即执行一次 + 定时器循环刷新 (间隔取自全局常量)
        refreshJackpotMoney();
        this.schedule(refreshJackpotMoney, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
    }
}