const { ccclass, property } = cc._decorator;

// ===================== 枚举保留不变，所有业务逻辑完全复用 =====================
export enum LobbySceneUIType {
    NONE = 0,
    LOBBY = 1,
    SUITE = 2,
    YOURS = 3,
    COUNT = 4
};

@ccclass()
export default class SceneInfo extends cc.Component {
    // ✅【核心修复点】：移除 { type: LobbySceneUIType }，只保留 @property()
    // 枚举本质是number，Cocos自动识别为数值类型，序列化正常，无任何报错
    @property()
    public type: LobbySceneUIType = LobbySceneUIType.NONE;

    // ✅ 这个属性写法完全正确，无需任何修改！
    @property({ type: [cc.Node] })
    public arrActiveObject: cc.Node[] = [];

    constructor(){
        super()
    }
}