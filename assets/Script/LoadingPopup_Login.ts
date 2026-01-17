import LoadingPopup from "./Popup/LoadingPopup";

const { ccclass, property } = cc._decorator;


/**
 * 登录场景专用Loading弹窗组件
 * 继承自基础LoadingPopup组件，无额外扩展逻辑
 */
@ccclass()
export default class LoadingPopup_Login extends LoadingPopup {
    // 该组件为登录场景专用Loading弹窗，仅继承基础LoadingPopup逻辑，无额外属性/方法
    constructor(){
        super()
    }
}