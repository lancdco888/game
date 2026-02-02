import CameraControl, { CameraPositionState } from "../../Slot/CameraControl";
import ReelShaderEffect from "../../UI/ReelShaderEffect";
import ViewResizeManager from "../../global_utility/ViewResizeManager";

const { ccclass, property } = cc._decorator;



/**
 * Reel curved effect component (extends shader effect base class)
 * Handles camera movement and screen resize to apply dynamic curved effect on reels
 */
@ccclass('ReelCurvedEffect')
export default class ReelCurvedEffect extends ReelShaderEffect {
    @property()
    curvedVertical: number = 0; // Vertical curve intensity

    @property()
    curvedHorizontal: number = 0; // Horizontal curve intensity

    @property()
    centerY: number = 0; // Curve center Y position

    @property()
    centerX: number = 0; // Curve center X position

    @property(cc.Material)
    mat: cc.Material = null; // Curved effect material for sprites

    @property(cc.Material)
    defaultMat: cc.Material = null; // Default material for sprites

    @property(cc.Material)
    spineMat: cc.Material = null; // Curved effect material for spine skeletons

    @property(cc.Material)
    defaultSpineMat: cc.Material = null; // Default material for spine skeletons

    private _cameraComp: CameraControl = null; // Camera control instance
    private _canvasSize: cc.Vec2 = null; // Current canvas size
    private defaultRatio: number = 1280 / 720; // Default design ratio (16:9)
    private currentRatio: number = 0; // Current screen ratio
    private _startCurvedHorizontal: number = 0; // Initial horizontal curve value
    private _startWorldPos: cc.Vec2 = cc.Vec2.ZERO; // Initial camera world position
    private _prevWorldPos: cc.Vec2 = cc.Vec2.ZERO; // Previous camera world position
    private _prevZoomRatio: number = 0; // Previous camera zoom ratio
    private _startCenterX: number = 0; // Initial center X value
    private _startCenterY: number = 0; // Initial center Y value
    private _backup_curvedHorizontal: number = 0; // Backup of initial horizontal curve
    private _backup_centerX: number = 0; // Backup of initial center X
    private _backup_centerY: number = 0; // Backup of initial center Y
    private _cameraControl: CameraControl = null; // Camera control reference
    private _reserveRefresh: boolean = false; // Flag to reserve refresh after scroll

    /**
     * Component load lifecycle
     * Backup initial properties and register camera handler
     */
    onLoad() {
        this._backup_curvedHorizontal = this.curvedHorizontal;
        this._backup_centerX = this.centerX;
        this._backup_centerY = this.centerY;
        
        if (CameraControl.Instance) {
            this._cameraControl = CameraControl.Instance;
            CameraControl.Instance.addHandler(this);
        }
    }

    /**
     * Component destroy lifecycle
     * Remove camera handler
     */
    onDestroy() {
        CameraControl.RemoveHandler(this);
    }

