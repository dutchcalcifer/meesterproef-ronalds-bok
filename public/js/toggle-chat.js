const button = document.querySelector("#toggleChat")
const searchBox = document.querySelector(":has(> .chat-box)")
let open = false

button.addEventListener("click", () => {
    console.log("click")
    if (open == true) {
        searchBox.classList.remove("open")
        open = false
    } else {
        searchBox.classList.add("open")
        open = true
    }
})