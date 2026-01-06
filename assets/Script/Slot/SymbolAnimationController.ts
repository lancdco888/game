const { ccclass, property } = cc._decorator;

// 导入项目依赖模块 (路径与原JS完全一致，无需修改)
import SymbolPoolManager from "../manager/SymbolPoolManager";
import SlotManager from "../manager/SlotManager";
import Reel from "./Reel";
import SymbolAni from "./SymbolAni";
import State from "./State";
import SymbolAnimationModule_Base from "../SymbolAnimationModule_Base";
import TSUtility from "../global_utility/TSUtility";

@ccclass()
export default class SymbolAnimationController extends cc.Component {
    // ===================== 编辑器序列化属性 (可视化配置) =====================
    @property(cc.Node)
    public animationRoot: cc.Node = null!;

    @property(cc.Node)
    public animationLayer: cc.Node = null!;

    @property([cc.Node])
    public animationReels: cc.Node[] = [];

    @property({ type: Boolean })
    public symbolsReverseOrder: boolean = false;

    @property(SymbolAnimationModule_Base)
    public symbolAnimationModule: SymbolAnimationModule_Base | null = null;

    // ===================== 静态单例实例 =====================
    public static Instance: SymbolAnimationController | null = null;

    // ===================== 私有内部属性 (强类型注解) =====================
    /** 存储播放中的符号动画信息 key: col_row  value: 符号动画节点信息 */
    private info: { [key: string]: { col: number, row: number, symbolId: number, aniNode: cc.Node } } = {};

    // ===================== 生命周期 =====================
    onLoad(): void {
        SymbolAnimationController.Instance = this;
        if (this.animationRoot) {
            this.animationRoot.active = false;
        }
    }

    onDestroy(): void {
        if (SymbolAnimationController.Instance === this) {
            SymbolAnimationController.Instance = null;
        } else {
            cc.error("SymbolAnimationController onDestroy error");
        }
    }

    // ===================== 核心方法：播放符号动画 (带缓存判断) =====================
    playAnimationSymbol(col: number, row: number, symbolId: number, aniName?: string, reelMachine?: any, isLoop?: boolean): cc.Node | null {
        if (this.symbolAnimationModule) {
            return this.symbolAnimationModule.playAnimationSymbol(col, row, symbolId, aniName, reelMachine, isLoop);
        }

        let aniNode: cc.Node | null = null;
        const key = `${col.toString()}_${row.toString()}`;
        if (this.info[key]) return aniNode;

        if (this.animationRoot) this.animationRoot.active = true;
        if (!this.animationLayer) {
            return this.playAnimationSymbol_onReels(col, row, symbolId, aniName, isLoop);
        }

        const targetReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        aniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        
        this.info[key] = { col, row, symbolId, aniNode };
        if (!aniNode) {
            cc.log(`SymbolPoolManager.instance.getSymbolAni( ${symbolId} ) return NULL`);
            return aniNode;
        }

        this.animationLayer.addChild(aniNode);
        aniNode.active = false;
        aniNode.active = true;

        // 获取符号世界坐标并转换为动画层本地坐标
        const globalPos = targetReelMachine.reels[col].getComponent(Reel)!.getGlobalPosition(row);
        aniNode.position = TSUtility.vec2ToVec3(this.animationLayer.convertToNodeSpace(globalPos));

        // 播放动画 - 优先SymbolAni组件 其次原生Animation组件
        const symbolAniCom = aniNode.getComponent(SymbolAni)!;
        if (symbolAniCom) {
            symbolAniCom.playAnimation(aniName, isLoop);
        } else {
            const aniCom = aniNode.getComponent(cc.Animation)!;
            if (aniCom) {
                aniCom.stop();
                if (isLoop !== undefined) {
                    const clip = aniCom.currentClip ?? aniCom.defaultClip;
                    if (clip) clip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                }
                aniCom.play();
            }
        }
        return aniNode;
    }

