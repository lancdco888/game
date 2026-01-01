const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 (路径与原JS完全一致，无需修改)
import DelayProgress from "../DelayProgress";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import MultiNodeActivator from "../Slot/MultiNodeActivator";
import UserInfo from "../User/UserInfo";
import HeroManager from "../manager/HeroManager";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import HeroSpineController, { HeroSpineState, HeroSpineLoopState } from "../Slot/HeroSpineController";

// ✅ 原JS枚举 1:1 标准还原
export enum HeroInfoUIType {
    Spine = "Spine",
    Small = "Small",
    Middle = "Middle"
}

export enum HeroDirectionType {
    Normal = "Normal",
    Reverse = "Reverse"
}

@ccclass('HeroInfoUI')
export default class HeroInfoUI extends cc.Component {
    // ===================== 编辑器序列化属性 (与原JS完全一致，强类型补全，顺序不变) =====================
    @property(cc.Label)
    public nameLabel: cc.Label  = null;

    @property(cc.Label)
    public nameLockedActiveLabel: cc.Label  = null;

    @property([cc.Node])
    public listNodesCenturionClique: cc.Node[] = [];

    @property([cc.Node])
    public levelNodes: cc.Node[] = [];

    @property(cc.Node)
    public levelNodeCenturionClique: cc.Node  = null;

    @property(cc.ProgressBar)
    public expProgress: cc.ProgressBar  = null;

    @property(cc.Label)
    public curExpLabel: cc.Label  = null;

    @property(cc.Label)
    public totExpLabel: cc.Label  = null;

    @property(cc.Label)
    public decoExpLabel: cc.Label  = null;

    @property(cc.Label)
    public bonusBenefitLabel: cc.Label  = null;

    @property(cc.Label)
    public bonusDesc1: cc.Label  = null;

    @property(cc.Label)
    public bonusDesc1NewLine: cc.Label  = null;

    @property([cc.Node])
    public activeNodes: cc.Node[] = [];

    @property(MultiNodeActivator)
    public powerEffect: MultiNodeActivator  = null;

    @property(cc.Node)
    public newTag: cc.Node  = null;

    @property(cc.Button)
    public btn: cc.Button  = null;

    @property(cc.Node)
    public heroConPivot: cc.Node  = null;

    @property(cc.Node)
    public loadingIcon: cc.Node  = null;

