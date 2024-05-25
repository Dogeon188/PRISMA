import { _decorator, Color, Component, Node, Sprite } from "cc"
const { ccclass, property } = _decorator

@ccclass("TextBox")
export class TextBox extends Component {
    protected editBegin(): void {
        this.node.getChildByName("Background").getComponent(Sprite).color =
            Color.WHITE
    }

    protected editEnd(): void {
        this.node.getChildByName("Background").getComponent(Sprite).color =
            new Color(153, 153, 153)
    }
}
