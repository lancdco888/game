const { ccclass, property } = cc._decorator;

// 导入项目依赖模块 (路径与原JS完全一致，无需修改)
import PlayAniOnActiveCurrentNode from "../BigWinEffect/PlayAniOnActiveCurrentNode";
import MultiNodeActivator from "./MultiNodeActivator";
//import StarAlbumManager from "../../Utility/StarAlbumManager";
import TSUtility from "../global_utility/TSUtility";
//import { TypeSkinStarAlbum } from "../StarCollection/StarAlbumData/StarAlbumSeasonData";

// ✅ 骨骼动画状态枚举 (原JS枚举1:1还原)
export enum HeroSpineState {
    UNKNOWN = -1,
    IDLE = 0,
    PLEASURE = 1,
    THANKS = 2,
    SILHOUETTE = 3,
    WHITE_SILHOUETTE = 4
}

// ✅ 骨骼动画循环状态枚举 (原JS枚举1:1还原)
export enum HeroSpineLoopState {
    STOP = 0,
    LOOP = 1
}

@ccclass('HeroSpineController')
export default class HeroSpineController extends cc.Component {
    // ===================== 编辑器序列化属性 (与原JS完全一致，带强类型) =====================
    @property(MultiNodeActivator)
    public idleActivator: MultiNodeActivator = null!;

    @property(MultiNodeActivator)
    public pleasureActivator: MultiNodeActivator = null!;

    @property(MultiNodeActivator)
    public thankActivator: MultiNodeActivator = null!;

    @property(cc.Node)
    public silhouette: cc.Node | null = null;

    @property(cc.Node)
    public whiteSilhouetteRoot: cc.Node | null = null;

    @property([cc.Node])
    public whiteSilhouettes: cc.Node[] = [];

    // ===================== 私有成员属性 (补全强类型注解) =====================
    private heroId: string = "";
    private state: HeroSpineState = HeroSpineState.UNKNOWN;
    private prevParentOpacity: number = -1;

    // 剪影配色相关 (原HEX色值1:1保留)
    private starAlbumsilhouetteColor: cc.Color = cc.Color.BLACK.fromHEX("#037F2A");
    private oriSilhouetteColor: cc.Color = cc.Color.BLACK.fromHEX("#920F94");
    private silhouetteColorDefault: cc.Color = cc.Color.BLACK.fromHEX("#920F94");
    private silhouetteColorSpring: cc.Color = cc.Color.BLACK.fromHEX("#037F2A");
    private silhouetteColorSummer: cc.Color = cc.Color.BLACK.fromHEX("#009CFF");
    private silhouetteColorAutumn: cc.Color = cc.Color.BLACK.fromHEX("#B03600");

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        // 为所有子节点Spine骨骼添加动画播放组件
        const spineList = this.getComponentsInChildren(sp.Skeleton);
        spineList.forEach(spine => {
            const playAniCom = spine.addComponent(PlayAniOnActiveCurrentNode);
            playAniCom.ignoreLoopFlag = true;
        });
        
        // // 获取当前赛季信息 + 设置剪影配色
        // StarAlbumManager.instance().getCurrentSeasonInfo().numSeasonID;
        this.setStarAlbumsilhouetteColorBySkinType();

