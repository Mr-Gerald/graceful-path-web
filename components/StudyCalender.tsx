import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Video, 
  BookOpen, 
  Award, 
  X,
  Calendar as CalendarIcon,
  Globe,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'live' | 'study' | 'exam' | 'other';
  time: string;
  description?: string;
}

const StudyCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Pharmacology Live Session',
      date: new Date(),
      type: 'live',
      time: '14:00',
      description: 'Deep dive into cardiac medications and NCLEX patterns.'
    },
    {
      id: '2',
      title: 'Maternity Mastery Quiz',
      date: addDays(new Date(), 2),
      type: 'exam',
      time: '10:00',
      description: 'Timed practice test covering OB/GYN fundamentals.'
    },
    {
      id: '3',
      title: 'Group Study: Fluid & Electrolytes',
      date: addDays(new Date(), -1),
      type: 'study',
      time: '16:30',
      description: 'Collaborative review of electrolyte imbalances.'
    }
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'study' as Event['type'],
    time: '12:00',
    description: ''
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center text-slate-500 text-sm mt-1 font-medium">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
            Your Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={prevMonth}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm font-bold text-sm text-slate-600"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    return (
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDays.map((day) => {
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <motion.div
              whileHover={{ y: -2 }}
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[100px] md:min-h-[140px] p-2 md:p-4 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer relative group
                ${!isCurrentMonth ? 'bg-slate-50/50 border-transparent opacity-40' : 'bg-white'}
                ${isSelected ? 'border-brand-500 shadow-xl shadow-brand-100/20' : 'border-slate-100 hover:border-brand-200'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  text-sm md:text-lg font-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl
                  ${isTodayDate ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-900'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                )}
              </div>
              
              <div className="space-y-1.5">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id}
                    className={`
                      text-[8px] md:text-[10px] p-1.5 md:p-2 rounded-lg font-bold truncate flex items-center
                      ${event.type === 'live' ? 'bg-red-50 text-red-600 border border-red-100' : 
                        event.type === 'exam' ? 'bg-brand-50 text-brand-600 border border-brand-100' : 
                        'bg-slate-100 text-slate-600 border border-slate-200'}
                    `}
                  >
                    {event.type === 'live' ? <Video className="w-2 h-2 md:w-3 md:h-3 mr-1" /> : <BookOpen className="w-2 h-2 md:w-3 md:h-3 mr-1" />}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[8px] md:text-[10px] text-slate-400 font-bold pl-1">
                    + {dayEvents.length - 2} more
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(day);
                  setIsAddModalOpen(true);
                }}
                className="absolute bottom-3 right-3 p-2 bg-brand-50 text-brand-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderEventDetails = () => {
    const dayEvents = events.filter(e => isSameDay(e.date, selectedDate));
    
    return (
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-1">Schedule for</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              {format(selectedDate, 'EEEE, MMMM do')}
            </h3>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        <div className="space-y-6">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={event.id} 
                className="group p-6 rounded-[2rem] border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${event.type === 'live' ? 'bg-red-100 text-red-600' : 
                      event.type === 'exam' ? 'bg-brand-100 text-brand-600' : 
                      'bg-slate-100 text-slate-600'}
                  `}>
                    {event.type}
                  </div>
                  <div className="flex items-center text-slate-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {event.time}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{event.description}</p>
                )}
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition">
                    Edit
                  </button>
                  <button 
                    onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-red-500 hover:bg-red-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Zap className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold">No sessions scheduled for this day.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 text-brand-600 font-black text-xs uppercase tracking-widest hover:underline"
              >
                + Add Study Goal
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> New Schedule Entry
        </button>
      </div>
    );
  };

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      date: selectedDate,
      type: newEvent.type,
      time: newEvent.time,
      description: newEvent.description
    };
    setEvents([...events, event]);
    setIsAddModalOpen(false);
    setNewEvent({ title: '', type: 'study', time: '12:00', description: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow">
          {renderHeader()}
          <div className="bg-white p-4 md:p-10 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-sm">
            {renderDays()}
            {renderCells()}
          </div>
        </div>
        <div className="lg:w-96">
          {renderEventDetails()}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Add Schedule</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session Title</label>
                    <input 
                      type="text" 
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="e.g. Cardiology Review"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
                      <select 
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition font-bold appearance-none"
                      >
                        <option value="study">Study</option>
                        <option value="live">Live Class</option>
                        <option value="exam">Exam Prep</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Time</label>
                      <input 
                        type="time" 
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description (Optional)</label>
                    <textarea 
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      rows={3}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition font-bold resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleAddEvent}
                    className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-100 hover:bg-brand-700 transition transform hover:scale-[1.02]"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyCalendar;
