import {
    _decorator,
    BoxCollider2D,
    Collider2D,
    Color,
    EPhysics2DDrawFlags,
    ParticleSystem2D,
    PhysicsSystem2D,
    Size,
    Vec2,
} from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Laser")
export class Laser extends Entity {
    @property({ type: ColliderGroup })
    private color: number = 0

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: new Color(200, 50, 50),
        [ColliderGroup.GREEN]: new Color(50, 255, 50),
        [ColliderGroup.BLUE]: new Color(0, 128, 255),
    }

    protected onLoad(): void {
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb
        this.initialize(
            this.color,
            new Vec2(this.node.position.x, this.node.position.y),
            this.getComponent(BoxCollider2D).size,
        )
    }

    public initialize(color: number, position: Vec2, size: Size): void {
        // Set position
        // need to shift the position by half of the size
        this.node.position.set(
            position.x + size.width / 4,
            position.y - size.height / 4,
        )

        // Set size
        this.getComponent(BoxCollider2D).size = size
        this.getComponent(ParticleSystem2D).posVar = new Vec2(
            size.width * 1.25,
            0,
        )
        // Set color
        this.color = color
        this.node.getComponent(ParticleSystem2D).startColor =
            Laser.COLOR_MAP[color]
        this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
    }

    public onEnterHalo(halo: PlayerHalo): boolean {
        if (halo.color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(ParticleSystem2D).resetSystem()
                this.node.getComponent(ParticleSystem2D).stopSystem()
                this.node.getComponent(Collider2D).group =
                    ColliderGroup.INACTIVE
            }, 0)
            return true
        }
        return false
    }

    public onLeaveHalo(halo: PlayerHalo, force: boolean = false): boolean {
        if (force || halo.color === this.color) {
            this.scheduleOnce(() => {
                this.node.getComponent(ParticleSystem2D).resetSystem()
                this.node.getComponent(Collider2D).group = ColliderGroup.ACTIVE
            }, 0)
            return true
        }
        return false
    }
}
