import {
    _decorator,
    BoxCollider2D,
    Collider2D,
    Component,
    Contact2DType,
    IPhysics2DContact,
    Size,
    Vec2,
} from "cc"
import { ColliderType } from "../Physics/ColliderManager"
const { ccclass, property } = _decorator

@ccclass("StoneDestroyer")
export class StoneDestroyer extends Component {
    protected onLoad(): void {
        const collider = this.getComponent(Collider2D)
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
    }

    public initialize(position: Vec2, size: Size): void {
        // set position
        // need to shift the position by quarter (why?) of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )

        // set size
        this.node.getComponent(BoxCollider2D).size = size
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        // destroy the stone when it collides with the ground
        if (other.tag === ColliderType.STONE) {
            this.scheduleOnce(() => {
                other.node.destroy()
            }, 0.1)
        }
    }
}
