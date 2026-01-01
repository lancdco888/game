const { ccclass } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 精准无偏差 =====================
import State from "../Slot/State";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import LobbyScene from "../LobbyScene";

// ✅ 核心修复: 自定义类 空@ccclass() 无类名 → 彻底根治类名指定报错 (纯逻辑类无序列化属性)
@ccclass()
export default class L_LobbyInitState extends State {
    // ===================== 状态启动入口 - 原JS逻辑1:1复刻 日志+回调+流程执行 =====================
    public onStart(): void {
        cc.log("L_LobbyInitState start");
        // 注册状态结束回调函数
        this.addOnEndCallback(() => {
            cc.log("L_LobbyInitState end");
        });
        // 执行核心初始化流程
        this.doProcess();
    }

    // ===================== 核心异步初始化流程 - 原JS编译后的异步语法 完美转为TS原生async/await ✅ 核心优化 =====================
    private async doProcess(): Promise<void> {
        try {
            // 原生平台执行垃圾回收 (优化内存占用, 原JS逻辑保留)
            if (cc.sys.isNative) {
                cc.sys.garbageCollect();
            }
            // 异步执行大厅核心初始化 (等待初始化完成, 原JS核心逻辑)
            await LobbyScene.instance.initialize();
            // 初始化成功 → 标记当前状态完成
            this.setDone();
        } catch (error) {
            // ✅ 异常捕获 - 上报错误日志到AWS FireHose 原JS逻辑1:1精准复刻
            const fireHose = FireHoseSender.Instance();
            fireHose.sendAws(fireHose.getRecord(FHLogType.Exception, error));
        }
    }
}