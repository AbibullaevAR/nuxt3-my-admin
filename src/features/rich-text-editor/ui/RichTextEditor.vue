<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

interface Props {
  modelValue: string
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Начните вводить описание товара...',
  minHeight: '200px',
  maxHeight: '500px',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary-600 underline' },
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: { class: 'rounded-lg max-w-full' },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    TextStyle,
    Color,
  ],
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML())
  },
})

const isActive = (type: string, attrs?: Record<string, unknown>) =>
  editor.value?.isActive(type, attrs) ?? false

function toggleBold() { editor.value?.chain().focus().toggleBold().run() }
function toggleItalic() { editor.value?.chain().focus().toggleItalic().run() }
function toggleStrike() { editor.value?.chain().focus().toggleStrike().run() }
function toggleCode() { editor.value?.chain().focus().toggleCode().run() }
function toggleBulletList() { editor.value?.chain().focus().toggleBulletList().run() }
function toggleOrderedList() { editor.value?.chain().focus().toggleOrderedList().run() }
function toggleBlockquote() { editor.value?.chain().focus().toggleBlockquote().run() }
function toggleCodeBlock() { editor.value?.chain().focus().toggleCodeBlock().run() }
function setHorizontalRule() { editor.value?.chain().focus().setHorizontalRule().run() }
function undo() { editor.value?.chain().focus().undo().run() }
function redo() { editor.value?.chain().focus().redo().run() }

function setHeading(level: 2 | 3 | 4) {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('URL', previousUrl)

  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function addImage() {
  const url = window.prompt('Image URL')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div
    class="rich-editor"
    :class="{ 'rich-editor--disabled': disabled }"
  >
    <div
      v-if="editor && !disabled"
      class="rich-editor__toolbar"
    >
      <div class="rich-editor__toolbar-group">
        <button
          type="button"
          :class="{ 'is-active': isActive('heading', { level: 2 }) }"
          title="Заголовок 2"
          @click="setHeading(2)"
        >
          H2
        </button>
        <button
          type="button"
          :class="{ 'is-active': isActive('heading', { level: 3 }) }"
          title="Заголовок 3"
          @click="setHeading(3)"
        >
          H3
        </button>
      </div>

      <div class="rich-editor__toolbar-divider" />

      <div class="rich-editor__toolbar-group">
        <button type="button" :class="{ 'is-active': isActive('bold') }" title="Жирный (Ctrl+B)" @click="toggleBold">
          <Icon name="ph:text-b-bold" size="18" />
        </button>
        <button type="button" :class="{ 'is-active': isActive('italic') }" title="Курсив (Ctrl+I)" @click="toggleItalic">
          <Icon name="ph:text-italic" size="18" />
        </button>
        <button type="button" :class="{ 'is-active': isActive('strike') }" title="Зачёркнутый" @click="toggleStrike">
          <Icon name="ph:text-strikethrough" size="18" />
        </button>
        <button type="button" :class="{ 'is-active': isActive('code') }" title="Код" @click="toggleCode">
          <Icon name="ph:code" size="18" />
        </button>
      </div>

      <div class="rich-editor__toolbar-divider" />

      <div class="rich-editor__toolbar-group">
        <button type="button" :class="{ 'is-active': isActive('bulletList') }" title="Список" @click="toggleBulletList">
          <Icon name="ph:list-bullets" size="18" />
        </button>
        <button type="button" :class="{ 'is-active': isActive('orderedList') }" title="Нумерованный список" @click="toggleOrderedList">
          <Icon name="ph:list-numbers" size="18" />
        </button>
        <button type="button" :class="{ 'is-active': isActive('blockquote') }" title="Цитата" @click="toggleBlockquote">
          <Icon name="ph:quotes" size="18" />
        </button>
        <button type="button" title="Код-блок" @click="toggleCodeBlock">
          <Icon name="ph:code-block" size="18" />
        </button>
      </div>

      <div class="rich-editor__toolbar-divider" />

      <div class="rich-editor__toolbar-group">
        <button type="button" :class="{ 'is-active': isActive('link') }" title="Ссылка" @click="setLink">
          <Icon name="ph:link" size="18" />
        </button>
        <button type="button" title="Изображение" @click="addImage">
          <Icon name="ph:image" size="18" />
        </button>
        <button type="button" title="Разделитель" @click="setHorizontalRule">
          <Icon name="ph:minus" size="18" />
        </button>
      </div>

      <div class="rich-editor__toolbar-spacer" />

      <div class="rich-editor__toolbar-group">
        <button type="button" title="Отменить (Ctrl+Z)" :disabled="!editor?.can().undo()" @click="undo">
          <Icon name="ph:arrow-counter-clockwise" size="18" />
        </button>
        <button type="button" title="Повторить (Ctrl+Y)" :disabled="!editor?.can().redo()" @click="redo">
          <Icon name="ph:arrow-clockwise" size="18" />
        </button>
      </div>
    </div>

    <EditorContent
      :editor="editor"
      class="rich-editor__content"
      :style="{
        minHeight: minHeight,
        maxHeight: maxHeight,
      }"
    />

    <div v-if="editor" class="rich-editor__footer">
      <span class="text-xs text-gray-400">
        {{ editor.storage.characterCount?.characters?.() ?? editor.getText().length }} символов
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-editor {
  @apply border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800;

  &--disabled {
    @apply opacity-60 pointer-events-none;
  }

  &__toolbar {
    @apply flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-wrap;

    button {
      @apply p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium;

      &.is-active {
        @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
      }

      &:disabled {
        @apply opacity-30 cursor-not-allowed;
      }
    }
  }

  &__toolbar-group {
    @apply flex items-center gap-0.5;
  }

  &__toolbar-divider {
    @apply w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1;
  }

  &__toolbar-spacer {
    @apply flex-1;
  }

  &__content {
    @apply px-4 py-3 overflow-y-auto;

    :deep(.tiptap) {
      @apply outline-none;

      > * + * {
        margin-top: 0.75em;
      }

      h2 { @apply text-xl font-bold; }
      h3 { @apply text-lg font-semibold; }
      h4 { @apply text-base font-semibold; }
      p { @apply text-sm leading-relaxed; }
      ul { @apply list-disc pl-6; }
      ol { @apply list-decimal pl-6; }
      li { @apply text-sm; }
      blockquote { @apply border-l-4 border-primary-300 pl-4 italic text-gray-600 dark:text-gray-400; }
      code { @apply bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-sm font-mono; }
      pre { @apply bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto; }
      hr { @apply border-gray-200 dark:border-gray-700 my-4; }
      img { @apply rounded-lg max-w-full h-auto; }

      .is-empty::before {
        @apply text-gray-400 dark:text-gray-500;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
    }
  }

  &__footer {
    @apply px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-end;
  }
}
</style>
