import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import ServiceInfoManager from "../ServiceInfoManager";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import LevelManager from "../manager/LevelManager";

const { ccclass, property } = cc._decorator;

/**
 * 大厅等级增益UI组件
 */
@ccclass('LobbyUI_LevelBooster')
export default class LobbyUI_LevelBooster extends LobbyUIBase {
    // 序列化属性（对应编辑器绑定）
    @property({ type: cc.Label })
    lblLevel: cc.Label = null!; // 等级显示文本

    @property({ type: cc.ProgressBar })
    bar: cc.ProgressBar = null!; // 等级进度条

    @property({ type: cc.Node })
    nodeNormalEXP: cc.Node = null!; // 普通经验显示节点

    @property({ type: cc.Node })
    nodeNormalLevel: cc.Node = null!; // 普通等级显示节点

    @property({ type: cc.Node })
    nodeBoosterEXP: cc.Node = null!; // 增益经验显示节点

    @property({ type: cc.Node })
    nodeBoosterLevel: cc.Node = null!; // 增益等级显示节点

    @property({ type: cc.Node })
    nodeX2: cc.Node = null!; // 2倍增益标识节点

    @property({ type: cc.Node })
    nodeX3: cc.Node = null!; // 3倍增益标识节点

    // 私有成员变量
    private _numBoosterMultiple: number = 1; // 增益倍数

    /**
     * 获取UI类型（重写父类属性）
     */
    get eType(): LobbyUIType {
        return LobbyUIType.LEVEL_BOOSTER;
    }

    /**
     * 检查该UI是否可用（是否有有效的等级增益道具）
     * @returns 是否可用
     */
    isAvailableUI(): boolean {
        this._numBoosterMultiple = 0;
        // 获取等级增益道具
        const items = this.inventory.getItemsByItemId(SDefine.ITEM_LEVEL_UP_BOOSTER);
        if (items.length <= 0) {
            return false;
        }

        const targetItem = items[0];
        // 检查道具有效性和是否过期
        if (!TSUtility.isValid(targetItem) || targetItem.isExpire() === 1) {
            return false;
        }

        // 解析道具额外信息获取增益倍数
        const extraInfo = JSON.parse(targetItem.extraInfo);
        this._numBoosterMultiple = extraInfo.multiplier;
        return true;
    }

    /**
     * 刷新UI显示
     */
    refresh(): void {
        this.setLevelBoosterUI(this.isAvailable, this._numBoosterMultiple);
        this.updateLevelGauge(ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP);
    }

    /**
     * 设置等级增益UI的显示状态
     * @param isAvailable 是否启用增益
     * @param multiple 增益倍数
     */
    setLevelBoosterUI(isAvailable: boolean, multiple: number): void {
        this.nodeNormalEXP.active = !isAvailable;
        this.nodeNormalLevel.active = !isAvailable;
        this.nodeBoosterEXP.active = isAvailable;
        this.nodeBoosterLevel.active = isAvailable;
        this.nodeX2.active = isAvailable && multiple === 2;
        this.nodeX3.active = isAvailable && multiple !== 2;
    }

    /**
     * 更新等级进度条显示
     * @param exp 当前经验值
     */
    updateLevelGauge(exp: number): void {
        // 计算经验百分比（限制在0-1之间）
        const expPercent = Math.min(1, LevelManager.Instance().getLevelExpPercent(exp));
        // 根据经验获取等级
        const level = LevelManager.Instance().getLevelFromExp(exp);
        
        // 更新服务端等级信息
        ServiceInfoManager.instance.setUserLevel(level);
        // 设置等级显示文本（*拼接等级）
        this.lblLevel.string = `*${level.toString()}`;
        // 设置进度条（最小0.1，避免进度条完全不可见）
        this.bar.progress = expPercent === 0 ? 0 : expPercent < 0.1 ? 0.1 : expPercent;
    }
}