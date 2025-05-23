<script setup lang="ts">
import type { Note } from '@/types';
import { onMounted, ref } from 'vue';

const notes = ref<Note[]>([])

onMounted(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?limit=10')
  const data = await response.json()

  notes.value = data.map((note: any) => {
    return {
      id: note.id,
      title: note.title,
      content: note.body,
      created_at: '2023-10-01',
      updated_at: '2024-05-11',
    }
  }).slice(0, 5)
})
</script>

<template>
  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div v-for="note in notes" :key="note.id" class="bg-sky p-4 flex flex-col gap-3 rounded shadow">
        <h3 class="text-xl font-normal">{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <div>
          <p class="text-gray-500 text-sm">Created at: {{ note.created_at }}</p>
          <p class="text-gray-500 text-sm">Updated at: {{ note.updated_at }}</p>
        </div>
      </div>
    </div>
  </div>
</template>