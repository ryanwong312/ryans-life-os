import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const daysOfWeek = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurringEventForm({ eventForm, setEventForm }) {
  const recurringPattern = eventForm.recurring_pattern || {};

  const updatePattern = (updates) => {
    setEventForm({
      ...eventForm,
      recurring_pattern: {
        ...recurringPattern,
        ...updates
      }
    });
  };

  const toggleDayOfWeek = (day) => {
    const days = recurringPattern.days_of_week || [];
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b);
    updatePattern({ days_of_week: newDays });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={eventForm.recurring || false}
          onCheckedChange={(checked) => {
            setEventForm({
              ...eventForm,
              recurring: checked,
              recurring_pattern: checked ? { frequency: 'weekly', interval: 1 } : null
            });
          }}
        />
        <Label className="text-slate-300">Recurring Event</Label>
      </div>

      {eventForm.recurring && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Frequency</Label>
              <Select
                value={recurringPattern.frequency || 'weekly'}
                onValueChange={(value) => updatePattern({ frequency: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400">Repeat Every</Label>
              <Input
                type="number"
                min="1"
                value={recurringPattern.interval || 1}
                onChange={(e) => updatePattern({ interval: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {(recurringPattern.frequency === 'weekly' || recurringPattern.frequency === 'biweekly') && (
            <div>
              <Label className="text-slate-400 mb-2 block">Repeat On</Label>
              <div className="flex gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      (recurringPattern.days_of_week || []).includes(day.value)
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-slate-400">Ends</Label>
            <Select
              value={
                recurringPattern.end_date ? 'date' :
                recurringPattern.occurrences ? 'after' :
                'never'
              }
              onValueChange={(value) => {
                if (value === 'never') {
                  const { end_date, occurrences, ...rest } = recurringPattern;
                  setEventForm({ ...eventForm, recurring_pattern: rest });
                } else if (value === 'date') {
                  updatePattern({ occurrences: undefined });
                } else if (value === 'after') {
                  updatePattern({ end_date: undefined, occurrences: 10 });
                }
              }}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="date">On Date</SelectItem>
                <SelectItem value="after">After X Occurrences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurringPattern.end_date !== undefined && (
            <div>
              <Label className="text-slate-400">End Date</Label>
              <Input
                type="date"
                value={recurringPattern.end_date || ''}
                onChange={(e) => updatePattern({ end_date: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          {recurringPattern.occurrences !== undefined && (
            <div>
              <Label className="text-slate-400">Number of Occurrences</Label>
              <Input
                type="number"
                min="1"
                value={recurringPattern.occurrences || 10}
                onChange={(e) => updatePattern({ occurrences: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}