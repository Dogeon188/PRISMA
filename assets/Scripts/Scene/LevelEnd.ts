import {
    _decorator,
    AudioClip,
    Camera,
    Component,
    Node,
    ParticleSystem2D,
    tween,
    UIOpacity,
    UITransform,
    Vec3,
} from "cc"
import { AudioManager } from "../AudioManager"
import { Dialog } from "../Game/Entities/Dialog"
import { PlayerHalo } from "../Game/Entities/PlayerHalo"
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

    @property(UIOpacity)
    private coreColoredOpacity: UIOpacity = null

    @property(Node)
    private finalWords1: Node = null

    @property(Node)
    private finalWords2: Node = null

    @property(UIOpacity)
    private overlayOpacity: UIOpacity = null

    @property(TrackCamera)
    private camera: TrackCamera = null

    @property({ type: AudioClip, group: "Audio" })
    private endBGM: AudioClip = null

    @property({ type: AudioClip, group: "Audio" })
    private engineSound: AudioClip = null

    @property([Node])
    private hideNodes: Node[] = []

    private coreParticles: ParticleSystem2D = null
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
        this.coreParticles = this.coreNode.getComponent(ParticleSystem2D)
        this.overlayOpacity.node.setSiblingIndex(2)
        const colorDict =
            GameManager.inst.player.getComponent(PlayerHalo).colorNumDict
        if (
            colorDict[ColliderGroup.RED] > 0 &&
            colorDict[ColliderGroup.GREEN] > 0 &&
            colorDict[ColliderGroup.BLUE] > 0
        ) {
            const returnPortal = this.objectsNode.getChildByName("ReturnPortal")
            returnPortal.active = false
        }
    }

    private onLampChangeColor(uuid: string, color: number): void {
        this.lampColors.set(uuid, color)
        const colors = new Set(this.lampColors.values())
        if (
            colors.has(ColliderGroup.RED) &&
            colors.has(ColliderGroup.GREEN) &&
            colors.has(ColliderGroup.BLUE)
        ) {
            this.startEndSequence()
        }
    }

    private startEndSequence(): void {
        const afterLight = tween(this.overlayOpacity)
            .delay(3)
            .to(0.5, { opacity: 255 }, { easing: "cubicInOut" })
            .delay(2)
            .call(() => {
                tween(this.finalWords1.getComponent(UIOpacity))
                    .to(2, { opacity: 255 }, { easing: "sineInOut" })
                    .delay(1)
                    .call(() =>
                        tween(this.finalWords2.getComponent(UIOpacity))
                            .to(2, { opacity: 255 }, { easing: "sineInOut" })
                            .start(),
                    )
                    .start()
                tween(this.finalWords1)
                    .by(0, { position: new Vec3(0, -50, 0) })
                    .by(
                        2,
                        { position: new Vec3(0, 50, 0) },
                        { easing: "sineInOut" },
                    )
                    .delay(1)
                    .call(() =>
                        tween(this.finalWords2)
                            .by(0, { position: new Vec3(0, -50, 0) })
                            .by(
                                2,
                                { position: new Vec3(0, 50, 0) },
                                { easing: "sineInOut" },
                            )
                            .start(),
                    )
                    .start()
            })
            .delay(7)
            .call(() => {
                // end
                GameManager.inst.canAct = true
                this.camera.shake = 0
                AudioManager.inst.stopBGM()
                AudioManager.inst.clearBGM()
            })
            .delay(5)
            .call(() => SceneManager.loadScene("Splash", true))

        tween(this.node)
            .call(() => {
                // initialize
                for (const node of this.hideNodes) {
                    node.active = false
                }
                GameManager.inst.canAct = false

                AudioManager.inst.fadeOutBGM(2)

                this.camera.damping = 0.98
                const cameraTransform = this.camera.getComponent(UITransform)
                cameraTransform.height *= 4 / 3
                cameraTransform.width *= 4 / 3
                tween(this.camera.getComponent(Camera))
                    .to(2, { orthoHeight: 480 }, { easing: "sineOut" })
                    .start()
                this.camera.focusOn(this.coreNode, false)
            })
            .delay(4)
            .call(() => AudioManager.inst.fadeInBGM(this.endBGM, 4))
            .delay(2)
            .call(() => {
                GameManager.inst.dialogBox.playDialog(
                    this.dummyDialog.entries,
                    afterLight.start.bind(afterLight),
                )
                tween(this.overlayOpacity)
                    .to(40, { opacity: 100 }, { easing: "cubicIn" })
                    .start()
            })
            .delay(12)
            .call(() => {
                tween(this.coreColoredOpacity)
                    .to(30, { opacity: 255 }, { easing: "cubicInOut" })
                    .start()
                tween(this.coreNode.getComponent(UIOpacity))
                    .to(30, { opacity: 0 }, { easing: "cubicInOut" })
                    .start()
                // "Look at these colors!"
                this.coreParticles.emissionRate = 100
                this.coreParticles.resetSystem()
                AudioManager.inst.playOneShot(this.engineSound)
            })
            .delay(13)
            .call(() => {
                // destroyer activated
                this.camera.shake = 2
                this.coreParticles.emissionRate = 300
                AudioManager.inst.playOneShot(this.engineSound)
                this.scheduleOnce(() => {
                    AudioManager.inst.playOneShot(this.engineSound, 0.8)
                }, 0.3)
            })
            .delay(5)
            .call(() => (this.camera.shake = 16))
            .start()
    }
}
