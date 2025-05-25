<script setup lang="ts">
import type { Note } from '@/types';
import { computed, onMounted, ref } from 'vue';
import Todo from './Todo.vue';
import config from '@/config';


const notes = ref<(Note | null)[]>([])

onMounted(async () => {
  const response = await fetch(config.apiUrl)
  const data = await response.json()

  notes.value = data
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
    <div class="flex items-center justify-between mb-4">
      <button type="button" class="hover:cursor-pointer"
        @click="!notes.includes(null) ? notes = [null, ...notes] : null">
        <i class="fa-regular fa-square-plus text-3xl text-pink-500"></i>
      </button>

      <form class="flex items-center max-w-lg">
        <label for="voice-search" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <i class="text-gray-500 fa-regular fa-note-sticky"></i>
          </div>
          <input type="text"
            class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full ps-10 p-2.5 focus-visible:outline-gray-300"
            placeholder="Search notes..." required />
        </div>
      </form>

    </div>
    <div class="flex flex-col gap-4">
      <div v-for="note in notes" :key="note?.id" class="grid rounded shadow relative">
        <Todo :note="note" @delete="deleteNote(note?.id)" @save="saveNote" @update="updateNote" />
      </div>
    </div>
  </div>
</template>