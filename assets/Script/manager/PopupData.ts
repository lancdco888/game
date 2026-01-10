import { ResultPopupType } from "../Slot/GameResultPopup";
import TSUtility from "../global_utility/TSUtility";
import ViewResizeManager from "../global_utility/ViewResizeManager";

const { ccclass, property } = cc._decorator;

/**
 * 弹窗数据配置组件（PopupData）
 * 存储单个弹窗的所有配置项：动画、音效、按钮、视图适配、金币特效等
 */
@ccclass()
export default class PopupData extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置，保留原tooltip） =================
    @property({
        type: Number, // 对应ResultPopupType枚举（数字类型）
        tooltip: `UnknownType = -1
                ResultCommon = 0
                JackpotResultMini = 1
                JackpotResultMinor = 2
                JackpotResultMajor = 3
                JackpotResultMega = 4
                JackpotResultCommon = 5
                BonusGameResult = 6
                LinkedJackpotResult = 7
                FreespinResult = 8
                Retrigger = 9
                JackpotModeResult = 10
                WheelOfVegasResult = 11
                JackpotResultGrand = 12`
    })
    public result_type: ResultPopupType = ResultPopupType.UnknownType; // 弹窗结果类型

    @property(cc.Node)
    public ani_pivot: cc.Node | null = null; // 弹窗动画根节点

    @property(cc.Node)
    public blockingBG: cc.Node | null = null; // 弹窗遮罩层节点

    @property(cc.Button)
    public btnCollect: cc.Button | null = null; // 收集按钮

    @property(cc.Toggle)
    public btnShare: cc.Toggle | null = null; // 分享按钮（Toggle类型）

    @property(String)
    public sound_id: string = ""; // 弹窗打开音效ID

    @property({
        type: Number,
        tooltip: "버튼이 나오는 애니메이션 시간 변수" // 按钮出现动画时长（秒）
    })
    public animation_time: number = 2.1;

    @property({
        type: Number,
        tooltip: "자동으로 넘어가는 시간 변수" // 自动关闭延迟时间（秒）
    })
    public auto_time: number = 15;

    @property(String)
    public end_animation: string = ""; // 弹窗关闭动画名称

    @property(String)
    public end_sound_id: string = ""; // 弹窗关闭音效ID

    @property({
        tooltip: "종료애니메이션이 끝나고 callback을 호출하면 true\n종료애니메이션을 시작하면서 callback을 호출하면 false"
    })
    public ignore_end_animation_delay: boolean = false; // 是否忽略关闭动画延迟

    @property(Boolean)
    public play_coin_effect: boolean = false; // 是否播放金币爆炸特效

    @property(Boolean)
    public playing_coin_direct_next: boolean = false; // 金币特效后是否直接跳转下一轮

    @property([cc.Label])
    public label_list: cc.Label[] = []; // 弹窗内标签列表

    @property([cc.Node])
    public sprite_list: cc.Node[] = []; // 弹窗内精灵节点列表

    @property([cc.Node])
    public etc_list: cc.Node[] = []; // 弹窗内其他节点列表

    @property(cc.Node)
    public effect_target: cc.Node | null = null; // 金币特效目标节点

    // ================= 私有属性 =================
    public origin_sound_id: string = ""; // 原始音效ID（用于重置）

    // ================= 生命周期函数 =================
    onLoad() {
        // 初始化视图适配 + 保存原始音效ID + 注册视图调整回调
        this.refresh();
        this.origin_sound_id = this.sound_id;
        ViewResizeManager.Instance().addHandler(this);
    }

    onDestroy() {
        // 移除视图调整回调
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图调整前回调（空实现，供子类重写）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图调整中回调（空实现，供子类重写）
     */
    onResizeView(): void {}

    /**
     * 视图调整后回调（刷新弹窗视图）
     */
    onAfterResizeView(): void {
        this.refresh();
    }

    /**
     * 组件禁用时回调（重置音效ID）
     */
    onDisable(): void {
        this.sound_id = this.origin_sound_id;
    }

    // ================= 核心方法 =================
    /**
     * 刷新弹窗视图（适配遮罩层尺寸）
     */
    public refresh(): void {
        if (TSUtility.isValid(this.blockingBG)) {
            TSUtility.setNodeViewSizeFit(this.blockingBG);
        }
    }

    /**
     * 获取金币特效的目标节点（优先effect_target，其次收集按钮）
     * @returns 特效目标节点
     */
    public getTarget(): cc.Node {
        if (TSUtility.isValid(this.effect_target)) {
            return this.effect_target;
        }
        // 兜底：收集按钮节点（确保返回有效节点）
        return this.btnCollect?.node!;
    }
}