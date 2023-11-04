<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
// import { useFetch } from '/js/fetch.js'

const user = ref<any>(null)
defineProps(['id'])


// user.value = useFetch("/api/searchUserById?id=" + id)

onBeforeMount(() => {
    user.value = 'ciao'

})

</script>


<template>
    <h1>{{ id }}</h1>
</template>

<style></style>