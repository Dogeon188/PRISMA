import {
    AudioClip,
    Camera,
    CircleCollider2D,
    Component,
    EPhysics2DDrawFlags,
    Node,
    PhysicsSystem2D,
    TiledObjectGroup,
    Vec2,
    Vec4,
    _decorator,
    postProcess,
    renderer,
} from "cc"
import { PREVIEW } from "cc/env"
import { AudioManager } from "../AudioManager"
import { DialogBox } from "../Interface/DialogBox"
import { InteractPrompt } from "../Interface/InteractPrompt"
import { SceneManager } from "../SceneManager"
import { Lamp } from "./Entities/Lamp"
import { Player } from "./Player"
import { TrackCamera } from "./TrackCamera"
const { ccclass, property } = _decorator

@ccclass("GameManager")
export class GameManager extends Component {
    //#region Singleton

    private static _inst: GameManager = null
    static get inst(): GameManager {
        return GameManager._inst
    }

    constructor() {
        super()
        GameManager._inst = this
    }

    protected onDestroy(): void {
        GameManager._inst = null
    }

    //#endregion

    //#region Properties

    @property
    private debugMode: boolean = false

    @property
    private levelName: string = ""

    @property(AudioClip)
    bgm: AudioClip = null

    @property({
        type: Node,
        group: "References",
        tooltip: "All interactive objects will be added here",
    })
    objectsNode: Node = null

    @property({
        type: TiledObjectGroup,
        group: "References",
        tooltip:
            "The tiled object group containing the start node. It should only have one object.",
    })
    startObjectGroup: TiledObjectGroup = null

    @property({
        type: DialogBox,
        group: "References",
        tooltip: "The dialog box node",
    })
    dialogBox: DialogBox = null

    @property({
        type: InteractPrompt,
        group: "References",
        tooltip: "The interact prompt node",
    })
    interactPrompt: InteractPrompt = null

    @property(Player)
    player: Player = null

    @property({ type: TrackCamera, group: "References" })
    camera: TrackCamera = null

    private _canAct: boolean = true

    public get canAct(): boolean {
        return this._canAct
    }

    public set canAct(value: boolean) {
        this._canAct = value
        this.player.canAct = value
    }

    //#endregion

    //#region Callbacks

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
        const startObject = this.startObjectGroup.getObjects()[0]
        this.player.initialize(this, new Vec2(startObject.x, startObject.y))
        this.camera.focusOn(this.player.node)
    }

    protected start(): void {
        this.initializeShader()
        if (PREVIEW && this.debugMode) {
            PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb
        }
    }

    public backToStart(): void {
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("Start")
    }

    //#endregion

    //#region Shader

    private pass: renderer.Pass = null
    private ubo = {
        centersX: new Vec4(0, 0, 0, 0),
        centersY: new Vec4(0, 0, 0, 0),
        radii: new Vec4(0, 0, 0, 0),
    }
    private uboHandles: {
        centersX: number
        centersY: number
        radii: number
    } = {
        centersX: null,
        centersY: null,
        radii: null,
    }
    public lamps: Lamp[] = []
    private lampHalos: Node[] = []

    private initializeShader(): void {
        // register lamps
        this.objectsNode.children.forEach((child) => {
            const lamp = child.getComponent(Lamp)
            if (lamp) this.lamps.push(lamp)
        })
        if (this.lamps.length > 3) {
            console.warn(
                "More than 3 lamps detected. Only the first 3 will be used.",
            )
            this.lamps = this.lamps.slice(0, 3)
        }
        this.lampHalos = this.lamps.map((lamp) =>
            lamp.node.getChildByName("Halo"),
        )

        // register halo radius
        const haloRadius = this.player.getComponent(CircleCollider2D).radius
        this.ubo.radii.w = haloRadius * 2.5

        // get shader pass
        const camera = this.camera.node.getComponent(Camera)
        const blit = camera.postProcess.getSetting(
            postProcess.BlitScreen,
        ) as postProcess.BlitScreen
        const mat = blit.materials[0].material
        this.pass = mat.passes[0]

        // get uniform handles
        this.uboHandles.centersX = this.pass.getHandle("centersX")
        this.uboHandles.centersY = this.pass.getHandle("centersY")
        this.uboHandles.radii = this.pass.getHandle("radii")
    }

    protected update(dt: number): void {
        const cameraPos = this.camera.node.position
        // update this.ubo
        this.ubo.centersX.w = this.player.node.worldPosition.x - cameraPos.x
        this.ubo.centersY.w = this.player.node.worldPosition.y - cameraPos.y
        if (this.lamps.length > 2) {
            this.ubo.centersX.z =
                this.lampHalos[2].worldPosition.x - cameraPos.x
            this.ubo.centersY.z =
                this.lampHalos[2].worldPosition.y - cameraPos.y
            this.ubo.radii.z = this.lamps[2].radius * 2.5
        }
        if (this.lamps.length > 1) {
            this.ubo.centersX.y =
                this.lampHalos[1].worldPosition.x - cameraPos.x
            this.ubo.centersY.y =
                this.lampHalos[1].worldPosition.y - cameraPos.y
            this.ubo.radii.y = this.lamps[1].radius * 2.5
        }
        if (this.lamps.length > 0) {
            this.ubo.centersX.x =
                this.lampHalos[0].worldPosition.x - cameraPos.x
            this.ubo.centersY.x =
                this.lampHalos[0].worldPosition.y - cameraPos.y
            this.ubo.radii.x = this.lamps[0].radius * 2.5
        }

        // Update shader uniforms
        this.pass.setUniform(this.uboHandles.centersX, this.ubo.centersX)
        this.pass.setUniform(this.uboHandles.centersY, this.ubo.centersY)
        this.pass.setUniform(this.uboHandles.radii, this.ubo.radii)
    }
}