    // ===================== 私有成员属性 (补全强类型注解，初始值与原JS完全一致) =====================
    private heroController: HeroSpineController | any = null;
    private heroId: string = "";
    private spineLoopState: HeroSpineLoopState = HeroSpineLoopState.LOOP;
    private _loadingDelayProgress: DelayProgress | any = null;
    private _isDimmedIdle: boolean = false;
    private _loadCnt: number = 0;
    private _curExp: number = 0;
    private _startTime: number = 0;
    private _startExp: number = 0;
	private _targetExp: number = 0;
	private _duration: number = 0.6;
    private reservedControllerState: HeroSpineState = HeroSpineState.UNKNOWN;
	private reservedControllerRank: number = 1;

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        this.setPowerEffect(0);
        this.showLoadingIcon(false);
        if (TSUtility.isValid(this.nameLockedActiveLabel)) {
            this.nameLockedActiveLabel.string = "";
        }
    }

    // ===================== 核心方法 - 加载动画相关 =====================
    public showLoadingIcon(isShow: boolean): void {
        if (!this.loadingIcon) return;
        this.loadingIcon.active = isShow;

        if (isShow) {
            const progressNode = PopupManager.Instance().makeDelayProgressNode();
            this.loadingIcon.addChild(progressNode);
            progressNode.setPosition(cc.v3(0, 0, 0)); // ✅ Vec2(0,0) → Vec3(0,0,0)
            progressNode.active = true;
            
            this._loadingDelayProgress = progressNode.getComponent(DelayProgress);
            this._loadingDelayProgress?.setContentSize(cc.size(0, 0));
            this._loadingDelayProgress?.showDisplayProgress(true, false);
            this.loadingIcon.opacity = 1;

            this.scheduleOnce(() => {
                this.loadingIcon?.runAction((cc.fadeTo(.15, 255)));
            }, 0.2);
        } else {
            this._loadingDelayProgress?.destroy();
            this._loadingDelayProgress = null;
        }
    }

    // ===================== 核心方法 - Spine骨骼控制器挂载/重置 =====================
    public setSpineController(controller: HeroSpineController): void {
        if (!this.heroConPivot) return;
        this.heroConPivot.removeAllChildren();
        TSUtility.moveToNewParent(controller.node, this.heroConPivot);
        controller.node.active = true;
        controller.node.setPosition(cc.Vec3.ZERO); // ✅ Vec2.ZERO → Vec3.ZERO 核心替换
        this.heroController = controller;
        this.setDimmedIdle(this._isDimmedIdle);
    }

    public resetSpineController(): void {
        this.heroConPivot?.removeAllChildren();
        this.heroController = null;
    }

    // ===================== 静态方法 - 预加载骨骼资源 =====================
    public static preLoadSpineController(heroId: string, type: string): void {
        const resPath = `Hero/%s_%s`.format(heroId, type);
        cc.loader.loadRes(resPath, () => {});
    }

    // ===================== 核心方法 - 加载骨骼控制器 (异步加载+回调+状态还原) =====================
    public loadSpineController(type: string, callback?: Function, isChangeColor: boolean = false): void {
        if (this.heroId === "") {
            cc.error("not initialized");
            return;
        }

        if (this.heroController && this.heroController.heroId === this.heroId) {
            callback && callback();
            this.setDimmedIdle(this._isDimmedIdle);
            return;
        }

        this.showLoadingIcon(true);
        this.resetSpineController();

        const curHeroId = this.heroId;
        const resPath = `Hero/%s_%s`.format(this.heroId, type);
        const curLoadCnt = ++this._loadCnt;
        const changeColor = isChangeColor;

        cc.loader.loadRes(resPath, (err, prefab) => {
            if (!TSUtility.isValid(this) || curLoadCnt !== this._loadCnt) return;
            
            this.showLoadingIcon(false);
            if (err) {
                const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg));
                return;
            }

            const spineNode = cc.instantiate(prefab);
            const spineController = spineNode.getComponent(HeroSpineController);
            if (!spineController) return;

            spineController.heroId = curHeroId;
            this.setSpineController(spineController);

            // 还原预留的骨骼状态
            switch (this.reservedControllerState) {
                case HeroSpineState.IDLE:
                    spineController.setIdle(this.reservedControllerRank);
                    break;
                case HeroSpineState.PLEASURE:
                    spineController.setPleasure(this.reservedControllerRank);
                    break;
                case HeroSpineState.THANKS:
                    spineController.setThanks(this.reservedControllerRank);
                    break;
                case HeroSpineState.SILHOUETTE:
                    spineController.setSilhoutte(changeColor);
                    break;
                case HeroSpineState.WHITE_SILHOUETTE:
                    spineController.setWhiteSilhouette(this.reservedControllerRank);
                    break;
            }

            // 设置骨骼循环状态
            switch (this.spineLoopState) {
                case HeroSpineLoopState.STOP:
                    spineController.stopAllSpineAni();
                    break;
                case HeroSpineLoopState.LOOP:
                    spineController.setAllSpineLoop(true);
                    break;
            }

            callback && callback();
            spineController.updateOpacity();
            this.reservedControllerState = HeroSpineState.IDLE;
            this.reservedControllerRank = 1;
        });
    }

    // ===================== 核心方法 - 英雄信息赋值/UI刷新 =====================
    public setInfo(heroId: string, level: number): void {
        this.heroId = heroId;
        let heroConfig = null;
        if (heroId !== "manager_july") {
            heroConfig = HeroManager.Instance().getHeroConfig(heroId);
        }

        if (heroConfig) {
            if (HeroManager.Instance().isCenturionCliqueHero(heroId)) {
                this.setHeroPowerLevelCenturionClique();
                this.setShowNodesCenturionClique(true);
            } else {
                this.setHeroPowerLevel(level);
                this.setShowNodesCenturionClique(false);
            }
            this.nameLabel && (this.nameLabel.string = heroConfig.getDisplayName());
        } else {
            this.setHeroPowerLevel(0);
        }
    }

    public setShowLockedActiveHeroName(isShow: boolean): void {
        if (isShow && TSUtility.isValid(this.nameLabel) && this.nameLabel.node.active) {
            this.nameLockedActiveLabel && (this.nameLockedActiveLabel.node.active = false);
        } else {
            this.nameLockedActiveLabel && (this.nameLockedActiveLabel.node.active = isShow);
        }
    }

    public setLockedActiveHeroName(heroId: string): void {
        this.heroId = heroId;
        let heroConfig = null;
        if (heroId !== "manager_july") {
            heroConfig = HeroManager.Instance().getHeroConfig(heroId);
        }

        if (heroConfig) {
            this.nameLockedActiveLabel && (this.nameLockedActiveLabel.string = heroConfig.getDisplayName());
        } else {
            this.nameLockedActiveLabel && (this.nameLockedActiveLabel.string = "");
        }
    }

    // ===================== 等级/阵营节点显示控制 =====================
    public setHeroPowerLevel(level: number): void {
        const showIdx = level - 1;
        this.levelNodes.forEach((node, idx) => {
            node.active = idx === showIdx;
        });
        this.levelNodeCenturionClique && (this.levelNodeCenturionClique.active = false);
    }

    public setHeroPowerLevelCenturionClique(): void {
        this.levelNodeCenturionClique && (this.levelNodeCenturionClique.active = true);
        this.levelNodes.forEach(node => node.active = false);
    }

    public setShowNodesCenturionClique(isShow: boolean): void {
        this.listNodesCenturionClique.forEach(node => {
            TSUtility.isValid(node) && (node.active = isShow);
        });
    }

    // ===================== 通用节点显隐控制 =====================
    public setActive(isShow: boolean): void {
        this.activeNodes.forEach(node => {
            node && (node.active = isShow);
        });
    }

    public setPowerEffect(index: number): void {
        this.powerEffect && this.powerEffect.playEffect(index);
    }

    // ===================== 经验进度条赋值 (含满级判断) =====================
    public setExpProgress(exp: number, isAdd: boolean = false): void {
        // const heroUserInfo = UserInfo.instance().getUserHeroInfo().getHeroInfo(this.heroId);
        // if (TSUtility.isValid(heroUserInfo) && heroUserInfo.isCenturionCliqueHero()) {
        //     this.expProgress && (this.expProgress.progress = 1);
        //     this.curExpLabel && (this.curExpLabel.node.active = true, this.curExpLabel.string = "MAX");
        //     this.decoExpLabel && (this.decoExpLabel.node.active = false);
        //     this.totExpLabel && (this.totExpLabel.node.active = false);
        //     return;
        // }

        const minExp = HeroManager.Instance().getHeroLevelMinExp(this.heroId, exp);
        const nextExp = HeroManager.Instance().getHeroLevelNextExp(this.heroId, exp);
        const expPercent = HeroManager.Instance().getHeroExpPercent(this.heroId, exp);
        
        this._curExp = exp;
        this.expProgress && (this.expProgress.progress = expPercent);

        let showExp = Math.floor(exp);
        if (isAdd) showExp = Math.floor(exp + 0.2);

        if (minExp === nextExp) {
            this.curExpLabel && (this.curExpLabel.node.active = true, this.curExpLabel.string = "MAX");
            this.decoExpLabel && (this.decoExpLabel.node.active = false);
            this.totExpLabel && (this.totExpLabel.node.active = false);
        } else {
            this.curExpLabel && (this.curExpLabel.node.active = true, this.curExpLabel.string = (showExp - minExp).toString());
            this.decoExpLabel && (this.decoExpLabel.node.active = true);
            this.totExpLabel && (this.totExpLabel.node.active = true, this.totExpLabel.string = (nextExp - minExp).toString());
        }
    }

    // ===================== 经验增长动画 (插值缓动) =====================
    public addPowerExp(addExp: number): void {
        this.unschedule(this.updatePowerExpGague);
        this._startTime = Date.now();
        this._startExp = this._curExp;
        this._targetExp = this._startExp + addExp;
        this.schedule(this.updatePowerExpGague, 0);
    }

    private updatePowerExpGague(): void {
        const elapsed = (Date.now() - this._startTime) / (this._duration * 1000);
        const lerpRate = Math.min(1, elapsed);
        const curExp = cc.misc.lerp(this._startExp, this._targetExp, lerpRate);
        const curLevel = HeroManager.Instance().getHeroLevelByExp(this.heroId, curExp);

        this.setHeroPowerLevel(curLevel);
        this.setExpProgress(curExp, true);

        if (lerpRate >= 1) {
            this.unschedule(this.updatePowerExpGague);
        }
    }

    // ===================== 小红点/缩放/隐藏信息 =====================
    public setNewTag(isShow: boolean): void {
        this.newTag && (this.newTag.active = isShow);
    }

    public setScale(scale: number): void {
        this.heroController && this.heroController.node.setScale(scale);
    }

    public hideInfo(): void {
        this.nameLabel && (this.nameLabel.node.active = false);
        this.levelNodes.forEach(node => node.active = false);
        this.levelNodeCenturionClique && (this.levelNodeCenturionClique.active = false);
    }

    // ===================== 骨骼控制器状态代理调用 (核心联动HeroSpineController) =====================
    public controller_SetControllerState(state: HeroSpineState, rank: number): void {
        switch (state) {
            case HeroSpineState.IDLE:
                this.controller_SetIdle(rank);
                break;
            case HeroSpineState.PLEASURE:
                this.controller_SetPleasure(rank);
                break;
            case HeroSpineState.THANKS:
                this.controller_SetThanks(rank);
                break;
            case HeroSpineState.SILHOUETTE:
                this.controller_SetSilhoutte();
                break;
            case HeroSpineState.WHITE_SILHOUETTE:
                this.controller_SetWhiteSilhouette(rank);
                break;
        }
    }

    public controller_SetIdle(rank: number): void {
        if (!this.heroController) {
            this.reservedControllerState = HeroSpineState.IDLE;
            this.reservedControllerRank = rank;
            return;
        }
        this.heroController.setIdle(rank);
    }

    public controller_SetPleasure(rank: number): void {
        if (!this.heroController) {
            this.reservedControllerState = HeroSpineState.PLEASURE;
            this.reservedControllerRank = rank;
            return;
        }
        this.heroController.setPleasure(rank);
    }

    public controller_SetThanks(rank: number): void {
        if (!this.heroController) {
            this.reservedControllerState = HeroSpineState.THANKS;
            this.reservedControllerRank = rank;
            return;
        }
        this.heroController.setThanks(rank);
    }

    public controller_SetSilhoutte(): void {
        if (this.heroController) {
            this.heroController.setSilhoutte();
        } else {
            this.reservedControllerState = HeroSpineState.SILHOUETTE;
        }
    }

    public controller_SetWhiteSilhouette(rank: number): void {
        if (!this.heroController) {
            this.reservedControllerState = HeroSpineState.WHITE_SILHOUETTE;
            this.reservedControllerRank = rank;
            return;
        }
        this.heroController.setWhiteSilhouette(rank);
    }

    public controller_IsSilhoutteState(): boolean {
        if (!this.heroController) {
            return this.reservedControllerState === HeroSpineState.SILHOUETTE;
        }
        return this.heroController.isSilhoutteState();
    }

    public controller_StopAllSpineAni(): void {
        if (this.heroController) {
            this.heroController.stopAllSpineAni();
        } else {
            this.spineLoopState = HeroSpineLoopState.STOP;
        }
    }

    public controller_SetAllSpineLoop(isLoop: boolean): void {
        if (this.heroController) {
            this.heroController.setAllSpineLoop(isLoop);
        } else {
            this.spineLoopState = HeroSpineLoopState.LOOP;
        }
    }

    // ===================== 待机状态灰度显示 =====================
    public setDimmedIdle(isDimmed: boolean = this._isDimmedIdle): void {
        this._isDimmedIdle = isDimmed;
        if (!TSUtility.isValid(this.heroController) || !this.heroController.idleActivator) return;
        
        const idleChildren = this.heroController.idleActivator.node.children;
        const dimColor = new cc.Color(120, 120, 120, 255);
        const normalColor = new cc.Color(255, 255, 255, 255);
        const targetColor = isDimmed ? dimColor : normalColor;

        idleChildren.forEach(node => {
            node.color = targetColor;
        });
    }

    // ===================== 英雄朝向控制 (左右翻转) =====================
    public setHeroDirection(direction: HeroDirectionType): void {
        if (!this.heroConPivot) return;
        this.heroConPivot.scaleX = direction === HeroDirectionType.Normal ? 1 : -1;
    }
}