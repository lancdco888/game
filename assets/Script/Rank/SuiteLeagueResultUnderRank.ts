const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
//import FBPictureSetter from "../../UI/FBPictureSetter";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";

// ===================== 联赛普通排名展示组件(300名以后) 继承cc.Component =====================
@ccclass
export default class SuiteLeagueResultUnderRank extends cc.Component {
    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 无任何遗漏 =====================
    @property(cc.Button)
    public closeBtn: cc.Button = null;

    @property(cc.Node)
    public blockingBG: cc.Node = null;

    @property(cc.Label)
    private userName: cc.Label = null;

    @property(cc.Label)
    private userRank: cc.Label = null;

    @property(cc.Label)
    private userPoint: cc.Label = null;

    @property(cc.Sprite)
    private picSprite: cc.Sprite = null;

    @property(cc.Sprite)
    private sprTH: cc.Sprite = null;

    @property(cc.Sprite)
    private sprST: cc.Sprite = null;

    @property(cc.Sprite)
    private sprND: cc.Sprite = null;

    @property(cc.Sprite)
    private sprRD: cc.Sprite = null;

    // ===================== 公有核心方法 - 打开普通排名展示 赋值所有UI数据+排名后缀逻辑 =====================
    public open(rank: number, pointStr: string): void {
        // 初始化所有排名后缀图标隐藏
        this.sprTH.node.active = false;
        this.sprST.node.active = false;
        this.sprND.node.active = false;
        this.sprRD.node.active = false;

        // 获取用户信息并赋值用户名(超长截取规则：超过7位加省略号)
        const userInfoIns = UserInfo.instance();
        if (TSUtility.isValid(userInfoIns)) {
            const userName = userInfoIns.getUserName();
            this.userName.string = userName.length > 7 ? userName.substring(0,7) + "..." : userName;
            // 加载用户头像
            //FBPictureSetter.default.loadProfilePicture(userInfoIns.getUserPicUrl(), FBPictureSetter.FB_PICTURE_TYPE.SMALL, this.picSprite, null);
        }

        // 排名赋值 + 核心序数后缀(ST/ND/RD/TH)规则处理 (与高级排名规则完全一致)
        if (TSUtility.isValid(rank)) {
            this.userRank.string = rank > 0 ? rank.toString() : "-";
            // 数字拆分为单个数字数组，用于判断个位/十位
            const rankNumArr = String(rank).split("").map(Number);
            
            if (TSUtility.isValid(rankNumArr) && rankNumArr.length > 0) {
                if (rankNumArr.length > 1) {
                    const lastNum = rankNumArr[rankNumArr.length - 1];
                    const secondLastNum = rankNumArr[rankNumArr.length - 2];
                    // 核心规则：1结尾非11=ST，2结尾非12=ND，3结尾非13=RD，其余=TH
                    this.sprST.node.active = (lastNum === 1) && (secondLastNum !== 1);
                    this.sprND.node.active = (lastNum === 2) && (secondLastNum !== 1);
                    this.sprRD.node.active = (lastNum === 3) && (secondLastNum !== 1);
                    this.sprTH.node.active = !this.sprST.node.active && !this.sprND.node.active && !this.sprRD.node.active;
                } else {
                    // 个位数默认显示TH
                    this.sprTH.node.active = true;
                }
            } else {
                this.sprTH.node.active = true;
            }
        }

        // 联赛积分赋值 数据有效性校验
        if (TSUtility.isValid(pointStr)) {
            this.userPoint.string = pointStr;
        }
    }
}