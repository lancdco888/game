import AutoScalingAdjuster from "./AutoScalingAdjuster";
import { LobbySceneUIType } from "./LobbySceneUI";
import LobbyScrollView from "./LobbyScrollView";
import { SlotBannerType } from "./LobbySlotBannerInfo";
import LobbySlotObjectPool from "./LobbySlotObjectPool";
import { LobbyUIType } from "./LobbyUIBase";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import AsyncHelper from "./global_utility/AsyncHelper";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import ServiceSlotDataManager, { ServiceSlotData } from "./manager/ServiceSlotDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LobbyUI_SlotScrollView extends cc.Component {

    @property(cc.Node)
    nodeMoveA: cc.Node = null;

    @property(cc.Node)
    nodeMoveB: cc.Node = null;

    @property
    text: string = 'hello';

    MOVE_TARGET_DEFAULT_Y = 500
    MOVE_OVER_Y = 15
    SCALE_ADJUSTER_SCROLL_NAME = "ScrollView"
    scrollBar = null
    scrollMasking = null
    _sceneType = LobbySceneUIType.NONE
    _arrLobbyScrollView = []
    _scaleAdjuster = null
    _nodeScrollViewRoot = null
    _numCurrentScrollScale = 1
    _numPrevNodeY = 0
    private _objectPool: LobbySlotObjectPool = null;
    lobbyUIType: LobbySceneUIType;

    get eType() {
        return LobbyUIType.BANNER_SCROLL_VIEW
    }

    get objectPool() {
        return this._objectPool
    }

    onLoad() {
        this._objectPool = this.getComponent(LobbySlotObjectPool);
        var e = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this.scrollBar.moveButtonDistance = e.node.getContentSize().width,
        this.scrollBar.boundaryEpsilon = 30,
        this._scaleAdjuster = this.getComponent(AutoScalingAdjuster),
        this._scaleAdjuster.initRatio(),
        this._nodeScrollViewRoot = this.node.getChildByName(this.SCALE_ADJUSTER_SCROLL_NAME),
        this._numPrevNodeY = this.node.y
    }
   
    onDestroy() {
        this._objectPool = null
    }


    initialize= async function() {
        this._sceneType = LobbySceneUIType.NONE;
        this.setAutoScaleByResolution();
        var e = 1;
        if (TSUtility.isValid(this._scaleAdjuster)) {
            e = this._scaleAdjuster.getScaleFactor(this.SCALE_ADJUSTER_SCROLL_NAME);
            cc.log("scrollScaleFactor", e);
        }
        await this.preloadSlotBanner();
        var t = await this.updateSlotBannerInfo();
        this._arrLobbyScrollView = this._nodeScrollViewRoot.children.map(function(e) {
            return e.getComponent(LobbyScrollView);
        }).filter(function(e) {
            return TSUtility.isValid(e);
        });
        var n = this._arrLobbyScrollView.length - 1;
        for (; n >= 0; n--) {
            var o = this._arrLobbyScrollView[n];
            if (TSUtility.isValid(o)) {
                o.node.active = !1;
                o.node.setPosition(cc.Vec2.ZERO);
                await o.initialize(t);
            }
        }
        
        //f.default.customLoadingRecord("lob_slotBanner_complete_" + (ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT - 1).toString());
    }
    
    refresh() {
        this._sceneType != this.lobbyUIType && this.lobbyUIType != LobbySceneUIType.NONE && this.changeScrollViewType(this.lobbyUIType);
    }
    
    setAutoScaleByResolution() {
        if (TSUtility.isValid(this._scaleAdjuster)) {
            for (var e = this._scaleAdjuster.getResolutionRatio(), t = 0; t < this._scaleAdjuster.infos.length; ++t) {
                var n = this._scaleAdjuster.infos[t];
                if (TSUtility.isValid(n)) {
                    for (var o = cc.misc.lerp(1, n.scale, e), a = 0; a < n.nodes.length; ++a)
                        n.nodes[a].setScale(o);
                    n.key == this.SCALE_ADJUSTER_SCROLL_NAME && (this._numCurrentScrollScale = o);
                }
            }
            this._numCurrentScrollScale > 1 ? this.node.setPosition(this.node.x, this._numPrevNodeY - 20) : this.node.setPosition(this.node.x, this._numPrevNodeY);
        }
    }
    
    async changeScrollViewType(e) {
        if (this._sceneType == LobbySceneUIType.NONE) {
            var i = this._arrLobbyScrollView.find(function(t) {
                return t.typeScene === e;
            });
            i.node.setPosition(cc.Vec2.ZERO);
            i.node.active = !0;
            this.scrollBar.setScrollView(i.scrollView);
            this.scrollBar.setOnLeftButtonCallback(i.onMovePrevPage.bind(i));
            this.scrollBar.setOnRightButtonCallback(i.onMoveNextPage.bind(i));
        } else {
            var t = this._arrLobbyScrollView.find(function(e) {
                return e.typeScene === this._sceneType;
            }.bind(this)),
            n = this._arrLobbyScrollView.find(function(t) {
                return t.typeScene === e;
            }),
            o = t.typeScene < n.typeScene;
            this.nodeMoveA.stopAllActions();
            this.nodeMoveB.stopAllActions();
            t.scrollView.stopAutoScroll();
            n.scrollView.stopAutoScroll();
            t.node.parent = o ? this.nodeMoveA : this.nodeMoveB;
            t.node.setPosition(cc.Vec2.ZERO);
            t.node.active = !0;
            n.node.parent = o ? this.nodeMoveB : this.nodeMoveA;
            n.node.setPosition(cc.Vec2.ZERO);
            n.node.active = !0;
            n.MoveToFirst(0);
            n.onRefresh();
            var a = this.MOVE_TARGET_DEFAULT_Y * this._numCurrentScrollScale;
            this.nodeMoveA.opacity = o ? 255 : 0;
            this.nodeMoveB.opacity = o ? 0 : 255;
            this.nodeMoveA.setPosition(o ? cc.Vec2.ZERO : cc.v2(0, a));
            this.nodeMoveB.setPosition(o ? cc.v2(0, -a) : cc.Vec2.ZERO);
            o ? (this.nodeMoveA.runAction(cc.sequence(cc.spawn(cc.moveTo(.3, cc.v2(0, a + this.MOVE_OVER_Y)), cc.sequence(cc.delayTime(.15), cc.fadeOut(.15))), cc.moveTo(.05, cc.v2(0, a)))),
            this.nodeMoveB.runAction(cc.sequence(cc.spawn(cc.moveTo(.3, cc.v2(0, this.MOVE_OVER_Y)), cc.fadeIn(.15)), cc.moveTo(.05, cc.Vec2.ZERO)))) : (this.nodeMoveA.runAction(cc.sequence(cc.spawn(cc.moveTo(.3, cc.v2(0, -this.MOVE_OVER_Y)), cc.fadeIn(.15)), cc.moveTo(.05, cc.Vec2.ZERO))),
            this.nodeMoveB.runAction(cc.sequence(cc.spawn(cc.moveTo(.3, cc.v2(0, -(a + this.MOVE_OVER_Y))), cc.sequence(cc.delayTime(.15), cc.fadeOut(.15))), cc.moveTo(.05, cc.v2(0, -a)))));
            await AsyncHelper.delayWithComponent(.35, this);
            n.playOpenAction(o);
            t.node.active = !1;
            t.node.parent = this._nodeScrollViewRoot;
            n.node.parent = this._nodeScrollViewRoot;
            this.scrollBar.setScrollView(n.scrollView);
            this.scrollBar.setOnLeftButtonCallback(n.onMovePrevPage.bind(n));
            this.scrollBar.setOnRightButtonCallback(n.onMoveNextPage.bind(n));
        }
        this._sceneType = this.lobbyUIType;
        this.scrollMasking.updateScrollView(this.getCurrentScrollView());
    }
    
    preloadSlotBanner =  async function() {
        var e = Object.values(SlotBannerType).filter(function(e) {
            return e !== SlotBannerType.NONE;
        }),
        t = 0, o = e;
        for (; t < o.length; t++) {
            var a = o[t], i = ServiceSlotDataManager.instance.getSlotBannerInfo(a);
            if (TSUtility.isValid(i)) {
                var l = this._objectPool.getPrefabCount(i.type), s = i.preloadCount - l;
                if (s > 0) {
                    var c = 0;
                    for (; c < s; c++) {
                        await this._objectPool.preloadObject(i.type);
                    }
                }
            }
        }
    }
    
    updateSlotBannerInfo = async function() {
        var e = [], t = UserInfo.instance().slotZoneInfo[SDefine.VIP_LOUNGE_ZONEID];
        if (!TSUtility.isValid(t)) return [];
        var n = function(t, n) {
            var o = e.find(function(e) {
                return e.eType === t;
            });
            TSUtility.isValid(o) ? o.arrInfo.push(n) : e.push({eType: t, arrInfo: [n]});
        };
        for (var f = 0; f < t.slotList.length; f++) {
            var o = new SlotBannerInfo;
            o.parseObj(t.slotList[f]);
            if (ServiceSlotDataManager.instance.isAvailableSlot(o)) {
                1 == o.isEarlyAccessSlot ? n(SlotBannerType.EARLY_ACCESS, o) : 1 == o.isNewSlot ? n(SlotBannerType.NEW, o) : 1 == o.isHotSlot ? n(SlotBannerType.HOT, o) : 1 == o.isFeaturedSlot ? n(SlotBannerType.FEATURED, o) : 1 == o.isRevampSlot ? n(SlotBannerType.REVAMP, o) : 1 == o.isReelQuestSlot ? n(SlotBannerType.REEL_QUEST, o) : 1 == o.isSupersizeSlot && n(SlotBannerType.SUPERSIZE_IT, o);
                TSUtility.isDynamicSlot(o.strSlotID) ? n(SlotBannerType.DYNAMIC, o) : (n(SlotBannerType.NORMAL, o), 1 == o.isLinkedSlot && n(SlotBannerType.LINKED, o));
            }
        }
        e.forEach(function(e) {
            e.eType != SlotBannerType.NORMAL && e.eType != SlotBannerType.DYNAMIC && e.arrInfo.sort(function(e, t) {
                return e.numOrder > t.numOrder ? 1 : e.numOrder < t.numOrder ? -1 : 0;
            });
        });
        var a = function(t) {
            var n = e.find(function(e) {
                return e.eType === t;
            });
            return n ? n.arrInfo : [];
        }, i = a(SlotBannerType.NEW), l = a(SlotBannerType.HOT), s = a(SlotBannerType.FEATURED);
        i.length > 2 && (i = i.slice(0, 2)), l.length > 4 && (l = l.slice(0, 4)), s.length > 2 && (s = s.slice(0, 2));
        var p = ServiceInfoManager.instance.getDynamicNewSlot();
        for (f = 0; f < p.length; ++f) {
            var h = ServiceSlotDataManager.instance.getSlotBannerInfo(SDefine.VIP_LOUNGE_ZONEID, p[f]);
            TSUtility.isValid(h) && (h.strFlag = "new", n(SlotBannerType.SUITE_NEW, h));
        }
        return e;
    }


    
    getCurrentScrollView() {
        var e = this
          , t = this._arrLobbyScrollView.find(function(t) {
            return t.typeScene === e._sceneType
        });
        return TSUtility.isValid(t) ? t : null
    }
    
    getCurrentScrollOffset() {
        var e = this.getCurrentScrollView();
        return !TSUtility.isValid(e) ? 0 : e.scrollOffset
    }
    
    getSlotBannerInfo(e) {
        var t = this.getCurrentScrollView();
        return !TSUtility.isValid(t) ? [] : t.getSlotBannerInfo(e)
    }
    
    getScrollViewData() {
        var e = this.getCurrentScrollView();
        return !TSUtility.isValid(e) ? [] : e.arrUIScrollViewData
    }
    
    moveFirstPosition() {
        var e = this.getCurrentScrollView();
        TSUtility.isValid(e) && e.MoveToFirst(0)
    }
}
