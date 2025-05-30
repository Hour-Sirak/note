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

// search
const searchQuery = ref('')
const filterOption = ref<'today' | 'yesterday' | 'thisWeek' | 'old' | ''>('')
const sortOption = ref<'newest' | 'oldest' | 'titleAsc' | 'titleDesc'>('newest')

const filteredNotes = computed(() => {

  // apply search
  const query = searchQuery.value.toLowerCase()
  let filtered = notes.value
  if (query) {
    filtered = filtered.filter(note =>
      note?.title.toLowerCase().includes(query) ||
      note?.content?.toLowerCase().includes(query)
    )
  }

  // apply filter
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterdayStart = new Date(today)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - today.getDay()) // Sunday start

  if (filterOption.value) {
    filtered = filtered.filter(note => {
      const updatedAt = note?.updatedAt || '0'
      const updatedDate = new Date(updatedAt)

      if (filterOption.value === 'today') {
        return updatedDate >= today
      } else if (filterOption.value === 'yesterday') {
        return updatedDate >= yesterdayStart && updatedDate < today
      } else if (filterOption.value === 'thisWeek') {
        return updatedDate >= weekStart
      } else if (filterOption.value === 'old') {
        return updatedDate < weekStart
      }
      return true
    })
  }

  // Sorting
  filtered.sort((a, b) => {
    if (!a || !b) return 0;

    if (sortOption.value === 'titleAsc') {
      return a.title.localeCompare(b.title)
    } else if (sortOption.value === 'titleDesc') {
      return b.title.localeCompare(a.title)
    } else if (sortOption.value === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortOption.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })
  return filtered
})

function reset() {
  searchQuery.value = ''
  filterOption.value = ''
  sortOption.value = 'newest'
}

</script>

<template>
  <div class="mt-4">
    <div class="flex flex-wrap sm:flex-nowrap gap-2 mb-4 min-w-80">
      <div class="flex items-center gap-5 mr-10">
        <!-- add new note button -->
        <button type="button" class="hover:cursor-pointer"
          @click="!notes.includes(null) ? notes = [null, ...notes] : null">
          <i class="fa-regular fa-square-plus text-3xl text-pink-500"></i>
        </button>
        <!-- count -->
        <p class="text-gray-400 font-bold text-xl"><i class="fa-solid fa-hashtag"></i> {{ filteredNotes.length }} </p>
      </div>

      <div class="flex-1 min-w-30 max-w-40 ml-auto">
        <label for="voice-search" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <i class="fa-regular fa-note-sticky text-gray-500"></i>
          </div>
          <!-- search bar -->
          <input v-model="searchQuery" type="text"
            class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full ps-10 p-2.5 focus-visible:outline-gray-300"
            placeholder="Search notes..." required />
        </div>
      </div>
      <div class="flex-1 sm:flex-0 flex items-center gap-2 text-gray-500">

        <!-- filter by updatedAt -->
        <select v-model="filterOption"
          class="flex-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus-visible:outline-gray-300">
          <option value="">Last modified</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="old">Old</option>
        </select>

        <!-- sort options -->
        <select v-model="sortOption"
          class="flex-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus-visible:outline-gray-300">
          <option value="newest">Newest Created</option>
          <option value="oldest">Oldest Created</option>
          <option value="titleAsc">Title A → Z</option>
          <option value="titleDesc">Title Z → A</option>
        </select>

        <button type="button" class="button p-2 text-pink-600" @click="reset">Reset</button>
      </div>

    </div>
    <div class="flex flex-col gap-4">
      <div v-for="note in filteredNotes" :key="note?.id" class="grid rounded shadow relative min-w-[max-content]">
        <Todo :note="note" @delete="deleteNote(note?.id)" @save="saveNote" @update="updateNote" />
      </div>
    </div>
  </div>
</template>