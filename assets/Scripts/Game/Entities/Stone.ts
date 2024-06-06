import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    RigidBody2D,
    Size,
    Sprite,
    UITransform,
    Vec2,
} from "cc"
import { ColliderGroup, ColorMap } from "../Physics/ColliderManager"
import { Brick } from "./Brick"
const { ccclass, property } = _decorator

@ccclass("Stone")
export class Stone extends Brick {
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
    }
    @property
    private radius: number = 10

    protected start(): void {
        // change radius
        this.node.getComponent(CircleCollider2D).radius = this.radius
        this.node.getComponent(CircleCollider2D).apply()
    }
}
