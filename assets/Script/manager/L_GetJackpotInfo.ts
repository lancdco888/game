import FireHoseSender, { FHLogType } from "../FireHoseSender";
import State from "../Slot/State";
import UserInfo from "../User/UserInfo";
import CasinoZoneManager from "./CasinoZoneManager";

// L_GetJackpotInfo.ts
const { ccclass } = cc._decorator;



// 核心类：继承自 State 基类（对应原代码中的 p 类）
@ccclass()
export default class L_GetJackpotInfo extends State {
    /**
     * 初始化方法：标记任务未完成，触发核心处理逻辑
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 核心处理方法：循环刷新所有区域的 Jackpot 信息
     */
    public async doProcess(): Promise<void> {
        try {
            // 1. 获取最大区域数量（对应原代码中的 u.default.Instance().getMaxZoneCount()）
            const maxZoneCount = CasinoZoneManager.Instance().getMaxZoneCount();

            // 2. 循环遍历每个区域 ID，异步刷新 Jackpot 信息（替换原 Generator 循环逻辑）
            for (let zoneId = 0; zoneId < maxZoneCount; zoneId++) {
                // 等待当前区域 Jackpot 信息刷新完成（对应原代码中的 asyncRefreshJackpotInfoByZoneId）
                await UserInfo.instance().asyncRefreshJackpotInfoByZoneId(zoneId);
            }

            // 3. 所有区域刷新完成，标记任务完成
            this.setDone();
        } catch (error) {
            // 4. 捕获异常：通过 FireHose 发送异常上报（对应原代码中的 c.default.Instance() 逻辑）
            const fireHoseInstance = FireHoseSender.Instance();
            const exceptionRecord = fireHoseInstance.getRecord(FHLogType.Exception, error);
            fireHoseInstance.sendAws(exceptionRecord);

            // 5. 异常情况下也标记任务完成
            this.setDone();
        }
    }
}
