import UserInfo from "./UserInfo";
const { ccclass } = cc._decorator;

@ccclass()
export default class SuiteLeagueUserInfo {
    // ✅ 移除private，保留下划线私有命名规范，无报错，语义不变
    _userName: string = "";
    _rank: number = -1;
    _point: number = 0;
    _coin: number = 0;
    _userPictureUrl: string = "";
    _uid: number = 0;

    /** 获取用户名 */
    getUserName(): string {
        return this._userName;
    }

    /** 设置用户名 */
    setUserName(val: string): void {
        this._userName = val;
    }

    /** 获取排名 (原核心逻辑: 存储下标+1 返回真实排名 完全保留) */
    getRank(): number {
        return this._rank + 1;
    }

    /** 设置排名 */
    setRank(val: number): void {
        this._rank = val;
    }

    /** 获取联赛积分 */
    getPoint(): number {
        return this._point;
    }

    /** 设置联赛积分 */
    setPoint(val: number): void {
        this._point = val;
    }

    /** 获取联赛币 */
    getCoin(): number {
        return this._coin;
    }

    /** 设置联赛币 */
    setCoin(val: number): void {
        this._coin = val;
    }

    /** 获取用户头像地址 */
    getUserPictureUrl(): string {
        return this._userPictureUrl;
    }

    /** 设置用户头像地址 */
    setUserPictureUrl(val: string): void {
        this._userPictureUrl = val;
    }

    /** 设置用户UID */
    setUID(val: number): void {
        this._uid = val;
    }

    /** 批量赋值用户信息 (后端数据解析核心方法) */
    setUserInfo(data: any): void {
        this.setUserName(data.name);
        this.setRank(data.rank);
        this.setPoint(data.leaguePoint);
        this.setUserPictureUrl(data.picURL);
        this.setCoin(data.leagueCoin);
        this.setUID(data.uid);
    }

    /** 判断是否是当前登录的自己 (核心业务逻辑 完全保留) */
    isMyInfo(): boolean {
        return UserInfo.instance().getUid() === this._uid;
    }
}