    // ===================== 核心方法：强制播放符号动画 (无缓存判断 必播) =====================
    mustPlayAnimationSymbol(col: number, row: number, symbolId: number, aniName?: string, reelMachine?: any, isLoop?: boolean): cc.Node | null {
        if (this.symbolAnimationModule) {
            return this.symbolAnimationModule.mustPlayAnimationSymbol(col, row, symbolId, aniName, reelMachine, isLoop);
        }

        let aniNode: cc.Node | null = null;
        if (this.animationRoot) this.animationRoot.active = true;
        if (!this.animationLayer) {
            return this.playAnimationSymbol_onReels(col, row, symbolId, aniName, isLoop);
        }

        const targetReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        aniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        
        if (!aniNode) {
            cc.log(`SymbolPoolManager.instance.getSymbolAni( ${symbolId} ) return NULL`);
            return aniNode;
        }

        this.animationLayer.addChild(aniNode);
        aniNode.active = false;
        aniNode.active = true;

        const globalPos = targetReelMachine.reels[col].getComponent(Reel)!.getGlobalPosition(row);
        aniNode.position = TSUtility.vec2ToVec3(this.animationLayer.convertToNodeSpace(globalPos));

        const symbolAniCom = aniNode.getComponent(SymbolAni)!;
        if (symbolAniCom) {
            symbolAniCom.playAnimation(aniName, isLoop);
        } else {
            const aniCom = aniNode.getComponent(cc.Animation)!;
            if (aniCom) {
                aniCom.stop();
                if (isLoop !== undefined) {
                    const clip = aniCom.currentClip ?? aniCom.defaultClip;
                    if (clip) clip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                }
                aniCom.play();
            }
        }
        return aniNode;
    }

