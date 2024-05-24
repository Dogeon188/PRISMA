import { Director, Scene, UIOpacity, _decorator, director, tween } from "cc"

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
        outDuration: number = 0.5,
        inDuration: number = 0.5,
        loadDuration: number = 0.2,
    ): void {
        const nextIn: Director.OnSceneLaunched = (_, scene) => {
            const opacity = SceneManager._getOrAddOpacity(scene)
            tween(opacity)
                .set({ opacity: 0 })
                .to(inDuration, { opacity: 255 }, { easing: "cubicIn" })
                .start()
        }

        const loadOut: Director.OnSceneLoaded = (_, __) => {
            const opacity = SceneManager._getOrAddOpacity(director.getScene())

            tween(opacity)
                .set({ opacity: 255 })
                .to(loadDuration, { opacity: 0 }, { easing: "cubicOut" })
                .call(() => director.loadScene(sceneName, nextIn))
                .start()
        }

        const loadIn: Director.OnSceneLaunched = (_, scene) => {
            const opacity = SceneManager._getOrAddOpacity(scene)

            tween(opacity)
                .set({ opacity: 0 })
                .to(loadDuration, { opacity: 255 }, { easing: "cubicIn" })
                .call(() => director.preloadScene(sceneName, loadOut))
                .start()
        }

        const prevOpacity = SceneManager._getOrAddOpacity(director.getScene())

        tween(prevOpacity)
            .to(outDuration, { opacity: 0 }, { easing: "cubicOut" })
            .call(() => director.loadScene("Loading", loadIn))
            .start()
    }
}
