<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import EditableDiv from './EditableDiv.vue';
import type { Note } from '@/types';
import { computed } from '@vue/reactivity';


const props = defineProps<{
  note?: Note | null
}>();

const title = ref(props.note?.title);
const content = ref(props.note?.content);

const contentEditable = useTemplateRef('contentEditable');

const emit = defineEmits(['save', 'update', 'delete']);
const isSubmitting = ref(false);
const isDeleting = ref(false);

const formChanged = computed(() => {
  if(!props.note) {
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
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title.value, body: content.value, userId: 1 }),
    });
    const data = await response.json();
    emit('save', {
      id: data.id,
      title: data.title,
      content: data.body,
      created_at: '2023-10-01',
      updated_at: '2024-05-11',
    });
  } catch (error) {
    console.error('Error creating note:', error)
  }
};

async function updateNote() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      method: 'PATCH',
      body: JSON.stringify({
        title: title.value,
        body: content.value,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    const data = await response.json();
    emit('update', {
      id: props.note?.id,
      title: data.title,
      content: data.body,
      created_at: '2023-10-01',
      updated_at: new Date().toISOString().slice(0, 10)
    });
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
    await updateNote();
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
    await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    });
    emit('delete', id);
  } catch (error) {
    console.error('Error deleting note:', error)
  }

  isDeleting.value = false;
}

</script>

<template>
  <div class="flex flex-col gap-5 justify-between h-full p-4 relative">
    <form @submit.prevent="handleSubmit" class="h-full">
      <!-- title -->
      <input v-model="title" @keydown.enter.prevent="contentEditable?.element?.focus()"
        class="text-xl font-medium outline-none mb-2 w-full" placeholder="Title" />
      <!-- content -->
      <EditableDiv ref="contentEditable" v-model="content" placeholder="take a note..." />
    </form>

    <!-- dates -->
    <div v-if="note">
      <p class="text-gray-500 text-sm">Created at: {{ note.created_at }}</p>
      <p class="text-gray-500 text-sm">Updated at: {{ note.updated_at }}</p>
    </div>

    <!-- save button -->
    <button v-if="formChanged" type="button" class="button absolute bottom-4 right-11 text-pink-500" @click="handleSubmit"
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
    <button type="button" class="button absolute bottom-4 right-3 text-pink-500" @click="handleDelete(note?.id)">
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
</template>