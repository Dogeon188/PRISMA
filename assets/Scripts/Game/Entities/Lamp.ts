import {
    _decorator,
    Collider2D,
    Color,
    Component,
    Contact2DType,
    IPhysics2DContact,
    Node,
    Sprite,
    Vec3,
} from "cc"
import { Entity } from "./Entity"
import { Player } from "../Player"
import { GameManager } from "../GameManager"
import { Settings } from "../../Scene/Settings"
import { ColliderGroup } from "../Physics/ColliderManager"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public color: number = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.drawColor()
        const haloCollider = this.node
            .getChildByName("Halo")
            .getComponent(Collider2D)
        haloCollider.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContactHalo,
            this,
        )
        haloCollider.on(Contact2DType.END_CONTACT, this.onEndContactHalo, this)
    }

    public onCollide(other: Node): void {}

    public showPrompt(): void {
        GameManager.inst.interactPrompt.showPrompt(
            Settings.keybinds.interact,
            "Interact",
        )
    }

    private drawColor(): void {
        if (this.color === null) {
            this.node.getChildByName("Halo").getComponent(Sprite).color =
                new Color(0, 0, 0, 0)
            return
        }
        const color = Lamp.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            color.r,
            color.g,
            color.b,
            66,
        )
    }

    private changeColor(player: Player): void {
        if (this.color === null) {
            this.color = player.node.getComponent(PlayerHalo).color
            this.drawColor()
        } else {
            this.color = null
            this.drawColor()
        }
        // this.node.getChildByName("Halo").scale = new Vec3(-1, 1, 1)
        this.node.getChildByName("Halo").getComponent(Collider2D).enabled =
            false
        this.scheduleOnce(() => {
            this.node.getChildByName("Halo").getComponent(Collider2D).enabled =
                true
        }, 0.5)
    }

    public onBeginInteract(player: Player): void {
        GameManager.inst.interactPrompt.hidePrompt()
        this.changeColor(player)
    }

    public onEndInteract(player: Player): void {}

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        console.log(other.node)
        if (entity) {
            entity.onEnterLampHalo(this)
        }
    }

    private onEndContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            entity.onLeaveLampHalo(this)
        }
    }
}
