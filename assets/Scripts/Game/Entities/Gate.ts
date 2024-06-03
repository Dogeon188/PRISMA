import {
    _decorator,
    BoxCollider2D,
    Component,
    Node,
    Size,
    tween,
    UITransform,
    Vec3,
} from "cc"
import { Entity } from "./Entity"
import { PlateTriggerable } from "./Plate"
const { ccclass, property } = _decorator

@ccclass("Gate")
export class Gate extends Entity implements PlateTriggerable {
    @property(Vec3)
    private triggeredOffset: Vec3 = new Vec3(0, 0, 0)

    @property
    transitionDuration: number = 0.5

    private normalPosition: Vec3 = new Vec3(0, 0, 0)

    private triggeredPosition: Vec3 = new Vec3(0, 0, 0)

    onLoad() {
        this.initialize(
            new Vec3(this.node.position),
            this.node.getComponent(UITransform).contentSize,
            this.triggeredOffset,
        )
    }

    initialize(
        position: Vec3,
        size: Size,
        triggeredOffset: Vec3,
        transitionDuration: number = 0.5,
    ): void {
        // set position
        // need to shift the position by quarter (why?) of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )

        // set size
        this.node.getComponent(UITransform).setContentSize(size)
        this.getComponent(BoxCollider2D).size = size
        
        // set the transition duration and positions
        this.transitionDuration = transitionDuration
        this.normalPosition = new Vec3(this.node.position)
        this.triggeredPosition = new Vec3(this.normalPosition).add(
            triggeredOffset,
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
