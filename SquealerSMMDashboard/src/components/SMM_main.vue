<script setup lang="ts">
import { onBeforeMount, ref, toValue} from 'vue'
// const count = ref(0)


const newSearch = ref('')
const accounts = ref([])

function search(){}


async function fetchUser(){
    accounts.value = []
    const res = await fetch("/api/search")
    accounts.value = await res.json()
    


    console.log(accounts.value)
    console.log(accounts)

    const unwrapped =  toValue(accounts)
    console.log(unwrapped)
    console.log(unwrapped.values)

        
}


    onBeforeMount(() => {
        fetchUser()
    })


</script>

<template>
    <div >
        <div>
            <form @submit.prevent="search">
                <input v-model="newSearch">
                <button>Search</button>    
            </form>
        </div>


        <div class="d-flex justify-content-around flex-wrap ">    
            <div v-for="account in accounts"  style="width: 10vh;height: 5vh;" class="card bg-success m-5 mb-5">    
                    <p>{{ account }}</p>
            </div>
        </div>
        
        <button @click="fetchUser">fetch</button>
    </div>
</template>


<style ></style>
