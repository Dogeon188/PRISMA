import { _decorator, Node } from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
import { Auth } from "../../Auth"
const { ccclass, property, executeInEditMode } = _decorator

@ccclass("Gem")
@executeInEditMode
export class Gem extends Entity {
    @property({ type: ColliderGroup })
    private color: number = ColliderGroup.GREEN

    @property
    private zone: string = "LevelLobby"

    zoneMap: Map<string, number> = new Map([
        ["LevelTest", 0],
        ["LevelLobby", 1],
        ["LevelRedZone", 2],
        ["LevelGreenZoneM1", 3],
        ["LevelGreenZoneM2", 4],
        ["LevelGreenZoneM3", 5],
        ["LevelGreenZoneM4", 6],
        ["LevelBlueZoneM1", 7],
        ["LevelBlueZoneM2", 8],
        ["LevelBlueZoneM3", 9],
    ])

    stageAndPointMap: Map<[number, number], number> = new Map([
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

    onLoad(): void {
        if (!this.zoneCheck()) {
            this.node.destroy()
        }
    }

    public onCollide(other: Node): void {
        other.getComponent(PlayerHalo).addGem(this.color)
        this.scheduleOnce(() => {
            this.node.destroy()
        }, 0.1)
    }

    private zoneCheck(): boolean {
        return (
            this.zoneMap.get(this.zone) >
            this.stageAndPointMap.get([Auth.data.stage, Auth.data.savepoint])
        )
    }
}
