import { DAILY_HABITS } from '../data.js';
import { parseNaturalLanguageActivity } from './aiNlp.js';

export function renderTracker(container, userState, onAddLog, onClearLogs) {
  
  const drawUI = () => {
    const dailyLogs = userState.loggedActivities || [];
    // Sort logs descending by timestamp
    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">Habit Tracker</h1>
          <p class="section-subtitle">Log your daily eco-friendly actions using AI NLP or direct checklist tags.</p>
        </div>
      </div>

      <div class="tracker-split-grid">
        <!-- Left Side: Log inputs -->
        <div>
          <!-- NLP Logger Panel -->
          <div class="glass-card pro-card" style="margin-bottom: 24px;">
            <h3 class="glass-card-title"><span class="title-icon">🤖</span> AI Natural Language Logger</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
              Simply type your environmental activities below. Our AI engine parses the action, distance, or duration to calculate carbon offsets!
            </p>
            
            <div class="nlp-log-bar">
              <input type="text" class="nlp-input" id="nlp-logger-input" placeholder="e.g. 'I rode my bike 8 km' or 'ate vegetarian lunch and took a 5 min shower'">
              <button class="nlp-submit" id="nlp-logger-submit">Analyze & Log</button>
            </div>

            <div class="nlp-feedback-bubble" id="nlp-feedback"></div>
          </div>

          <!-- Checklist Panel -->
          <div class="glass-card">
            <h3 class="glass-card-title"><span class="title-icon">✔️</span> Quick Checklist</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
              Click cards directly to log standardized daily activities.
            </p>
            
            <div class="habit-checklist-grid">
              ${DAILY_HABITS.map(habit => `
                <div class="habit-log-card" data-habit-id="${habit.id}">
                  <div class="habit-card-left">
                    <span class="habit-emoji">${habit.icon}</span>
                    <div class="habit-card-info">
                      <span class="habit-card-name">${habit.name}</span>
                      <span class="habit-card-offset">-${habit.offset} kg CO₂</span>
                    </div>
                  </div>
                  <div class="habit-log-btn"><i class="fas fa-plus"></i></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Side: Logs timeline -->
        <div class="glass-card" style="display: flex; flex-direction: column; max-height: 600px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="glass-card-title" style="margin-bottom:0;"><span class="title-icon">🕒</span> Activity Log History</h3>
            ${sortedLogs.length > 0 ? `<button class="btn btn-secondary" id="btn-clear-logs" style="padding: 4px 10px; font-size: 11px;">Clear All</button>` : ''}
          </div>

          <div class="timeline-container" style="flex: 1; overflow-y: auto;">
            ${sortedLogs.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
                <p style="font-size: 32px; margin-bottom: 8px;">📭</p>
                <p>No actions logged today. Type an activity or select checklist actions on the left to get started!</p>
              </div>
            ` : sortedLogs.map(log => {
              const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
              return `
                <div class="timeline-item">
                  <div class="timeline-node">${log.icon || '🌱'}</div>
                  <div class="timeline-content-card">
                    <div class="timeline-meta">
                      <span>${formattedDate} • ${formattedTime}</span>
                      <span style="color: var(--color-green); font-weight:700;">-${log.offset} kg CO₂</span>
                    </div>
                    <div class="timeline-title">${log.name}</div>
                    <div class="timeline-detail" style="text-transform: capitalize; color: var(--text-muted); font-size:10px;">Category: ${log.category}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindEvents = () => {
    // 1. NLP Form trigger
    const nlpSubmit = container.querySelector('#nlp-logger-submit');
    const nlpInput = container.querySelector('#nlp-logger-input');
    const nlpFeedback = container.querySelector('#nlp-feedback');

    if (nlpSubmit && nlpInput && nlpFeedback) {
      const handleNlpLog = () => {
        const text = nlpInput.value;
        const result = parseNaturalLanguageActivity(text);

        nlpFeedback.style.display = 'block';
        nlpFeedback.textContent = result.feedback;

        if (result.success) {
          nlpFeedback.style.background = 'rgba(16, 185, 129, 0.08)';
          nlpFeedback.style.borderColor = 'rgba(16, 185, 129, 0.2)';
          nlpInput.value = '';

          // Add all matches to log
          result.matches.forEach(match => {
            onAddLog({
              id: match.id,
              name: match.name,
              category: match.category,
              offset: match.offset,
              icon: match.icon,
              timestamp: new Date().toISOString()
            });
          });

          // Re-draw layout
          setTimeout(drawUI, 2000);
        } else {
          nlpFeedback.style.background = 'rgba(239, 68, 68, 0.08)';
          nlpFeedback.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        }
      };

      nlpSubmit.addEventListener('click', handleNlpLog);
      nlpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleNlpLog();
      });
    }

    // 2. Checklist card logging
    container.querySelectorAll('.habit-log-card').forEach(card => {
      card.addEventListener('click', () => {
        const habitId = card.getAttribute('data-habit-id');
        const habit = DAILY_HABITS.find(h => h.id === habitId);
        if (habit) {
          onAddLog({
            id: habit.id,
            name: habit.name,
            category: habit.category,
            offset: habit.offset,
            icon: habit.icon,
            timestamp: new Date().toISOString()
          });
          drawUI();
        }
      });
    });

    // 3. Clear logs list
    const btnClear = container.querySelector('#btn-clear-logs');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all your tracked habits history?")) {
          onClearLogs();
          drawUI();
        }
      });
    }
  };

  drawUI();
}
