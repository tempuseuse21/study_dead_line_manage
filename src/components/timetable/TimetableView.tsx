import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  MapPin,
  User,
  Trash2,
  Edit3,
  BookOpen,
  X,
  Sparkles,
  CheckCircle2,
  Tag,
  Layers,
  FlaskConical,
  GraduationCap
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { DayOfWeek, TimetableSlot } from '../../types';
import { cn } from '../../lib/utils';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TimetableFormModalProps {
  slot?: TimetableSlot;
  onClose: () => void;
}

const TimetableFormModal: React.FC<TimetableFormModalProps> = ({ slot, onClose }) => {
  const { subjects, addTimetableSlot, updateTimetableSlot } = useTasks();
  const isEdit = !!slot;

  const [day, setDay] = useState<DayOfWeek>(slot?.day || 'Monday');
  const [startTime, setStartTime] = useState(slot?.startTime || '09:00');
  const [endTime, setEndTime] = useState(slot?.endTime || '10:00');
  const [selectedSubjectId, setSelectedSubjectId] = useState(slot?.subjectId || subjects[0]?.id || '');
  const [subjectName, setSubjectName] = useState(slot?.subjectName || subjects[0]?.name || '');
  const [room, setRoom] = useState(slot?.room || '');
  const [professor, setProfessor] = useState(slot?.professor || '');
  const [type, setType] = useState<TimetableSlot['type']>(slot?.type || 'lecture');
  const [color, setColor] = useState(slot?.color || '#3b82f6');
  const [notes, setNotes] = useState(slot?.notes || '');

  const presetColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#f97316'];

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = subjects.find(s => s.id === subId);
    if (sub) {
      setSubjectName(sub.name);
      setProfessor(sub.professor || sub.teacherName || '');
      setColor(sub.color || '#3b82f6');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const sub = subjects.find(s => s.id === selectedSubjectId);

    const slotData: Partial<TimetableSlot> = {
      day,
      startTime,
      endTime,
      subjectId: selectedSubjectId || undefined,
      subjectCode: sub?.code || 'CLASS',
      subjectName: subjectName.trim(),
      room: room.trim(),
      professor: professor.trim(),
      type,
      color,
      notes: notes.trim()
    };

    if (isEdit && slot) {
      updateTimetableSlot(slot.id, slotData);
    } else {
      addTimetableSlot(slotData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-display font-bold text-base text-[var(--text-main)]">
              {isEdit ? 'Edit Class Slot' : 'Add Class to Timetable'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
              Select Day *
            </label>
            <select
              value={day}
              onChange={e => setDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-semibold"
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
              Curriculum Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-semibold mb-2"
            >
              <option value="">-- Custom Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
              Class / Topic Name *
            </label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
              placeholder="e.g. Database Systems Lecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Room / Venue / Lab
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. LH-101 or Computer Lab 3"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-1">
                Class Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-semibold"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Lab Session</option>
                <option value="tutorial">Tutorial</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)]">
                Professor / Instructor
              </label>
              {selectedSubjectId && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✨ Auto-assigned from Subject
                </span>
              )}
            </div>
            <input
              type="text"
              value={professor}
              onChange={e => setProfessor(e.target.value)}
              placeholder="e.g. Prof. Ramesh Kulkarni"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-xs uppercase text-[var(--text-muted)] mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-transform cursor-pointer',
                    color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gradient-brand-bg text-white font-bold shadow-md hover:scale-105 transition-all"
            >
              {isEdit ? 'Save Changes' : 'Add to Timetable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TimetableView: React.FC<{ onNavigate?: (view: string) => void }> = () => {
  const { timetableSlots, subjects, deleteTimetableSlot } = useTasks();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const getTodayDayName = (): DayOfWeek => {
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date().getDay()];
  };

  const todayName = getTodayDayName();

  const sortedSlots = useMemo(() => {
    return [...timetableSlots].sort((a, b) => {
      const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [timetableSlots]);

  const displayedSlots = useMemo(() => {
    if (selectedDay === 'all') return sortedSlots;
    return sortedSlots.filter(s => s.day === selectedDay);
  }, [sortedSlots, selectedDay]);

  const getTypeBadge = (t: TimetableSlot['type']) => {
    switch (t) {
      case 'lab':
        return { label: 'LAB', bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      case 'tutorial':
        return { label: 'TUTORIAL', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'seminar':
        return { label: 'SEMINAR', bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
      default:
        return { label: 'LECTURE', bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
              Class Timetable & Weekly Schedule
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shared Master Timetable</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Shared master timetable for lectures, lab sessions, and tutorials — synced in real-time for all users.
          </p>
        </div>

        <button
          onClick={() => { setEditingSlot(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand-bg text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedDay === 'all'
              ? 'gradient-brand-bg text-white shadow-xs'
              : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Full Week ({timetableSlots.length} Slots)
        </button>

        {DAYS.map(dayName => {
          const isToday = dayName === todayName;
          const isSelected = selectedDay === dayName;
          const count = timetableSlots.filter(s => s.day === dayName).length;
          return (
            <button
              key={dayName}
              onClick={() => setSelectedDay(dayName)}
              className={cn(
                'px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              )}
            >
              <span>{dayName}</span>
              {isToday && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                  Today
                </span>
              )}
              {count > 0 && (
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Schedule Cards Grid */}
      {selectedDay === 'all' ? (
        /* Full Week View grouped by Day */
        <div className="space-y-6">
          {DAYS.map(dName => {
            const daySlots = sortedSlots.filter(s => s.day === dName);
            const isToday = dName === todayName;
            if (daySlots.length === 0) return null;

            return (
              <div key={dName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                  <h2 className="font-display font-bold text-base text-[var(--text-main)]">
                    {dName}
                  </h2>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                      Today's Schedule
                    </span>
                  )}
                  <span className="text-xs font-mono text-[var(--text-muted)] ml-auto">
                    {daySlots.length} Classes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySlots.map(slot => {
                    const badge = getTypeBadge(slot.type);
                    const profName = slot.professor || subjects.find(s => s.id === slot.subjectId || s.name.toLowerCase() === slot.subjectName.toLowerCase())?.professor || subjects.find(s => s.id === slot.subjectId || s.name.toLowerCase() === slot.subjectName.toLowerCase())?.teacherName;
                    return (
                      <div
                        key={slot.id}
                        className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border"
                              style={{
                                backgroundColor: slot.color ? `${slot.color}15` : 'rgba(99,102,241,0.1)',
                                color: slot.color || '#4f46e5',
                                borderColor: slot.color ? `${slot.color}30` : 'rgba(99,102,241,0.3)'
                              }}
                            >
                              {slot.subjectCode || 'CLASS'}
                            </span>

                            <span className={cn('text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border', badge.bg)}>
                              {badge.label}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-sm text-[var(--text-main)] mb-1">
                            {slot.subjectName}
                          </h3>

                          <div className="space-y-1 text-xs text-[var(--text-muted)] mt-2">
                            <div className="flex items-center gap-1.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{slot.startTime} – {slot.endTime}</span>
                            </div>

                            {slot.room && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                                <span>{slot.room}</span>
                              </div>
                            )}

                            {profName && (
                              <div className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
                                <User className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                                <span>{profName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-[var(--border-subtle)]">
                          <button
                            onClick={() => { setEditingSlot(slot); setShowModal(true); }}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                            title="Edit slot"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Remove ${slot.subjectName} from timetable?`)) deleteTimetableSlot(slot.id); }}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Day Schedule Cards */
        <div className="space-y-3">
          {displayedSlots.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <Clock className="w-10 h-10 text-[var(--text-faint)] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">No classes scheduled for {selectedDay}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Enjoy your free time or add a new lecture/lab slot.</p>
              <button
                onClick={() => { setEditingSlot(null); setShowModal(true); }}
                className="mt-4 px-4 py-2 rounded-xl gradient-brand-bg text-white font-bold text-xs"
              >
                + Add Class Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSlots.map(slot => {
                const badge = getTypeBadge(slot.type);
                const profName = slot.professor || subjects.find(s => s.id === slot.subjectId || s.name.toLowerCase() === slot.subjectName.toLowerCase())?.professor || subjects.find(s => s.id === slot.subjectId || s.name.toLowerCase() === slot.subjectName.toLowerCase())?.teacherName;
                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: slot.color ? `${slot.color}15` : 'rgba(99,102,241,0.1)',
                            color: slot.color || '#4f46e5',
                            borderColor: slot.color ? `${slot.color}30` : 'rgba(99,102,241,0.3)'
                          }}
                        >
                          {slot.subjectCode || 'CLASS'}
                        </span>

                        <span className={cn('text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border', badge.bg)}>
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-sm text-[var(--text-main)] mb-1">
                        {slot.subjectName}
                      </h3>

                      <div className="space-y-1 text-xs text-[var(--text-muted)] mt-2">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>

                        {slot.room && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                            <span>{slot.room}</span>
                          </div>
                        )}

                        {profName && (
                          <div className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
                            <User className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                            <span>{profName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={() => { setEditingSlot(slot); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                        title="Edit slot"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Remove ${slot.subjectName} from timetable?`)) deleteTimetableSlot(slot.id); }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TimetableFormModal
          slot={editingSlot || undefined}
          onClose={() => { setShowModal(false); setEditingSlot(null); }}
        />
      )}
    </div>
  );
};
