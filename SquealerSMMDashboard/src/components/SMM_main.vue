<script setup lang="ts">
import { ref } from 'vue'
// const count = ref(0)


let id = 0
const newAccount = ref('')
const followed_accounts = ref([{id: id++, text: 'pippo'}])

function addAccount() {
    followed_accounts.value.push({ id: id++ , text: newAccount.value})
    newAccount.value = ''
}

function removeAccount(id: {}){
    followed_accounts.value = followed_accounts.value.filter( (account) => account !== id)
}

function getUser() {
    fetch("/api/search")
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
}


</script>

<template>
    <div >
        <div>
            <form @submit.prevent="addAccount">
                <input v-model="newAccount">
                <button>Add account</button>    
            </form>
        </div>
        <div class="d-flex justify-content-around flex-wrap ">    
            <div v-for="account in followed_accounts" :key="account.id" style="width: 20vh;height: 30vh;text-overflow: ellipsis;" class="card bg-success m-5 mb-5">    
                    <button type="button" class="btn-close" aria-label="Close" @click="removeAccount(account)"></button>
                    <p>{{ account.text }}</p>
            </div>

        </div>
        <button @click="getUser">Get user</button>
    </div>
</template>


<style ></style>
