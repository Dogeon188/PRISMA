import { _decorator, CircleCollider2D, Component, Node } from "cc"
import { Brick } from "./Brick"
const { ccclass, property } = _decorator

@ccclass("Stone")
export class Stone extends Brick {
    @property
    private radius: number = 10

    protected start(): void {
        // change radius
        this.node.getComponent(CircleCollider2D).radius = this.radius
        this.node.getComponent(CircleCollider2D).apply()
    }
    public onCollide(other: Node): void {}
}
