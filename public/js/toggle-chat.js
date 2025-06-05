const button = document.querySelector("#toggleChat")
const searchBox = document.querySelector(".search")
let open = true

button.addEventListener("click", changeOpenState)

function changeOpenState() {
    console.log("hoi")
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