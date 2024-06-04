import {
    AudioClip,
    Component,
    EPhysics2DDrawFlags,
    Node,
    PhysicsSystem2D,
    Prefab,
    _decorator,
} from "cc"
import { PREVIEW } from "cc/env"
import { AudioManager } from "../AudioManager"
import { DialogBox } from "../Interface/DialogBox"
import { InteractPrompt } from "../Interface/InteractPrompt"
import { SceneManager } from "../SceneManager"
import { Player } from "./Player"
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

    @property(AudioClip)
    bgm: AudioClip = null

    @property({
        type: Node,
        group: "References",
        tooltip: "All interactive objects will be added here",
    })
    objectsNode: Node = null

    @property({
        type: Node,
        group: "References",
        tooltip: "Player will be spawned at its position",
    })
    startNode: Node = null

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

    @property({ type: Prefab, group: "Prefabs" })
    playerPrefab: Prefab = null

    /** @deprecated Only for test purpose. Please use {@linkcode playerPrefab} instead. */
    @property(Player)
    player: Player = null

    //#endregion

    //#region Callbacks

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
        this.player.initialize(this, this.startNode.position)
    }

    protected start(): void {
        if (PREVIEW) {
            PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb
        }
    }

    backToStart(): void {
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("Start")
    }

    //#endregion
}
