import { Utility } from "./global_utility/Utility";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISliderScrollBar extends cc.Component {
    BUTTON_ENABLE_INTERVAL = 10
    scrollView = null
    slider = null
    btnLeft = null
    btnRight = null
    btnUp = null
    btnDown = null
    enableButtonAutoHide = false
    moveButtonDistance = 100
    _numBeforeMaxOffset = 0
    _numBeforeOffset = 0
    _isScrollViewInertia = false
    _isScrollCancelInnerEvents = false
    _boundaryEpsilon = 0
    _onLeftButtonCallback = null
    _onRightButtonCallback = null

    get boundaryEpsilon() {
        return this._boundaryEpsilon
    }

    set boundaryEpsilon(e) {
        this._boundaryEpsilon = e
    }

    onLoad() {
        var e, t, n, o, a = this;
        null === (e = this.btnLeft) || void 0 === e || e.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Left", "")),
        null === (t = this.btnRight) || void 0 === t || t.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Right", "")),
        null === (n = this.btnUp) || void 0 === n || n.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Up", "")),
        null === (o = this.btnDown) || void 0 === o || o.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Down", "")),
        null != this.slider && (this.slider.handle.node.on(cc.Node.EventType.TOUCH_END, function(e) {
            a.onTouchEnd()
        }, this),
        this.slider.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
            a.onTouchEnd()
        }, this),
        this.slider.handle.node.on(cc.Node.EventType.MOUSE_UP, function(e) {
            a.onTouchEnd()
        }, this),
        this.slider.slideEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onTouchMove", ""))),
        this.setScrollView(this.scrollView)
    }
    
    lateUpdate() {
        if (null != this.scrollView && null != this.slider) {
            if (this.hideScrollBar(),
            1 == this.scrollView.horizontal) {
                if (this._numBeforeMaxOffset == this.scrollView.getMaxScrollOffset().x && this._numBeforeOffset == this.scrollView.getScrollOffset().x)
                    return;
                this._numBeforeMaxOffset = this.scrollView.getMaxScrollOffset().x,
                this._numBeforeOffset = this.scrollView.getScrollOffset().x
            } else {
                if (this._numBeforeMaxOffset == this.scrollView.getMaxScrollOffset().y && this._numBeforeOffset == this.scrollView.getScrollOffset().y)
                    return;
                this._numBeforeMaxOffset = this.scrollView.getMaxScrollOffset().y,
                this._numBeforeOffset = this.scrollView.getScrollOffset().y
            }
            this.updateScroll()
        }
    }
    
    setScrollView(e) {
        null != e && (this.scrollView = e,
        this.scrollView.node.off("scrolling", this.updateScroll, this),
        this.scrollView.node.off("scroll-ended", this.updateScroll, this),
        this.scrollView.node.on("scrolling", this.updateScroll, this),
        this.scrollView.node.on("scroll-ended", this.updateScroll, this),
        this._isScrollViewInertia = this.scrollView.inertia,
        this._isScrollCancelInnerEvents = this.scrollView.cancelInnerEvents,
        this.hideScrollBar(),
        this.updateScroll())
    }
    
    setOnLeftButtonCallback(e) {
        this._onLeftButtonCallback = e
    }
    
    setOnRightButtonCallback(e) {
        this._onRightButtonCallback = e
    }
    
    updateScroll() {
        if (null != this.scrollView && null != this.slider)
            if (1 == this.scrollView.horizontal) {
                if (this.enableButtonAutoHide) {
                    var e = this._boundaryEpsilon
                      , t = this.scrollView.getScrollOffset().x
                      , n = this.scrollView.getMaxScrollOffset().x
                      , o = Math.abs(t) <= e
                      , a = Math.abs(t + n) <= e;
                    null != this.btnLeft && null != this.btnLeft && (this.btnLeft.node.active = !o && t < -(0 + e)),
                    null != this.btnRight && null != this.btnRight && (this.btnRight.node.active = !a && t > -(n - e))
                }
                this.slider.progress = -this.scrollView.getScrollOffset().x / this.scrollView.getMaxScrollOffset().x
            } else
                this.enableButtonAutoHide && (t = this.scrollView.getScrollOffset().y,
                null != this.btnUp && null != this.btnUp && (this.btnUp.node.active = t >= this.BUTTON_ENABLE_INTERVAL),
                null != this.btnDown && null != this.btnDown && (this.btnDown.node.active = t <= this.scrollView.content.height - this.scrollView.node.height - this.BUTTON_ENABLE_INTERVAL)),
                this.slider.progress = 1 - this.scrollView.getScrollOffset().y / this.scrollView.getMaxScrollOffset().y
    }
    
    hideScrollBar() {
        if (null != this.scrollView && null != this.slider)
            if (1 == this.scrollView.horizontal) {
                var e = this.scrollView.node.getContentSize().width / (this.scrollView.node.getContentSize().width + this.scrollView.getMaxScrollOffset().x);
                this.node.opacity = e >= 1 ? 0 : 255
            } else {
                var t = this.scrollView.node.getContentSize().height / (this.scrollView.node.getContentSize().height + this.scrollView.getMaxScrollOffset().y);
                this.node.opacity = t >= 1 ? 0 : 255
            }
    }
    
    onTouchEnd() {
        null != this.scrollView && null != this.slider && (this.scrollView.inertia = this._isScrollViewInertia,
        this.scrollView.cancelInnerEvents = this._isScrollCancelInnerEvents)
    }
    
    onTouchMove() {
        null != this.scrollView && null != this.slider && (this.scrollView.inertia = false,
        this.scrollView.cancelInnerEvents = false,
        this.scrollView.stopAutoScroll(),
        1 == this.scrollView.horizontal ? this.scrollView.scrollToPercentHorizontal(this.slider.progress, .01, false) : this.scrollView.scrollToPercentVertical(this.slider.progress, .01, false))
    }
    
    onClick_Left() {
        if (null != this.scrollView && null != this.slider) {
            if (//l.default.playFxOnce("btn_etc"),
            this._onLeftButtonCallback && 1 == this._onLeftButtonCallback())
                return;
            this.scrollView.scrollToOffset(cc.v2(Math.max(-this.scrollView.getMaxScrollOffset().x, Math.abs(this.scrollView.getScrollOffset().x) + -this.moveButtonDistance), 0), .25, true)
        }
    }
    
    onClick_Right() {
        if (null != this.scrollView && null != this.slider) {
            if (//l.default.playFxOnce("btn_etc"),
            this._onRightButtonCallback && 1 == this._onRightButtonCallback())
                return;
            this.scrollView.scrollToOffset(cc.v2(Math.max(-this.scrollView.getMaxScrollOffset().x, Math.abs(this.scrollView.getScrollOffset().x) + this.moveButtonDistance), 0), .25, true)
        }
    }
    
    onClick_Up() {
        null != this.scrollView && null != this.slider && (//l.default.playFxOnce("btn_etc"),
        this.scrollView.scrollToOffset(cc.v2(Math.max(-this.scrollView.getMaxScrollOffset().y, Math.abs(this.scrollView.getScrollOffset().y) + -this.moveButtonDistance), 0), .25, true))
    }
    
    onClick_Down() {
        null != this.scrollView && null != this.slider && (//l.default.playFxOnce("btn_etc"),
        this.scrollView.scrollToOffset(cc.v2(Math.max(-this.scrollView.getMaxScrollOffset().y, Math.abs(this.scrollView.getScrollOffset().y) - this.moveButtonDistance), 0), .25, true))
    }
}
