'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const presets = [
  { label: '1 hour before',  offset: { value: 1,  unit: 'hours' } },
  { label: '3 hours before', offset: { value: 3,  unit: 'hours' } },
  { label: '1 day before',   offset: { value: 1,  unit: 'days'  } },
  { label: '3 days before',  offset: { value: 3,  unit: 'days'  } },
  { label: '1 week before',  offset: { value: 1,  unit: 'weeks' } },
];

const units = ['minutes', 'hours', 'days', 'weeks'];

export default function ReminderPicker({ eventId, onSuccess }) {
  const [mode, setMode] = useState('preset');
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState({ value: 1, unit: 'hours' });
  const [loading, setLoading] = useState(false);

  const handleSet = async () => {
    const offset = mode === 'preset' ? selected : custom;
    if (!offset) { toast.error('Please select a reminder time'); return; }

    setLoading(true);
    try {
      await api.post('/reminders', { eventId, offset });
      toast.success('Reminder set successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-brand-600" />
        <p className="text-sm font-medium text-ink-700">Set a reminder</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {['preset', 'custom'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${mode === m
                ? 'bg-brand-600 text-white'
                : 'bg-surface-100 text-ink-600 hover:bg-surface-200'
              }`}
          >
            {m === 'preset' ? 'Quick select' : 'Custom'}
          </button>
        ))}
      </div>

      {mode === 'preset' ? (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setSelected(p.offset)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                ${JSON.stringify(selected) === JSON.stringify(p.offset)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-surface-200 text-ink-600 hover:border-surface-300'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={custom.value}
            onChange={(e) => setCustom({ ...custom, value: Number(e.target.value) })}
            className="input w-20 text-center"
          />
          <select
            value={custom.unit}
            onChange={(e) => setCustom({ ...custom, unit: e.target.value })}
            className="input flex-1"
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <span className="text-xs text-ink-500 whitespace-nowrap">before</span>
        </div>
      )}

      <button
        onClick={handleSet}
        disabled={loading || (mode === 'preset' && !selected)}
        className="btn-secondary text-sm w-full justify-center"
      >
        {loading ? 'Setting...' : 'Set reminder'}
      </button>
    </div>
  );
}