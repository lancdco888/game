const { ccclass, property } = cc._decorator;

// ===================== 原文件嵌套序列化数据类 CommonPrefabInfo 完整保留 序列化标记精准 =====================
@ccclass()
export class CommonPrefabInfo {
    @property()
    public key: string = "";

    @property({type: cc.Prefab})
    public prefab: cc.Prefab = null;
}

// ===================== 核心预制体管理工具类 继承cc.Component =====================
@ccclass
export default class CommonPrefabSetter extends cc.Component {
    // ===================== 序列化绑定的预制体数组 类型为上面定义的CommonPrefabInfo =====================
    @property({type: [CommonPrefabInfo]})
    private prefabs: CommonPrefabInfo[] = [];

    // ===================== 私有缓存对象 预制体key-value映射表 =====================
    private _prefabObjs: {[key: string]: cc.Prefab} = null;

    // ===================== 私有初始化方法 构建预制体映射缓存 只执行一次 =====================
    private _init(): void {
        this._prefabObjs = {};
        for (let i = 0; i < this.prefabs.length; ++i) {
            const prefabInfo = this.prefabs[i];
            this._prefabObjs[prefabInfo.key] = prefabInfo.prefab;
        }
    }

    // ===================== 对外公有核心方法 根据key获取预制体 缓存优先 =====================
    public getPrefab(key: string): cc.Prefab {
        if (this._prefabObjs == null) {
            this._init();
        }
        if (this._prefabObjs[key]) {
            return this._prefabObjs[key];
        } else {
            cc.error("CommonPrefabSetter not found key ", key);
            return null;
        }
    }
}