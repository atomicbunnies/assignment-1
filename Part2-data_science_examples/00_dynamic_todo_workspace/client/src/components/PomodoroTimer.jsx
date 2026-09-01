import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  X,
  Flame,
  CheckCircle,
  Timer
} from 'lucide-react';

export const PomodoroModal = ({ onClose }) => {
  const { tasks, patchTask } = useTasks();

  const [mode, setMode] = useState('focus'); // 'focus' (25m), 'short' (5m), 'long' (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  const MODES = {
    focus: { duration: 25 * 60, label: 'Focus Session', color: '#ef4444' },
    short: { duration: 5 * 60, label: 'Short Break', color: '#10b981' },
    long: { duration: 15 * 60, label: 'Long Break', color: '#06b6d4' }
  };

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sound.playPomodoroFinish();
      triggerConfetti();

      if (mode === 'focus') {
        setCompletedSessions((c) => c + 1);
        if (selectedTaskId) {
          const target = tasks.find((t) => t.id === selectedTaskId);
          if (target) {
            patchTask(selectedTaskId, {
              time_spent_minutes: (target.time_spent_minutes || 0) + 25
            });
          }
        }
        alert('🎉 Focus session completed! Take a well-deserved break.');
      } else {
        alert('⏰ Break finished! Ready to focus?');
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, selectedTaskId, tasks, patchTask]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
    sound.playClick();
  };

  const handleToggle = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Timer size={20} style={{ color: MODES[mode].color }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Pomodoro Focus</h3>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1.25rem 1.5rem 0',
            justifyContent: 'center'
          }}
        >
          {['focus', 'short', 'long'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: mode === m ? MODES[m].color : 'var(--bg-elevated)',
                color: mode === m ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Big Timer Dial */}
        <div
          style={{
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '4.25rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              textShadow: `0 0 30px ${MODES[mode].color}40`,
              marginBottom: '1rem'
            }}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '80%',
              height: 6,
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: MODES[mode].color,
                borderRadius: 'var(--radius-full)',
                transition: 'width 1s linear'
              }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-icon" onClick={handleReset} title="Reset Timer">
              <RotateCcw size={18} />
            </button>

            <button
              onClick={handleToggle}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: MODES[mode].color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${MODES[mode].color}60`,
                transition: 'all var(--transition-fast)'
              }}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
            </button>
          </div>
        </div>

        {/* Task Binding Dropdown */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}
        >
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Link Focus Session to Task:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">-- None (Freestyle Focus) --</option>
            {tasks
              .filter((t) => t.status !== 'completed')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};
