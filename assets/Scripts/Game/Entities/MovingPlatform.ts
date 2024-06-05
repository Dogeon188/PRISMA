import { Node, Vec3, _decorator, tween } from "cc"
import { Brick } from "./Brick"
const { ccclass, property } = _decorator

@ccclass("MovingPlatform")
export class MovingPlatform extends Brick {
    @property(Node)
    private moveTo: Node = null

    @property
    private duration: number = 3

    private originalPosition: Vec3 = new Vec3()
    private moveToPosition: Vec3 = new Vec3()

    protected onLoad(): void {
        super.onLoad()
        this.originalPosition = this.node.position.clone()
    }

    public set moveToNode(value: Node) {
        this.moveTo = value
        this.moveToPosition = new Vec3(
            this.moveTo.position.x,
            this.moveTo.position.y,
            this.node.position.z,
        )
    }

    public set durationValue(value: number) {
        this.duration = value
    }

    protected start(): void {
        tween(this.node)
            .to(
                this.duration,
                { position: this.moveToPosition },
                { easing: "sineInOut" },
            )
            .to(
                this.duration,
                { position: this.originalPosition },
                { easing: "sineInOut" },
            )
            .union()
            .repeatForever()
            .start()
    }
}
