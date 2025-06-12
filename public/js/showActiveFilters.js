import { toggleBookmarks } from "./script.js"

// Stap 1: Zoekformulieren updaten bij verandering
document.querySelector('.searchFilter').addEventListener('change', (e) => {
    const formState = new FormData(e.currentTarget)
    const searchParams = (new URLSearchParams(formState)).toString()
    const newUrl = window.location.pathname + '?' + searchParams
    history.replaceState(null, '', newUrl)

    fetch(newUrl)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')

            const resultsList = doc.querySelector('#resultsAndFilters')
            document.querySelector('#resultsAndFilters').replaceWith(resultsList)
            toggleBookmarks()
        })
})

// Stap 2: Event delegation voor #activeFilters → checkbox deselectie in .searchFilter
document.body.addEventListener('change', (e) => {
    if (e.target.closest('#activeFilters')) {
        const name = e.target.name
        const value = e.target.value
        const checkBox = document.querySelector(`.searchFilter [name="${name}"][value="${value}"]`)
        if (checkBox) {
            checkBox.checked = false
            const event = new Event('change', { bubbles: true })
            checkBox.dispatchEvent(event)
        }
    }
})