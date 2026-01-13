const { ccclass, property } = cc._decorator;
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SDefine from "../global_utility/SDefine";
import SlotManager from "./SlotManager";

/**
 * 老虎机侧边背景组件
 * 负责根据当前游戏区域异步加载并显示对应的侧边背景预制体
 */
@ccclass()
export default class SlotmachineBackgroundSide extends cc.Component {
    // ================= 生命周期方法 =================
    /**
     * 组件加载时执行（原onLoad逻辑，TS中保留空实现以兼容原代码）
     */
    onLoad(): void {
        // 原代码无具体逻辑，保留空方法以兼容
    }

    /**
     * 异步加载侧边背景预制体
     * @returns 加载是否成功（Promise<boolean>）
     */
    public async asyncLoadBg(): Promise<boolean> {
        try {
            // 1. 获取当前游戏区域名称
            const zoneName = SlotManager.Instance.getZoneName();
            if (!zoneName) {
                cc.error("SlotmachineBackgroundSide: 游戏区域名称为空，使用默认背景类型");
            }

            // 2. 根据区域名称确定背景类型编号
            let bgType = 0;
            if (zoneName === SDefine.HIGHROLLER_ZONENAME || zoneName === SDefine.LIGHTNING_ZONENAME) {
                bgType = 0;
            } else if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
                bgType = 1;
            } else {
                bgType = 2; // 其他区域默认类型
            }

            // 3. 拼接预制体资源路径
            const resPath = `SlotCommon/Prefab/BGSIDE_${bgType.toString()}`;

            // 4. 异步加载预制体资源（兼容Cocos 2.4.x的loader.loadRes）
            return new Promise<boolean>((resolve) => {
                cc.loader.loadRes(
                    resPath,
                    cc.Prefab, // 指定加载类型为Prefab，提升类型安全
                    (err: Error | null, prefab: cc.Prefab) => {
                        // 5. 加载失败处理：发送异常日志到FireHose
                        if (err) {
                            const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                            cc.error(errorMsg.message);
                            // FireHoseSender.Instance().sendAws(
                            //     FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, errorMsg)
                            // );
                            resolve(false);
                            return;
                        }

                        // 6. 加载成功：实例化预制体并添加到当前节点
                        const bgNode = cc.instantiate(prefab);
                        this.node.addChild(bgNode);
                        resolve(true);
                    }
                );
            });
        } catch (err) {
            // 全局异常捕获
            const errorMsg = err instanceof Error ? err : new Error(`asyncLoadBg 异常: ${String(err)}`);
            cc.error(errorMsg.message);
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
            );
            return false;
        }
    }
}