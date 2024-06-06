import { _decorator, AudioClip, Camera, Component, Node, tween } from "cc"
import { AudioManager } from "../AudioManager"
import { Dialog } from "../Game/Entities/Dialog"
import { GameManager } from "../Game/GameManager"
import { ColliderGroup } from "../Game/Physics/ColliderManager"
import { TrackCamera } from "../Game/TrackCamera"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("LevelEnd")
export class LevelEnd extends Component {
    @property(Node)
    private objectsNode: Node = null

    @property(Node)
    private coreNode: Node = null

    @property(TrackCamera)
    private camera: TrackCamera = null

    @property(AudioClip)
    private endBGM: AudioClip = null

    @property([Node])
    private hideNodes: Node[] = []

    private lampColors: Map<string, number> = new Map()
    private dummyDialog: Dialog = null

    protected start(): void {
        this.objectsNode.children
            .filter((child) => {
                return child.name === "Lamp"
            })
            .forEach((lamp) => {
                lamp.on("changeColor", this.onLampChangeColor, this)
            })
        this.dummyDialog = this.objectsNode
            .getChildByName("EndDialog")
            .getComponent(Dialog)
    }

    private onLampChangeColor(uuid: string, color: number): void {
        this.lampColors.set(uuid, color)
        const colors = new Set(this.lampColors.values())
        // if (
        //     colors.has(ColliderGroup.RED) &&
        //     colors.has(ColliderGroup.GREEN) &&
        //     colors.has(ColliderGroup.BLUE)
        // ) {
        if (
            colors.has(ColliderGroup.RED) ||
            colors.has(ColliderGroup.GREEN) ||
            colors.has(ColliderGroup.BLUE)
        ) {
            this.startEndSequence()
        }
    }

    private startEndSequence(): void {
        tween(this.node)
            .call(() => {
                // initialize
                GameManager.inst.canAct = false
                AudioManager.inst.fadeOutBGM(2)
                this.camera.damping = 0.98
                tween(this.camera.getComponent(Camera))
                    .to(2, { orthoHeight: 480 }, { easing: "sineOut" })
                    .start()
                this.camera.focusOn(this.coreNode, false)
                for (const node of this.hideNodes) {
                    node.active = false
                }
            })
            .delay(4)
            .call(() => AudioManager.inst.fadeInBGM(this.endBGM, 20))
            .delay(2)
            .call(() =>
                GameManager.inst.dialogBox.playDialog(
                    this.dummyDialog.entries,
                ),
            )
            .call(() => {
                // finish
                GameManager.inst.canAct = true
                // SceneManager.loadScene("Splash")
            })
            .start()
    }
}
