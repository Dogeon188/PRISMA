import { _decorator, Component, director, EditBox, Node } from "cc"

const { ccclass, property } = _decorator

declare const firebase: any

@ccclass("Register")
export class Register extends Component {
    @property({ type: EditBox })
    private email: EditBox = null

    @property({ type: EditBox })
    private username: EditBox = null

    @property({ type: EditBox })
    private password: EditBox = null

    protected navigateToLogin(): void {
        director.loadScene("Login")
    }

    protected register(): void {
        const email = this.email.string
        const password = this.password.string
        const username = this.username.string
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((user) => {
                alert("User created successfully")
                firebase.auth().currentUser.updateProfile({
                    displayName: username,
                })
                console.log(firebase.auth().currentUser.displayName)
            })
            .catch((error) => {
                alert(error.message)
            })
    }
}
