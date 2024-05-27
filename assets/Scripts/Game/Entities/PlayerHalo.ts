import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Component,
    Contact2DType,
    IPhysics2DContact,
    Node,
    Vec3,
} from "cc"
import { getCorrectNormal } from "../Physics/PhysicsFixer"
import { ColliderGroup, ColliderType } from "../Physics/ColliderManager"
import { Box } from "./Box"
const { ccclass, property } = _decorator

@ccclass("PlayerHalo")
export class PlayerHalo extends Component {
    private color: number = ColliderGroup.RED

    onLoad() {
        const collider = this.node.getComponent(Collider2D)
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        }
    }

    update(deltaTime: number) {
        // this.node.position = new Vec3(0, 0, 0)
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        // const normal = getCorrectNormal(self, other, contact)
        if (other.tag === ColliderType.OBJECT) {
            other.node.getComponent(Box).onCollisionEnter()
        }
    }
}
