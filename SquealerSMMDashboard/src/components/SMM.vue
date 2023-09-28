<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)

defineProps<{ msg: string }>()


</script>

<template >
   <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
    </p>
    </div>
</template>

<style scoped></style>
