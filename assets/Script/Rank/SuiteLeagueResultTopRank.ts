const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
//import FBPictureSetter from "../../UI/FBPictureSetter";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";

// ===================== 联赛顶级排名展示组件(1-3名) 继承cc.Component =====================
@ccclass
export default class SuiteLeagueResultTopRank extends cc.Component {
    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 无任何遗漏 =====================
    @property(cc.Button)
    public closeBtn: cc.Button = null;

    @property(cc.Node)
    public blockingBG: cc.Node = null;

    @property(cc.Node)
    private node1th: cc.Node = null;

    @property(cc.Node)
    private node2th: cc.Node = null;

    @property(cc.Node)
    private node3th: cc.Node = null;

    @property(cc.Label)
    private userName: cc.Label = null;

    @property(cc.Label)
    private userPoint: cc.Label = null;

    @property(cc.Label)
    private userCoin: cc.Label = null;

    @property(cc.Sprite)
    private picSprite: cc.Sprite = null;

    // ===================== 公有核心方法 - 打开顶级排名展示 赋值所有UI数据+前三名节点显隐逻辑 =====================
    public open(rank: number, pointStr: string, coinStr: string): void {
        // 获取用户信息并赋值用户名(超长截取规则：超过7位加省略号)
        const userInfoIns = UserInfo.instance();
        if (TSUtility.isValid(userInfoIns)) {
            const userName = userInfoIns.getUserName();
            this.userName.string = userName.length > 7 ? userName.substring(0,7) + "..." : userName;
            // 加载用户头像
            //FBPictureSetter.loadProfilePicture(userInfoIns.getUserPicUrl(), FBPictureSetter.FB_PICTURE_TYPE.SMALL, this.picSprite, null);
        }

        // 联赛积分赋值 数据有效性校验
        if (TSUtility.isValid(pointStr)) {
            this.userPoint.string = pointStr;
        }

        // 奖励币赋值 数据有效性校验
        if (TSUtility.isValid(coinStr)) {
            this.userCoin.string = coinStr;
        }

        // 核心规则：前三名对应节点单独显隐 (1=冠军 2=亚军 3=季军)
        this.node1th.active = rank === 1;
        this.node2th.active = rank === 2;
        this.node3th.active = rank === 3;
    }
}