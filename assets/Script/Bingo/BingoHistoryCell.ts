const { ccclass, property } = cc._decorator;

@ccclass
export default class BingoHistoryCell extends cc.Component {
    @property(cc.Label)
    public label: cc.Label = null;

    onLoad() {
        
    }
}