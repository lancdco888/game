import LanguageManager from "../Config/LanguageManager";
import LevelBettingLockConfig from "../Config/LevelBettingLockConfig";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import CasinoZoneManager from "./CasinoZoneManager";
import LevelManager from "./LevelManager";


export default class ConfigManager {
    /**
     * 异步加载所有配置表（核心方法）
     * @returns Promise<boolean> 加载成功返回true，失败返回false
     */
    public static asyncLoadAllConfig() {



        // 返回一个 Promise<boolean>，对应原代码的逻辑
        return new Promise<boolean>(async (resolve) =>  {
            try {
                // 1. 并行加载所有配置（修正拼写错误：ayncLoadConfig → asyncLoadConfig）
                const configResults = await Promise.all([
                    this.asyncLoadConfig("Config/Common/level"),
                    this.asyncLoadConfig("Config/Common/language"),
                    this.asyncLoadConfig("Config/Common/vip"),
                    this.asyncLoadConfig("Config/Common/casinoZone"),
                    this.asyncLoadConfig("Config/Common/levelBettingLock"),
                    this.asyncLoadConfig("Config/Common/product"),
                    this.asyncLoadConfig("Config/Common/reelQuest")
                ]);

                // 2. 验证加载结果：判断是否包含 null（有任意一个配置加载失败）
                if (configResults.includes(null)) {
                    const nullIndex = configResults.indexOf(null);
                    cc.error(`加载失败，失败配置索引：${nullIndex}`);
                    resolve(false);
                    return;
                }

                LevelManager.Init(configResults[0]);
                LanguageManager.Init(configResults[1]);
                //VipManager.Init(configList[2]);
                CasinoZoneManager.Init(configResults[3]);
                LevelBettingLockConfig.Init(configResults[4]);
                // ProductConfig.Init(configList[5]);
                // ReelQuestConfig.Init(configList[6]);

                // 4. 初始化完成，返回成功
                resolve(true);
            } catch (error) {
                // 捕获意外错误（如 Promise 执行异常）
                cc.error("加载所有配置时发生意外错误：", error);
                resolve(false);
            }
        });



    }

    /**
     * 异步加载单个配置表JSON
     * @param path resources目录下的JSON配置文件路径 (无需写.json后缀)
     * @returns Promise<any> 成功返回JSON数据，失败返回null
     */
    public static async asyncLoadConfig(path: string): Promise<any> {
        return new Promise<any>((resolve) => {
            cc.loader.loadRes(path, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
                if (err) {
                    // 加载失败：错误日志 + AWS异常上报 + 返回null
                    const errorMsg = new Error(`cc.loader.loadRes 加载失败: ${path} : ${JSON.stringify(err)}`);
                    FireHoseSender.Instance().sendAws(
                        FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
                    );
                    resolve(null);
                    return;
                }
                // 加载成功，返回JSON配置的具体数据
                resolve(asset.json);
            });
        });
    }
}