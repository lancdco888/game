const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import GameCommonSound from "../GameCommonSound";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import SuiteLeagueResultHighRank from "../Rank/SuiteLeagueResultHighRank";
import SuiteLeagueResultTopRank from "../Rank/SuiteLeagueResultTopRank";
import SuiteLeagueResultUnderRank from "../Rank/SuiteLeagueResultUnderRank";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";

// ===================== 套装联赛结果弹窗 继承弹窗基类 =====================
@ccclass
export default class SuiteLeagueResultPopup extends DialogBase {
    // ===================== 序列化绑定子组件 原数据完整保留 类型精准匹配 =====================
    @property(SuiteLeagueResultTopRank)
    private nodeTopRank: SuiteLeagueResultTopRank = null;

    @property(SuiteLeagueResultHighRank)
    private nodeHighRank: SuiteLeagueResultHighRank = null;

    @property(SuiteLeagueResultUnderRank)
    private nodeUnderRank: SuiteLeagueResultUnderRank = null;

    // ===================== 静态核心方法 - 加载弹窗预制体 带进度显示+异常上报 =====================
    public static getPopup(callback: Function): void {
        if (callback != null) {
            PopupManager.Instance().showDisplayProgress(true);
        }
        const popupPath: string = "Service/01_Content/SuiteLeague/SuiteLeaugeResultPopup";
        
        TSUtility.getServerBaseNowUnixTime();
        cc.loader.loadRes(popupPath, (error, prefab) => {
            if (callback != null) {
                PopupManager.Instance().showDisplayProgress(false);
            }

            if (error) {
                const loadError = new Error("cc.loader.loadRes fail %s: %s".format(popupPath, JSON.stringify(error)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, loadError));
                if (callback) callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(SuiteLeagueResultPopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    // ===================== 公有核心方法 - 打开弹窗 解析联赛数据+分档展示 =====================
    public open(data: any): SuiteLeagueResultPopup {
        if (data === void 0) data = null;
        if (TSUtility.isValid(data) !== false) {
            // 解析联赛结果扩展信息
            const extraInfo = JSON.parse(data.message.extraInfo);
            const addCnt = TSUtility.isValid(extraInfo.addCnt) === false ? 0 : extraInfo.addCnt;
            const point = TSUtility.isValid(extraInfo.point) === false ? 0 : extraInfo.point;
            const rank = TSUtility.isValid(extraInfo.rank) === false ? 0 : extraInfo.rank;

            // 数字格式化处理
            const formatAddCnt = CurrencyFormatHelper.formatNumber(addCnt);
            const formatPoint = CurrencyFormatHelper.formatEllipsisNumber(point, this.getEllipsisCountLeaguePoint(point));

            // 初始化所有子节点隐藏
            this.nodeTopRank.node.active = false;
            this.nodeHighRank.node.active = false;
            this.nodeUnderRank.node.active = false;

            // 三档排名分开展示逻辑 - 核心业务规则完整保留
            if (rank <= 3) {
                // 前3名 顶级排名展示
                this.nodeTopRank.node.active = true;
                this.nodeTopRank.open(rank, formatPoint, formatAddCnt);
                this.closeBtn = this.nodeTopRank.closeBtn;
                this.blockingBG = this.nodeTopRank.blockingBG;
            } else if (rank <= 300) {
                // 4-300名 高级排名展示
                this.nodeHighRank.node.active = true;
                this.nodeHighRank.open(rank, formatPoint, formatAddCnt);
                this.closeBtn = this.nodeHighRank.closeBtn;
                this.blockingBG = this.nodeHighRank.blockingBG;
            } else {
                // 300名以后 普通排名展示
                this.nodeUnderRank.node.active = true;
                this.nodeUnderRank.open(rank, formatPoint);
                this.closeBtn = this.nodeUnderRank.closeBtn;
                this.blockingBG = this.nodeUnderRank.blockingBG;
            }

            // 弹窗音效+淡入动画
            GameCommonSound.playFxOnce("pop_etc");
            this.rootNode.opacity = 0;
            const fadeInAction = cc.fadeIn(0.2);
            
            // 打开弹窗+初始化基类+存储结果创建时间
            this._open(fadeInAction, true, () => {});
            this.initDailogBase();
            ServerStorageManager.save(StorageKeyType.LAST_SUITE_LEAGUE_RESULT_CREATE_TIME, data.message.createdDate);
            
            return this;
        }
        // 数据无效时兜底关闭
        this.close();
        return this;
    }

    // ===================== 私有核心方法 - 根据积分数值获取格式化省略位数 规则完整保留 =====================
    private getEllipsisCountLeaguePoint(point: number): number {
        if (point < 1000000) return 0;
        else if (point < 1000000000) return 3;
        else if (point < 1000000000000) return 6;
        else if (point < 1000000000000000) return 9;
        else return 12;
    }

    // ===================== 重写父类方法 - 关闭弹窗 清空定时器+状态重置 =====================
    public close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);
        this.unscheduleAllCallbacks();
        this._close(null);
    }
}