        // 默认切待机状态
        if (this.state === HeroSpineState.UNKNOWN) {
            this.setIdle(1);
        }
    }

    onEnable(): void {
        this.updateOpacity();
    }

    update(): void {
        this.updateOpacity();
    }

    // ===================== 核心业务方法 =====================
    /** 根据皮肤类型设置剪影配色 */
    setStarAlbumsilhouetteColorBySkinType(): void {
        // const skinType = StarAlbumManager.instance().eSkinType;
        // switch (skinType) {
        //     case TypeSkinStarAlbum.SPRING:
        //         this.starAlbumsilhouetteColor = this.silhouetteColorSpring;
        //         break;
        //     case TypeSkinStarAlbum.SUMMER:
        //         this.starAlbumsilhouetteColor = this.silhouetteColorSummer;
        //         break;
        //     case TypeSkinStarAlbum.AUTUMN:
        //         this.starAlbumsilhouetteColor = this.silhouetteColorAutumn;
        //         break;
        //     default:
        //         this.starAlbumsilhouetteColor = this.silhouetteColorDefault;
        //         break;
        // }
    }

    /** 获取当前播放的Spine动画结束时间 */
    getCurrentSpineAniEndTime(): number {
        let targetNode: cc.Node | null = null;
        if (this.idleActivator.node.active) {
            targetNode = this.idleActivator.node;
        } else if (this.pleasureActivator.node.active) {
            targetNode = this.pleasureActivator.node;
        } else if (this.thankActivator.node.active) {
            targetNode = this.thankActivator.node;
        }

        if (!targetNode) return 0;

        const spineList = targetNode.getComponentsInChildren(sp.Skeleton);
        for (const spine of spineList) {
            if (spine.node.active && spine.getCurrent(0)) {
                return spine.getCurrent(0).animationEnd;
            }
        }
        return 0;
    }

    /** 设置待机状态 */
    setIdle(index: number): void {
        this.idleActivator.node.active = true;
        this.pleasureActivator.node.active = false;
        this.thankActivator.node.active = false;
        this.whiteSilhouetteRoot && (this.whiteSilhouetteRoot.active = false);
        this.silhouette && (this.silhouette.active = false);
        this.state = HeroSpineState.IDLE;
        
        const playIdx = index - 1;
        this.idleActivator.playEffect(playIdx);
    }

    /** 设置喜悦状态 */
    setPleasure(index: number): void {
        this.idleActivator.node.active = false;
        this.pleasureActivator.node.active = true;
        this.thankActivator.node.active = false;
        this.whiteSilhouetteRoot && (this.whiteSilhouetteRoot.active = false);
        this.silhouette && (this.silhouette.active = false);
        this.state = HeroSpineState.PLEASURE;
        
        const playIdx = index - 1;
        this.pleasureActivator.playEffect(playIdx);
    }

    /** 设置感谢状态 */
    setThanks(index: number): void {
        this.idleActivator.node.active = false;
        this.pleasureActivator.node.active = false;
        this.thankActivator.node.active = true;
        this.whiteSilhouetteRoot && (this.whiteSilhouetteRoot.active = false);
        this.silhouette && (this.silhouette.active = false);
        this.state = HeroSpineState.THANKS;
        
        const playIdx = index - 1;
        this.thankActivator.playEffect(playIdx);
    }

    /** 设置剪影状态 */
    setSilhoutte(isChageColor: boolean = false): void {
        this.setStarAlbumsilhouetteColorBySkinType();
        this.idleActivator.node.active = false;
        this.pleasureActivator.node.active = false;
        this.thankActivator.node.active = false;
        this.whiteSilhouetteRoot && (this.whiteSilhouetteRoot.active = false);

        if (this.silhouette) {
            console.log("isChageColor : " + isChageColor);
            this.silhouette.color = isChageColor ? this.starAlbumsilhouetteColor : this.oriSilhouetteColor;
            this.silhouette.active = true;
        }
        this.state = HeroSpineState.SILHOUETTE;
    }

    /** 设置白色剪影状态 */
    setWhiteSilhouette(index: number): void {
        this.idleActivator.node.active = false;
        this.pleasureActivator.node.active = false;
        this.thankActivator.node.active = false;
        this.whiteSilhouetteRoot && (this.whiteSilhouetteRoot.active = true);
        this.silhouette && (this.silhouette.active = false);

        const playIdx = index - 1;
        this.whiteSilhouettes.forEach((node, idx) => {
            node.active = playIdx === idx;
        });
        this.state = HeroSpineState.WHITE_SILHOUETTE;
    }

    /** 判断是否是剪影状态 */
    isSilhoutteState(): boolean {
        return this.state === HeroSpineState.SILHOUETTE;
    }

    /** 停止所有Spine骨骼动画 */
    stopAllSpineAni(): void {
        const spineList = this.getComponentsInChildren(sp.Skeleton);
        spineList.forEach(spine => {
            spine.timeScale = 0;
        });
    }

    /** 设置所有Spine骨骼动画循环/停止 */
    setAllSpineLoop(isLoop: boolean): void {
        const spineList = this.getComponentsInChildren(sp.Skeleton);
        spineList.forEach(spine => {
            spine.loop = isLoop;
            spine.timeScale = 1;
            spine.setAnimation(0, spine.animation, isLoop);
        });
    }

    /** 获取父节点链的最终透明度 */
    getParentNodeOpacity(): number {
        let opacity = 255;
        let parentNode = this.node.parent;
        while (TSUtility.isValid(parentNode)) {
            opacity *= parentNode.opacity / 255;
            parentNode = parentNode.parent;
        }
        return Math.max(Math.min(255, opacity), 0);
    }

    /** 更新骨骼动画节点的透明度 (原生平台专用) */
    updateOpacity(): void {
        if (!cc.sys.isNative) return;
        
        const currOpacity = this.getParentNodeOpacity();
        if (currOpacity !== this.prevParentOpacity) {
            this.prevParentOpacity = currOpacity;
            const spineList = this.getComponentsInChildren(sp.Skeleton);
            spineList.forEach(spine => {
                spine.node.opacity = this.prevParentOpacity;
            });
        }
    }
}