    // ===================== 核心方法：绝对坐标播放符号动画 (带缓存判断) =====================
    playAnimationSymbolAbsoluteCoordinate(col: number, row: number, symbolId: number, aniName?: string): cc.Node | null {
        if (this.symbolAnimationModule) {
            return this.symbolAnimationModule.playAnimationSymbolAbsoluteCoordinate(col, row, symbolId, aniName);
        }

        let aniNode: cc.Node | null = null;
        const key = `${col.toString()}_${row.toString()}`;
        if (!this.info[key]) {
            if (this.animationRoot) this.animationRoot.active = true;
            if (!this.animationLayer) {
                return this.playAnimationSymbol_onReels(col, row, symbolId, aniName);
            }

            aniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
            this.info[key] = { col, row, symbolId, aniNode };

            if (!aniNode) {
                cc.log(`SymbolPoolManager.instance.getSymbolAni( ${symbolId} ) return NULL`);
                return aniNode;
            }

            this.animationLayer.addChild(aniNode);
            aniNode.active = false;
            aniNode.active = true;

            // 计算绝对坐标
            const pos = new cc.Vec2();
            const reelCom = SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)!;
            pos.x = SlotManager.Instance.reelMachine.reels[col].node.x;
            pos.y = reelCom.symbolHeight * (reelCom.visibleRow - 1) / 2 - reelCom.symbolHeight * row;
            aniNode.position = TSUtility.vec2ToVec3(pos);

            const symbolAniCom = aniNode.getComponent(SymbolAni)!;
            if (symbolAniCom) {
                symbolAniCom.playAnimation(aniName);
            } else {
                const aniCom = aniNode.getComponent(cc.Animation)!;
                if (aniCom) {
                    aniCom.stop();
                    aniCom.play();
                }
            }
        }
        return aniNode;
    }

    // ===================== 核心方法：绝对坐标强制播放符号动画 (无缓存判断) =====================
    mustPlayAnimationSymbolAbsoluteCoordinate(col: number, row: number, symbolId: number, aniName?: string): cc.Node | null {
        if (this.symbolAnimationModule) {
            return this.symbolAnimationModule.mustPlayAnimationSymbolAbsoluteCoordinate(col, row, symbolId, aniName);
        }

        let aniNode: cc.Node | null = null;
        if (this.animationRoot) this.animationRoot.active = true;
        if (!this.animationLayer) {
            return this.playAnimationSymbol_onReels(col, row, symbolId, aniName);
        }

        aniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        if (!aniNode) {
            cc.log(`SymbolPoolManager.instance.getSymbolAni( ${symbolId} ) return NULL`);
            return aniNode;
        }

        this.animationLayer.addChild(aniNode);
        aniNode.active = false;
        aniNode.active = true;

        const pos = new cc.Vec2();
        const reelCom = SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)!;
        pos.x = SlotManager.Instance.reelMachine.reels[col].node.x;
        pos.y = reelCom.symbolHeight * (reelCom.visibleRow - 1) / 2 - reelCom.symbolHeight * row;
        aniNode.position = TSUtility.vec2ToVec3(pos);

        const symbolAniCom = aniNode.getComponent(SymbolAni)!;
        if (symbolAniCom) {
            symbolAniCom.playAnimation(aniName);
        } else {
            const aniCom = aniNode.getComponent(cc.Animation)!;
            if (aniCom) {
                aniCom.stop();
                aniCom.play();
            }
        }
        return aniNode;
    }

    // ===================== 核心方法：获取停止所有动画的状态机 =====================
    getStopAllAnimationSymbolState(): State {
        if (this.symbolAnimationModule) {
            return this.symbolAnimationModule.getStopAllAnimationSymbolState();
        }

        const state = new State();
        state.addOnStartCallback(() => {
            SlotManager.Instance.node.stopAllActions();
            this.stopAllAnimationSymbol();
            state.setDone();
        });
        return state;
    }

    // ===================== 核心方法：停止所有符号动画 并回收至对象池 =====================
    stopAllAnimationSymbol(): void {
        if (this.symbolAnimationModule) {
            this.symbolAnimationModule.stopAllAnimationSymbol();
            return;
        }

        if (this.animationRoot) this.animationRoot.active = false;
        if (this.animationLayer) {
            // 深拷贝子节点列表 防止遍历中数组变化
            const children = this.animationLayer.children.slice(0);
            children.forEach(node => {
                SymbolPoolManager.instance.releaseSymbolAni(node);
            });
            this.info = {};
            SlotManager.Instance.showAllSymbol();
        } else {
            this.stopAllAnimationSymbol_onReels();
        }
    }

    // ===================== 核心方法：暂停所有符号动画 =====================
    pauseAllAnimationSymbol(): void {
        if (this.symbolAnimationModule) {
            this.symbolAnimationModule.pauseAllAnimationSymbol();
            return;
        }

        if (this.animationLayer) {
            this.animationLayer.children.forEach(node => {
                const symbolAniCom = node.getComponent(SymbolAni)!;
                symbolAniCom && symbolAniCom.stopAnimation();
            });
            this.info = {};
            SlotManager.Instance.showAllSymbol();
        } else {
            this.pauseAllAnimationSymbol_onReels();
        }
    }

    // ===================== 核心方法：停止所有动画 除指定符号ID列表外 =====================
    stopAllAnimationSymbolExceptList(symbolIds: number[]): void {
        if (this.symbolAnimationModule) {
            this.symbolAnimationModule.stopAllAnimationSymbolExceptList(symbolIds);
            return;
        }

        const keys = Object.keys(this.info);
        keys.forEach(key => {
            const data = this.info[key];
            if (symbolIds.indexOf(data.symbolId) === -1) {
                SymbolPoolManager.instance.releaseSymbolAni(data.aniNode);
                delete this.info[key];
                SlotManager.Instance.reelMachine.reels[data.col].getComponent(Reel)!.showSymbolInRow(data.row);
            }
        });
    }

    // ===================== 核心方法：释放指定行列的符号动画 =====================
    releaseAnimationSymbol_byKey(col: number, row: number): void {
        const key = `${col.toString()}_${row.toString()}`;
        if (TSUtility.isValid(this.info[key])) {
            const data = this.info[key];
            if (data && data.aniNode) {
                this.animationLayer.removeChild(data.aniNode);
                SymbolPoolManager.instance.releaseSymbolAni(data.aniNode);
                delete this.info[key];
            }
        }
    }

    // ===================== 核心方法：获取指定行列的符号动画节点 =====================
    getAnimaionByKey(col: number, row: number): cc.Node | null {
        const key = `${col.toString()}_${row.toString()}`;
        return TSUtility.isValid(this.info[key]) ? this.info[key].aniNode : null;
    }

    // ===================== 层级排序：新版符号Z轴排序 =====================
    resetZorderSymbolAnimationNew(): void {
        if (!this.animationLayer) return;
        
        if (!this.symbolsReverseOrder) {
            this.animationLayer.children.sort((a, b) => {
                const aAni = a.getComponent(SymbolAni)!;
                const bAni = b.getComponent(SymbolAni)!;
                if (aAni.zOrder > bAni.zOrder) return 1;
                if (aAni.zOrder < bAni.zOrder) return -1;
                return Math.floor(a.position.x) > Math.floor(b.position.x) || Math.floor(a.position.y) < Math.floor(b.position.y) ? 1 : -1;
            });
        } else {
            this.animationLayer.children.sort((a, b) => {
                const aAni = a.getComponent(SymbolAni)!;
                const bAni = b.getComponent(SymbolAni)!;
                if (aAni.zOrder > bAni.zOrder) return -1;
                if (aAni.zOrder < bAni.zOrder) return 1;
                return Math.floor(a.position.x) > Math.floor(b.position.x) || Math.floor(a.position.y) < Math.floor(b.position.y) ? -1 : 1;
            });
        }
    }

    // ===================== 层级排序：旧版符号Z轴排序 (核心排序逻辑) =====================
    resetZorderSymbolAnimation(): void {
        if (this.symbolAnimationModule) {
            this.symbolAnimationModule.resetZorderSymbolAnimation();
            return;
        }

        const targetNodes: cc.Node[] = [];
        if (!this.animationLayer) {
            this.animationReels.forEach(node => targetNodes.push(node));
        } else {
            targetNodes.push(this.animationLayer);
        }

        targetNodes.forEach(node => {
            const sortList: SymbolAni[] = [];
            node.children.forEach(child => {
                const aniCom = child.getComponent(SymbolAni)!;
                if (!aniCom) return;

                let isInsert = false;
                for (let i = 0; i < sortList.length; i++) {
                    const tempAni = sortList[i];
                    if (tempAni.zOrder > aniCom.zOrder) {
                        sortList.splice(i, 0, aniCom);
                        isInsert = true;
                        break;
                    }
                    if (tempAni.zOrder === aniCom.zOrder) {
                        if (!this.symbolsReverseOrder && tempAni.node.y <= aniCom.node.y) {
                            sortList.splice(i, 0, aniCom);
                            isInsert = true;
                            break;
                        }
                        if (this.symbolsReverseOrder && tempAni.node.y > aniCom.node.y) {
                            sortList.splice(i, 0, aniCom);
                            isInsert = true;
                            break;
                        }
                    }
                }
                if (!isInsert) sortList.push(aniCom);
            });

            sortList.forEach((aniCom, idx) => {
                aniCom && aniCom.node.setSiblingIndex(idx);
            });
        });
    }

    // ===================== 层级排序：按ZOrder快速排序 =====================
    resetZorderSymbolAnimationByZorder(): void {
        if (this.symbolAnimationModule) {
            this.symbolAnimationModule.resetZorderSymbolAnimation();
            return;
        }

        const targetNodes: cc.Node[] = [];
        if (!this.animationLayer) {
            this.animationReels.forEach(node => targetNodes.push(node));
        } else {
            targetNodes.push(this.animationLayer);
        }

        this.animationLayer.children.sort((a, b) => {
            const aAni = a.getComponent(SymbolAni)!;
            const bAni = b.getComponent(SymbolAni)!;
            if (aAni.zOrder > bAni.zOrder) return 1;
            if (aAni.zOrder < bAni.zOrder) return -1;
            return Math.floor(a.position.x) > Math.floor(b.position.x) || Math.floor(a.position.y) < Math.floor(b.position.y) ? 1 : -1;
        });
    }

    // ===================== 私有方法：在卷轴节点上播放符号动画 =====================
    private playAnimationSymbol_onReels(col: number, row: number, symbolId: number, aniName?: string, isLoop?: boolean): cc.Node | null {
        let aniNode: cc.Node | null = null;
        const key = `${col.toString()}_${row.toString()}`;
        if (this.info[key]) return aniNode;

        aniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        this.info[key] = { col, row, symbolId, aniNode };

        if (!aniNode) {
            cc.log(`SymbolPoolManager.instance.getSymbolAni( ${symbolId} ) return NULL`);
            return aniNode;
        }

        this.animationReels[col].addChild(aniNode);
        aniNode.active = false;
        aniNode.active = true;

        // 坐标转换 + 特效组件绑定
        const globalPos = SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)!.getGlobalPosition(row);
        aniNode.position = TSUtility.vec2ToVec3(this.animationReels[col].convertToNodeSpaceAR(globalPos));
        
        this.animationReels[col].getComponent("WaveEffect") && this.animationReels[col].getComponent("WaveEffect")._use();
        this.animationReels[col].getComponent("ReelCurvedEffect") && this.animationReels[col].getComponent("ReelCurvedEffect").setProgram(aniNode);

        // 播放动画
        const symbolAniCom = aniNode.getComponent(SymbolAni)!;
        if (symbolAniCom) {
            symbolAniCom.playAnimation(aniName, isLoop);
        } else {
            const aniCom = aniNode.getComponent(cc.Animation)!;
            if (aniCom) {
                aniCom.stop();
                const clip = aniCom.currentClip ?? aniCom.defaultClip;
                if (isLoop !== undefined && clip) {
                    clip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                }
                aniName ? aniCom.play(aniName) : aniCom.play();
            } else {
                cc.log(`not found animation...  col:${col}  row:${row}  symbolId:${symbolId}`);
            }
        }
        return aniNode;
    }

    // ===================== 私有方法：停止所有卷轴上的符号动画 =====================
    private stopAllAnimationSymbol_onReels(): void {
        this.animationReels.forEach(reelNode => {
            const children = reelNode.children.slice(0);
            children.forEach(node => {
                SymbolPoolManager.instance.releaseSymbolAni(node);
            });
        });
        this.info = {};
        SlotManager.Instance.reelMachine.reels.forEach((reel:any) => {
            reel.getComponent(Reel)!.showAllSymbol();
        });
    }

    // ===================== 私有方法：暂停所有卷轴上的符号动画 =====================
    private pauseAllAnimationSymbol_onReels(): void {
        this.animationReels.forEach(reelNode => {
            reelNode.children.forEach(node => {
                const symbolAniCom = node.getComponent(SymbolAni)!;
                symbolAniCom && symbolAniCom.stopAnimation();
            });
        });
    }
}