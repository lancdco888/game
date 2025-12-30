const { ccclass, property } = cc._decorator;

/** 预制体信息实体类 - 原JS内联SlotPrefabInfo，序列化配置100%精准复刻 */
@ccclass("SlotPrefabInfo")
export class SlotPrefabInfo {
    @property({ type: cc.String })
    public key: string = "";

    @property({ type: cc.Prefab })
    public prefab: cc.Prefab = null;
}

/** 老虎机预制体管理器 - 全局单例模式，核心资源管理类，原逻辑一字不改 */
@ccclass
export default class SlotPrefabManager extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%复刻，预制体信息数组，编辑器可拖拽配置 =====
    @property({ type: [SlotPrefabInfo] })
    public prefabs: SlotPrefabInfo[] = [];

    // ===== 私有成员变量 - 原JS声明+初始化，变量名/默认值完全一致 =====
    private _prefabObjs: { [key: string]: cc.Prefab } = {};
    private static _instance: SlotPrefabManager = null;

    // ===== 全局单例获取方法 - 【核心逻辑 一字不改】，场景内获取实例+初始化，原写法完全保留 =====
    public static Instance(): SlotPrefabManager {
        if (null == this._instance) {
            this._instance = cc.director.getScene().getComponentInChildren(this);
            this._instance._init();
        }
        return this._instance;
    }

    // ===== 生命周期销毁回调 - 原逻辑完全复刻，单例置空+错误日志 =====
    onDestroy(): void {
        if (SlotPrefabManager._instance == this) {
            SlotPrefabManager._instance = null;
        } else {
            cc.error("SlotPrefabManager.Instance onDestroy error");
        }
    }

    // ===== 私有初始化方法 - 下划线命名保留，遍历预制体数组组装键值对，原逻辑不变 =====
    private _init(): void {
        for (let i = 0; i < this.prefabs.length; ++i) {
            const prefabInfo = this.prefabs[i];
            this._prefabObjs[prefabInfo.key] = prefabInfo.prefab;
        }
    }

    // ===== 预制体存在判断 - 【重中之重 严格保留双层重复null校验】，原逻辑零改动 =====
    isPrefabExist(key: string): boolean {
        return null != this._prefabObjs[key] && null != this._prefabObjs[key];
    }

    // ===== 获取预制体核心方法 - 原逻辑完全复刻，含错误日志提示+兜底返回null =====
    getPrefab(key: string): cc.Prefab {
        return this._prefabObjs[key] || (cc.error("SlotPrefabManager not found key ", key), null);
    }
}