import {
    _decorator,
    BoxCollider2D,
    Component,
    Node,
    Size,
    tween,
    UITransform,
    Vec2,
    Vec3,
} from "cc"
import { Entity } from "./Entity"
import { PlateTriggerable } from "./Plate"
const { ccclass, property } = _decorator

@ccclass("Gate")
export class Gate extends Entity implements PlateTriggerable {
    @property(Vec2)
    private triggeredOffset: Vec2 = new Vec2(0, 0)

    @property
    transitionDuration: number = 0.5

    private normalPosition: Vec3 = new Vec3(0, 0, 0)

    private triggeredPosition: Vec3 = new Vec3(0, 0, 0)

    public initialize(
        position: Vec2,
        size: Size,
        triggeredOffset: Vec2,
        transitionDuration: number = 0.5,
    ): void {
        // set position
        // need to shift the position by half of the size
        this.node.position.set(
            position.x + size.width / 2,
            position.y - size.height / 2,
        )

        // set size
        this.node.getComponent(UITransform).setContentSize(size)
        this.getComponent(BoxCollider2D).size = size

        // set the transition duration and positions
        this.transitionDuration = transitionDuration
        this.normalPosition = new Vec3(this.node.position)
        this.triggeredPosition = new Vec3(this.normalPosition).add(
            new Vec3(triggeredOffset.x, triggeredOffset.y, 0),
        )
    }

    onTriggered() {
        tween(this.node)
            .to(this.transitionDuration, { position: this.triggeredPosition })
            .start()
    }

    onReleased() {
        tween(this.node)
            .to(this.transitionDuration, { position: this.normalPosition })
            .start()
    }
}
