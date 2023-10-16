<script setup lang="ts">

import { onBeforeMount, ref} from 'vue'
// const count = ref(0)



const newSearch = ref('')




function search(){}


const userid = '651fde888a066ec0334dabb3' 
const url = ref("/api/searchUserById?id=" + userid)
const data = ref<any>(null); // specificare il tipo di dato
const error = ref<Error | null>(null); // specificare il tipo di errore

async function fetchUser(){
    fetch(url.value)
        .then((res)=>res.json())// parsing json
        .then((json)=>{     // f(json){data.value = json }
            data.value=json;
            console.log(json)
        })
        .catch((err)=>{
            error.value=err;
            console.log(err)
        })
}


    onBeforeMount(() => {
        fetchUser()
    })

</script>

<template>
    <div >
        <div>
            <h1>{{ data.name }}</h1>
            <form @submit.prevent="search">
                <input v-model="newSearch">
                <button>Search</button>    
            </form>
        </div>


        <div class="d-flex justify-content-around flex-wrap ">    
            <div v-for="account in data.controls"  style="width: 10vh;height: 5vh;" class="card bg-success m-5 mb-5">    
                    <p>{{ account.name }}</p>
            </div>
        </div>
        
        <button @click="fetchUser">fetch</button>
    </div>
</template>


<style ></style>
