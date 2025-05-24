<script setup lang="ts">
import type { Note } from '@/types';
import { onMounted, ref } from 'vue';
import Todo from './Todo.vue';

const notes = ref<(Note | null)[]>([])

onMounted(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
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

async function deleteNote(id?: String) {
  // If no id is provided, it means we are removing the null note from local state
  if (!id) {
    notes.value = notes.value.filter(note => note !== null)
    return
  }

  notes.value = notes.value.filter(note => note?.id !== id)
}

async function saveNote(note: Note) {
  console.log('new note', note)
  try {
    deleteNote() // remove the null note
    notes.value = [note, ...notes.value]
  } catch (error) {
    console.error('Error creating note:', error)
  }
}
</script>

<template>
  <div class="mt-4">
    <button type="button" class="hover:cursor-pointer" @click="!notes.includes(null) ? notes = [null, ...notes] : null">
      <i class="fa-regular fa-square-plus text-2xl text-pink-500"></i>
    </button>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="note in notes" :key="note?.id" class="rounded shadow min-h-40">
        <!-- <Todo v-if="note" :note="note" />
        <Todo v-else /> -->
        <Todo :note="note" @delete="deleteNote(note?.id)" @save="saveNote" />
      </div>
    </div>
  </div>
</template>