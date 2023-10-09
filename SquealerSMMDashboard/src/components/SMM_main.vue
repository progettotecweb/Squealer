<script setup lang="ts">
import { ref } from 'vue'
// const count = ref(0)


let id = 0
const newAccount = ref('')
const followed_accounts = ref([{id: id++, text: 'ciao'}])

function addAccount() {
    followed_accounts.value.push({ id: id++ , text: newAccount.value})
    newAccount.value = ''
}

function removeAccount(id: {}){
    followed_accounts.value = followed_accounts.value.filter( (account) => account !== id)
}

function getUser() {
    fetch("/Home/api/user")
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
        <div v-for="account in followed_accounts" :key="account.id">
            <div class="card bg-success h-25 w-25">
                {{ account.text }}
                <button class="exit-button" @click="removeAccount(account)">X</button>
            </div> 

        </div>
        <button @click="getUser">Get user</button>
    </div>
</template>

<style ></style>
