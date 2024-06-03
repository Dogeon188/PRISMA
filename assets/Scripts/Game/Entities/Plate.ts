import {
    _decorator,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    Sprite,
    tween,
    Vec2,
    Vec3,
} from "cc"
import { ColliderType } from "../Physics/ColliderManager"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

export interface PlateTriggerable {
    onTriggered(): void
    onReleased(): void
}

@ccclass("Plate")
export class Plate extends Entity {
    @property(Sprite)
    private sprite: Sprite = null

    @property({ type: [Entity] })
    private connectedEntities: PlateTriggerable[] = []

    private pressedBy: Set<Uuid> = new Set()

    protected onLoad(): void {
        const collider = this.getComponent(Collider2D)!
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
    }

    private onBeginContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if (
            other.tag === ColliderType.PLAYER ||
            other.tag === ColliderType.BOX
        ) {
            this.addPressedBy(other.node.uuid)
        }
    }

    private onEndContact(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        if (
            other.tag === ColliderType.PLAYER ||
            other.tag === ColliderType.BOX
        ) {
            this.removePressedBy(other.node.uuid)
        }
    }

    private addPressedBy(other: Uuid): void {
        this.pressedBy.add(other)
        if (this.pressedBy.size === 1) {
            this.press()
        }
    }

    private removePressedBy(other: Uuid): void {
        this.pressedBy.delete(other)
        if (this.pressedBy.size === 0) {
            this.release()
        }
    }

    private press(): void {
        console.log("Plate pressed")
        this.connectedEntities.forEach((entity) => entity.onTriggered())
        tween(this.sprite.node)
            .to(1, { position: new Vec3(0, -2.5, 0) })
            .start()
    }

    private release(): void {
        console.log("Plate released")
        this.connectedEntities.forEach((entity) => entity.onReleased())
        tween(this.sprite.node)
            .to(1, { position: new Vec3(0, 2.5, 0) })
            .start()
    }
}
