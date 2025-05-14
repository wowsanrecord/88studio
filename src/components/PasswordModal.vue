<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white p-6 rounded-2xl w-96 shadow-2xl">
      <h2 class="text-xl font-bold mb-4 text-center">예약 정보</h2>
      
      <!-- 예약 정보 표시 -->
      <div class="mb-6 space-y-3">
        <div>
          <span class="font-medium text-gray-700">신청자: </span>
          <span class="text-gray-900">{{ eventInfo.name }}</span>
        </div>
        
        <div>
          <span class="font-medium text-gray-700">룸: </span>
          <span class="text-gray-900">{{ eventInfo.room }}</span>
        </div>
        
        <div>
          <span class="font-medium text-gray-700">내용: </span>
          <span class="text-gray-900">{{ eventInfo.content }}</span>
        </div>
        
        <div>
          <span class="font-medium text-gray-700">일시: </span>
          <span class="text-gray-900">{{ formatEventDate() }}</span>
        </div>
        
        <div>
          <span class="font-medium text-gray-700">시간: </span>
          <span class="text-gray-900">{{ formatEventTime() }}</span>
        </div>
      </div>
      
      <!-- 삭제 섹션 -->
      <div class="border-t pt-4">
        <p class="text-sm text-gray-600 mb-3">삭제하시려면 비밀번호를 입력해주세요</p>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <input
              v-model="password"
              type="password"
              required
              placeholder="비밀번호"
              class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              삭제
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'

export default {
  name: 'PasswordModal',
  props: {
    currentEvent: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      password: ''
    }
  },
  computed: {
    eventInfo() {
      console.log('PasswordModal - currentEvent:', this.currentEvent)
      
      if (!this.currentEvent) {
        console.log('PasswordModal - currentEvent is null/undefined')
        return {
          name: '',
          room: '',
          content: '',
          start: null,
          end: null,
          title: ''
        }
      }
      
      console.log('PasswordModal - extendedProps:', this.currentEvent.extendedProps)
      
      return {
        name: this.currentEvent.extendedProps?.name || '',
        room: this.currentEvent.extendedProps?.room || '',
        content: this.currentEvent.extendedProps?.content || '',
        start: this.currentEvent.start,
        end: this.currentEvent.end,
        title: this.currentEvent.title
      }
    }
  },
  methods: {
    formatEventDate() {
      if (!this.eventInfo.start) return '날짜 정보 없음'
      return moment(this.eventInfo.start).format('YYYY년 MM월 DD일 (ddd)')
    },
    formatEventTime() {
      if (!this.eventInfo.start || !this.eventInfo.end) return '시간 정보 없음'
      const startTime = moment(this.eventInfo.start).format('HH:mm')
      const endTime = moment(this.eventInfo.end).format('HH:mm')
      return `${startTime} - ${endTime}`
    },
    handleSubmit() {
      this.$emit('submit', this.password)
      this.password = ''
    }
  }
}
</script>