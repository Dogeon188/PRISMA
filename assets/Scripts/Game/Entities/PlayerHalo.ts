import { _decorator, Collider2D, Component, IPhysics2DContact, Node } from "cc"
import { getCorrectNormal } from "../Physics/PhysicsFixer"
import { ColliderGroup, ColliderType } from "../Physics/ColliderManager"
import { Box } from "./Box"
const { ccclass, property } = _decorator

@ccclass("PlayerHalo")
export class PlayerHalo extends Component {
    private color: number = ColliderGroup.RED

    start() {}

    update(deltaTime: number) {}

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
