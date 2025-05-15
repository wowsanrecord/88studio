<template>
  <div class="studio-reservation">
    <!-- Message Container -->
    <div id="messageContainer" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-90">
      <div
        v-if="message.text"
        :class="[
          'message px-5 py-3 rounded-lg text-white font-bold shadow-lg transition-all duration-300',
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        {{ message.text }}
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col items-center mb-4 sm:mb-8 pt-4 sm:pt-8">
      <h1 class="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">88 Studio Reservation</h1>
      
      <!-- 룸 선택 탭 -->
      <div class="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6 px-2 w-full">
        <button
          v-for="room in rooms"
          :key="room"
          @click="selectRoom(room)"
          :class="[
            'px-3 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none',
            selectedRoom === room
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ room }}
        </button>
      </div>
    </div>

    <!-- Admin Button -->
    <button
      @click="toggleAdminMode"
      :class="[
        'fixed top-2 sm:top-5 right-2 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition-colors z-40',
        isAdminMode ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500'
      ]"
      :title="isAdminMode ? '관리자 모드 비활성화' : '관리자 모드 활성화'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm-2 5V6a2 2 0 114 0v1H8z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Calendar -->
    <div class="max-w-7xl mx-auto bg-white p-2 sm:p-8 rounded-2xl shadow-lg">
      <FullCalendar
        ref="fullCalendarRef"
        :options="calendarOptions"
      />
    </div>

    <!-- Mobile Time Selection Button -->
    <button
      v-if="isMobileView"
      @click="openMobileTimeSelection"
      class="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>

    <!-- Modals -->
    <ReservationModal
      v-if="showReservationModal"
      @close="closeReservationModal"
      @submit="handleReservationSubmit"
      :events="events"
      :preselectedRoom="selectedRoom === '전체' ? '' : selectedRoom"
      :selectedDateInfo="selectedDateInfo"
    />

    <PasswordModal
      v-if="showPasswordModal"
      @close="closePasswordModal"
      @submit="handlePasswordSubmit"
      :currentEvent="currentEvent"
    />

    <AdminPasswordModal
      v-if="showAdminPasswordModal"
      @close="closeAdminPasswordModal"
      @submit="handleAdminPasswordSubmit"
    />

    <DeleteConfirmModal
      v-if="showDeleteConfirmModal"
      @close="closeDeleteConfirmModal"
      @confirm="confirmDeleteEvent"
    />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from '../api/axios'
import moment from 'moment-timezone'
import ReservationModal from './ReservationModal.vue'
import PasswordModal from './PasswordModal.vue'
import AdminPasswordModal from './AdminPasswordModal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'

