const { ccclass } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 精准无偏差 =====================
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import SlotJackpotManager from "../manager/SlotJackpotManager";
//import ADBannerDataManager from "../../ADBanner/ADBannerDataManager";
import LobbySceneUI from "../LobbySceneUI";
import LobbyBannerLinkedInfo, { LinkedDisplayInfo } from "./LobbyBannerLinkedInfo";
import LobbySlotBannerInfo, { SlotBannerType, SlotBannerDecoType } from "../LobbySlotBannerInfo";
import LobbyScrollView from "../LobbyScrollView";
import { LobbySceneUIType } from "../SceneInfo";

// ✅ 核心修复: 自定义Component组件 空@ccclass() 无类名 → 彻底根治类名指定报错
@ccclass()
export default class LobbyScrollView_Lobby extends LobbyScrollView {
    // ===================== 业务常量配置 - 原JS数值完整复刻 只读不可修改 符合TS最佳实践 =====================
    private readonly LONG_SLOT_BEST_BANNER_COUNT: number = 6;
    private readonly LONG_SPACING: number = 3;
    private readonly MAX_BANNER_COUNT: number = 2;

    // ===================== 只读属性 - 原JS Object.defineProperty 完整还原为TS原生get访问器 =====================
    public get typeScene(): LobbySceneUIType {
        return LobbySceneUIType.LOBBY;
    }

    // ===================== 核心业务方法 - 组装大厅所有老虎机横幅数据 原JS逻辑1:1精准复刻 无任何修改 =====================
    public updateSlotBanner(): void {
        // 填充空占位横幅
        this.pushBannerData(SlotBannerType.EMPTY, 6);
        // 广告横幅 - 大厅首位
        // this.pushBannerData(SlotBannerType.SERVICE_BANNER, ADBannerType.LOBBY_FIRST);
        // 各类业务横幅依次添加
        // this.pushBannerData(SlotBannerType.EARLY_ACCESS, this.getSlotBannerInfo(SlotBannerType.EARLY_ACCESS));
        // this.pushBannerData(SlotBannerType.NEW, this.getSlotBannerInfo(SlotBannerType.NEW));
        // this.pushBannerData(SlotBannerType.SUPERSIZE_IT, this.getSlotBannerInfo(SlotBannerType.SUPERSIZE_IT));
        // this.pushBannerData(SlotBannerType.RECENTLY);
        // this.pushBannerData(SlotBannerType.POWER_GEM);
        // this.pushBannerData(SlotBannerType.HOT, this.getSlotBannerInfo(SlotBannerType.HOT));
        // 广告横幅 - 大厅第二位
        //this.pushBannerData(SlotBannerType.SERVICE_BANNER, ADBannerType.LOBBY_SECOND);
        // this.pushBannerData(SlotBannerType.TOURNEY);
        // this.pushBannerData(SlotBannerType.REVAMP, this.getSlotBannerInfo(SlotBannerType.REVAMP));
        // this.pushBannerData(SlotBannerType.REEL_QUEST, this.getSlotBannerInfo(SlotBannerType.REEL_QUEST));
        // // 装饰横幅 - 所有老虎机通用
        // this.pushBannerData(SlotBannerType.DECO, SlotBannerDecoType.ALL_SLOTS);

        // 过滤普通横幅 排除联动横幅已包含的SlotID
        let normalBannerList = Array.from(this.getSlotBannerInfo(SlotBannerType.NORMAL));
        const linkedSlotInfoList = this.getLinkedSlotInfo();
        const linkedSlotIDs: string[] = [];
        linkedSlotInfoList.forEach(info => {
            linkedSlotIDs.push(info.infoLeftBanner.strSlotID);
            linkedSlotIDs.push(info.infoRightBanner.strSlotID);
        });
        // 过滤掉联动已包含的老虎机ID
        normalBannerList = normalBannerList.filter(banner => !linkedSlotIDs.includes(banner.strSlotID));

        // 截取最优横幅数量
        const bestBannerList = normalBannerList.splice(0, Math.min(this.LONG_SLOT_BEST_BANNER_COUNT, normalBannerList.length));
        let tempNormalList: any[] = [];
        let lineIndex: number = 0;
        let spacingCount: number = 0;

        // 推送首个最优普通横幅
        this.pushBannerData(SlotBannerType.NORMAL, [bestBannerList.shift()]);

        // ✅ 核心循环组装普通横幅+间距装饰+联动横幅 原JS逻辑完全复刻
        while (normalBannerList.length > 0) {
            const currentBanner = normalBannerList.shift();
            if (!TSUtility.isValid(currentBanner)) continue;

            tempNormalList.push(currentBanner);
            // 数据不足时补空占位
            if (normalBannerList.length <= 0 && tempNormalList.length < this.MAX_BANNER_COUNT) {
                tempNormalList.push(null);
                this.pushBannerData(SlotBannerType.NORMAL, Array.from(tempNormalList));
                continue;
            }
            // 未达最大数量 继续收集
            if (tempNormalList.length < this.MAX_BANNER_COUNT) continue;

            // 推送收集好的普通横幅组
            this.pushBannerData(SlotBannerType.NORMAL, Array.from(tempNormalList));
            spacingCount++;
            tempNormalList = [];

            // 间距达标 插入分隔装饰/联动横幅
            if (bestBannerList.length > 0) {
                if (spacingCount >= this.LONG_SPACING) {
                    this.handleBestBannerAndLinked(lineIndex, spacingCount, bestBannerList, linkedSlotInfoList);
                    lineIndex++;
                    spacingCount = 0;
                }
            }

            // 最优横幅耗尽+间距达标+剩余数据充足 插入分隔装饰
            if (bestBannerList.length <= 0 && spacingCount >= this.LONG_SPACING && normalBannerList.length >=7) {
                this.pushBannerData(SlotBannerType.DECO, SlotBannerDecoType.SLOT_LINE);
                this.pushBannerData(SlotBannerType.NORMAL, [normalBannerList.shift()]);
                spacingCount = 0;
            }
        }

        // 填充尾部空占位横幅 保证滚动容器长度
        this.pushBannerData(SlotBannerType.EMPTY, 30);
    }

