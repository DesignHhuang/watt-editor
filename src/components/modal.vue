<template>
  <t-dialog
    :visible="visible"
    attach="body"
    :prevent-scroll-through="false"
    placement="center"
    draggable
    destroy-on-close
    v-bind="$attrs"
  >
    <template #header>
      <icon v-if="$attrs.icon" :name="$attrs.icon" />
      <span>{{ $attrs.header }}</span>
    </template>
    <slot />
  </t-dialog>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
</script>
