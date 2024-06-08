import { Collider2D, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Vec2, Vec3, _decorator, tween } from "cc"
import { Brick } from "./Brick"
import { NormalDirection, fuzzyEqual, getCorrectNormal } from "../Physics/PhysicsFixer"
import { ColliderType } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Box } from "./Box"
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
        this.getComponent(Collider2D).on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContact,
            this,
        )
        this.getComponent(Collider2D).on(
            Contact2DType.END_CONTACT,
            this.onEndContact,
            this,
        )
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

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if(other.tag === ColliderType.PLAYER || other.tag === ColliderType.BOX) {
            other.node.setParent(this.node)
        }
    }

    private onEndContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if(other.tag === ColliderType.PLAYER || other.tag === ColliderType.BOX) {
            if(other.tag === ColliderType.PLAYER) other.node.setParent(other.node.getComponent(Player).myParent)
            else other.node.setParent(other.node.getComponent(Box).myParent)
        }
    }
}
