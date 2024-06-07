import {
    Color,
    Node,
    Prefab,
    Size,
    Sprite,
    UIOpacity,
    UITransform,
    _decorator,
    director,
    instantiate,
    log,
    math,
    resources,
    size,
    tween,
    v2,
} from "cc"
import { EDITOR_NOT_IN_PREVIEW } from "cc/env"
const { ccclass, property } = _decorator

/**
 * A black mask manager that controls the transition effect of the game \
 * It is a singleton, and you should only use {@linkcode BlackMaskManager.inst} to access it. \
 * Don't create it manually.
 * To make the mask visible, use {@linkcode BlackMaskManager.fadeIn} \
 * To make the mask invisible, use {@linkcode BlackMaskManager.fadeOut} \
 */
@ccclass("BlackMaskManager")
export class BlackMaskManager {
    private static _inst: BlackMaskManager = null
    private currentCamera: Node = null
    private maskContainer: Node = null
    private maskPrefab: Prefab = null
    private mask: Node = null
    private maskSprite: Sprite = null
    private maskUITransform: UITransform = null
    private maskUIOpacity: UIOpacity = null

    static get inst(): BlackMaskManager {
        if (this._inst == null) {
            this._inst = new BlackMaskManager()
        }
        return this._inst
    }

    constructor() {
        if (BlackMaskManager._inst != null) {
            throw new Error(
                "BlackMaskManager is a singleton, don't create it twice.",
            )
        }
        this.maskContainer = new Node("__BlackMaskManager__")
        //load the black mask prefab
        resources.load("Prefabs/Interface/BlackMask", Prefab, (err, prefab) => {
            if (err) {
                console.error("Failed to load black mask prefab", err)
                return
            }
            this.maskPrefab = prefab
        })
        director.addPersistRootNode(this.maskContainer)
    }
    /**
     * Initialize the mask node and add it to the current scene
     *
     */
    private _initMask(fadeOut: boolean = false): void {
        this.currentCamera = director.getScene().getChildByPath("Canvas/Camera")
        // set a high sibling index to make sure the mask is on top of everything
        this.currentCamera.setSiblingIndex(20)
        this.mask = null
        this.mask = instantiate(this.maskPrefab)
        this.maskSprite = this.mask.getComponent(Sprite)
        this.maskUITransform = this.mask.getComponent(UITransform)
        this.maskUIOpacity = this.mask.getComponent(UIOpacity)

        this.mask.parent = this.currentCamera

        let cameraUITransform = this.currentCamera.getComponent(UITransform)
        //if the camera doesn't have a UITransform component, add one
        if (cameraUITransform === null) {
            cameraUITransform = this.currentCamera.addComponent(UITransform)
            const size = new Size(1280, 720)
            cameraUITransform.setContentSize(size)
        }

        const size = cameraUITransform.contentSize
        this.mask.setPosition(0, 0, 0)
        this.maskUITransform.setContentSize(size)
        this.maskSprite.color = Color.BLACK
        this.maskUIOpacity.opacity = fadeOut ? 255 : 0
    }

    private _fadeIn(duration: number, callback: Function = () => { }, isChangeScene: boolean = true): void {
        // log("fade in")
        this._initMask()
        tween(this.maskUIOpacity)
            .to(duration, { opacity: 255 }, { easing: "sineInOut" })
            .call(() => {
                // log("fade in complete")
                // log(`opacity: ${this.maskUIOpacity.opacity}`)
                if (!isChangeScene) {
                    // log("fade in complete, remove mask")
                    this.mask.destroy()
                    }  
            })
            .call(callback)
            .start()
    }

    private _fadeOut(duration: number, callback: Function = () => { }, isChangeScene: boolean = true): void {
        // log("fade out")
        this._initMask(true)
        tween(this.maskUIOpacity)
            .to(duration, { opacity: 0 }, { easing: "cubicOut" })
            .call(() => {
                // log("fade out complete")
                // log(`opacity: ${this.maskUIOpacity.opacity}`)
                if (!isChangeScene) {
                    // log("fade out complete, remove mask")
                    this.mask.destroy()
                    }   
                })
            .call(callback)
            .start()    
    }
    /**
     * Increase the opacity of the mask to 255 \
     * Make the mask visible
     * @param duration
     * @param callback callback function after the mask is fully visible
     */
    static fadeIn(duration: number = 1, callback: Function = () => { }, isChangeScene: boolean = true): void {
        BlackMaskManager.inst._fadeIn(duration, callback, isChangeScene)
    }
    /**
     * Decrease the opacity of the mask to 0 \
     * Make the mask invisible
     * @param duration
     * @param callback callback function after the mask is fully invisible
     */
    static fadeOut(duration: number = 1, callback: Function = () => { }, isChangeScene: boolean = true): void {
        BlackMaskManager.inst._fadeOut(duration, callback, isChangeScene)
    }
}

// initialize the singleton
let initialized = false
if (!EDITOR_NOT_IN_PREVIEW && !initialized) {
    BlackMaskManager.inst
    initialized = true
}
