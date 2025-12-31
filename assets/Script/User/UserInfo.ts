import SingtonClass from "../core/SingtonClass";

export default class UserInfo extends SingtonClass {
    getUserVipInfo() {
        throw new Error("Method not implemented.");
    }
    // 私有成员变量 + 初始值 完全对齐原JS
    private _userName: string = "";
    private _rank: number = -1;
    private _point: number = 0;
    private _coin: number = 0;
    private _userPictureUrl: string = "";
    private _uid: number = 0;
    slotZoneInfo: any;

    public getUserName(): string {
        return this._userName;
    }

    public setUserName(name: string): void {
        this._userName = name;
    }

    public getRank(): number {
        // 原JS核心逻辑：排名返回+1 （后端传的是索引0开始，前端显示1开始）
        return this._rank + 1;
    }

    public setRank(rank: number): void {
        this._rank = rank;
    }

    public getPoint(): number {
        return this._point;
    }

    public setPoint(point: number): void {
        this._point = point;
    }

    public getCoin(): number {
        return this._coin;
    }

    public setCoin(coin: number): void {
        this._coin = coin;
    }

    public getUserPictureUrl(): string {
        return this._userPictureUrl;
    }

    public setUserPictureUrl(url: string): void {
        this._userPictureUrl = url;
    }

    public setUID(uid: number): void {
        this._uid = uid;
    }

    public getUid():number{
        return 0;
    }

    public getAccessToken():string{
        return "";
    }

    public getUserPicUrl():string{
        return "";
    }

    /** 批量赋值用户信息 - 完全对齐原JS的字段映射关系 */
    public setUserInfo(data: any): void {
        this.setUserName(data.name);
        this.setRank(data.rank);
        this.setPoint(data.leaguePoint);
        this.setUserPictureUrl(data.picURL);
        this.setCoin(data.leagueCoin);
        this.setUID(data.uid);
    }

    /** 判断是否是当前登录玩家的信息 */
    public isMyInfo(): boolean {
        return true;
    }
}