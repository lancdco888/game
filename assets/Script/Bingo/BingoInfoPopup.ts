const { ccclass, property } = cc._decorator;

import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import DialogBase, { DialogState } from "../DialogBase";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import { Utility } from "../global_utility/Utility";

@ccclass('BingoInfoPopup')
export default class BingoInfoPopup extends DialogBase {
    @property([cc.Button])
    public tabBtns: cc.Button[] = [];

    @property([cc.Node])
    public tabNodes: cc.Node[] = [];

    @property(cc.Node)
    public normal_Node: cc.Node = null;

    @property(cc.Node)
    public instant_Node: cc.Node = null;

    // ===================== 静态对外加载方法 =====================
    public static getPopup(callFunc: Function) {
        PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes("Service/01_Content/Bingo/Bingo_InfoPopup", (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                const error = new Error("cc.loader.loadRes fail BingoInfoPopup: %s".format(JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callFunc(err, null);
                return;
            }
            const popupCom = cc.instantiate(prefab).getComponent(BingoInfoPopup);
            callFunc(null, popupCom);
        });
    }

    // ===================== 生命周期 =====================
    onLoad() {
        this.initDailogBase();
        
        // 初始化所有标签页节点为显示状态
        for (let i = 0; i < this.tabNodes.length; ++i) {
            this.tabNodes[i].active = true;
        }

        // 绑定所有标签按钮点击事件
        for (let i = 0; i < this.tabBtns.length; ++i) {
            this.tabBtns[i].clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoInfoPopup", "onClickTabBtn", i.toString()));
        }

        // FB小游戏 节点显隐适配
        this.normal_Node.active = (!Utility.isFacebookInstant());
        this.instant_Node.active = (Utility.isFacebookInstant());
    }

    // ===================== 核心打开方法 =====================
    public open() {
        const self = this;
        GameCommonSound.playFxOnce("pop_etc");
        this.rootNode.opacity = 100;
        // 淡入动画打开弹窗 + 默认选中第一个标签
        this._open(cc.fadeIn(0.1), true, () => {
            self.setTab(0);
        });
    }

    // ===================== 核心关闭方法 =====================
    public close() {
        if (!this.isStateClose()) {
            this.setState(DialogState.Close);
            this.clear();
            this._close(null);
        }
    }

    // 清空按钮事件 防止重复点击
    public clear() {
        for (let i = 0; i < this.tabBtns.length; ++i) {
            this.tabBtns[i].clickEvents = [];
            this.tabBtns[i].enabled = false;
        }
    }

    // ===================== 标签切换核心逻辑 =====================
    public setTab(tabIndex: number) {
        for (let i = 0; i < this.tabBtns.length; ++i) {
            if (i === tabIndex) {
                this.tabBtns[i].node.active = false;
                this.tabNodes[i].active = true;
            } else {
                this.tabBtns[i].node.active = true;
                this.tabNodes[i].active = false;
            }
        }
    }

    // 标签按钮点击事件
    public onClickTabBtn(event: cc.Event, tabIdxStr: string) {
        GameCommonSound.playFxOnce("btn_etc");
        this.setTab(parseInt(tabIdxStr));
    }
}