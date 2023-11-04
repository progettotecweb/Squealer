// fetch.js
import { ref } from 'vue'



export function useFetch(url: string) {
    const data = ref(null)

    fetch(url)
        .then((res) => res.json())
        .then((json) => (data.value = json))
        .catch((err) => (data.value = err))
    return { data }
}

export function idFetch(url: string) {
    const data = ref(null)

    fetch(url)
        .then((res) => res.json())
        .then((json) => (data.value = json.id))
        .catch((err) => (data.value = err))
    return { data }
}