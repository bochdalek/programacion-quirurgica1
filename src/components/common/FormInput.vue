<template>
    <div class="mb-4">
      <label :for="id" class="block mb-1 font-medium text-gray-700">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <input
        :id="id"
        :name="computedName"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2',
          { 
            'border-red-300 focus:ring-red-500': hasError,
            'border-gray-300 focus:ring-blue-500': !hasError,
            'bg-gray-100': disabled
          }
        ]"
      >
      <div v-if="hasError" class="mt-1 text-sm text-red-600">
        {{ errorMessage }}
      </div>
      <div v-if="helpText" class="mt-1 text-sm text-gray-500">
        {{ helpText }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FormInput',
    props: {
      modelValue: {
        type: [String, Number],
        default: ''
      },
      label: {
        type: String,
        required: true
      },
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        default: null
      },
      type: {
        type: String,
        default: 'text',
        validator: value => {
          return ['text', 'email', 'password', 'number', 'tel', 'date'].includes(value);
        }
      },
      placeholder: {
        type: String,
        default: ''
      },
      required: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      helpText: {
        type: String,
        default: ''
      },
      errorMessage: {
        type: String,
        default: ''
      },
      hasError: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      computedName() {
        return this.name || this.id;
      }
    },
    emits: ['update:modelValue']
  }
  </script>