'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar, MapPin, Clock, UserPlus, AlertCircle, X, Plus, Search,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical,
  Eye, Pencil, Trash2, CheckSquare, Square, Filter, Phone, User,
  DollarSign, FileText, Users, Tag, Check, UserCheck, UserX, Loader2
} from 'lucide-react';
import { selectUser } from '@/store/slices/authSlice';
import {
  useGetBookingsQuery, useCreateBookingMutation, useUpdateBookingMutation,
  useDeleteBookingMutation, useAssignStaffMutation, useUpdateAssignmentMutation,
  useGetClientsQuery, useGetEmployeesQuery,
} from '@/store/api/eventoApi';

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingStatus = 'UPCOMING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
type EventType = 'WEDDING' | 'ENGAGEMENT' | 'BIRTHDAY' | 'CORPORATE_EVENT' | 'CONFERENCE' | 'PRODUCT_LAUNCH' | 'PRIVATE_EVENT' | 'PHOTOSHOOT' | 'GRADUATION' | 'OTHER';

interface Booking {
  id: string; title: string; type: EventType;
  clientId?: string; client?: { id: string; name: string; phone?: string };
  clientName?: string; clientPhone?: string;
  venue?: string; googleMapsUrl?: string; eventDate?: string;
  startTime?: string; endTime?: string; notes?: string; additionalNotes?: string;
  bookingStatus: BookingStatus; quotationAmount: number; advanceAmount: number;
  additionalExpenses: number; profit: number;
  staffAssignments: StaffAssignment[]; createdAt: string;
}
interface StaffAssignment {
  id: string; role: string; status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  user: { id: string; firstName: string; lastName: string; email: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; cls: string }> = {
  UPCOMING:  { label: 'Upcoming',  cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-violet-500/15 text-violet-400 border border-violet-500/25' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/15 text-red-400 border border-red-500/25' },
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEDDING: 'Wedding', ENGAGEMENT: 'Engagement', BIRTHDAY: 'Birthday',
  CORPORATE_EVENT: 'Corporate Event', CONFERENCE: 'Conference',
  PRODUCT_LAUNCH: 'Product Launch', PRIVATE_EVENT: 'Private Event',
  PHOTOSHOOT: 'Photoshoot', GRADUATION: 'Graduation', OTHER: 'Other',
};

const EMPTY_FORM = {
  clientId: '', clientName: '', clientPhone: '', title: '', type: 'WEDDING' as EventType,
  eventDate: '', startTime: '', endTime: '', venue: '', googleMapsUrl: '',
  quotationAmount: '', advanceAmount: '', additionalExpenses: '',
  bookingStatus: 'UPCOMING' as BookingStatus, notes: '', additionalNotes: '',
};

type SortCol = 'clientName' | 'title' | 'eventDate' | 'bookingStatus' | 'quotationAmount' | 'createdAt';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}
function fmtCurrency(n: number | string | undefined) {
  const num = Number(n ?? 0);
  return isNaN(num) ? '—' : `AED ${num.toLocaleString('en', { minimumFractionDigits: 0 })}`;
}
function getClientName(b: Booking) { return b.client?.name || b.clientName || '—'; }
function getClientPhone(b: Booking) { return b.client?.phone || b.clientPhone || '—'; }

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UPCOMING;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const user = useSelector(selectUser);
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  // ── RTK Query hooks (all cached globally)
  const { data: rawBookings = [], isLoading } = useGetBookingsQuery();
  const bookings = rawBookings as Booking[];
  const { data: rawClients = [] } = useGetClientsQuery(undefined, { skip: !isAdmin });
  const clients = rawClients as any[];
  const { data: rawEmployees = [] } = useGetEmployeesQuery(undefined, { skip: !isAdmin });
  const employees = rawEmployees as any[];
  const [createBooking] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  const [assignStaff] = useAssignStaffMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();

  // ── Table state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('');
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [sortCol, setSortCol] = useState<SortCol>('eventDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // ── Drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // ── View / Delete
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Staff assignment panel
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);
  const [tempAssignments, setTempAssignments] = useState<{ userId: string; role: string }[]>([]);
  const [assignmentError, setAssignmentError] = useState('');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) setOpenActionId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Table logic ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...bookings];
    if (search) { const q = search.toLowerCase(); rows = rows.filter(b => getClientName(b).toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || (b.venue || '').toLowerCase().includes(q) || getClientPhone(b).toLowerCase().includes(q)); }
    if (filterStatus) rows = rows.filter(b => b.bookingStatus === filterStatus);
    if (filterType) rows = rows.filter(b => b.type === filterType);
    rows.sort((a, b) => {
      let va: any, vb: any;
      switch (sortCol) {
        case 'clientName': va = getClientName(a); vb = getClientName(b); break;
        case 'title': va = a.title; vb = b.title; break;
        case 'eventDate': va = a.eventDate ?? ''; vb = b.eventDate ?? ''; break;
        case 'bookingStatus': va = a.bookingStatus; vb = b.bookingStatus; break;
        case 'quotationAmount': va = Number(a.quotationAmount); vb = Number(b.quotationAmount); break;
        case 'createdAt': va = a.createdAt; vb = b.createdAt; break;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [bookings, search, filterStatus, filterType, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleSort = (col: SortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(1); };
  const SortIcon = ({ col }: { col: SortCol }) => sortCol === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 text-violet-400 inline" /> : <ChevronDown className="w-3 h-3 ml-1 text-violet-400 inline" />) : <ChevronUp className="w-3 h-3 ml-1 text-gray-600 inline opacity-40" />;

  const allSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
  const toggleAll = () => { if (allSelected) setSelected(prev => { const n = new Set(prev); pageRows.forEach(r => n.delete(r.id)); return n; }); else setSelected(prev => { const n = new Set(prev); pageRows.forEach(r => n.add(r.id)); return n; }); };
  const toggleRow = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ─── Drawer ────────────────────────────────────────────────────────────────
  const openCreate = () => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setDrawerMode('create'); setShowDrawer(true); };
  const openEdit = (b: Booking) => {
    setFormData({ clientId: b.clientId || '', clientName: b.clientName || b.client?.name || '', clientPhone: b.clientPhone || b.client?.phone || '', title: b.title, type: b.type, eventDate: b.eventDate ? b.eventDate.split('T')[0] : '', startTime: b.startTime || '', endTime: b.endTime || '', venue: b.venue || '', googleMapsUrl: b.googleMapsUrl || '', quotationAmount: b.quotationAmount ? String(b.quotationAmount) : '', advanceAmount: b.advanceAmount ? String(b.advanceAmount) : '', additionalExpenses: b.additionalExpenses ? String(b.additionalExpenses) : '', bookingStatus: b.bookingStatus, notes: b.notes || '', additionalNotes: b.additionalNotes || '' });
    setEditingId(b.id); setDrawerMode('edit'); setShowDrawer(true); setOpenActionId(null);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { title: formData.title || 'Untitled Booking', type: formData.type, clientId: formData.clientId || undefined, clientName: formData.clientName || undefined, clientPhone: formData.clientPhone || undefined, venue: formData.venue || undefined, googleMapsUrl: formData.googleMapsUrl || undefined, eventDate: formData.eventDate || undefined, startTime: formData.startTime || undefined, endTime: formData.endTime || undefined, notes: formData.notes || undefined, additionalNotes: formData.additionalNotes || undefined, bookingStatus: formData.bookingStatus, quotationAmount: formData.quotationAmount !== '' ? Number(formData.quotationAmount) : undefined, advanceAmount: formData.advanceAmount !== '' ? Number(formData.advanceAmount) : undefined, additionalExpenses: formData.additionalExpenses !== '' ? Number(formData.additionalExpenses) : undefined };
      if (drawerMode === 'edit' && editingId) await updateBooking({ id: editingId, body: payload }).unwrap();
      else await createBooking(payload).unwrap();
      setShowDrawer(false);
    } catch (e: any) { alert(e?.data?.message || 'Failed to save booking'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteBooking(deleteId).unwrap(); setDeleteId(null); }
    catch { alert('Failed to delete booking'); }
    finally { setDeleting(false); }
  };

  // ─── Staff Assignment ──────────────────────────────────────────────────────
  const handleSelectEvent = (event: Booking) => { setSelectedEvent(event); setAssignmentError(''); setTempAssignments(event.staffAssignments.map(a => ({ userId: a.user.id, role: a.role }))); };
  const handleRoleSelection = (role: string, userId: string) => { setTempAssignments(prev => { const f = prev.filter(i => i.role !== role); if (!userId) return f; return [...f, { userId, role }]; }); };
  const handleSaveRoster = async () => {
    setAssignmentError('');
    try {
      await assignStaff({ id: selectedEvent!.id, body: { assignments: tempAssignments } }).unwrap();
      setSelectedEvent(null);
      alert('Roster updated and notifications dispatched!');
    } catch (e: any) { setAssignmentError(e?.data?.message || 'Double booking collision detected'); }
  };
  const handleResponse = async (assignmentId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try { await updateAssignment({ assignmentId, status }).unwrap(); setSelectedEvent(null); }
    catch { alert('Status update failed'); }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: bookings.length, upcoming: bookings.filter(b => b.bookingStatus === 'UPCOMING').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
    completed: bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
    revenue: bookings.reduce((s, b) => s + Number(b.quotationAmount || 0), 0),
  }), [bookings]);

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* Header */}
      <header className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Events Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all bookings, photoshoots, weddings and events.</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all hover:-translate-y-0.5 shrink-0">
            <Plus className="w-4 h-4" /> New Booking
          </button>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'text-violet-400' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-blue-400' },
          { label: 'Confirmed', value: stats.confirmed, icon: Check, color: 'text-violet-400' },
          { label: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-emerald-400' },
          { label: 'Total Revenue', value: `AED ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/[0.04] ${color}`}><Icon className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
              <p className="text-lg font-bold text-white leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/[0.06] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input type="text" placeholder="Search client, event, location..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/[0.08] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(1); }}
              className="pl-7 pr-6 py-2 bg-black/30 border border-white/[0.08] rounded-xl text-xs text-gray-400 focus:outline-none appearance-none cursor-pointer">
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            <select value={filterType} onChange={e => { setFilterType(e.target.value as any); setPage(1); }}
              className="pl-7 pr-6 py-2 bg-black/30 border border-white/[0.08] rounded-xl text-xs text-gray-400 focus:outline-none appearance-none cursor-pointer">
              <option value="">All Types</option>
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <span className="text-[11px] text-gray-600 ml-auto whitespace-nowrap">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pl-4 py-3 w-10"><button onClick={toggleAll} className="text-gray-500 hover:text-white transition-colors">{allSelected ? <CheckSquare className="w-3.5 h-3.5 text-violet-400" /> : <Square className="w-3.5 h-3.5" />}</button></th>
                {([['clientName', 'Client'], ['title', 'Event']] as [SortCol, string][]).map(([col, label]) => (
                  <th key={col} className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => handleSort(col)}>{label}<SortIcon col={col} /></th>
                ))}
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => handleSort('eventDate')}>Date<SortIcon col="eventDate" /></th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Time</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('quotationAmount')}>Amount<SortIcon col="quotationAmount" /></th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Advance</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Staff</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('bookingStatus')}>Status<SortIcon col="bookingStatus" /></th>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('createdAt')}>Created<SortIcon col="createdAt" /></th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-[#0a0a12]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={14} className="py-20 text-center"><Loader2 className="w-6 h-6 text-violet-500 animate-spin mx-auto" /><p className="text-gray-600 text-xs mt-3">Loading bookings...</p></td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={14} className="py-20 text-center"><Calendar className="w-8 h-8 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm font-medium">No bookings found</p><p className="text-gray-700 text-xs mt-1">{search || filterStatus || filterType ? 'Try adjusting your filters' : 'Click "New Booking" to get started'}</p></td></tr>
              ) : pageRows.map((b) => (
                <tr key={b.id} className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${selected.has(b.id) ? 'bg-violet-500/5' : ''}`}>
                  <td className="pl-4 py-3.5"><button onClick={() => toggleRow(b.id)} className="text-gray-500 hover:text-violet-400 transition-colors">{selected.has(b.id) ? <CheckSquare className="w-3.5 h-3.5 text-violet-400" /> : <Square className="w-3.5 h-3.5" />}</button></td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0">{(getClientName(b)[0] || '?').toUpperCase()}</div>
                      <span className="font-medium text-white whitespace-nowrap">{getClientName(b)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5"><span className="text-gray-300 font-medium whitespace-nowrap max-w-[160px] truncate block">{b.title}</span></td>
                  <td className="px-3 py-3.5 text-gray-400 whitespace-nowrap">{getClientPhone(b)}</td>
                  <td className="px-3 py-3.5"><span className="text-[10px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-md whitespace-nowrap">{EVENT_TYPE_LABELS[b.type as EventType] || b.type}</span></td>
                  <td className="px-3 py-3.5 text-gray-400 whitespace-nowrap">{fmtDate(b.eventDate)}</td>
                  <td className="px-3 py-3.5 text-gray-400 whitespace-nowrap">{b.startTime && b.endTime ? `${b.startTime} – ${b.endTime}` : b.startTime || b.endTime || '—'}</td>
                  <td className="px-3 py-3.5"><span className="text-gray-400 truncate block max-w-[140px]" title={b.venue}>{b.venue || '—'}</span></td>
                  <td className="px-3 py-3.5 text-white font-medium whitespace-nowrap">{fmtCurrency(b.quotationAmount)}</td>
                  <td className="px-3 py-3.5 text-emerald-400 whitespace-nowrap">{fmtCurrency(b.advanceAmount)}</td>
                  <td className="px-3 py-3.5">
                    {b.staffAssignments.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {b.staffAssignments.slice(0, 3).map(a => (
                          <div key={a.id} title={`${a.user.firstName} ${a.user.lastName} (${a.role})`} className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[8px] font-bold text-indigo-300">{a.user.firstName[0]}{a.user.lastName[0]}</div>
                        ))}
                        {b.staffAssignments.length > 3 && <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[8px] font-bold text-gray-400">+{b.staffAssignments.length - 3}</div>}
                      </div>
                    ) : <span className="text-gray-700 text-[10px]">Unassigned</span>}
                  </td>
                  <td className="px-3 py-3.5"><StatusBadge status={b.bookingStatus} /></td>
                  <td className="px-3 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                  <td className="px-4 py-3.5 sticky right-0 bg-[#0a0a12]">
                    <div className="relative flex justify-center" ref={openActionId === b.id ? actionMenuRef : undefined}>
                      <button onClick={() => setOpenActionId(openActionId === b.id ? null : b.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><MoreVertical className="w-3.5 h-3.5" /></button>
                      {openActionId === b.id && (
                        <div className="absolute right-0 top-8 z-50 bg-[#131320] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px] animate-fade-in">
                          <button onClick={() => { setViewingBooking(b); setOpenActionId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"><Eye className="w-3.5 h-3.5 text-blue-400" /> View Details</button>
                          {isAdmin && <>
                            <button onClick={() => openEdit(b)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5 text-violet-400" /> Edit Booking</button>
                            <button onClick={() => { handleSelectEvent(b); setOpenActionId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"><Users className="w-3.5 h-3.5 text-indigo-400" /> Assign Staff</button>
                            <div className="border-t border-white/[0.06] my-1" />
                            <button onClick={() => { setDeleteId(b.id); setOpenActionId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                          </>}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-4">
          <p className="text-[11px] text-gray-600">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-white/[0.08] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all ${page === p ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'}`}>{p}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-white/[0.08] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* ── Booking Drawer ── */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={() => !saving && setShowDrawer(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0d0d1a] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col" style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] shrink-0">
              <div><h2 className="text-lg font-bold text-white">{drawerMode === 'create' ? 'New Booking' : 'Edit Booking'}</h2><p className="text-xs text-gray-500 mt-0.5">{drawerMode === 'create' ? 'Create a new event booking record' : 'Update booking details'}</p></div>
              <button onClick={() => !saving && setShowDrawer(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <Section title="Client Information" icon={<User className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Client Name">{clients.length > 0 ? (<select name="clientId" value={formData.clientId} onChange={handleFormChange} className="form-field"><option value="">— Manual entry —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>) : (<input type="text" name="clientName" placeholder="e.g. John & Sarah" value={formData.clientName} onChange={handleFormChange} className="form-field" />)}</Field>
                  <Field label="Phone Number"><input type="tel" name="clientPhone" placeholder="+971 50 000 0000" value={formData.clientPhone} onChange={handleFormChange} className="form-field" /></Field>
                  {formData.clientId && clients.length > 0 && <Field label="Override Name (optional)" className="col-span-2"><input type="text" name="clientName" placeholder="Leave blank to use client record name" value={formData.clientName} onChange={handleFormChange} className="form-field" /></Field>}
                </div>
              </Section>
              <Section title="Event Details" icon={<Calendar className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Event Name / Title" className="col-span-2"><input type="text" name="title" placeholder="e.g. Ahmad & Fatima Wedding" value={formData.title} onChange={handleFormChange} className="form-field" /></Field>
                  <Field label="Event Type"><select name="type" value={formData.type} onChange={handleFormChange} className="form-field">{(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}</select></Field>
                  <Field label="Booking Status"><select name="bookingStatus" value={formData.bookingStatus} onChange={handleFormChange} className="form-field"><option value="UPCOMING">Upcoming</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></Field>
                  <Field label="Event Date"><input type="date" name="eventDate" value={formData.eventDate} onChange={handleFormChange} className="form-field" /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start Time"><input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} className="form-field" /></Field>
                    <Field label="End Time"><input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} className="form-field" /></Field>
                  </div>
                </div>
              </Section>
              <Section title="Location" icon={<MapPin className="w-3.5 h-3.5" />}>
                <div className="space-y-3">
                  <Field label="Event Location / Venue"><input type="text" name="venue" placeholder="e.g. Armani Hotel, Dubai" value={formData.venue} onChange={handleFormChange} className="form-field" /></Field>
                  <Field label="Google Maps URL (optional)"><input type="url" name="googleMapsUrl" placeholder="https://maps.google.com/..." value={formData.googleMapsUrl} onChange={handleFormChange} className="form-field" /></Field>
                </div>
              </Section>
              <Section title="Financials" icon={<DollarSign className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Total Amount (AED)"><input type="number" name="quotationAmount" placeholder="0" min="0" value={formData.quotationAmount} onChange={handleFormChange} className="form-field" /></Field>
                  <Field label="Advance (AED)"><input type="number" name="advanceAmount" placeholder="0" min="0" value={formData.advanceAmount} onChange={handleFormChange} className="form-field" /></Field>
                  <Field label="Add. Expenses (AED)"><input type="number" name="additionalExpenses" placeholder="0" min="0" value={formData.additionalExpenses} onChange={handleFormChange} className="form-field" /></Field>
                </div>
                {(formData.quotationAmount || formData.advanceAmount) && (
                  <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/[0.05] text-xs flex justify-between">
                    <span className="text-gray-500">Balance Due</span>
                    <span className="text-amber-400 font-bold">AED {Math.max(0, Number(formData.quotationAmount || 0) - Number(formData.advanceAmount || 0)).toLocaleString()}</span>
                  </div>
                )}
              </Section>
              <Section title="Notes & Remarks" icon={<FileText className="w-3.5 h-3.5" />}>
                <div className="space-y-3">
                  <Field label="Notes / Remarks"><textarea name="notes" rows={3} placeholder="Shoot requirements, special requests..." value={formData.notes} onChange={handleFormChange} className="form-field resize-none" /></Field>
                  <Field label="Additional Custom Notes"><textarea name="additionalNotes" rows={3} placeholder="Internal notes, follow-up reminders..." value={formData.additionalNotes} onChange={handleFormChange} className="form-field resize-none" /></Field>
                </div>
              </Section>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 shrink-0">
              <button onClick={() => !saving && setShowDrawer(false)} className="px-4 py-2.5 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : drawerMode === 'create' ? 'Create Booking' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── View Modal ── */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#0d0d1a] flex items-center justify-between px-6 py-5 border-b border-white/[0.08] z-10">
              <div className="flex items-center gap-3">
                <div><h2 className="text-lg font-bold text-white">{viewingBooking.title}</h2><p className="text-xs text-gray-500 mt-0.5">{EVENT_TYPE_LABELS[viewingBooking.type]}</p></div>
                <StatusBadge status={viewingBooking.bookingStatus} />
              </div>
              <button onClick={() => setViewingBooking(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard icon={<User className="w-4 h-4" />} label="Client" value={getClientName(viewingBooking)} />
                <InfoCard icon={<Phone className="w-4 h-4" />} label="Phone" value={getClientPhone(viewingBooking)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <InfoCard icon={<Calendar className="w-4 h-4" />} label="Event Date" value={fmtDate(viewingBooking.eventDate)} />
                <InfoCard icon={<Clock className="w-4 h-4" />} label="Start Time" value={viewingBooking.startTime || '—'} />
                <InfoCard icon={<Clock className="w-4 h-4" />} label="End Time" value={viewingBooking.endTime || '—'} />
              </div>
              <InfoCard icon={<MapPin className="w-4 h-4" />} label="Venue / Location" value={viewingBooking.venue || '—'}>
                {viewingBooking.googleMapsUrl && <a href={viewingBooking.googleMapsUrl} target="_blank" rel="noreferrer" className="text-[10px] text-violet-400 hover:underline mt-1 block">Open in Maps →</a>}
              </InfoCard>
              <div className="bg-black/30 rounded-xl border border-white/[0.05] p-4 space-y-2.5">
                <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Financial Summary</h4>
                {[{ label: 'Total Amount', value: fmtCurrency(viewingBooking.quotationAmount), cls: 'text-white' }, { label: 'Advance Received', value: fmtCurrency(viewingBooking.advanceAmount), cls: 'text-emerald-400' }, { label: 'Additional Expenses', value: fmtCurrency(viewingBooking.additionalExpenses), cls: 'text-amber-400' }].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between text-xs"><span className="text-gray-500">{label}</span><span className={`font-semibold ${cls}`}>{value}</span></div>
                ))}
                <div className="border-t border-white/[0.06] pt-2.5 flex justify-between text-xs"><span className="text-gray-400 font-semibold">Balance Due</span><span className="font-bold text-amber-300">{fmtCurrency(Math.max(0, Number(viewingBooking.quotationAmount) - Number(viewingBooking.advanceAmount)))}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400 font-semibold">Net Profit</span><span className="font-bold text-emerald-400">{fmtCurrency(viewingBooking.profit)}</span></div>
              </div>
              {viewingBooking.staffAssignments.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Assigned Staff</h4>
                  <div className="space-y-2">{viewingBooking.staffAssignments.map(a => (<div key={a.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/[0.04]"><div><p className="text-xs font-semibold text-white">{a.user.firstName} {a.user.lastName}</p><p className="text-[10px] text-gray-500">{a.role}</p></div><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${a.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : a.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{a.status}</span></div>))}</div>
                </div>
              )}
              {(viewingBooking.notes || viewingBooking.additionalNotes) && (
                <div className="space-y-3">
                  {viewingBooking.notes && <div><h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Notes</h4><p className="text-xs text-gray-400 bg-black/20 p-3 rounded-xl border border-white/[0.04] leading-relaxed">{viewingBooking.notes}</p></div>}
                  {viewingBooking.additionalNotes && <div><h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Additional Notes</h4><p className="text-xs text-gray-400 bg-black/20 p-3 rounded-xl border border-white/[0.04] leading-relaxed">{viewingBooking.additionalNotes}</p></div>}
                </div>
              )}
              <p className="text-[11px] text-gray-700">Created {fmtDate(viewingBooking.createdAt)} · ID: <span className="font-mono text-gray-600">{viewingBooking.id.slice(0, 8)}…</span></p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              {isAdmin && <button onClick={() => { setViewingBooking(null); openEdit(viewingBooking); }} className="flex items-center gap-2 px-4 py-2.5 border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-xs font-semibold rounded-xl transition-all"><Pencil className="w-3.5 h-3.5" /> Edit Booking</button>}
              <button onClick={() => setViewingBooking(null)} className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-white text-xs font-semibold rounded-xl transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Staff Assignment Panel ── */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.08]">
              <div><span className="text-[9px] font-bold bg-violet-600/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-md uppercase">{selectedEvent.type}</span><h3 className="font-bold text-white text-base mt-2">{selectedEvent.title}</h3><p className="text-xs text-gray-500 mt-0.5">{fmtDate(selectedEvent.eventDate)}</p></div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {isAdmin ? (
                <>
                  <div className="flex justify-between items-center"><h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Roster Allocation</h4><span className="text-[9px] text-gray-600">Double booking protected</span></div>
                  {assignmentError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex gap-2 items-start"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{assignmentError}</div>}
                  <div className="space-y-2.5">
                    {['Photographer', 'Videographer', 'Drone Operator', 'Editor', 'Coordinator'].map(role => {
                      const currentAssignee = tempAssignments.find(i => i.role === role);
                      const fullStaffRecord = selectedEvent.staffAssignments.find(a => a.role === role);
                      return (
                        <div key={role} className="bg-black/20 p-3 rounded-xl border border-white/[0.04]">
                          <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-gray-400">{role}</span>{fullStaffRecord && <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${fullStaffRecord.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{fullStaffRecord.status}</span>}</div>
                          <select value={currentAssignee?.userId || ''} onChange={e => handleRoleSelection(role, e.target.value)} className="w-full bg-black/40 border border-white/[0.08] text-xs text-gray-300 rounded-lg py-1.5 px-2 focus:outline-none">
                            <option value="">Unassigned</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeProfile?.designation || 'Staff'})</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={handleSaveRoster} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> Save & Notify Crew</button>
                </>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Crew Assignments</h4>
                  {selectedEvent.staffAssignments.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-black/20 p-3 border border-white/[0.04] rounded-xl">
                      <div><p className="text-xs font-semibold text-white">{a.user.firstName} {a.user.lastName}</p><span className="text-[10px] text-gray-500">{a.role}</span></div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${a.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{a.status}</span>
                    </div>
                  ))}
                  {(() => {
                    const myAssign = selectedEvent.staffAssignments.find(a => a.user.id === user?.userId);
                    if (myAssign && myAssign.status === 'PENDING') return (
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <p className="text-[10px] font-bold text-violet-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Action Required: Confirm Availability</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleResponse(myAssign.id, 'DECLINED')} className="flex items-center justify-center gap-1.5 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-all"><UserX className="w-3.5 h-3.5" /> Decline</button>
                          <button onClick={() => handleResponse(myAssign.id, 'ACCEPTED')} className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/5 hover:bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl transition-all"><UserCheck className="w-3.5 h-3.5" /> Accept</button>
                        </div>
                      </div>
                    );
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0d0d1a] border border-red-500/20 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-400" /></div>
            <h3 className="text-base font-bold text-white mb-2">Delete Booking?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">This action cannot be undone. The booking and all associated staff assignments will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-60">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .form-field { width:100%; padding:.5rem .75rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:.625rem; color:#f8fafc; font-size:.75rem; transition:all .15s; outline:none; appearance:none; }
        .form-field::placeholder { color:rgba(148,163,184,.5); }
        .form-field:focus { border-color:rgba(139,92,246,.5); box-shadow:0 0 0 3px rgba(139,92,246,.1); background:rgba(139,92,246,.04); }
        .form-field option { background:#131320; color:#f8fafc; }
        select.form-field { cursor:pointer; }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><span className="text-violet-400">{icon}</span><h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</h3></div>
      {children}
    </div>
  );
}
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>;
}
function InfoCard({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="bg-black/20 p-3.5 rounded-xl border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-1"><span className="text-gray-600">{icon}</span><span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">{label}</span></div>
      <p className="text-sm font-semibold text-white pl-6">{value}</p>
      {children && <div className="pl-6">{children}</div>}
    </div>
  );
}
