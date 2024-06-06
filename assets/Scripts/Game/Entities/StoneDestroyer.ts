import {
    _decorator,
    Collider2D,
    Component,
    Contact2DType,
    IPhysics2DContact,
    Node,
} from "cc"
import { ColliderGroup, ColliderType } from "../Physics/ColliderManager"
const { ccclass, property } = _decorator

@ccclass("StoneDestroyer")
export class StoneDestroyer extends Component {
    protected onLoad(): void {
        const collider = this.getComponent(Collider2D)
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
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
