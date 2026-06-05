'use client';

import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const fetchEvents = async () => {
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Transform for react-big-calendar
        const calendarEvents = data.map((e: any) => {
          // e.eventDate is YYYY-MM-DD
          // e.startTime is HH:mm
          const [startH, startM] = e.startTime.split(':');
          const startDate = new Date(e.eventDate);
          startDate.setHours(Number(startH), Number(startM));

          const [endH, endM] = e.endTime.split(':');
          const endDate = new Date(e.eventDate);
          endDate.setHours(Number(endH), Number(endM));

          return {
            id: e.id,
            title: e.title,
            start: startDate,
            end: endDate,
            resource: e,
          };
        });
        setEvents(calendarEvents);
      }
    } catch (err) {
      console.error('Failed to fetch events for calendar', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: '#8b5cf6', // brand primary
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '2px 6px'
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Master Schedule</h1>
          <p className="text-gray-400 text-sm mt-1">Global view of all upcoming events, vendor assignments, and blocked dates.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold text-xs rounded-xl transition-all">
           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.662 3.999-5.445 3.999-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.523 2.978 15.222 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z"/>
           </svg>
           Sync with Google Calendar
        </button>
      </header>

      <div className="glass-panel p-6 rounded-2xl flex-1 min-h-[700px] overflow-hidden">
        {/* Custom CSS overrides for dark mode react-big-calendar */}
        <style dangerouslySetInnerHTML={{__html: `
          .rbc-calendar { font-family: 'DM Sans', sans-serif; }
          .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: rgba(255,255,255,0.05); }
          .rbc-header { border-bottom: 1px solid rgba(255,255,255,0.05); border-left: 1px solid rgba(255,255,255,0.05); padding: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 10px; }
          .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05); }
          .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05); }
          .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
          .rbc-date-cell { padding: 8px; font-weight: 600; font-size: 12px; color: #cbd5e1; }
          .rbc-off-range { color: #475569; }
          .rbc-today { background: rgba(139, 92, 246, 0.05); }
          .rbc-toolbar button { color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-weight: 600; font-size: 12px; padding: 6px 12px; transition: all 0.2s; }
          .rbc-toolbar button:hover, .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background: rgba(139, 92, 246, 0.2); border-color: rgba(139, 92, 246, 0.5); color: white; box-shadow: none; }
          .rbc-toolbar .rbc-toolbar-label { font-weight: 800; font-size: 18px; color: white; font-family: 'Outfit', sans-serif; }
          .rbc-time-content { border-top: 1px solid rgba(255,255,255,0.05); }
          .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.05); }
          .rbc-timeslot-group { border-bottom: 1px solid rgba(255,255,255,0.05); min-height: 60px; }
          .rbc-time-gutter .rbc-timeslot-group { border-right: 1px solid rgba(255,255,255,0.05); }
          .rbc-time-slot { color: #64748b; font-size: 10px; }
          .rbc-allday-cell { border-bottom: 1px solid rgba(255,255,255,0.05); }
          .rbc-agenda-view table.rbc-agenda-table { border: 1px solid rgba(255,255,255,0.05); }
          .rbc-agenda-view table.rbc-agenda-table thead > tr > th { border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
          .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { border-top: 1px solid rgba(255,255,255,0.05); color: #94a3b8; }
        `}} />

        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(v: any) => setView(v)}
          date={date}
          onNavigate={(d: any) => setDate(d)}
          eventPropGetter={eventStyleGetter}
          popup
          selectable
        />
      </div>
    </div>
  );
}
