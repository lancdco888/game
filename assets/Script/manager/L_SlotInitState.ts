import HRVSlotService from "../HRVService/HRVSlotService";
import State from "../Slot/State";
import SlotManager from "./SlotManager";

/**
 * 老虎机初始化状态类
 * 负责老虎机初始化阶段的核心逻辑：埋点记录、垃圾回收、HRV服务初始化、SlotManager初始化
 */
export default class L_SlotInitState extends State {
    /**
     * 状态启动方法（State基类生命周期）
     */
    onStart(): void {
        // 打印初始化开始日志
        cc.log("L_SlotInitState start");
        
        // 绑定状态结束回调，打印结束日志
        this.addOnEndCallback(() => {
            cc.log("L_SlotInitState end");
        });
        
        // 执行核心初始化流程
        this.doProcess();
    }

    /**
     * 核心初始化流程（异步执行）
     */
    private async doProcess(): Promise<void> {
        // try {
            // 1. 记录老虎机初始化开始的埋点
            // Analytics.customSlotLoadingRecord("slotInit_start");
            
            // 2. 原生环境下执行垃圾回收（优化性能）
            if (cc.sys.isNative) {
                cc.sys.garbageCollect();
            }

            // c.default.customSlotLoadingRecord("slotInit_start"),
            cc.sys.isNative && cc.sys.garbageCollect()
            HRVSlotService.createInstance()
            HRVSlotService.instance().init(SlotManager.Instance)
    
            // 4. 异步初始化SlotManager核心管理器
            await SlotManager.Instance.init();
            
            // 5. 标记状态完成
            this.setDone();
        // } catch (error) {
        //     // 捕获初始化异常，打印日志并标记状态完成（避免流程阻塞）
        //     const err = error as Error;
        //     cc.log(`L_SlotInitState doProcess error: ${err.message}`, err.stack);
        //     this.setDone();
        // }
    }
}