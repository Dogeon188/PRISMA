import { _decorator, Component, Node } from "cc"
import { Player } from "../Player"
const { ccclass } = _decorator

@ccclass("Entity")
export class Entity extends Component {
    /**
     * Called when this entity collides with another entity
     * Normally should be called in {@linkcode Player.onBeginContact}
     * @param other The other entity collided with, usually a {@linkcode Player}
     */
    public onCollide(other: Node) {}
}