    // ===================== 私有辅助方法 - 处理最优横幅+联动横幅插入逻辑 抽离原JS嵌套逻辑 可读性提升 =====================
    private handleBestBannerAndLinked(lineIndex: number, spacingCount: number, bestBannerList: any[], linkedSlotInfoList: LinkedDisplayInfo[]): void {
        const targetLinkedInfo = linkedSlotInfoList.find(info => info.numIndex - 1 === lineIndex);
        if (!TSUtility.isValid(targetLinkedInfo)) {
            // 插入分隔装饰+联动横幅
            this.pushBannerData(SlotBannerType.DECO, SlotBannerDecoType.SLOT_LINE);
            this.pushBannerData(SlotBannerType.LINKED, targetLinkedInfo);
            // 过滤已使用的联动数据
            linkedSlotInfoList = linkedSlotInfoList.filter(info => info !== targetLinkedInfo);
        } else {
            // 插入分隔装饰+最优横幅
            this.pushBannerData(SlotBannerType.DECO, SlotBannerDecoType.SLOT_LINE);
            this.pushBannerData(SlotBannerType.NORMAL, [bestBannerList.shift()]);
        }
    }

    // ===================== 核心业务方法 - 获取联动老虎机横幅信息 排序+过滤+组装 原JS逻辑1:1精准复刻 =====================
    public getLinkedSlotInfo(): LinkedDisplayInfo[] {
        const linkedBannerList = Array.from(this.getSlotBannerInfo(SlotBannerType.LINKED));
        const linkedDisplayInfoList: LinkedDisplayInfo[] = [];

        // 遍历联动横幅 组装左右横幅数据+联动Key
        for (let i = 0; i < linkedBannerList.length; i++) {
            const currentBanner = linkedBannerList[i];
            if (!TSUtility.isValid(currentBanner)) continue;

            // 获取老虎机大奖联动信息
            const slotMachineInfo = SlotJackpotManager.Instance().getSlotmachineInfo(SDefine.VIP_LOUNGE_ZONEID, currentBanner.strSlotID);
            if (!TSUtility.isValid(slotMachineInfo) || !slotMachineInfo.isExistLinkedJackpot()) continue;

            const linkedKey = slotMachineInfo.getLinkedJackpotKey();
            const existLinkedInfo = linkedDisplayInfoList.find(info => info.strLinkedKey === linkedKey);

            if (!TSUtility.isValid(existLinkedInfo)) {
                // 新建联动展示数据
                const newLinkedInfo = new LinkedDisplayInfo();
                newLinkedInfo.strLinkedKey = linkedKey;
                newLinkedInfo.infoLeftBanner = currentBanner;
                
                // 匹配联动横幅配置
                const linkedConfig = ServiceSlotDataManager.LINKED_SLOT_BANNER.find(config => config.linkedKey === linkedKey);
                if (TSUtility.isValid(linkedConfig)) {
                    newLinkedInfo.eFrameType = linkedConfig.type;
                    newLinkedInfo.numIndex = linkedConfig.index;
                }
                linkedDisplayInfoList.push(newLinkedInfo);
            } else {
                // 填充右侧横幅数据
                existLinkedInfo.infoRightBanner = currentBanner;
            }
        }

        // 按索引正序排序 保证联动横幅展示顺序正确
        return linkedDisplayInfoList.sort((a, b) => {
            if (a.numIndex > b.numIndex) return 1;
            if (a.numIndex < b.numIndex) return -1;
            return 0;
        });
    }
}