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
  if (!id) {
    notes.value = notes.value.filter(note => note !== null)
    return
  }
  notes.value = notes.value.filter(note => note?.id !== id)
}

async function saveNote(note: Note) {
  deleteNote() // remove the null note
  notes.value = [note, ...notes.value]
}

async function updateNote(note: Note) {
  const idx = notes.value.findIndex(n => n?.id === note.id)
  notes.value[idx] = note
}
</script>

<template>
  <div class="mt-4">
    <button type="button" class="hover:cursor-pointer" @click="!notes.includes(null) ? notes = [null, ...notes] : null">
      <i class="fa-regular fa-square-plus text-2xl text-pink-500"></i>
    </button>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="note in notes" :key="note?.id" class="rounded shadow min-h-40">
        <Todo :note="note" @delete="deleteNote(note?.id)" @save="saveNote" @update="updateNote"/>
      </div>
    </div>
  </div>
</template>