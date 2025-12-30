const { ccclass, property } = cc._decorator;
import Symbol from "../Slot/Symbol";
import SymbolAni from "../Slot/SymbolAni";
import FireHoseSender, { FHLogType } from "../FireHoseSender";

// ===== 原代码嵌套类 SymbolInfo 完整复刻，变量名全小写+装饰器100%保留 =====
@ccclass('SymbolInfo')
export class SymbolInfo {
    @property({ type: Number })
    public symbolid: number = 0; // ✅ 保留原代码 小写id 特征，不是 symbolId！核心特征

    @property({ type: cc.Prefab })
    public prefab: cc.Prefab = null;
}

// ===== 核心类 SymbolPoolManager 符号对象池管理器，单例模式+对象池核心逻辑 =====
@ccclass
export default class SymbolPoolManager extends cc.Component {
    // ✅ 保留原代码 全局单例【小写instance】核心特征，老虎机所有组件调用依赖此单例，改大写必报错！
    public static instance: SymbolPoolManager = null;

    // ===== 序列化属性 - 原JS @property配置100%精准复刻，变量名全小写+拼写+顺序完全一致，一个不漏 =====
    @property({ type: Number })
    public initialsize: number = 10; // ✅ 保留原代码 拼写笔误 initialsize 不是 initialSize，核心特征

    @property({ type: [SymbolInfo] })
    public symbolinfo: SymbolInfo[] = []; // ✅ 全小写，普通符号配置列表

    @property({ type: [SymbolInfo] })
    public symbolaniinfo: SymbolInfo[] = []; // ✅ 全小写，动画符号配置列表

    @property({ type: cc.Node })
    public layerInitSymbolAni: cc.Node = null; // ✅ 动画符号预加载层

    // ===== 私有成员变量 - 对象池字典，key=symbolid 数值，value=对应符号的节点池 =====
    private pools: cc.NodePool[] = []; // 普通符号池
    private anipools: cc.NodePool[] = []; // 动画符号池

    // ===== 生命周期回调 - onLoad 单例赋值+初始化，原逻辑一字不改 =====
    onLoad(): void {
        SymbolPoolManager.instance = this;
        this.init();
    }

    // ===== 生命周期回调 - onDestroy 原代码【3个空for循环冗余逻辑】严格保留！哪怕无意义也不改 =====
    onDestroy(): void {
        let e: number;
        if (null != this.pools) {
            for (e = 0; e < this.pools.length; ++e) this.pools[e];
            for (e = 0; e < this.pools.length; ++e) this.pools[e];
            for (e = 0; e < this.pools.length; ++e) this.pools[e];
        }
    }

    // ===== 初始化对象池核心方法 - 预创建符号节点+动画符号预加载播放，原逻辑完全复刻 =====
    init(): void {
        let symbolCfg: SymbolInfo, nodePool: cc.NodePool, instNode: cc.Node;
        const self = this;

        // 初始化【普通符号】对象池
        for (let n = 0; n < this.symbolinfo.length; ++n) {
            symbolCfg = this.symbolinfo[n];
            if (null != symbolCfg.prefab) {
                nodePool = new cc.NodePool();
                this.pools[symbolCfg.symbolid] = nodePool;
                // 预创建指定数量的符号节点放入池中
                for (let o = 0; o < this.initialsize; ++o) {
                    nodePool.put(cc.instantiate(symbolCfg.prefab));
                }
            } else {
                cc.error("init fail. ", symbolCfg.symbolid);
            }
        }

        // 初始化【动画符号】对象池 + 预加载动画播放（初始化层）
        for (let n = 0; n < this.symbolaniinfo.length; ++n) {
            symbolCfg = this.symbolaniinfo[n];
            nodePool = new cc.NodePool();
            this.anipools[symbolCfg.symbolid] = nodePool;
            // 预创建指定数量的动画符号节点放入池中
            for (let o = 0; o < this.initialsize; ++o) {
                instNode = cc.instantiate(symbolCfg.prefab);
                nodePool.put(instNode);
                // 预加载动画播放：添加到初始化层并播放动画
                if (null != this.layerInitSymbolAni) {
                    this.layerInitSymbolAni.addChild(instNode);
                    instNode.getComponent(SymbolAni).playAnimation();
                }
            }
        }

        // ✅ 保留原代码 0.5秒延迟移除预加载动画节点，解决动画预加载卡顿问题
        if (null != this.layerInitSymbolAni) {
            this.scheduleOnce(function () {
                while (self.layerInitSymbolAni.childrenCount > 0) {
                    self.layerInitSymbolAni.children[0].removeFromParent();
                }
            }, 0.5);
        }
    }

