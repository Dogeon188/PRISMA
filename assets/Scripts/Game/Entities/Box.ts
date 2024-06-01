import { _decorator, Collider2D, Color, Node, Sprite, Vec3 } from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

@ccclass("Box")
export class Box extends Entity {
    @property({ type: ColliderGroup })
    private color: number = ColliderGroup.RED

    private bindedTo: Node | null = null
    private bindOffsetX: number = 0

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.initialize(this.color)
    }

    public initialize(color: number): void {
        this.color = color
        // Set the color of the box
        this.node.getComponent(Sprite).color = Box.COLOR_MAP[this.color]
        // Set the group of the collider
        this.node.getComponent(Collider2D).group = this.color
    }

    protected update(deltaTime: number) {
        if (this.bindedTo) {
            this.node.position = new Vec3(
                this.bindedTo.position.x + this.bindOffsetX,
                this.node.position.y,
                this.node.position.z,
            )
        }
    }

    public onCollisionEnter(playerHaloColor: number): void {
        if (playerHaloColor === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = false
            }, 0.1)
        }
    }

    public onCollisionExit(playerHaloColor: number): void {
        if (playerHaloColor === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = true
            }, 0.1)
        }
    }

    public onBeginInteract(player: Player): void {
        this.bindedTo = player.node
        this.bindOffsetX = this.node.position.x - player.node.position.x
    }

    public onEndInteract(player: Player): void {
        this.bindedTo = null
    }
}
