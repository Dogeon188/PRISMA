import { _decorator, Color, Component, Node, Sprite } from "cc"
const { ccclass, property } = _decorator

@ccclass("TextBox")
export class TextBox extends Component {
    start() {}

    update(deltaTime: number) {}

    editBegin() {
        this.node.getChildByName("Background").getComponent(Sprite).color =
            Color.WHITE
    }

    editEnd() {
        this.node.getChildByName("Background").getComponent(Sprite).color =
            new Color(153, 153, 153)
    }
}
