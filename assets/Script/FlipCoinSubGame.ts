const { ccclass, property } = cc._decorator;

@ccclass
export default class FlipCoinSubGame extends cc.Component {
    // ====================== 序列化属性 - 编辑器拖拽赋值 ======================
    @property(cc.Animation)
    public leftAni: cc.Animation = null;

    @property(cc.Animation)
    public rightAni: cc.Animation = null;

    @property(cc.Sprite)
    public leftCoinImg: cc.Sprite = null;

    @property([cc.Sprite])
    public rightCoinImgs: cc.Sprite[] = [];

    @property(cc.Animation)
    public txtResultAni: cc.Animation = null;

    @property(cc.Sprite)
    public txtResultSpr: cc.Sprite = null;

    // ====================== 贴图资源 - 编辑器拖拽赋值 ======================
    @property(cc.SpriteFrame)
    public headSprFrame: cc.SpriteFrame = null; // 硬币正面贴图

    @property(cc.SpriteFrame)
    public tailSprFrame: cc.SpriteFrame = null; // 硬币反面贴图

    @property(cc.SpriteFrame)
    public hooraySprFrame: cc.SpriteFrame = null; // 中奖结果贴图

    @property(cc.SpriteFrame)
    public darnSprFrame: cc.SpriteFrame = null; // 未中奖结果贴图

    // ====================== 私有成员变量 ======================
    private subGameIndex: number = 0;

    // ====================== 对外公开方法 - 初始化子游戏 ======================
    public initSubGame(index: number, headSF: cc.SpriteFrame, tailSF: cc.SpriteFrame): void {
        this.subGameIndex = index;
        this.headSprFrame = headSF;
        this.tailSprFrame = tailSF;
    }

    // ====================== 对外公开方法 - 开始子游戏 ======================
    public startSubGame(): void {
        this.leftAni.node.active = false;
        this.rightAni.node.active = false;
        this.txtResultAni.node.active = false;
    }

    // ====================== 对外公开方法 - 设置左侧硬币显示 ======================
    // param : isHead 1=正面 | 0=反面
    public setLeftCoin(isHead: number): void {
        this.leftAni.node.active = true;
        this.leftCoinImg.spriteFrame = isHead === 1 ? this.headSprFrame : this.tailSprFrame;
        this.leftAni.play("Chance_Coin_Appear_Ani");
        this.leftAni.setCurrentTime(0);
    }

    // ====================== 对外公开方法 - 设置右侧硬币显示 ======================
    // param : isHead 1=正面 | 0=反面
    public setRightCoin(isHead: number): void {
        this.rightAni.node.active = true;
        const targetSF = isHead === 1 ? this.headSprFrame : this.tailSprFrame;
        
        for (let i = 0; i < this.rightCoinImgs.length; ++i) {
            this.rightCoinImgs[i].spriteFrame = targetSF;
        }
        
        this.rightAni.play("Chance_Coin_Appear_Ani");
        this.rightAni.setCurrentTime(0);
    }

    // ====================== 对外公开方法 - 播放匹配结果动画 ======================
    // param : isMatch 1=匹配中奖 | 0=不匹配未中奖
    public showMatchingAni(isMatch: number): void {
        this.txtResultAni.node.active = true;
        this.txtResultAni.play();
        this.txtResultAni.setCurrentTime(0);

        // 左侧硬币固定动画
        this.leftAni.play("Chance_Coin_Compare_Ani_1");
        this.leftAni.setCurrentTime(0);

        if (isMatch === 1) {
            // 匹配成功 - 播放中奖动画+显示中奖文案
            this.rightAni.play("Chance_Coin_Compare_Ani_2");
            this.txtResultSpr.spriteFrame = this.hooraySprFrame;
        } else {
            // 匹配失败 - 播放未中奖动画+显示未中奖文案
            this.rightAni.play("Chance_Coin_Compare_Ani_3");
            this.txtResultSpr.spriteFrame = this.darnSprFrame;
        }
        this.rightAni.setCurrentTime(0);
    }
}