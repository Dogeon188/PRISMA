import {Node, director, _decorator, Component, instantiate, Prefab, log } from "cc";
import {Toast} from "./Toast";
const { ccclass, property } = _decorator


/**
 * A simple toast manager that shows toast with custom message \
 * It is a singleton, and you should only use {@linkcode ToastManager.inst} to access it. \
 * 
 * Don't create it manually.
 */
@ccclass("ToastManager")
export class ToastManager extends Component{
    private static _inst: ToastManager = null;
    private toastPool: Node[] = [];
    private toastContainer: Node = null;

    @property (Prefab)
    toastPrefab: Prefab = null;

    static get inst(): ToastManager {
        if (this._inst == null) {
            this._inst = new ToastManager();
        }
        return this._inst;
    }


    onLoad() {
        if (ToastManager._inst != null) {
            throw new Error(
                "ToastManager is a singleton, don't create it twice.",
            );
        }
        // Create a toast pool
        for (let i = 0; i < 5; i++) {
            const toast = instantiate(this.toastPrefab);
            toast.parent = this.node;
            this.toastPool.push(toast);
        }
        director.addPersistRootNode(this.node);
        this.toastContainer = this.node;
    }
    show(message: string, duration: number = Toast.LENGTH_SHORT): void {
        let toast = this.toastPool.pop();
        if (toast == null) {
            log("Toast pool is empty, instantiate a new toast");
            toast = instantiate(this.toastPrefab);
        }
        const canvas = director.getScene().getChildByName("Canvas");
        toast.parent = canvas;
        toast.getComponent(Toast).setText(message);
        toast.getComponent(Toast).show(duration);
        this.toastPool.push(toast);
        // director.getScene().removeChild(toast);
    }


}