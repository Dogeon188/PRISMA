import { Enum, Node, _decorator } from "cc"
import { Settings } from "../../Scene/Settings"
import { SceneManager } from "../../SceneManager"
import { GameManager } from "../GameManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

export const PortalType = Enum({
    /** Change to another scene */
    SCENE: 0,
    /** Move to a specific node's position */
    NODE: -1,
})

@ccclass("Portal")
export class Portal extends Entity {
    @property({ type: PortalType, visible: true })
    private _portalType: number = PortalType.NODE

    get portalType(): number {
        return this._portalType
    }

    set portalType(value: number) {
        this._portalType = value
    }

    @property({
        visible: function (this: Portal) {
            return this.portalType === PortalType.SCENE
        },
    })
    private _toScene: string = ""

    get toScene(): string {
        return this._toScene
    }

    set toScene(value: string) {
        this._toScene = value
    }

    @property({
        type: Node,
        visible: function (this: Portal) {
            return this.portalType === PortalType.NODE
        },
    })
    private _toNode: Node = null

    get toNode(): Node {
        return this._toNode
    }

    set toNode(value: Node) {
        this._toNode = value
    }

    public onBeginInteract(player: Player): void {
        if (this.portalType === PortalType.SCENE) {
            SceneManager.loadScene(this._toScene)
        } else if (this.portalType === PortalType.NODE) {
            player.node.position = this.toNode.position
        }
    }

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            "Enter",
        )
    }
}
