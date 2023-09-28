<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)

defineProps<{ msg: string }>()


</script>

<template>
    <div class="bg-dark h-100">
        <div class="d-flex justify-content-around  h-100">

            <div class="card bg-success align-self-center h-25 w-25">
                ciao {{ msg }}
            </div>

            <div class="card bg-success align-self-center h-25 w-25">
                altre {{ msg }}
            </div>

            <div class="card bg-success align-self-center h-25 w-25">
                altre {{ msg }}
            </div>
                

        </div>
    </div>
</template>

<style ></style>
