import {
    _decorator,
    Component,
    instantiate,
    Label,
    Node,
    Prefab,
    Size,
    UITransform,
    Vec3,
} from "cc"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("LeaderBoard")
export class LeaderBoard extends Component {
    private zoneMap: Map<number, string> = new Map([
        [-1, "LevelTest"],
        [0, "LevelOpening"],
        [1, "LevelLobby"],
        [2, "LevelRedZone"],
        [3, "LevelGreenZoneM1"],
        [4, "LevelGreenZoneM2"],
        [5, "LevelGreenZoneM3"],
        [6, "LevelGreenZoneM4"],
        [7, "LevelBlueZoneM1"],
        [8, "LevelBlueZoneM2"],
        [9, "LevelBlueZoneM3"],
        [10, "LevelEnd"],
    ])

    @property({ type: Prefab })
    record: Prefab = null

    protected onLoad(): void {
        this.initialize()
    }

    private goBack(): void {
        SceneManager.loadScene("Start", true)
    }

    private async initialize(): Promise<void> {
        const snapshot = await firebase
            .database()
            .ref(`leaderboard`)
            .once("value")
        if (snapshot.exists()) {
            const data = snapshot.val()
            let arr = []
            for (let key in data) {
                arr.push(data[key])
            }
            const sortedData = arr.sort(
                (a, b) =>
                    b.gameProgress -
                    a.gameProgress +
                    (a.gameProgress === b.gameProgress ? a.time - b.time : 0),
            )
            const container = this.node
            for (let i = 0; i < sortedData.length; i++) {
                const record = instantiate(this.record)
                record.parent = container
                record.getChildByName("I").getComponent(Label).string = `${
                    i + 1
                }${i === 0 ? "ST" : i === 1 ? "ND" : i === 2 ? "RD" : "TH"}.`
                record
                    .getChildByName("Username")
                    .getComponent(Label).string = `${sortedData[i].username}`
                record
                    .getChildByName("Stage")
                    .getComponent(Label).string = `${this.zoneMap.get(
                    sortedData[i].gameProgress,
                )}`
                record
                    .getChildByName("Time")
                    .getComponent(Label).string = `${Math.floor(
                    sortedData[i].time / 60,
                )
                    .toString()
                    .padStart(2, "0")} : ${Math.floor(sortedData[i].time % 60)
                    .toString()
                    .padStart(2, "0")}`
                record.position = new Vec3(0, -(i + 0.5) * 100, 0)
            }
            this.node.getComponent(UITransform).contentSize = new Size(
                1000,
                100 * sortedData.length,
            )
        }
    }
}
