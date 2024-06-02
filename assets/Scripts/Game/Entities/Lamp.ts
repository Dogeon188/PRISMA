import { _decorator, Component, Node } from "cc"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public onCollide(other: Node): void {}
}