export default {
  name: 'StudioReservation',
  components: {
    FullCalendar,
    ReservationModal,
    PasswordModal,
    AdminPasswordModal,
    DeleteConfirmModal
  },
  data() {
    return {
      showReservationModal: false,
      showPasswordModal: false,
      showAdminPasswordModal: false,
      showDeleteConfirmModal: false,
      isAdminMode: false,
      currentEvent: null,
      events: [],
      filteredEvents: [],
      selectedRoom: '전체',
      rooms: ['전체', '컨트롤룸', 'A룸', 'B룸'],
      selectedDateInfo: null,
      message: {
        text: '',
        type: 'success'
      },
      isMobileView: window.innerWidth < 640,
      lastViewType: null
    }
  },
  computed: {
    calendarOptions() {
      const vm = this;
      const isMobile = window.innerWidth < 640;
      
      // 현재 날짜의 해당 주 일요일을 구하는 함수
      const getThisWeekSunday = () => {
        const today = new Date();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay());
        return sunday;
      };
      
      // 현재 시간을 HH:mm:ss 형식으로 반환하는 함수
      const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}:00`;
      };
      
      return {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: isMobile ? 'timeGridThreeDay' : 'timeGridWeek',
        defaultView: isMobile ? 'timeGridThreeDay' : 'timeGridWeek',
        initialDate: isMobile ? new Date() : getThisWeekSunday(),
        scrollTime: getCurrentTime(),
        scrollTimeReset: true,
        firstDay: 0, // 0은 일요일
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: isMobile ? 'timeGridDay,customWeek,dayGridMonth' : 'customDay,customWeek,dayGridMonth'
        },
        customButtons: {
          customWeek: {
            text: '주간',
            click: () => {
              const calendarApi = vm.$refs.fullCalendarRef.getApi();
              if (vm.isMobileView) {
                calendarApi.changeView('timeGridThreeDay');
                calendarApi.today();
              } else {
                calendarApi.changeView('timeGridWeek');
                // 현재 선택된 날짜의 해당 주 일요일로 이동
                const currentDate = calendarApi.getDate();
                const sunday = new Date(currentDate);
                sunday.setDate(currentDate.getDate() - currentDate.getDay());
                calendarApi.gotoDate(sunday);
              }
            }
          },
          customDay: {
            text: '일간',
            click: () => {
              const calendarApi = vm.$refs.fullCalendarRef.getApi();
              calendarApi.changeView('timeGridDay');
              calendarApi.today();
            }
          }
        },
        views: {
          timeGridWeek: {
            type: 'timeGrid',
            duration: { days: 7 },
            buttonText: '주간'
          },
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3일',
            visibleRange: function() {
              const start = new Date();
              const end = new Date(start);
              end.setDate(start.getDate() + 2);
              return { start, end };
            }
          },
          timeGridDay: {
            buttonText: '일간'
          },
          dayGridMonth: {
            buttonText: '월간'
          }
        },
        locale: 'ko',
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        editable: false,
        events: this.filteredEvents,
        height: isMobile ? '100%' : 'auto',
        aspectRatio: isMobile ? 0.5 : 1.35,
        allDaySlot: false,
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        slotDuration: '00:30:00',
        timeZone: 'local',
        longPressDelay: 100,
        selectLongPressDelay: 100,
        eventLongPressDelay: 100,
        selectMinDistance: 0,
        unselectAuto: false,
        selectOverlap: false,
        nowIndicator: true,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        displayEventTime: true,
        displayEventEnd: true,
        eventDisplay: 'block',
        slotEventOverlap: false,
        dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric' },
        selectConstraint: {
          startTime: '00:00',
          endTime: '24:00'
        },
        selectAllow: () => true,
        select: (selectInfo) => {
          console.log('=== Date selected via calendarOptions ===');
          console.log('selectInfo:', selectInfo);
          console.log('Current selected room:', vm.selectedRoom);
          
          // 선택된 시간이 undefined인 경우 처리
          if (!selectInfo.start || !selectInfo.end) {
            console.error('Invalid selection: start or end time is undefined');
            return;
          }
          
          vm.selectedDateInfo = {
            start: selectInfo.start,
            end: selectInfo.end,
            startStr: selectInfo.startStr,
            endStr: selectInfo.endStr
          };
          
          console.log('Selected time info stored:', vm.selectedDateInfo);
          vm.openReservationModal();
        },
        eventContent: function(arg) {
          // 임시 선택 이벤트인 경우 빈 내용 반환
          if (arg.event.display === 'background' || arg.event.title === undefined) {
            return { html: '' };
          }
          
          const view = arg.view.type;
          const startTime = moment(arg.event.start).format('HH:mm');
          const endTime = moment(arg.event.end).format('HH:mm');
          const name = arg.event.extendedProps.name;
          const content = arg.event.extendedProps.content;
          
          if (view === 'dayGridMonth') {
            return {
              html: `<div class="text-xs">${startTime}-${endTime} ${name}</div>`
            };
          } else if (view === 'timeGridDay') {
            return {
              html: `<div class="text-sm font-medium">${startTime}-${endTime} ${name}(${content})</div>`
            };
          } else {
            // timeGridWeek
            return {
              html: `<div class="text-sm font-medium">${name}</div>`
            };
          }
        },
        eventClick: function(clickInfo) {
          console.log('Event clicked via calendarOptions');
          vm.handleEventClick(clickInfo);
        },
        eventDidMount: function(info) {
          console.log('Event mounted:', {
            title: info.event.title,
            start: info.event.start?.toISOString(),
            end: info.event.end?.toISOString()
          });
        },
        viewDidMount: function(info) {
          console.log('View changed to:', info.view.type);
        },
        eventsSet: function(events) {
          console.log('Events set in calendar:', events.length);
        },
        datesSet: function(dateInfo) {
          // 일간 보기로 처음 전환될 때만 오늘 날짜로 이동
          if (dateInfo.view.type === 'timeGridDay' && 
              !vm.lastViewType && // 이전 뷰 타입이 없는 경우에만 (첫 전환 시)
              dateInfo.view.currentStart.toDateString() !== new Date().toDateString()) {
            setTimeout(() => {
              const calendarApi = vm.$refs.fullCalendarRef.getApi();
              calendarApi.today();
            }, 0);
          }
          // 현재 뷰 타입 저장
          vm.lastViewType = dateInfo.view.type;
          
          // 스크롤 위치 조정
          setTimeout(() => {
            const scrollContainer = document.querySelector('.fc-scroller-liquid-absolute');
            if (scrollContainer) {
              const currentHour = new Date().getHours();
              const hourHeight = scrollContainer.scrollHeight / 24;
              scrollContainer.scrollTop = hourHeight * currentHour - (scrollContainer.clientHeight / 2);
            }
          }, 100);
        },
        handleWindowResize: true,
        expandRows: true,
      }
    }
  },
  watch: {
    filteredEvents() {
      this.updateCalendarEvents();
    }
  },
  mounted() {
    this.loadReservations();
    window.addEventListener('resize', this.handleResize);
    
    // 모바일에서 초기 뷰를 3일로 설정
    if (this.isMobileView && this.$refs.fullCalendarRef) {
      const calendarApi = this.$refs.fullCalendarRef.getApi();
      calendarApi.changeView('timeGridThreeDay');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    selectRoom(room) {
      this.selectedRoom = room
      this.filterEventsByRoom()
      console.log('Selected room:', room)
    },
    filterEventsByRoom() {
      if (this.selectedRoom === '전체') {
        this.filteredEvents = [...this.events]
      } else {
        this.filteredEvents = this.events.filter(event => event.extendedProps.room === this.selectedRoom)
      }
      console.log(`Filtered events for ${this.selectedRoom}:`, this.filteredEvents.length)
      this.updateCalendarEvents()
    },
    async loadReservations() {
      try {
        const response = await axios.get('/reservations')
        console.log('Raw reservations from API:', response.data)
        
        this.events = response.data.map(event => {
          const startUTC = moment(event.start);
          const endUTC = moment(event.end);
          const startKST = startUTC.tz('Asia/Seoul');
          const endKST = endUTC.tz('Asia/Seoul');
          const startLocal = new Date(startKST.format('YYYY-MM-DD HH:mm:ss'));
          const endLocal = new Date(endKST.format('YYYY-MM-DD HH:mm:ss'));
          
          return {
            ...event,
            id: event._id,
            start: startLocal,
            end: endLocal,
            extendedProps: {
              room: event.room,
              password: event.password,
              name: event.name,
              content: event.content
            }
          }
        })
        
        console.log('Processed events for calendar:', this.events)
        this.filterEventsByRoom()
      } catch (error) {
        console.error('예약 로드 에러:', error)
        this.showMessage('예약 정보를 불러오는데 실패했습니다.', 'error')
      }
    },
    updateCalendarEvents() {
      if (this.$refs.fullCalendarRef) {
        const calendarApi = this.$refs.fullCalendarRef.getApi()
        calendarApi.removeAllEvents()
        
        this.filteredEvents.forEach(event => {
          calendarApi.addEvent(event)
        })
        
        calendarApi.render()
      }
    },
    showMessage(text, type = 'success') {
      this.message = { text, type }
      setTimeout(() => {
        this.message = { text: '', type: 'success' }
      }, 3000)
    },
    handleDateSelect(selectInfo) {
      console.log('=== Date selected in handleDateSelect ===')
      console.log('selectInfo:', selectInfo)
      console.log('Current selected room:', this.selectedRoom)
      
      this.selectedDateInfo = {
        start: selectInfo.start,
        end: selectInfo.end,
        startStr: selectInfo.startStr,
        endStr: selectInfo.endStr
      }
      
      console.log('Selected time info stored:', this.selectedDateInfo)
      this.openReservationModal()
    },
    openReservationModal() {
      this.showReservationModal = true
    },
    closeReservationModal() {
      this.showReservationModal = false;
      this.selectedDateInfo = null;
      
      // 캘린더의 선택 영역 제거
      if (this.$refs.fullCalendarRef) {
        const calendarApi = this.$refs.fullCalendarRef.getApi();
        calendarApi.unselect();
      }
    },
    async handleReservationSubmit(formData) {
      try {
        console.log('Submitting reservation:', formData);
        const response = await axios.post('/reservations', formData);
        console.log('New reservation created:', response.data);
        
        const startUTC = moment(response.data.start);
        const endUTC = moment(response.data.end);
        const startKST = startUTC.tz('Asia/Seoul');
        const endKST = endUTC.tz('Asia/Seoul');
        const startLocal = new Date(startKST.format('YYYY-MM-DD HH:mm:ss'));
        const endLocal = new Date(endKST.format('YYYY-MM-DD HH:mm:ss'));
        
        const newEvent = {
          ...response.data,
          id: response.data._id,
          start: startLocal,
          end: endLocal,
          title: `${response.data.name} (${response.data.content})`,
          extendedProps: {
            room: response.data.room,
            name: response.data.name,
            content: response.data.content,
            password: response.data.password
          }
        };
        
        // 캘린더에 즉시 반영
        if (this.$refs.fullCalendarRef) {
          const calendarApi = this.$refs.fullCalendarRef.getApi();
          calendarApi.addEvent(newEvent);
          calendarApi.render(); // 캘린더 리렌더링
        }
        
        this.events.push(newEvent);
        this.filterEventsByRoom();
        this.closeReservationModal();
        this.showMessage('예약이 완료되었습니다!', 'success');
      } catch (error) {
        console.error('예약 생성 에러:', error);
        this.showMessage(error.response?.data?.error || '예약 중 오류가 발생했습니다.', 'error');
      }
    },
    handleEventClick(clickInfo) {
      console.log('Event clicked:', clickInfo)
      
      this.currentEvent = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        extendedProps: clickInfo.event.extendedProps
      }
      
      if (this.isAdminMode) {
        this.showDeleteConfirmModal = true
      } else {
        this.showPasswordModal = true
      }
    },
    toggleAdminMode() {
      if (this.isAdminMode) {
        this.isAdminMode = false
        this.showMessage('관리자 모드가 비활성화되었습니다.', 'success')
      } else {
        this.showAdminPasswordModal = true
      }
    },
    closePasswordModal() {
      this.showPasswordModal = false
    },
    async handlePasswordSubmit(password) {
      try {
        const response = await axios.delete('/reservations', {
          data: {
            id: this.currentEvent.id,
            password: password
          }
        });
        
        if (response.data.success) {
          this.events = this.events.filter(event => event.id !== this.currentEvent.id);
          this.filterEventsByRoom();
          this.closePasswordModal();
          this.showMessage('예약이 삭제되었습니다.', 'success');
        } else {
          this.showMessage('예약 삭제에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('예약 삭제 에러:', error);
        if (error.response?.status === 403) {
          this.showMessage('비밀번호가 일치하지 않습니다.', 'error');
        } else {
          this.showMessage('예약 삭제 중 오류가 발생했습니다.', 'error');
        }
      }
    },
    closeAdminPasswordModal() {
      this.showAdminPasswordModal = false
    },
    async handleAdminPasswordSubmit(adminPassword) {
      try {
        await axios.post('/admin/verify', { adminPassword })
        this.isAdminMode = true
        this.closeAdminPasswordModal()
        this.showMessage('관리자 모드가 활성화되었습니다.', 'success')
      } catch (error) {
        console.error('관리자 인증 에러:', error)
        this.showMessage('관리자 비밀번호가 틀렸습니다.', 'error')
      }
    },
    closeDeleteConfirmModal() {
      this.showDeleteConfirmModal = false
    },
    async confirmDeleteEvent() {
      try {
        const response = await axios.delete('/reservations', {
          data: {
            id: this.currentEvent.id,
            password: '0106*'
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          this.events = this.events.filter(event => event.id !== this.currentEvent.id);
          this.filterEventsByRoom();
          this.closeDeleteConfirmModal();
          this.showMessage('예약이 삭제되었습니다.', 'success');
        } else {
          this.showMessage('예약 삭제에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('관리자 예약 삭제 에러:', error);
        this.showMessage('예약 삭제 중 오류가 발생했습니다.', 'error');
      }
    },
    handleResize() {
      const wasInMobileView = this.isMobileView;
      this.isMobileView = window.innerWidth < 640;
      
      // 모바일 상태가 변경되었고 캘린더가 존재하는 경우
      if (wasInMobileView !== this.isMobileView && this.$refs.fullCalendarRef) {
        const calendarApi = this.$refs.fullCalendarRef.getApi();
        
        // 모바일 뷰로 변경된 경우
        if (this.isMobileView) {
          calendarApi.changeView('timeGridThreeDay');
          calendarApi.today();
        } else {
          // 데스크톱 뷰로 변경된 경우
          calendarApi.changeView('timeGridWeek');
          const today = new Date();
          const sunday = new Date(today);
          sunday.setDate(today.getDate() - today.getDay());
          calendarApi.gotoDate(sunday);
        }
      }
    },
    openMobileTimeSelection() {
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      
      this.selectedDateInfo = {
        start: now,
        end: end,
        startStr: now.toISOString(),
        endStr: end.toISOString()
      };
      
      this.openReservationModal();
    }
  }
}
</script>

<style scoped>
.studio-reservation {
  padding: 8px;
  min-height: 100vh;
}

@media (min-width: 640px) {
  .studio-reservation {
    padding: 40px;
  }
}

/* 캘린더 스타일 조정 */
:deep(.fc) {
  font-size: 0.875rem;
  height: 100% !important;
  min-height: 700px !important;
}

/* 선택 영역 스타일 */
:deep(.fc-highlight) {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border: 2px solid #3b82f6 !important;
}

:deep(.fc-event.fc-event-mirror) {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border: 2px solid #3b82f6 !important;
}

:deep(.fc-event.fc-event-mirror .fc-event-main) {
  display: none !important;
}

/* 모바일 최적화 스타일 */
@media (max-width: 640px) {
  :deep(.fc) {
    font-size: 0.75rem;
    height: calc(100vh - 200px) !important;
    min-height: auto !important;
  }
  
  :deep(.fc-view-harness) {
    height: 100% !important;
  }
  
  :deep(.fc-scroller) {
    height: 100% !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  
  :deep(.fc-timegrid-slots) {
    min-height: unset !important;
  }
  
  :deep(.fc-timegrid-col-frame) {
    min-height: unset !important;
  }
  
  :deep(.fc-toolbar.fc-header-toolbar) {
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
  }
  
  :deep(.fc-timegrid-slot) {
    height: 2.5rem !important;
  }
  
  :deep(.fc-timegrid-axis) {
    padding: 0.25rem !important;
  }
  
  :deep(.fc-event) {
    padding: 0.125rem 0.25rem !important;
  }
  
  :deep(.fc-timegrid-event) {
    min-height: 1.5rem !important;
  }
}

.message {
  animation: fadeInOut 3s ease-in-out;
  width: 90%;
  max-width: 32rem;
  margin: 0 auto;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
</style>