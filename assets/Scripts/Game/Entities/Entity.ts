import { _decorator, Component, Node } from "cc"
import { ColliderGroup } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass } = _decorator

@ccclass("Entity")
export class Entity extends Component {
    /**
     * Called when this entity collides with another entity
     * Normally should be called in {@linkcode Player.onBeginContact}
     * @param other The other entity collided with, usually a {@linkcode Player}
     */
    public onCollide(other: Node) {}

    /**
     * Called when the player starts interacting with this entity (by pressing the interact button)
     * @param player The player interacting with this entity
     */
    public onBeginInteract(player: Player) {}

    /**
     * Called when the player stops interacting with this entity (by releasing the interact button)
     */
    public onEndInteract(player: Player) {}

    /**
     * Called when the entity enters the player's halo
     */
    public onEnterHalo(halo: PlayerHalo): boolean {
        return false
    }

    /**
     * Called when the entity leaves the player's halo
     */
    public onLeaveHalo(halo: PlayerHalo, force: boolean = false): boolean {
        return false
    }
}
