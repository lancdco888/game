const { ccclass, property } = cc._decorator;

// 导入项目依赖模块 - 路径与原JS完全一致，无需修改
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SDefine from "../global_utility/SDefine";
import GameCommonSound from "../GameCommonSound";
import HeroStatSetter from "./HeroStatSetter";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class HeroInfoPopup extends DialogBase {
    // ====================== 编辑器绑定属性 (与原JS一一对应) ======================
    @property(cc.Button)
    private leftBtn: cc.Button = null;

    @property(cc.Button)
    private rightBtn: cc.Button = null;

    @property([cc.Node])
    private pages: cc.Node[] = [];

    @property(cc.Toggle)
    private pageToggleTemplage: cc.Toggle = null; // 原代码拼写错误保留，防止预制体绑定失效

    @property([cc.Node])
    private instantIOSExceptNodes: cc.Node[] = [];

    @property([HeroStatSetter])
    private statSetters: HeroStatSetter[] = [];

    // ====================== 私有成员变量 ======================
    private _pageIndex: number = 0;
    private _pageToggles: cc.Toggle[] = [];

    // ====================== 静态公共方法 - 动态加载弹窗预制体 ======================
    public static getPopup(callback: (err: Error, popup: HeroInfoPopup) => void): void {
        PopupManager.Instance().showDisplayProgress(true);
        const resPath = "Service/01_Content/Hero/HeroMain/HeroInfoPopup";

        cc.loader.loadRes(resPath, (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            
            // 加载失败：异常上报 + 回调错误信息
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }

            // 加载成功：实例化预制体 + 获取弹窗组件
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(HeroInfoPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    // ====================== 生命周期回调 ======================
    protected onLoad(): void {
        // 初始化弹窗基类
        this.initDailogBase();

        // 绑定左右切换按钮的点击事件
        this.leftBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroInfoPopup", "onClickLeftBtn", ""));
        this.rightBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroInfoPopup", "onClickRightBtn", ""));

        // 初始化第0个分页按钮 + 绑定点击事件
        this._pageToggles.push(this.pageToggleTemplage);
        this.pageToggleTemplage.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroInfoPopup", "onClickPageBtn", "0"));

        // 动态实例化剩余的分页按钮
        for (let i = 1; i < this.pages.length; ++i) {
            const toggleNode = cc.instantiate(this.pageToggleTemplage.node);
            const toggle = toggleNode.getComponent(cc.Toggle);
            this.pageToggleTemplage.node.parent.addChild(toggleNode);
            toggle.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroInfoPopup", "onClickPageBtn", i.toString()));
            this._pageToggles.push(toggle);
        }

        // iOS FB Instant 商店兼容逻辑 - 隐藏指定节点
        if (SDefine.FB_Instant_iOS_Shop_Flag) {
            for (let i = 0; i < this.instantIOSExceptNodes.length; ++i) {
                if (this.instantIOSExceptNodes[i]) {
                    this.instantIOSExceptNodes[i].active = false;
                }
            }
        }
    }

    // ====================== 重写父类方法 - 弹窗核心方法 ======================
    /**
     * 打开弹窗
     * @returns 当前弹窗实例 (链式调用)
     */
    public open(): HeroInfoPopup {
        const self = this;
        this._open(null, true, () => {
            self.init();       // 初始化英雄属性面板
            self.setPage(0);   // 默认显示第0页
        });
        return this;
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        GameCommonSound.playFxOnce("btn_etc");
        if (this.isStateClose()) return;
        
        this.setState(DialogState.Close);
        this.clear();
        this._close(null); // 无关闭动画，直接关闭
    }

    // ====================== 业务初始化方法 ======================
    /**
     * 初始化英雄属性面板数据
     * 原逻辑：固定绘制 埃及艳后(cleopatra) 1/3/5 阶的英雄属性
     */
    private init(): void {
        this.statSetters[0].drawStat("hero_cleopatra", 1);
        this.statSetters[1].drawStat("hero_cleopatra", 3);
        this.statSetters[2].drawStat("hero_cleopatra", 5);
    }

    // ====================== 分页切换核心方法 ======================
    /**
     * 获取最大分页数
     */
    private getMaxPage(): number {
        return this.pages.length;
    }

    /**
     * 切换指定分页
     * @param targetIndex 目标分页索引
     */
    private setPage(targetIndex: number): void {
        this._pageIndex = targetIndex;
        
        // 显示对应分页节点，隐藏其他节点
        for (let i = 0; i < this.pages.length; ++i) {
            this.pages[i].active = i === targetIndex;
        }

        // 选中对应分页按钮
        this._pageToggles[targetIndex].isChecked = true;

        // 控制左右按钮的显隐：到最左则隐藏左按钮，到最右则隐藏右按钮
        this.leftBtn.node.active = !(targetIndex <= 0);
        this.rightBtn.node.active = !(targetIndex >= this.getMaxPage() - 1);
    }

    // ====================== 按钮点击事件回调 ======================
    /**
     * 点击分页按钮切换分页
     */
    public onClickPageBtn(_: any, indexStr: string): void {
        GameCommonSound.playFxOnce("btn_etc");
        const targetIndex = parseInt(indexStr);
        if (this._pageIndex !== targetIndex) {
            this.setPage(targetIndex);
        }
    }

    /**
     * 点击左按钮 上一页
     */
    public onClickLeftBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._pageIndex - 1);
    }

    /**
     * 点击右按钮 下一页
     */
    public onClickRightBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.setPage(this._pageIndex + 1);
    }
}