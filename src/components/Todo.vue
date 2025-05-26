<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import EditableDiv from './EditableDiv.vue';
import type { Note } from '@/types';
import { computed } from '@vue/reactivity';
import config from '@/config';
import { timeAgo } from '@/utils';


const props = defineProps<{
  note?: Note | null
}>();

const title = ref(props.note?.title);
const content = ref(props.note?.content);

// toggle detail view
const showDetail = ref(false);
const contentEditable = useTemplateRef('contentEditable');

const emit = defineEmits(['save', 'update', 'delete']);
const isSubmitting = ref(false);
const isDeleting = ref(false);

const formChanged = computed(() => {
  if (!props.note) {
    return true;
  }
  return title.value !== props.note?.title || content.value !== props.note?.content;
});

function validateForm() {
  if (!title.value) {
    alert('Title cannot be empty');
    return false;
  }
  return true;
}

async function createNote() {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title.value, content: content.value }),
    });
    const data = await response.json();
    emit('save', data);
  } catch (error) {
    console.error('Error creating note:', error)
  }
};

async function updateNote(id: string) {
  try {
    const response = await fetch(`${config.apiUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: title.value,
        content: content.value,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    const data = await response.json();
    emit('update', data);
  }
  catch (error) {
    console.error('Error updating note:', error);
  }
};

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  if (props.note) {
    await updateNote(props.note.id);
  } else {
    await createNote();
  }

  isSubmitting.value = false;
};

async function handleDelete(id?: String) {
  // If no id is provided, it means we are removing the null note from local state (no api call)

  if (id) {
    const confirmToDelete = window.confirm('Are you sure you want to delete this note?')
    if (!confirmToDelete) return
  }

  isDeleting.value = true;

  if (!id) {
    emit('delete');
    isDeleting.value = false;
    return
  }

  try {
    await fetch(`${config.apiUrl}/${id}`, {
      method: 'DELETE',
    });
    emit('delete', id);
  } catch (error) {
    console.error('Error deleting note:', error)
  }

  isDeleting.value = false;
}

let intervalId: number;

const updatedAgo = ref(timeAgo(props.note?.updatedAt));

// watch for changes in note's updatedAt property to update the time ago text
watch(() => props.note?.updatedAt, (newVal) => {
  if (newVal) {
    updatedAgo.value = timeAgo(newVal);
  }
}, { immediate: true });

// set up an interval to update the time ago text every minute
onMounted(() => {
  intervalId = setInterval(() => {
    if (props.note) updatedAgo.value = timeAgo(props.note.updatedAt)
  }, 60000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

</script>

<template>
  <button v-if="showDetail" @click.stop="showDetail = false"
    class="z-1 absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] button rounded-full grid place-items-center size-6 text-xs p-0">
    <i class="fa-solid fa-caret-down"></i>
  </button>
  <div class="flex flex-col gap-5 justify-between h-full p-4 relative" @click="showDetail = true"
    @focusin="showDetail = true">
    <form @submit.prevent="handleSubmit" class="h-full">
      <div class="flex gap-2 items-center">
        <!-- title -->
        <input v-model="title" @keydown.enter.prevent="contentEditable?.element?.focus()"
          class="text-xl font-medium outline-none mb-2 flex-1" placeholder="Title" />

        <!-- createdAt -->
        <p v-if="note" class="text-gray-600 text-sm">{{ note.createdAt }} <i class="fa-regular fa-calendar-plus"></i>
        </p>
      </div>
      <!-- content -->
      <EditableDiv v-if="showDetail" ref="contentEditable" v-model="content" placeholder="take a note..." />
    </form>

    <div class="flex items-center">

      <!-- updatedAt -->
      <small v-if="showDetail && note && note.updatedAt" class="text-gray-400">Edited {{ updatedAgo }}</small>

      <div class="ml-auto flex gap-2">
        <!-- save button -->
        <button v-if="formChanged" type="button" class="button text-pink-500" @click="handleSubmit" @focusin.stop=""
          :disabled="isSubmitting">
          <svg v-if="isSubmitting" class="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <i v-else class="fa-solid fa-check"></i>
        </button>

        <!-- delete button -->
        <button type="button" class="button text-pink-500" @click.stop="handleDelete(note?.id)" @focusin.stop="">
          <svg v-if="isDeleting" class="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <i v-else class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>

  </div>
</template>