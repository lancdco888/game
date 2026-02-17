import TopUI_SharkAttack from './TopUI_SharkAttack';
import FreeSpinStartPopup_SharkAttack from './FreeSpinStartPopup_SharkAttack';
import FreeSpinResultPopup_SharkAttack from './FreeSpinResultPopup_SharkAttack';
import ReelExpandComponent_SharkAttack from './ReelExpandComponent_SharkAttack';
// 注意：原文件中存在拼写错误 SahrkAttack，此处保留以兼容原有引用，建议后续统一修正为 SharkAttack
import FreeSpinRetriggerPopup_SahrkAttack from './FreeSpinRetriggerPopup_SahrkAttack';
import JackpotCollectComponent_SharkAttack from './JackpotCollectComponent_SharkAttack';

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏组件管理器
 * 集中管理游戏内所有核心UI和功能组件的引用，方便外部统一访问
 */
@ccclass('GameComponents_SharkAttack')
export default class GameComponents_SharkAttack extends cc.Component {
    // 顶部UI组件
    @property({ type: TopUI_SharkAttack })
    topUI: TopUI_SharkAttack = null!;

    // 免费旋转开始弹窗
    @property({ type: FreeSpinStartPopup_SharkAttack })
    freeSpinStartPopup: FreeSpinStartPopup_SharkAttack = null!;

    // 免费旋转结果弹窗
    @property({ type: FreeSpinResultPopup_SharkAttack })
    freeSpinResultPopup: FreeSpinResultPopup_SharkAttack = null!;

    // 滚轮扩展组件
    @property({ type: ReelExpandComponent_SharkAttack })
    reelExpandComponent: ReelExpandComponent_SharkAttack = null!;

    // 免费旋转重新触发弹窗（原文件拼写错误 SahrkAttack，保留兼容）
    @property({ type: FreeSpinRetriggerPopup_SahrkAttack })
    freeSpinRetriggerPopup: FreeSpinRetriggerPopup_SahrkAttack = null!;

    // 大奖收集组件（原文件变量名拼写错误 collcet，保留兼容）
    @property({ type: JackpotCollectComponent_SharkAttack })
    jackpotCollcetComponent: JackpotCollectComponent_SharkAttack = null!;
}