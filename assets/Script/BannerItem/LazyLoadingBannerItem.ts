// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import DelayProgress from "../DelayProgress";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import CommonBannerItem from "./CommonBannerItem";

/**
 * 广告横幅懒加载核心组件
 * 继承cc.Component原生组件，核心功能：广告预制体的异步懒加载、加载中进度动画显示、加载完成销毁动画节点、实例化广告预制体并绑定弹窗回调、加载失败错误处理，是广告轮播的性能核心组件
 */
@ccclass
export default class LazyLoadingBannerItem extends cc.Component {
    // ===================== 核心业务方法 - 懒加载广告预制体 (原逻辑完整保留，100%精准还原所有细节+参数+错误处理) =====================
    public setPrefabItem(prefabPath: string, programObj: any, popupCloseCallback: Function | null): void {
        // 回调参数默认值赋值 - 原代码逻辑保留
        if (popupCloseCallback === void 0) {
            popupCloseCallback = null;
        }
        const self = this;

        // 1. 创建加载进度动画节点并添加到当前节点
        const progressNode = PopupManager.Instance().makeDelayProgressNode();
        this.node.addChild(progressNode);

        // 2. 根据当前节点锚点，设置进度节点的居中位置
        const nodeSize = this.node.getContentSize();
        if (this.node.anchorX === 0) {
            progressNode.setPosition(nodeSize.width / 2, 0);
        } else {
            progressNode.setPosition(cc.Vec2.ZERO);
        }
        progressNode.active = true;

        // 3. 初始化进度动画组件的样式与显示状态
        const delayProgress = progressNode.getComponent(DelayProgress);
        delayProgress.setContentSize(nodeSize);
        delayProgress.setScaleAniNode(0.8);
        delayProgress.showDisplayProgress(true, false);

        // 4. 异步加载广告预制体资源 - 核心懒加载逻辑
        cc.loader.loadRes(prefabPath, (error: Error, prefab: cc.Prefab) => {
            // 组件已销毁 容错处理 - 原代码核心健壮性校验
            if (!TSUtility.isValid(self)) {
                cc.error("LazyLoadingBannerItem already destroy", prefabPath);
                return;
            }

            // 加载失败 错误处理 - 原代码逻辑保留，报错+销毁当前节点
            if (error) {
                cc.error("LazyLoadingBannerItem.setPrefabItem fail", prefabPath);
                self.node.destroy();
                return;
            }

            // 5. 加载成功 - 销毁进度动画节点+隐藏进度显示
            delayProgress.showDisplayProgress(false, false);
            progressNode.destroy();

            // 6. 实例化广告预制体 + 挂载到当前节点 + 居中对齐
            const bannerItemNode = cc.instantiate(prefab);
            self.node.addChild(bannerItemNode);
            bannerItemNode.setPosition(cc.Vec2.ZERO);

            // 7. 绑定弹窗关闭回调到广告基类组件
            bannerItemNode.getComponent(CommonBannerItem).setOnPopupClose(popupCloseCallback);

            // 8. 可选逻辑 - 传递着色器program对象（原代码保留，兼容着色器需求）
            if (programObj) {
                programObj.setProgram(bannerItemNode);
            }
        });
    }
}