<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white p-4 sm:p-8 rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{{ preselectedRoom }} 예약 신청</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">신청자</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
        </div>
        
        <!-- 룸 선택 (전체 탭에서만 보임) -->
        <div v-if="!preselectedRoom" class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">룸 선택</label>
          <select
            v-model="form.room"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            @change="updateTimeOptions"
          >
            <option value="">선택하세요</option>
            <option value="컨트롤룸">컨트롤룸</option>
            <option value="A룸">A룸</option>
            <option value="B룸">B룸</option>
          </select>
        </div>
        
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">날짜</label>
          <input
            v-model="form.date"
            type="date"
            required
            @change="updateTimeOptions"
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
        </div>
        
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">신청 내용</label>
          <select
            v-model="form.content"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option value="">선택하세요</option>
            <option value="녹음">녹음</option>
            <option value="합주">합주</option>
            <option value="촬영">촬영</option>
            <option value="와우산라디오">와우산라디오</option>
            <option value="ETC">ETC</option>
          </select>
        </div>
        
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">시작 시간</label>
          <select
            v-model="form.startTime"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option
              v-for="time in timeOptions"
              :key="time.value"
              :value="time.value"
              :disabled="time.disabled"
              :class="{ 'text-gray-400': time.disabled }"
            >
              {{ time.label }}
            </option>
          </select>
        </div>
        
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 text-sm font-medium">종료 시간</label>
          <select
            v-model="form.endTime"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option
              v-for="time in endTimeOptions"
              :key="time.value"
              :value="time.value"
              :disabled="time.disabled"
              :class="{ 'text-gray-400': time.disabled }"
            >
              {{ time.label }}
            </option>
          </select>
        </div>
        
        <div class="mb-4 sm:mb-6">
          <label class="block mb-1 text-sm font-medium">비밀번호 (삭제용)</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg transition-colors text-sm sm:text-base"
          >
            취소
          </button>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 sm:px-5 rounded-lg transition-colors text-sm sm:text-base"
          >
            신청
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'