    /**
     * Component enable lifecycle
     * Refresh effect and register resize handler
     */
    onEnable() {
        this.onAfterResizeView();
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * Component disable lifecycle
     * Remove resize handler
     */
    onDisable() {
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * Refresh effect parameters and schedule update
     */
    refresh() {
        this._cameraComp = CameraControl.Instance;
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (!canvas) return;

        this._canvasSize = cc.v2(canvas.node.width, canvas.node.height);
        this.currentRatio = this._canvasSize.x / this._canvasSize.y;
        
        // Reset initial values
        this._startCurvedHorizontal = this._backup_curvedHorizontal;
        this._startWorldPos = this._cameraComp.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this._prevWorldPos = this._startWorldPos.clone();
        this._prevZoomRatio = this._cameraComp.node.scale;
        this._startCenterX = this._backup_centerX;
        this._startCenterY = this._backup_centerY;
        
        // Restore backup values
        this.curvedHorizontal = this._backup_curvedHorizontal;
        this.centerX = this._backup_centerX;
        this.centerY = this._backup_centerY;
        
        // Update schedule
        this.unschedule(this.updateSchdule);
        this.schedule(this.updateSchdule, 0.015); // ~60 FPS update
        
        this._use();
    }

    /**
     * Update effect parameters based on camera movement/zoom
     */
    updateSchdule() {
        if (!this._cameraComp) return;

        const currentWorldPos = this._cameraComp.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const currentZoomRatio = this._cameraComp.node.scale;

        // Check if camera position or zoom changed
        if (this._prevWorldPos.x !== currentWorldPos.x || 
            this._prevWorldPos.y !== currentWorldPos.y || 
            this._prevZoomRatio !== currentZoomRatio) {
            
            const zoomFactor = 1 - currentZoomRatio;
            const ratioFactor = (this.currentRatio - this.defaultRatio) / this.defaultRatio;
            
            // Update curve parameters
            this.curvedHorizontal = this._startCurvedHorizontal * (1 - ratioFactor / 2) * (1 + 2 * zoomFactor);
            this.centerY = (this._startCenterY * (1 + ratioFactor) - (currentWorldPos.y - this._startWorldPos.y) / this._canvasSize.y) * currentZoomRatio;
            this.centerX = (this._startCenterX - (currentWorldPos.x - this._startWorldPos.x) / this._canvasSize.x) * currentZoomRatio;
            
            // Save current state
            this._prevWorldPos = currentWorldPos.clone();
            this._prevZoomRatio = currentZoomRatio;
            
            this._use();
        }
    }

    /**
     * Apply effect materials to all children sprites and skeletons
     */
    private _use() {
        if (!this.mat) return;

        // Apply to sprites
        this.mat.setProperty("toggle", this.curvedVertical);
        this.mat.setProperty("toggleHorizontal", this.curvedHorizontal);
        this.mat.setProperty("center", this.centerY);
        this.mat.setProperty("centerX", this.centerX);
        
        const sprites = this.node.getComponentsInChildren(cc.Sprite);
        sprites.forEach(sprite => sprite.setMaterial(0, this.mat));

        // Apply to spine skeletons
        if (this.spineMat) {
            this.spineMat.setProperty("toggle", this.curvedVertical);
            this.spineMat.setProperty("toggleHorizontal", this.curvedHorizontal);
            this.spineMat.setProperty("center", this.centerY);
            this.spineMat.setProperty("centerX", this.centerX);
            
            const skeletons = this.node.getComponentsInChildren(sp.Skeleton);
            skeletons.forEach(skeleton => skeleton.setMaterial(0, this.spineMat));
        }
    }

    /**
     * Set effect materials to a specific node and its children
     * @param node Target node
     */
    setProgram(node: cc.Node) {
        const sprites = node.getComponentsInChildren(cc.Sprite);
        sprites.forEach(sprite => sprite.setMaterial(0, this.mat));
        
        const skeletons = node.getComponentsInChildren(sp.Skeleton);
        skeletons.forEach(skeleton => skeleton.setMaterial(0, this.spineMat));
    }

    /**
     * Reset to default materials for a specific node and its children
     * @param node Target node
     */
    resetProgram(node: cc.Node) {
        const sprites = node.getComponentsInChildren(cc.Sprite);
        sprites.forEach(sprite => sprite.setMaterial(0, this.defaultMat));
        
        const skeletons = node.getComponentsInChildren(sp.Skeleton);
        skeletons.forEach(skeleton => skeleton.setMaterial(0, this.defaultSpineMat));
    }

    /**
     * Before resize view handler (empty as per original)
     */
    onBeforeResizeView() {}

    /**
     * Resize view handler (empty as per original)
     */
    onResizeView() {}

    /**
     * After resize view handler
     * Refresh effect or reserve for later if camera is scrolling
     */
    onAfterResizeView() {
        if (!CameraControl.Instance) {
            this.refresh();
            return;
        }

        const camera = CameraControl.Instance;
        const isUpOrScrolling = camera.eStateOfCameraPosition === CameraPositionState.Up || camera.isScrolling();
        
        if (isUpOrScrolling) {
            this._reserveRefresh = true;
        } else {
            this.refresh();
        }
    }

    /**
     * Scroll down start handler (empty as per original)
     */
    onStartScrollDown() {}

    /**
     * Scroll up start handler (empty as per original)
     */
    onStartScrollUp() {}

    /**
     * Scroll up handler (empty as per original)
     */
    onScrollUp() {}

    /**
     * Scroll down handler
     * Refresh reserved effect
     */
    onScrollDown() {
        if (this._reserveRefresh) {
            this._reserveRefresh = false;
            this.refresh();
        }
    }
}