import {
    Director,
    Scene,
    UIOpacity,
    _decorator,
    director,
    log,
    tween,
} from "cc"
import { GameManager } from "./Game/GameManager"
import { BlackMaskManager } from "./Interface/BlackMaskManager"
export class SceneManager {
    private static _getOrAddOpacity(scene: Scene): UIOpacity {
        const canvas = scene.getChildByName("Canvas")!
        let opacity = canvas.getComponent(UIOpacity)
        if (!opacity) {
            opacity = canvas.addComponent(UIOpacity)
        }
        return opacity
    }

    /**
     * Load a scene with fade-in/out transitions
     *
     * @param sceneName The name of the scene to load
     * @param outDuration The duration of the fade-out transition of the current scene
     * @param inDuration The duration of the fade-in transition to the target scene
     * @param loadDuration The duration of the fade-in/out transition of the loading scene
     */
    static loadScene(
        sceneName: string,
        noLoading: boolean = false,
        outDuration: number = 0.5,
        inDuration: number = 0.5,
        loadDuration: number = 0.2,
    ): void {
        const nextIn: Director.OnSceneLaunched = (_, scene) => {
            BlackMaskManager.fadeOut(inDuration)
            if (!GameManager.inst) {
                const opacity = SceneManager._getOrAddOpacity(scene)
                tween(opacity)
                    .set({ opacity: 0 })
                    .to(inDuration, { opacity: 255 }, { easing: "cubicIn" })
                    .start()
            }
        }

        const loadOut: Director.OnSceneLoaded = (_, __) => {
            const load = () => {
                director.loadScene(sceneName, nextIn)
            }
            BlackMaskManager.fadeIn(loadDuration, load)

            if (!GameManager.inst) {
                const opacity = SceneManager._getOrAddOpacity(
                    director.getScene(),
                )
                tween(opacity)
                    .set({ opacity: 255 })
                    .to(loadDuration, { opacity: 0 }, { easing: "cubicOut" })
                    .start()
            }
        }

        const loadIn: Director.OnSceneLaunched = (_, scene) => {
            const preload = () => {
                director.preloadScene(sceneName, loadOut)
            }
            BlackMaskManager.fadeOut(loadDuration, preload)

            if (!GameManager.inst) {
                const opacity = SceneManager._getOrAddOpacity(scene)
                tween(opacity)
                    .set({ opacity: 0 })
                    .to(loadDuration, { opacity: 255 }, { easing: "cubicIn" })
                    .start()
            }
        }

        if (!GameManager.inst) {
            const prevOpacity = SceneManager._getOrAddOpacity(
                director.getScene(),
            )
            tween(prevOpacity)
                .to(outDuration, { opacity: 0 }, { easing: "cubicOut" })
                .start()
        }

        BlackMaskManager.fadeIn(outDuration, () => {
            if (noLoading) {
                director.loadScene(sceneName, nextIn)
                return
            }
            director.loadScene("Loading", loadIn)
        })
    }
}
