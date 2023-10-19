// fetch.js
import { ref } from 'vue'

export function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    fetch(url)
        .then((res) => res.json())
        .then((json) => (data.value = json))
        .catch((err) => (data.value = err))


    return {data}
}

export function idFetch(url) {
    const data = ref(null)
    const error = ref(null)

    fetch(url)
        .then((res) => res.json())
        .then((json) => (data.value = json.id))
        .catch((err) => (data.value = err))


    return { data }
}