<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white p-6 rounded-2xl w-80 shadow-2xl">
      <h2 class="text-xl font-bold mb-4 text-center">관리자 비밀번호 입력</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <input
            v-model="adminPassword"
            type="password"
            required
            placeholder="관리자 비밀번호"
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPasswordModal',
  emits: ['close', 'submit'],
  data() {
    return {
      adminPassword: ''
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', this.adminPassword)
      this.adminPassword = ''
    }
  }
}
</script>