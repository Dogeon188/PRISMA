import { _decorator, Component, Node } from "cc"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

@ccclass("Dialog")
export class Dialog extends Entity {
    onCollide(other: Node): void {
        // TODO show dialog on HUD
        console.log("Collided with Dialog")
    }
}
