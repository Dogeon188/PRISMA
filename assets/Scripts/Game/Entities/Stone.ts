import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    Contact2DType,
    IPhysics2DContact,
    log,
    RigidBody2D,
    RigidBodyComponent,
    Size,
    Sprite,
    UITransform,
    Vec2,
} from "cc"
import { ColliderGroup, ColliderType, ColorMap } from "../Physics/ColliderManager"
import { Brick } from "./Brick"
const { ccclass, property } = _decorator

@ccclass("Stone")
export class Stone extends Brick {
    @property
    private static readonly MAX_VELOCITY = 15
    
    public initialize(color: number, position: Vec2, size: Size): void {
        // set position
        // need to shift the position by quarter (why?) of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )
        // set size
        this.radius = size.width / 2
        this.node.getComponent(UITransform).setContentSize(size)

        // Set the color of the box
        this.color = color
        this.node.getComponent(Sprite).color = ColorMap[this.color]
        // Set the collision group of the collider
        this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
        this.node.getComponent(RigidBody2D).gravityScale = 5

        for (const collider of this.node.getComponents(Collider2D)) {
            collider.on(
                Contact2DType.BEGIN_CONTACT,
                this.onBeginContact,
                this,
            )
        }
    }
    @property
    private radius: number = 10

    protected start(): void {
        // change radius
        this.node.getComponent(CircleCollider2D).radius = this.radius
        this.node.getComponent(CircleCollider2D).apply()
    }

    protected update(dt: number): void {
        const rigidBody = this.node.getComponent(RigidBody2D)
        if (!rigidBody) return
        let velocity = rigidBody.linearVelocity
        if (velocity.length() < Stone.MAX_VELOCITY) return
        rigidBody.linearVelocity = velocity.normalize().multiplyScalar(Stone.MAX_VELOCITY)
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if (other.tag === ColliderType.ONEWAY) {
            contact.disabled = true
        }
    }
}
