const {ccclass, property} = cc._decorator;

export enum LobbySceneUIType {
    NONE = 0,
    LOBBY = 1,
    SUITE = 2,
    YOURS = 3,
    COUNT = 4
}


@ccclass
export default class LobbySceneUI extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
