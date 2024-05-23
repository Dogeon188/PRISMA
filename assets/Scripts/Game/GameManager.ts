import { AudioClip, Component, Node, Prefab, _decorator } from "cc"
import { AudioManager } from "../AudioManager"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("GameManager")
export class GameManager extends Component {
    @property(AudioClip)
    bgm: AudioClip = null

    @property({
        type: Node,
        group: "Objects",
        tooltip: "All interactive objects will be added here",
    })
    objectsNode: Node = null

    @property({
        type: Node,
        group: "References",
        tooltip: "Player will be spawned at its position",
    })
    startNode: Node = null

    @property({ type: Prefab, group: "Prefabs" })
    playerPrefab: Prefab = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
    }

    backToStart(): void {
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("Start")
    }
}
