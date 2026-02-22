import TopUI_HundredDollar from './TopUI_HundredDollar';
import ReelFrameAnimation_HundredDollar from './ReelFrameAnimation_HundredDollar';
import BonusGameComponent_HundredDollar from './BonusGameComponent_HundredDollar';

const { ccclass, property } = cc._decorator;

@ccclass('GameComponents_HundredDollar')
export default class GameComponents_HundredDollar extends cc.Component {
    @property(TopUI_HundredDollar)
    public topUI: TopUI_HundredDollar = null;

    @property(ReelFrameAnimation_HundredDollar)
    public reelFrameAni: ReelFrameAnimation_HundredDollar = null;

    
    @property(BonusGameComponent_HundredDollar)
    public bonusGameComponent: BonusGameComponent_HundredDollar = null;

    constructor(){
        super()
    }


    onLoad(): void {

    }
}