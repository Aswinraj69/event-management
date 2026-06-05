'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, UserCheck, UserX, UserPlus, Clipboard, ShieldAlert, BadgeCheck, AlertCircle, X, HelpCircle } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // New Event Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'WEDDING',
    clientId: '',
    venue: '',
    googleMapsUrl: '',
    eventDate: '',
    startTime: '14:00',
    endTime: '22:00',
    notes: '',
    quotationAmount: 5000,
    advanceAmount: 1500,
    additionalExpenses: 500
  });

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [assignmentError, setAssignmentError] = useState('');
  const [tempAssignments, setTempAssignments] = useState<any[]>([]); // Array of { userId, role }

  const fetchInitialData = async () => {
    const token = localStorage.getItem('evento_token');
    try {
      // 1. Fetch Events
      const evRes = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(evData);
      }

      // 2. Fetch Clients (only if Admin)
      const u = JSON.parse(localStorage.getItem('evento_user') || '{}');
      setUser(u);

      if (u.role === 'COMPANY_ADMIN') {
        const clRes = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (clRes.ok) {
          const clData = await clRes.json();
          setClients(clData);
        }

        // 3. Fetch Employees for assignment pool
        const empRes = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData);
        }
      }
    } catch (err) {
      console.error('Error fetching event listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Amount') || name.includes('Expenses') ? Number(value) : value
    }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        alert('Failed to schedule event');
        return;
      }
      setShowAddForm(false);
      fetchInitialData();
      // Reset form
      setFormData({
        title: '',
        type: 'WEDDING',
        clientId: '',
        venue: '',
        googleMapsUrl: '',
        eventDate: '',
        startTime: '14:00',
        endTime: '22:00',
        notes: '',
        quotationAmount: 5000,
        advanceAmount: 1500,
        additionalExpenses: 500
      });
    } catch (err) {
      alert('Error scheduling event');
    }
  };

  // Pre-load current assignments in temp states for edits
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setAssignmentError('');
    setTempAssignments(
      event.staffAssignments.map((a: any) => ({
        userId: a.user.id,
        role: a.role
      }))
    );
  };

  // Append or modify a staff role selection
  const handleRoleSelection = (role: string, userId: string) => {
    setTempAssignments(prev => {
      // Remove previous assignee for this specific role
      const filtered = prev.filter(item => item.role !== role);
      if (!userId) return filtered;
      return [...filtered, { userId, role }];
    });
  };

  const handleSaveRoster = async () => {
    setAssignmentError('');
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${selectedEvent.id}/staff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assignments: tempAssignments })
      });
      const data = await res.json();

      if (!res.ok) {
        // Display double booking warning returned from backend
        setAssignmentError(data.message || 'Double booking collision detected');
        return;
      }

      setSelectedEvent(data);
      fetchInitialData();
      alert('Roster updated and notifications dispatched to workers!');
    } catch (err) {
      setAssignmentError('Connection issue during assignment review');
    }
  };

  // Staff status updates (Accept / Decline)
  const handleResponse = async (assignmentId: string, nextStatus: 'ACCEPTED' | 'DECLINED') => {
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchInitialData();
        setSelectedEvent(null);
      }
    } catch (err) {
      alert('Status update failed');
    }
  };

  const isAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Events Scheduler</h1>
          <p className="text-gray-400 text-sm mt-1">Configure weddings, corporate campaigns, and dispatch staff.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
          >
            <Calendar className="w-4 h-4" /> Book Event Campaign
          </button>
        )}
      </header>

      {/* Scheduler Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Event cards lists column */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass-panel p-10 text-center text-xs text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="glass-panel p-12 text-center text-xs text-gray-500">No scheduled events found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(event => {
                // If logged in as staff, highlight assignments
                const userAssigned = event.staffAssignments.find((a: any) => a.user.id === user?.userId);

                return (
                  <div
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className={`glass-panel p-6 rounded-2xl cursor-pointer hover:border-violet-500/30 transition-all ${
                      selectedEvent?.id === event.id ? 'border-violet-500' : ''
                    } relative overflow-hidden`}
                  >
                    {userAssigned && (
                      <div className="absolute top-0 right-0 bg-violet-600/20 border-b border-l border-violet-500/30 px-3 py-1 rounded-bl-xl text-[9px] font-bold text-violet-400">
                        My Assignment: {userAssigned.role} ({userAssigned.status})
                      </div>
                    )}
                    <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">{event.type}</span>
                    <h3 className="text-md font-bold text-white mt-1.5 truncate">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.client?.name}</p>

                    <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(event.eventDate).toISOString().split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span className="truncate max-w-[200px]">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed details inspector / assignment tools column */}
        <div>
          {selectedEvent ? (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold bg-violet-600/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-md uppercase">
                    {selectedEvent.type}
                  </span>
                  <h3 className="font-bold text-white text-md mt-2 leading-tight">{selectedEvent.title}</h3>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Roster Assignment panel - Admin Mode */}
              {isAdmin ? (
                <div className="space-y-4 border-t border-white/[0.05] pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"> Roster Allocation</h4>
                    <span className="text-[9px] text-gray-400">Double booking guarded</span>
                  </div>

                  {assignmentError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex gap-1.5 items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{assignmentError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {['Photographer', 'Videographer', 'Drone Operator', 'Editor', 'Coordinator'].map(role => {
                      const currentAssignee = tempAssignments.find(item => item.role === role);
                      const fullStaffRecord = selectedEvent.staffAssignments.find((a: any) => a.role === role);

                      return (
                        <div key={role} className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-xl border border-white/[0.03]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-400 text-[10px]">{role}</span>
                            {fullStaffRecord && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                fullStaffRecord.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {fullStaffRecord.status}
                              </span>
                            )}
                          </div>
                          <select
                            value={currentAssignee?.userId || ''}
                            onChange={e => handleRoleSelection(role, e.target.value)}
                            className="w-full bg-black/40 border border-white/[0.08] text-xs text-gray-300 rounded-lg py-1 px-2 focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeProfile?.designation || 'Staff'})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSaveRoster}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Save & Notify Crew
                  </button>
                </div>
              ) : (
                /* Staff member viewing panel */
                <div className="space-y-4 border-t border-white/[0.05] pt-4 text-xs">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Crew assignments</h4>
                  <div className="space-y-2">
                    {selectedEvent.staffAssignments.map((a: any) => (
                      <div key={a.id} className="flex justify-between items-center bg-black/20 p-3 border border-white/[0.04] rounded-xl">
                        <div>
                          <p className="font-semibold text-white">{a.user.firstName} {a.user.lastName}</p>
                          <span className="text-[10px] text-gray-500">{a.role}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          a.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Accept/Decline options if user is currently assigned and pending */}
                  {(() => {
                    const myAssign = selectedEvent.staffAssignments.find((a: any) => a.user.id === user?.userId);
                    if (myAssign && myAssign.status === 'PENDING') {
                      return (
                        <div className="pt-4 border-t border-white/[0.05] space-y-2">
                          <p className="text-[10px] font-bold text-violet-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Action Required: Confirm Availability
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleResponse(myAssign.id, 'DECLINED')}
                              className="flex items-center justify-center gap-1 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-all"
                            >
                              <UserX className="w-3.5 h-3.5" /> Decline
                            </button>
                            <button
                              onClick={() => handleResponse(myAssign.id, 'ACCEPTED')}
                              className="flex items-center justify-center gap-1 py-2 bg-emerald-500/5 hover:bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-all"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Accept
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Financial cards parameters for administrators */}
              {isAdmin && (
                <div className="space-y-3 border-t border-white/[0.05] pt-4 text-xs">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Clipboard className="w-3.5 h-3.5" /> Project Budget ledger
                  </h4>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/[0.04] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quotation value</span>
                      <span className="text-white font-medium">AED {Number(selectedEvent.quotationAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Advance Deposit</span>
                      <span className="text-white font-medium">AED {Number(selectedEvent.advanceAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.04] pt-2">
                      <span className="text-gray-500">Additional Expenses</span>
                      <span className="text-white font-medium">AED {Number(selectedEvent.additionalExpenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.05] pt-2 font-bold">
                      <span className="text-gray-400">Net Estimated Profit</span>
                      <span className="text-emerald-400">AED {Number(selectedEvent.profit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-2xl text-xs text-gray-500 border-dashed">
              Select an event card to schedule crew roster, manage double bookings, and check budget logs.
            </div>
          )}
        </div>
      </div>

      {/* Book Event Dialog Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Book Event Campaign</h3>
              <p className="text-xs text-gray-500 mt-1">Create schedule details and record client values.</p>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Event Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Event Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400">
                    <option value="WEDDING">Wedding</option>
                    <option value="ENGAGEMENT">Engagement</option>
                    <option value="BIRTHDAY">Birthday</option>
                    <option value="CORPORATE_EVENT">Corporate Event</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="PRODUCT_LAUNCH">Product Launch</option>
                    <option value="PRIVATE_EVENT">Private Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Link Client Account</label>
                  <select name="clientId" required value={formData.clientId} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400">
                    <option value="">Choose Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Event Date</label>
                  <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Start Time</label>
                  <input type="text" name="startTime" placeholder="14:00" required value={formData.startTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">End Time</label>
                  <input type="text" name="endTime" placeholder="22:00" required value={formData.endTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Venue Location</label>
                  <input type="text" name="venue" placeholder="e.g. Armani Hotel" required value={formData.venue} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Google Maps URL (Optional)</label>
                  <input type="text" name="googleMapsUrl" placeholder="https://..." value={formData.googleMapsUrl} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/[0.04] pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Quotation Amount (AED)</label>
                  <input type="number" name="quotationAmount" value={formData.quotationAmount} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Advance Received (AED)</label>
                  <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Est Additional Expenses</label>
                  <input type="number" name="additionalExpenses" value={formData.additionalExpenses} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Event Planner Notes</label>
                <textarea name="notes" rows={2} value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white resize-none" />
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
