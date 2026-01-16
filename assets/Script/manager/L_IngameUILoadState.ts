import InGameUI_2020 from "../../resources/game/Scripts/InGameUI_2020";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import State from "../Slot/State";
import LoadingSlotProcess from "./LoadingSlotProcess";

const { ccclass, property } = cc._decorator;

/**
 * 游戏内UI加载状态类（继承自State基类）
 * 负责加载IngameUI预制体、服务资源预制体，处理加载异常并上报日志
 */
@ccclass()
export default class L_IngameUILoadState extends State {
    /**
     * 状态启动时执行
     */
    onStart(): void {
        cc.log("L_IngameUILoadState start");
        
        // 添加状态结束回调
        this.addOnEndCallback(() => {
            cc.log("L_IngameUILoadState end");
        });

        // 执行加载流程
        this.doProcess();
    }

    /**
     * 执行核心加载流程（并行加载IngameUI和服务资源）
     */
    private async doProcess(): Promise<void> {
        try {
            // 并行加载多个资源：IngameUI + 两个服务资源
            const loadResults = await Promise.all([
                this.asyncLoadInGameUI(),
                this.asyncLoadServiceResources("Service/01_Content/FeverMode/FeverModeIcon"),
                this.asyncLoadServiceResources("Service/01_Content/PowerGem/PowerGemSlotBottomIcon")
            ]);

            // 检查是否有加载失败的项
            if (loadResults.includes(false)) {
                const errorMsg = new Error("L_IngameUILoadState fail");
                // FireHoseSender.Instance().sendAws(
                //     FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, errorMsg)
                // );
                console.error(errorMsg);
                return;
            }

            // 加载完成：记录埋点，标记状态完成
            //Analytics.default.customSlotLoadingRecord("load_ingameui_complete");
            this.setDone();
        } catch (error) {
            // 捕获加载异常并上报
            //FireHoseSender.default.Instance().sendAws(
            //    FireHoseSender.default.Instance().getRecord(FireHoseSender.default.FHLogType.Exception, error)
            //);
        }
    }

    /**
     * 异步加载IngameUI_2020预制体
     * @returns 加载是否成功（true=成功，false=失败）
     */
    private asyncLoadInGameUI(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            // 加载IngameUI预制体
            cc.loader.loadRes("IngameUI/InGameUI_2020", (err: Error | null, prefab: any) => {
                if (err) {
                    // 加载失败：上报异常，返回false
                    const errorMsg = new Error(`cc.loader.loadRes fail asyncLoadInGameUI: ${JSON.stringify(err)}`);
                    // FireHoseSender.Instance().sendAws(
                    //     FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
                    // );
                    console.error(errorMsg);

                    resolve(false);
                    return;
                }

                // 加载成功：实例化并赋值给LoadingSlotProcess
                const ingameUINode = cc.instantiate(prefab);
                const ingameUIComponent = ingameUINode.getComponent(InGameUI_2020);
                LoadingSlotProcess.Instance().ingameUI = ingameUIComponent;
                resolve(true);
            });
        });
    }

    /**
     * 异步加载服务资源预制体（优先读取缓存）
     * @param prefabPath 预制体资源路径
     * @returns 加载是否成功（true=成功，false=失败）
     */
    private asyncLoadServiceResources(prefabPath: string): Promise<boolean> {
        // 优先检查缓存，存在则直接返回成功
        const cachedPrefab = LoadingSlotProcess.Instance().getPrefab(prefabPath);
        if (cachedPrefab != null) {
            return Promise.resolve(true);
        }

        // 缓存不存在则加载资源
        return new Promise<boolean>((resolve) => {
            cc.loader.loadRes(prefabPath, (err: Error | null, prefab: any) => {
                if (err) {
                    // 加载失败：上报异常，返回false
                    const errorMsg = new Error(`cc.loader.loadRes fail prefabPath: [key:${prefabPath}] ${JSON.stringify(err)}`);
                    // FireHoseSender.Instance().sendAws(
                    //     FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
                    // );
                    console.error(errorMsg);
                    resolve(false);
                    return;
                }

                // 加载成功：缓存预制体，返回true
                LoadingSlotProcess.Instance().setPrefab(prefabPath, prefab);
                resolve(true);
            });
        });
    }
}