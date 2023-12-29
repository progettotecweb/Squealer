<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';


const user = ref<any>(null)
const id = defineProps(['id'])




user.value = getMyData(id.id)
user.value.then((data: any) => {
    user.value = data
})

</script>


<template>
    <div class="user_profile">
        <p>{{ user.name }}</p>
        <!--post new squils-->
        <!--squils fatti -->
        <!--clicca uno squils per vedere le statistiche -->   
    </div>
</template>

<style>
.user_box {
    background-color: #3e5870;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
    width: 200px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: aliceblue;
}

</style>