export default {
  name: 'ReservationModal',
  props: {
    events: {
      type: Array,
      default: () => []
    },
    preselectedRoom: {
      type: String,
      default: ''
    },
    selectedDateInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      form: {
        name: '',
        date: this.getKSTDate(),
        room: this.preselectedRoom || '',
        content: '',
        startTime: '',
        endTime: '',
        password: ''
      },
      timeOptions: this.generateTimeOptions(),
      endTimeOptions: this.generateTimeOptions()
    }
  },
  watch: {
    preselectedRoom(newRoom) {
      this.form.room = newRoom
      this.updateTimeOptions()
    },
    selectedDateInfo: {
      handler(newDateInfo) {
        console.log('selectedDateInfo changed:', newDateInfo)
        if (newDateInfo) {
          // 선택된 날짜를 폼에 설정
          const selectedDate = moment(newDateInfo.start).format('YYYY-MM-DD')
          this.form.date = selectedDate
          
          // 선택된 시간을 폼에 설정
          const startTime = moment(newDateInfo.start).format('HH:mm')
          const endTime = moment(newDateInfo.end).format('HH:mm')
          this.form.startTime = startTime
          this.form.endTime = endTime
          
          console.log('Auto-filled form:', {
            date: this.form.date,
            startTime: this.form.startTime,
            endTime: this.form.endTime
          })
          
          // 시간 옵션 업데이트
          this.updateTimeOptions()
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.form.room = this.preselectedRoom
    this.updateTimeOptions()
  },
  methods: {
    getKSTDate() {
      // moment를 사용하여 정확한 한국 시간 날짜 반환
      return moment.tz('Asia/Seoul').format('YYYY-MM-DD')
    },
    generateTimeOptions() {
      const options = []
      // 00:00부터 24:00까지 30분 간격으로 옵션 생성
      for (let hour = 0; hour <= 24; hour++) {
        // 24:00만 추가하고 24시의 다른 분은 제외
        if (hour === 24) {
          options.push({
            value: '24:00',
            label: '24:00',
            disabled: false
          })
          continue
        }
        
        for (let min = 0; min < 60; min += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
          options.push({
            value: time,
            label: time,
            disabled: false
          })
        }
      }
      return options
    },
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    },
    updateTimeOptions() {
      if (!this.form.date || !this.form.room) {
        // 날짜나 룸이 선택되지 않았으면 모든 시간을 사용 가능하게 함
        this.timeOptions = this.generateTimeOptions()
        this.endTimeOptions = this.generateTimeOptions()
        return
      }

      const reservedTimes = this.getReservedTimes()
      
      // 시작 시간 옵션 업데이트
      this.timeOptions = this.generateTimeOptions().map(option => ({
        ...option,
        disabled: this.isTimeDisabled(option.value, reservedTimes, 'start')
      }))

      // 종료 시간 옵션 업데이트
      this.endTimeOptions = this.generateTimeOptions().map(option => ({
        ...option,
        disabled: this.isTimeDisabled(option.value, reservedTimes, 'end')
      }))
    },
    getReservedTimes() {
      const reservedTimes = []
      
      this.events.forEach(event => {
        if (event.room === this.form.room) {
          // moment를 사용하여 시간을 한국 시간대로 변환
          const startMoment = moment(event.start).tz('Asia/Seoul')
          const endMoment = moment(event.end).tz('Asia/Seoul')
          
          const eventStartDate = startMoment.format('YYYY-MM-DD')
          const eventEndDate = endMoment.format('YYYY-MM-DD')
          
          console.log('Checking reserved event:', {
            title: event.title,
            utcStart: event.start,
            utcEnd: event.end,
            kstStart: startMoment.format(),
            kstEnd: endMoment.format(),
            eventStartDate,
            eventEndDate,
            selectedDate: this.form.date
          })
          
          // 이벤트가 선택된 날짜와 겹치는지 확인
          if (eventStartDate <= this.form.date && this.form.date <= eventEndDate) {
            let startTime = startMoment.format('HH:mm')
            let endTime = endMoment.format('HH:mm')
            
            // 이벤트가 선택된 날짜 이전에 시작된 경우
            if (eventStartDate < this.form.date) {
              startTime = '00:00'
            }
            
            // 이벤트가 선택된 날짜 이후에 끝나는 경우
            if (eventEndDate > this.form.date) {
              endTime = '24:00'
            } else if (endTime === '00:00' && eventEndDate === this.form.date) {
              endTime = '24:00'
            }
            
            reservedTimes.push({
              start: startTime,
              end: endTime,
              startDate: eventStartDate,
              endDate: eventEndDate
            })
            
            console.log('Added reserved time:', {
              room: this.form.room,
              selectedDate: this.form.date,
              startTime,
              endTime
            })
          }
        }
      })
      
      console.log('Total reserved times for', this.form.room, 'on', this.form.date, ':', reservedTimes)
      return reservedTimes
    },
    isTimeDisabled(time, reservedTimes, type) {
      let isDisabled = false
      
      reservedTimes.forEach(reserved => {
        let timeMinutes = this.timeToMinutes(time)
        let startMinutes = this.timeToMinutes(reserved.start)
        let endMinutes = this.timeToMinutes(reserved.end)
        
        // 다음날 시간대 처리
        const isNextDayTime = time <= '05:30'
        if (isNextDayTime) {
          timeMinutes += 24 * 60
        }
        
        if (type === 'start') {
          if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
            isDisabled = true
          }
        } else {
          if (timeMinutes > startMinutes && timeMinutes <= endMinutes) {
            isDisabled = true
          }
        }
      })
      
      return isDisabled
    },
    handleSubmit() {
      this.$emit('submit', this.form)
    }
  }
}
</script>