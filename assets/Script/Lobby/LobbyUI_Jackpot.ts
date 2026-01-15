
import CasinoJackpotInfoPopup from '../CasinoJackpotInfoPopup';
import GameCommonSound from '../GameCommonSound';
import LobbyScene from '../LobbyScene';
import LobbyTitleEffectSelector from '../LobbyTitleEffectSelector';
import LobbyUIBase, { LobbyUIType } from '../LobbyUIBase';
import SDefine from '../global_utility/SDefine';
import TSUtility from '../global_utility/TSUtility';
import { Utility } from '../global_utility/Utility';
import PopupManager from '../manager/PopupManager';

const { ccclass, property } = cc._decorator;

/**
 * 大厅Jackpot（大奖）UI组件
 * 负责Jackpot标题特效、动画状态更新、点击打开大奖信息弹窗等逻辑
 */
@ccclass()
export default class LobbyUI_Jackpot extends LobbyUIBase {
    // ===== 可序列化属性（对应编辑器赋值）=====
    @property(cc.Prefab)
    public prefJackpotTitle: cc.Prefab = null;

    @property(cc.Button)
    public btnJackpot: cc.Button = null;

    @property(cc.Node)
    public nodeRoot: cc.Node = null;

    @property(cc.Node)
    public nodeJackpot_1: cc.Node = null;

    @property(cc.Node)
    public nodeJackpot_3: cc.Node = null;

    @property(cc.Node)
    public nodeJackpot_4: cc.Node = null;

    // ===== 私有状态属性 =====
    private _jackpot: LobbyTitleEffectSelector | null = null;
    private _prevState: number = -1;

    // ===== 只读属性（覆盖父类/对外提供）=====
    get eType(): LobbyUIType {
        return LobbyUIType.JACKPOT;
    }

    get lobbyJackpotTitle(): LobbyTitleEffectSelector {
        return this._jackpot;
    }

    get nodeJackpotRoot(): cc.Node {
        return this.nodeRoot;
    }

    /**
     * 组件加载初始化
     */
    onLoad(): void {
        // 绑定Jackpot按钮点击事件
        this.btnJackpot?.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Jackpot", "onClick_Jackpot", "")
        );

        // 实例化Jackpot标题预制体并初始化
        if (this.prefJackpotTitle && this.nodeRoot) {
            const jackpotTitleNode = cc.instantiate(this.prefJackpotTitle);
            jackpotTitleNode.parent = this.nodeRoot;
            jackpotTitleNode.setPosition(cc.Vec2.ZERO);
            
            // 获取标题特效组件并初始化
            this._jackpot = jackpotTitleNode.getComponent(LobbyTitleEffectSelector);
            if (this._jackpot) {
                // 绑定BGM刷新回调
                this._jackpot.setOnChangeBurningState(LobbyScene.instance.refreshBGM.bind(this));
                // 初始化标题特效
                this._jackpot.initLobbyTitleEffectSelector(true);
                // 设置居中
                this._jackpot.setCenter();
            }
        }
    }

    /**
     * 刷新Jackpot状态（启动动画状态检测调度器）
     */
    refresh(): void {
        // 清空原有调度，重新启动状态更新
        this.unscheduleAllCallbacks();
        this.schedule(
            this.updateAnimationState.bind(this),
            SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL
        );
    }

    /**
     * 更新Jackpot动画状态（根据标题特效状态切换不同节点显隐）
     */
    updateAnimationState(): void {
        if (!TSUtility.isValid(this._jackpot)) return;

        // 获取标题特效的前一状态
        const currentState = this._jackpot.prevState;
        
        // 状态未变化则不处理
        if (this._prevState === currentState) return;
        
        // 更新状态记录并切换节点显隐
        this._prevState = currentState;
        this.nodeJackpot_1.active = currentState <= 1;
        this.nodeJackpot_3.active = currentState >= 2 && currentState <= 3;
        this.nodeJackpot_4.active = currentState >= 4;
    }

    /**
     * Jackpot按钮点击事件（打开大奖信息弹窗）
     */
    onClick_Jackpot(): void {
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_casino");
        
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);
        
        // 获取并打开大奖信息弹窗
        CasinoJackpotInfoPopup.getPopup((isCancel: any, popup: any) => {
            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);
            
            // 非取消状态则打开弹窗
            if (!TSUtility.isValid(isCancel)) {
                popup.open();
            }
        });
    }
}