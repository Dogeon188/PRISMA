import { _decorator, Component, Node } from "cc"
import { ColliderGroup } from "../Game/Physics/ColliderManager"
import { TrackCamera } from "../Game/TrackCamera"
const { ccclass, property } = _decorator

@ccclass("LevelEnd")
export class LevelEnd extends Component {
    @property(Node)
    private objectsNode: Node = null

    @property(TrackCamera)
    private camera: TrackCamera = null

    private lampColors: Map<string, number> = new Map()

    protected start(): void {
        this.objectsNode.children
            .filter((child) => {
                return child.name === "Lamp"
            })
            .forEach((lamp) => {
                lamp.on("changeColor", this.onLampChangeColor, this)
            })
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
        console.log("Level end sequence started")
    }
}
