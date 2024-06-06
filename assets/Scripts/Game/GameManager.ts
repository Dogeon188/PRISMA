import {
    AudioClip,
    Component,
    EPhysics2DDrawFlags,
    Node,
    PhysicsSystem2D,
    Prefab,
    TiledObjectGroup,
    Vec2,
    _decorator,
} from "cc"
import { PREVIEW } from "cc/env"
import { AudioManager } from "../AudioManager"
import { DialogBox } from "../Interface/DialogBox"
import { InteractPrompt } from "../Interface/InteractPrompt"
import { SceneManager } from "../SceneManager"
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

    //#endregion

    //#region Callbacks

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
        const startObject = this.startObjectGroup.getObjects()[0]
        this.player.initialize(this, new Vec2(startObject.x, startObject.y))
        this.camera.focusOn(this.player.node)
    }

    protected start(): void {
        if (PREVIEW && this.debugMode) {
            PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb
        }
    }

    backToStart(): void {
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("Start")
    }

    //#endregion
}
