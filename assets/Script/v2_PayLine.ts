const { ccclass, property } = cc._decorator;

/**
 * 老虎机赔付线 基础配置类
 * 给v2_PayLineRenderer提供单条赔付线的基础样式配置 (宽度/颜色)
 */
@ccclass
export default class v2_PayLine extends cc.Component {
    /** 赔付线宽度 */
    @property({ type: Number })
    public m_lineWidth: number = 0;

    /** 赔付线颜色 */
    @property({ type: cc.Color })
    public m_color: cc.Color = cc.Color.WHITE;
}