    // ===== 获取普通符号节点 - 对象池核心取节点逻辑，异常上报+暗态关闭，100%原逻辑 =====
    getSymbol(symbolId: number): cc.Node | null {
        const nodePool = this.pools[symbolId];
        let symbolNode: cc.Node | null = null;

        if (!nodePool) {
            cc.log("SymbolPoolManager.getSymbol : there is not pool with SymbolId: " + symbolId);
            const error = new Error(`SymbolPoolManager getSymbol fail. not pool with SymbolId: ${symbolId.toString()}`);
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            return symbolNode;
        }

        // 池中有节点则取，无则实例化新节点
        if (nodePool.size() > 0) {
            symbolNode = nodePool.get();
        } else {
            const symbolCfg = this.getSymbolInfo(symbolId);
            if (null == symbolCfg.prefab) {
                cc.error("invalid symbol id", symbolId);
                const error = new Error(`SymbolPoolManager getSymbol fail. invalid SymbolId: ${symbolId.toString()}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                return symbolNode;
            }
            symbolNode = cc.instantiate(symbolCfg.prefab);
        }

        // 节点激活 + 关闭暗态（核心：符号取出默认亮态）
        const symbolCom = symbolNode.getComponent(Symbol);
        null == symbolCom.node && cc.log("Symbol ID", symbolId);
        symbolCom.node.active = true;
        symbolCom.setDimmActive(false);

        return symbolNode;
    }

    // ===== 获取动画符号节点 - 与普通符号逻辑一致，保留异常上报，100%原逻辑 =====
    getSymbolAni(symbolId: number): cc.Node | null {
        const nodePool = this.anipools[symbolId];
        let aniNode: cc.Node | null = null;

        if (!nodePool) {
            cc.log("SymbolPoolManager.getSymbolAni : there is not pool with SymbolId: " + symbolId);
            const error = new Error(`SymbolPoolManager getSymbolAni fail symbolId: ${symbolId.toString()}`);
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            return aniNode;
        }

        // 池中有节点则取，无则实例化新节点
        if (nodePool.size() > 0) {
            aniNode = nodePool.get();
        } else {
            const symbolCfg = this.getSymbolAniInfo(symbolId);
            if (null == symbolCfg) {
                const error = new Error(`SymbolPoolManager getSymbolAni fail. invalid SymbolId: ${symbolId.toString()}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                return aniNode;
            }
            aniNode = cc.instantiate(symbolCfg.prefab);
        }

        return aniNode;
    }

    // ===== 根据ID获取普通符号配置 - 松散判断==，遍历匹配，100%原逻辑 =====
    getSymbolInfo(symbolId: number): SymbolInfo | null {
        let cfg: SymbolInfo, targetCfg: SymbolInfo | null = null;
        for (let o = 0; o < this.symbolinfo.length; ++o) {
            cfg = this.symbolinfo[o];
            if (cfg.symbolid == symbolId) { // ✅ 保留松散判断 ==
                targetCfg = cfg;
                break;
            }
        }
        return targetCfg;
    }

    // ===== 根据ID获取动画符号配置 - 松散判断==，遍历匹配，100%原逻辑 =====
    getSymbolAniInfo(symbolId: number): SymbolInfo | null {
        let cfg: SymbolInfo, targetCfg: SymbolInfo | null = null;
        for (let o = 0; o < this.symbolaniinfo.length; ++o) {
            cfg = this.symbolaniinfo[o];
            if (cfg.symbolid == symbolId) { // ✅ 保留松散判断 ==
                targetCfg = cfg;
                break;
            }
        }
        return targetCfg;
    }

    // ===== 释放普通符号节点 - 【核心致命特征：双层null校验】，放回对象池，改必报错！ =====
    releaseSymbol(symbolCom: Symbol): void {
        const nodePool = this.pools[symbolCom.symbolId];
        // ✅ 保留原代码 神级双层null校验：null != t && null != t 完全复刻，核心特征！
        if (null != nodePool && null != nodePool) {
            // ✅ 保留双层父节点判空，移除节点时不销毁
            if (null != symbolCom.node.parent && null != symbolCom.node.parent) {
                symbolCom.node.removeFromParent(false);
            }
            nodePool.put(symbolCom.node);
        } else {
            cc.log("SymbolPoolManager.releaseSymbol : there is not pool with SymbolId: " + symbolCom.symbolId);
        }
    }

    // ===== 释放动画符号节点 - 兼容双组件获取ID+双层null校验，100%原逻辑 =====
    releaseSymbolAni(aniNode: cc.Node): void {
        let symbolId: number;
        const aniCom = aniNode.getComponent(SymbolAni);
        const symbolCom = aniNode.getComponent(Symbol);

        // 优先取动画组件ID，无则取普通符号组件ID
        if (null != aniCom) {
            symbolId = aniCom.symbolId;
        } else {
            if (null == symbolCom) {
                return cc.log("SymbolPoolManager: AnimationNode have not symbol ani component: " + symbolId);
            }
            symbolId = symbolCom.symbolId;
        }

        const nodePool = this.anipools[symbolId];
        // ✅ 同样保留双层null校验核心特征
        if (null != nodePool && null != nodePool) {
            if (null != aniNode.parent && null != aniNode.parent) {
                aniNode.removeFromParent(false);
            }
            nodePool.put(aniNode);
        } else {
            cc.log("SymbolPoolManager.releaseSymbolAni : there is not pool with SymbolId: " + symbolId);
        }
    }
}