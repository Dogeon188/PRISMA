import {
    _decorator,
    BoxCollider2D,
    Collider2D,
    Color,
    Size,
    Sprite,
    UITransform,
    Vec2,
    Vec3,
} from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

@ccclass("Brick")
export class Brick extends Entity {
    @property({ type: ColliderGroup })
    private color: number = ColliderGroup.RED

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.initialize(
            this.color,
            new Vec2(this.node.position.x, this.node.position.y),
            this.node.getComponent(UITransform).contentSize,
        )
    }

    public initialize(color: number, position: Vec2, size: Size): void {
        // set position
        // need to shift the position by half of the size
        console.log(position, size)
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )
        // this.node.position.set(position.x, position.y)
        // set size
        this.node.getComponent(UITransform).setContentSize(size)
        this.node.getComponent(BoxCollider2D).size = size

        // Set the color of the box
        this.color = color
        this.node.getComponent(Sprite).color = Brick.COLOR_MAP[this.color]
        // Set the group of the collider
        this.node.getComponent(Collider2D).group = this.color
    }

    public onEnterHalo(player: Player, color: number): void {
        if (color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = false
            }, 0.1)
        }
    }

    public onLeaveHalo(player: Player, color: number): void {
        if (color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(Sprite).enabled = true
            }, 0.1)
        }
    }
}
