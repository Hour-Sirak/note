<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String
})

const emit = defineEmits(['update:modelValue'])

const editableElement = ref<HTMLElement | null>(null)

// Initialize content once
onMounted(() => {
  if (!editableElement.value) return
  editableElement.value.innerText = props.modelValue || ''
})

// Emit changes
function onInput() {
  emit('update:modelValue', editableElement.value?.innerText)
}

// If parent updates modelValue, reflect it manually
watch(() => props.modelValue, (newVal) => {
  if (!editableElement.value || !newVal) return

  if (newVal !== editableElement.value.innerText) {
    editableElement.value.innerText = newVal
  }
})

defineExpose({
  element: editableElement
})
</script>

<template>
  <span contenteditable="true" ref="editableElement" @input="onInput" class="outline-none inline-block w-full h-[70%]" :placeholder="placeholder"></span>
</template>
