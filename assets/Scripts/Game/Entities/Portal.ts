import { Enum, Node, _decorator, find } from "cc"
import { Settings } from "../../Scene/Settings"
import { SceneManager } from "../../SceneManager"
import { GameManager } from "../GameManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { Auth } from "../../Auth"
import { PlayerHalo } from "./PlayerHalo"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Timer } from "../Timer"
const { ccclass, property } = _decorator

export const PortalType = Enum({
    /** Change to another scene */
    SCENE: 0,
    /** Move to a specific node's position */
    NODE: -1,
})

export const StageMap: Map<string, [number, number]> = new Map([
    ["LevelTest", [-1, 1]],
    ["LevelOpening", [0, 1]],
    ["LevelLobby", [1, 1]],
    ["LevelRedZone", [2, 1]],
    ["LevelGreenZoneM1", [3, 1]],
    ["LevelGreenZoneM2", [3, 2]],
    ["LevelGreenZoneM3", [3, 3]],
    ["LevelGreenZoneM4", [3, 4]],
    ["LevelBlueZoneM1", [4, 1]],
    ["LevelBlueZoneM2", [4, 2]],
    ["LevelBlueZoneM3", [4, 3]],
])

@ccclass("Portal")
export class Portal extends Entity {
    private stageAndPointMap: Map<[number, number], number> = new Map([
        [[-1, 1], 0],
        [[0, 1], 1],
        [[1, 1], 2],
        [[2, 1], 3],
        [[2, 2], 4],
        [[2, 3], 5],
        [[2, 4], 6],
        [[3, 1], 7],
        [[3, 2], 8],
        [[3, 3], 9],
    ])

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
            Auth.updateUserData({
                stage: StageMap.get(this._toScene)[0],
                savepoint: StageMap.get(this._toScene)[1],
                haloColor: player.getComponent(PlayerHalo).color,
                gemNum: {
                    red: player.getComponent(PlayerHalo).colorNumDict[
                        ColliderGroup.RED
                    ],
                    green: player.getComponent(PlayerHalo).colorNumDict[
                        ColliderGroup.GREEN
                    ],
                    blue: player.getComponent(PlayerHalo).colorNumDict[
                        ColliderGroup.BLUE
                    ],
                },
                time: find("Canvas/Camera/HUD/Timer").getComponent(Timer).time,
            })
            Auth.updateLeaderboardData({
                username: firebase.auth().currentUser.displayName,
                time: find("Canvas/Camera/HUD/Timer").getComponent(Timer).time,
                gameProgress: this.stageAndPointMap.get(
                    StageMap.get(this._toScene),
                ),
            })
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
