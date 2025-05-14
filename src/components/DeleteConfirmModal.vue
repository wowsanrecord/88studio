<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white p-6 rounded-2xl w-80 shadow-2xl">
      <h2 class="text-xl font-bold mb-4 text-center">예약 삭제</h2>
      <p class="text-center mb-4 text-gray-600">정말로 이 예약을 삭제하시겠습니까?</p>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          취소
        </button>
        <button
          @click="$emit('confirm')"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteConfirmModal',
  emits: ['close', 'confirm']
}
</script>