import {
    Node,
    Prefab,
    _decorator,
    director,
    instantiate,
    log,
    resources,
} from "cc"
import { EDITOR_NOT_IN_PREVIEW } from "cc/env"
import { Toast } from "./Toast"
const { ccclass, property } = _decorator

/**
 * A simple toast manager that shows toast with custom message \
 * It is a singleton, and you should only use {@linkcode ToastManager.inst} to access it. \
 *
 * Don't create it manually.
 */
@ccclass("ToastManager")
export class ToastManager {
    private static _inst: ToastManager = null
    private toastPool: Node[] = []
    private toastContainer: Node = null
    private toastPrefab: Prefab = null

    static get inst(): ToastManager {
        if (this._inst == null) {
            this._inst = new ToastManager()
        }
        return this._inst
    }

    constructor() {
        if (ToastManager._inst != null) {
            throw new Error(
                "ToastManager is a singleton, don't create it twice.",
            )
        }
        this.toastContainer = new Node("__ToastManager__")
        // Load the toast prefab
        resources.load("Prefabs/Interface/Toast", Prefab, (err, prefab) => {
            if (err) {
                console.error("Failed to load toast prefab", err)
                return
            }
            this.toastPrefab = prefab
            // Create a toast pool
            for (let i = 0; i < 20; i++) {
                const toast = instantiate(this.toastPrefab)
                toast.parent = this.toastContainer
                this.toastPool.push(toast)
            }
        })
        director.addPersistRootNode(this.toastContainer)
    }

    private _show(message: string, duration: number = Toast.LENGTH_SHORT): void {
        let toast = this.toastPool.pop()
        if (toast == null) {
            log("Toast pool is empty, instantiate a new toast")
            toast = instantiate(this.toastPrefab)
        }
        const canvas = director.getScene().getChildByName("Canvas")
        toast.parent = canvas
        toast.getComponent(Toast).setText(message)
        toast.getComponent(Toast).show(duration)
        this.toastPool.push(toast)
        director.getScene().removeChild(toast)
    }

    static show(message: string, duration: number = Toast.LENGTH_SHORT): void {
        this.inst._show(message, duration)
    }
}

// initialize the singleton
let initialized = false
if (!EDITOR_NOT_IN_PREVIEW && !initialized) {
    ToastManager.inst
    initialized = true
}
