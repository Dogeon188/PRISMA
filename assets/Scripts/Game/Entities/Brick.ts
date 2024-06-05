import {
    _decorator,
    BoxCollider2D,
    Collider2D,
    Color,
    Size,
    Sprite,
    UITransform,
    Vec2,
} from "cc"
import { ColliderGroup, ColorMap } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
import { Lamp } from "./Lamp"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Brick")
export class Brick extends Entity {
    @property({ type: ColliderGroup })
    protected color: number = ColliderGroup.RED

    private collidedHaloSet: Set<string> = new Set()

    protected onLoad(): void {
        this.initialize(
            this.color,
            new Vec2(this.node.position.x, this.node.position.y),
            this.node.getComponent(UITransform).contentSize,
        )
    }

    public initialize(color: number, position: Vec2, size: Size): void {
        // set position
        // need to shift the position by quarter (why?) of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )

        // set size
        this.node.getComponent(UITransform).setContentSize(size)
        this.node.getComponent(BoxCollider2D).size = size

        // Set the color of the box
        this.color = color
        this.node.getComponent(Sprite).color = ColorMap[this.color]
        // Set the collision group of the collider
        this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
    }

    public onEnterHalo(playerHalo: PlayerHalo): void {
        if (playerHalo.color === this.color) {
            this.collidedHaloSet.add(playerHalo.node.uuid)
        }
        this.determineActive()
    }

    public onLeaveHalo(playerHalo: PlayerHalo, force: boolean = false): void {
        this.collidedHaloSet.delete(playerHalo.node.uuid)
        this.determineActive()
    }

    private determineActive(): void {
        if (this.collidedHaloSet.size === 0) {
            this.node.getComponent(Sprite).enabled = true
            this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
        } else {
            this.node.getComponent(Sprite).enabled = false
            this.node.getComponent(Collider2D).group = ColliderGroup.INACTIVE
        }
    }

    public onEnterLampHalo(lamp: Lamp): void {
        if (lamp.color === this.color) {
            this.collidedHaloSet.add(lamp.node.uuid)
        }
        this.determineActive()
    }

    public onLeaveLampHalo(lamp: Lamp, force: boolean = false): void {
        this.collidedHaloSet.delete(lamp.node.uuid)
        this.determineActive()
    }
}
