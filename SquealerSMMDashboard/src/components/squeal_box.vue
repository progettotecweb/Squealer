<script setup lang="ts">
//import { ref } from 'vue'



//const user = ref<any>(null)
const id = defineProps(['id', 'content'])
//define user_id, it will be shared with the father



</script>


<template>
    <p> post text: {{ id.content}}</p>
</template>

<style>

</style>



