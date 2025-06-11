const button = document.querySelector("#toggleChat")
const searchBox = document.querySelector(".search")
let open = true
let state = JSON.parse(localStorage.getItem("chatState"));

if (state) {
    console.log("close de chat!")
    open = false
}

button.addEventListener("click", changeOpenState)

function changeOpenState() {
    if (open === false) {
        searchBox.classList.remove("open")
        button.innerHTML = "bekijk chat"
        open = true
    } else {
        searchBox.classList.add("open")
        button.innerHTML = "verberg chat"
        open = false
    }
}

changeOpenState()