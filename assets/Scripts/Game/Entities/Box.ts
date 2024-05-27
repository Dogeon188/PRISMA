import { _decorator, Collider, Color, Component, Node, Sprite, Vec3 } from "cc"
const { ccclass, property } = _decorator
import { ColliderGroup } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
import { Player } from "../Player"

@ccclass("Box")
export class Box extends Entity {
    @property({ type: ColliderGroup })
    private color: number = ColliderGroup.RED

    private bindedTo: Node | null = null
    private bindOffsetX: number = 0

    protected onLoad(): void {
        const target_color =
            this.color === ColliderGroup.RED
                ? Color.RED
                : this.color === ColliderGroup.GREEN
                ? Color.GREEN
                : Color.BLUE
        // Set the color of the box
        this.node.getComponent(Sprite).color = target_color
    }

    protected start() {}

    protected update(deltaTime: number) {
        if (this.bindedTo) {
            this.node.position = new Vec3(
                this.bindedTo.position.x + this.bindOffsetX,
                this.node.position.y,
                this.node.position.z,
            )
        }
    }

    public onCollisionEnter(): void {
        this.scheduleOnce(() => {
            this.node.getComponent(Sprite).enabled = false
        }, 0.1)
    }

    public onCollisionExit(): void {
        this.scheduleOnce(() => {
            this.node.getComponent(Sprite).enabled = true
        }, 0.1)
    }

    public onBeginInteract(player: Player): void {
        console.log("Begin Interact")
        this.bindedTo = player.node
        this.bindOffsetX = this.node.position.x - player.node.position.x
    }

    public onEndInteract(player: Player): void {
        console.log("End Interact")
        this.bindedTo = null
    }
}
