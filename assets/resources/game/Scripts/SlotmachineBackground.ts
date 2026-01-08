import FireHoseSender, { FHLogType } from "../../../Script/FireHoseSender";
import SDefine from "../../../Script/global_utility/SDefine";
import SlotManager from "../../../Script/manager/SlotManager";

const { ccclass, property } = cc._decorator;


@ccclass()
export default class SlotmachineBackground extends cc.Component {
    // 缩放状态标识
    private scale_flag: boolean = true;
    // 顶部背景节点数组
    private top_bg: cc.Node[] = [];
    // 侧边背景节点数组
    private side_bg: cc.Node[] = [];
    // 原始缩放值
    private origin_scale: number = 1;

    /**
     * 异步加载背景预制体
     * @returns Promise<boolean> 加载成功返回true，失败返回false
     */
    public async asyncLoadBg(): Promise<boolean> {
        try {
            // 根据不同的zone类型获取对应的背景预制体路径
            const zoneName = SlotManager.Instance.getZoneName();
            let prefabPath = "";
            
            if (zoneName === SDefine.HIGHROLLER_ZONENAME || zoneName === SDefine.LIGHTNING_ZONENAME) {
                prefabPath = "SlotCommon/Prefab/BG_0";
            } else if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
                prefabPath = "SlotCommon/Prefab/BG_1";
            } else if (zoneName === SDefine.SUITE_ZONENAME) {
                prefabPath = "SlotCommon/Prefab/BG_2";
            } else {
                cc.error(`未匹配到zoneName: ${zoneName} 对应的背景预制体`);
                return false;
            }

            // 加载预制体（Cocos Creator 2.4.13 原生支持Promise化）
            const prefab = await new Promise<cc.Prefab>((resolve, reject) => {
                cc.loader.loadRes(prefabPath, cc.Prefab, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });

            // 实例化预制体并添加到当前节点
            const bgNode = cc.instantiate(prefab);
            bgNode.setPosition(0, 0);
            this.node.addChild(bgNode);

            // 收集背景子节点
            this.top_bg.push(
                bgNode.getChildByName("T"),
                bgNode.getChildByName("TL"),
                bgNode.getChildByName("TR")
            );
            this.side_bg.push(
                bgNode.getChildByName("TL"),
                bgNode.getChildByName("TR"),
                bgNode.getChildByName("Left"),
                bgNode.getChildByName("Right")
            );

            this.origin_scale = 1;
            return true;

        } catch (error) {
            // 错误日志上报
            const err = new Error(`加载背景预制体失败: ${JSON.stringify(error)}`);
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err));
            return false;
        }
    }

    /**
     * 设置原始缩放值
     * @param scale 目标缩放值
     */
    public setOriginScale(scale: number): void {
        this.origin_scale = scale;
    }

    /**
     * 改变背景缩放比例
     * @param duration 缩放动画时长（秒）
     * @param targetScale 目标缩放值
     * @param isSideBg 是否缩放侧边背景（默认false，缩放顶部背景）
     */
    public changeScaleRatio(duration: number, targetScale: number, isSideBg: boolean = false): void {
        // 原始缩放值大于目标值时不执行
        if (this.origin_scale > targetScale) {
            return;
        }

        if (this.scale_flag) {
            this.scale_flag = false;
            const completeCallback = () => {
                this.scale_flag = true;
            };

            // 选择要缩放的背景节点数组
            const targetNodes = isSideBg ? this.side_bg : this.top_bg;
            
            // 对每个目标节点执行缩放动画
            targetNodes.forEach(node => {
                if (!node) return; // 防止节点为空报错
                const tweenTarget = isSideBg ? { scaleX: targetScale } : { scaleY: targetScale };
                cc.tween(node)
                    .to(duration, tweenTarget)
                    .call(completeCallback)
                    .start();
            });
        } else {
            cc.log("背景缩放标识未初始化，跳过缩放操作");
        }
    }

    /**
     * 重置背景缩放到原始值
     * @param duration 缩放动画时长（秒）
     * @param isSideBg 是否重置侧边背景（默认false，重置顶部背景）
     */
    public resetScale(duration: number = 0, isSideBg: boolean = false): void {
        this.scale_flag = true;
        this.changeScaleRatio(duration, this.origin_scale, isSideBg);
    }

    /**
     * 重置所有背景（顶部+侧边）的缩放到原始值
     * @param duration 缩放动画时长（秒）
     */
    public allResetScale(duration: number = 0): void {
        this.resetScale(duration, true); // 重置侧边
        this.resetScale(duration, false); // 重置顶部
    }
}