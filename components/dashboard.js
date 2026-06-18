import { DAILY_HABITS } from '../data.js';

export function renderDashboard(container, userState, onLogHabit) {
  const annualCO2 = parseFloat((userState.calculatorData?.annualFootprint || 0).toFixed(1));
  const breakdown = userState.calculatorData?.breakdown || { transport: 0, energy: 0, diet: 0, consumption: 0 };
  
  // Calculate daily offsets
  const dailyLogs = userState.loggedActivities || [];
  const todayStr = new Date().toDateString();
  const todayLogs = dailyLogs.filter(log => new Date(log.timestamp).toDateString() === todayStr);
  const dailyOffsetTotal = parseFloat(todayLogs.reduce((sum, item) => sum + item.offset, 0).toFixed(1));

  // Unlocked pledges annual impact
  const activePledges = userState.committedPledges || [];
  const annualPledgeSavings = activePledges.length * 350; // simple estimation for quick visual metrics

  // Calculate gauge fill ratio. Scale it relative to US Average of 16 Tonnes.
  // 502 is the maximum stroke dash-array circumference.
  const targetTonnes = 2.0; // Paris target
  const maxScale = 16.0;   // US national average comparison
  const gaugePercent = Math.min((annualCO2 / maxScale), 1.0);
  // Subtracting from 502 to get the stroke offset. 502 = empty, 0 = 100% full.
  const strokeOffset = 502 - (gaugePercent * 502);

  // Determine badges unlock status
  const earnedBadges = userState.unlockedBadges || [];

  // Generate Personalized AI recommendations
  const getAIRecommendations = () => {
    const recs = [];
    if (annualCO2 === 0) {
      recs.push({
        title: "Setup Your Profile",
        desc: "Complete the Footprint Calculator to unlock personalized insights.",
        icon: "📋"
      });
      return recs;
    }

    if (breakdown.transport > 2.0) {
      recs.push({
        title: "AI Transport Alert",
        desc: "Transportation is your highest emission sector. Try riding a bike or carpooling twice a week to shave off ~800 kg CO2.",
        icon: "🚲"
      });
    }

    if (breakdown.energy > 1.8) {
      recs.push({
        title: "AI Home Energy Alert",
        desc: "Your home utility usage is above average. Try upgrading to LED bulbs or switching your wash cycle to cold to save 150 kg.",
        icon: "💡"
      });
    }

    if (breakdown.diet > 1.5) {
      recs.push({
        title: "AI Diet Insight",
        desc: "Reducing meat intake can slash your food footprint. Swapping beef for plant-based alternatives 3 days a week saves up to 900 kg.",
        icon: "🥗"
      });
    }

    // Default general advice
    if (recs.length < 3) {
      recs.push({
        title: "AI Pro Tip: Carbon Offset",
        desc: "Offset your remaining emissions through verified sustainability projects in the Offset Marketplace.",
        icon: "🌍"
      });
    }
    return recs;
  };

  const aiRecs = getAIRecommendations();

  // Badges lists definition
  const badgeConfig = [
    { id: 'badge_initiate', name: 'Eco Initiate', icon: '🌱', desc: 'Completed the Carbon Calculator' },
    { id: 'badge_commute', name: 'Transit Pioneer', icon: '🚲', desc: 'Logged walking/bike or public transit' },
    { id: 'badge_diet', name: 'Plant Powered', icon: '🥦', desc: 'Logged vegan/vegetarian diet action' },
    { id: 'badge_iot', name: 'Grid Master', icon: '⚡', desc: 'Activated Eco mode on thermostat' },
    { id: 'badge_offset', name: 'Net Zero Hero', icon: '🥇', desc: 'Offsided emissions in the Marketplace' }
  ];

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h1 class="section-title">Eco Dashboard</h1>
        <p class="section-subtitle">Real-time overview of your environmental footprint and green habits.</p>
      </div>
      <div>
        <button class="btn btn-pro" id="btn-dashboard-audit"><i class="fas fa-file-invoice"></i> Generate Eco Audit</button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Gauge Card -->
      <div class="glass-card score-hero-card">
        <h3 class="glass-card-title"><span class="title-icon">📊</span> Annual Footprint</h3>
        
        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 180 180" role="img" aria-label="Annual carbon footprint gauge showing ${annualCO2 > 0 ? annualCO2 : 0} Tonnes CO₂">
            <circle class="gauge-track" cx="90" cy="90" r="80"></circle>
            <circle class="gauge-fill" id="dashboard-gauge-fill" cx="90" cy="90" r="80" style="stroke-dashoffset: 502;"></circle>
          </svg>
          <div class="gauge-text">
            <span class="gauge-number">${annualCO2 > 0 ? annualCO2 : '--'}</span>
            <span class="gauge-unit">Tonnes CO₂</span>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
          ${annualCO2 > 0 ? (annualCO2 <= targetTonnes ? '🎉 You are under the global target threshold!' : 'You are above the global target threshold of 2.0 Tonnes.') : 'Complete the calculator to see score.'}
        </p>

        <div class="score-stats">
          <div class="stat-sub-box">
            <div class="stat-sub-value">${targetTonnes} t</div>
            <div class="stat-sub-label">Target Limit</div>
          </div>
          <div class="stat-sub-box" style="border-left: 1px solid var(--border-glass); border-right: 1px solid var(--border-glass);">
            <div class="stat-sub-value">${maxScale} t</div>
            <div class="stat-sub-label">US Average</div>
          </div>
          <div class="stat-sub-box">
            <div class="stat-sub-value">${parseFloat(breakdown.transport.toFixed(1))} t</div>
            <div class="stat-sub-label">Travel CO₂</div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Card -->
      <div class="span-2-cols mini-stats-grid">
        <div class="glass-card stat-card">
          <div class="stat-icon-wrapper">
            <span>🥗</span>
          </div>
          <div class="stat-details">
            <span class="stat-label">Daily Offset (Today)</span>
            <span class="stat-value" id="dashboard-daily-offset">${dailyOffsetTotal} kg</span>
          </div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-icon-wrapper purple">
            <span>🔥</span>
          </div>
          <div class="stat-details">
            <span class="stat-label">Active Streak</span>
            <span class="stat-value">${userState.streak || 0} days</span>
          </div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-icon-wrapper amber">
            <span>🎗️</span>
          </div>
          <div class="stat-details">
            <span class="stat-label">Active Pledges</span>
            <span class="stat-value">${activePledges.length} committed</span>
          </div>
        </div>

        <div class="glass-card stat-card">
          <div class="stat-icon-wrapper" style="background: rgba(20, 184, 166, 0.1); color: var(--color-teal);">
            <span>♻️</span>
          </div>
          <div class="stat-details">
            <span class="stat-label">Pledge Savings (Est)</span>
            <span class="stat-value">${annualPledgeSavings} kg/yr</span>
          </div>
        </div>
      </div>

      <!-- AI Recommendations Card -->
      <div class="span-2-cols glass-card pro-card">
        <h3 class="glass-card-title"><span class="title-icon">⚡</span> TerraAI Live Guidance</h3>
        <div class="ai-recommendations-panel">
          ${aiRecs.map(rec => `
            <div class="ai-recommendation-card">
              <span class="ai-rec-icon">${rec.icon}</span>
              <div class="ai-rec-content">
                <div class="ai-rec-title">${rec.title}</div>
                <div class="ai-rec-desc">${rec.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Logs card -->
      <div class="glass-card">
        <h3 class="glass-card-title"><span class="title-icon">⚡</span> Quick Logs</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-secondary btn-quick-log" data-habit="vegan_meal" style="text-align: left; justify-content: flex-start;">
            🥗 Plant-based Meal (-2.1kg)
          </button>
          <button class="btn btn-secondary btn-quick-log" data-habit="commute_bike" style="text-align: left; justify-content: flex-start;">
            🚲 Bike Commute (-4.8kg)
          </button>
          <button class="btn btn-secondary btn-quick-log" data-habit="short_shower" style="text-align: left; justify-content: flex-start;">
            🚿 Short Shower (-0.9kg)
          </button>
        </div>
      </div>

      <!-- Badges card -->
      <div class="span-3-cols glass-card">
        <h3 class="glass-card-title"><span class="title-icon">🏅</span> Carbon Achievement Badges</h3>
        <div class="badge-list">
          ${badgeConfig.map(badge => {
            const isUnlocked = earnedBadges.includes(badge.id);
            return `
              <div class="badge-item ${isUnlocked ? 'unlocked' : ''}" role="img" tabindex="0" aria-label="Badge: ${badge.name}. Status: ${isUnlocked ? 'Unlocked' : 'Locked'}. Description: ${badge.desc}">
                <div class="badge-circle" aria-hidden="true">${badge.icon}</div>
                <div class="badge-name" aria-hidden="true">${badge.name}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Animate the gauge arc after rendering
  setTimeout(() => {
    const fill = container.querySelector('#dashboard-gauge-fill');
    if (fill) {
      fill.style.strokeDashoffset = strokeOffset;
    }
  }, 100);

  // Bind Quick Log Button Events
  container.querySelectorAll('.btn-quick-log').forEach(btn => {
    btn.addEventListener('click', () => {
      const habitId = btn.getAttribute('data-habit');
      const habit = DAILY_HABITS.find(h => h.id === habitId);
      if (habit) {
        onLogHabit({
          id: habit.id,
          name: habit.name,
          category: habit.category,
          offset: habit.offset,
          icon: habit.icon,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Bind Generate Audit Button Event
  const btnAudit = container.querySelector('#btn-dashboard-audit');
  if (btnAudit) {
    btnAudit.addEventListener('click', () => {
      window.location.hash = '#planner';
      // Automatically trigger audit modal after redirection
      setTimeout(() => {
        const auditBtn = document.querySelector('#btn-open-audit');
        if (auditBtn) auditBtn.click();
      }, 200);
    });
  }
}
