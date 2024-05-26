import { _decorator, Component, Sprite, tween, UIOpacity } from "cc"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("Splash")
export class Splash extends Component {
    @property(Sprite)
    private logo: Sprite = null

    start() {
        const logoOpacity = this.logo.node.getComponent(UIOpacity)!

        tween(logoOpacity)
            .set({ opacity: 0 })
            .delay(0.5)
            .to(1, { opacity: 255 }, { easing: "sineIn" })
            .delay(2)
            .to(1, { opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                SceneManager.loadScene("Register", true)
            })
            .start()
    }

    update(deltaTime: number) {}
}
