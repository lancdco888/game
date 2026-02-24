import { SymbolInfo } from "../manager/SymbolPoolManager";
import Symbol from "./Symbol";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestSymbol extends cc.Component {

    @property(Symbol)
    symPref: Symbol = null;

    @property(cc.Prefab)
    symPrefab: cc.Prefab = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:
    @property({ type: [SymbolInfo] })
    public symbolinfo: SymbolInfo[] = []; // ✅ 全小写，普通符号配置列表

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
