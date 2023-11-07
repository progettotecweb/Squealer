<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';
// import { useFetch } from '/js/fetch.js'

const user = ref<any>(null)
const id = defineProps(['id'])


user.value = getMyData(id.id)
console.log(user.value)

</script>


<template>
    <div>
        <h1>{{ id }}</h1>
        <h1>{{ user }}</h1>
    </div>
</template>

<style></style>