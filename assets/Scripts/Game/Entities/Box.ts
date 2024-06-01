import { _decorator, Collider2D, Color, Node, Sprite, Vec3 } from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
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
        // Set the color of the box
        this.node.getComponent(Sprite).color = Box.COLOR_MAP[this.color]
        // Set the group of the collider
        this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
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

    public onEnterHalo(playerHalo: PlayerHalo): boolean {
        if (playerHalo.color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = false
                this.node.getComponent(Collider2D).group =
                    ColliderGroup.INACTIVE
            }, 0.1)
            return true
        }
        return false
    }

    public onLeaveHalo(
        playerHalo: PlayerHalo,
        force: boolean = false,
    ): boolean {
        if (force || playerHalo.color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = true
                this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
            }, 0.1)
            return true
        }
        return false
    }

    public onBeginInteract(player: Player): void {
        this.bindedTo = player.node
        this.bindOffsetX = this.node.position.x - player.node.position.x
    }

    public onEndInteract(player: Player): void {
        this.bindedTo = null
    }
}
