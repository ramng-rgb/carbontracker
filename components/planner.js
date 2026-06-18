import { PLANNER_PLEDGES } from '../data.js';

export function renderPlanner(container, userState, onCommitPledge, onRemovePledge) {
  const activePledges = userState.committedPledges || [];
  const annualCO2 = parseFloat((userState.calculatorData?.annualFootprint || 0).toFixed(1));
  const breakdown = userState.calculatorData?.breakdown || { transport: 0, energy: 0, diet: 0, consumption: 0 };
  const dailyLogs = userState.loggedActivities || [];

  // Calculate carbon grade
  let grade = 'F';
  let gradeDesc = 'Critical Deficit';
  if (annualCO2 === 0) {
    grade = '--';
    gradeDesc = 'No Profile data. Please complete the Footprint Calculator.';
  } else if (annualCO2 <= 2.0) {
    grade = 'A+';
    gradeDesc = 'Climate Champion (Sustainable target reached)';
  } else if (annualCO2 <= 4.0) {
    grade = 'A';
    gradeDesc = 'Eco Leader';
  } else if (annualCO2 <= 6.0) {
    grade = 'B';
    gradeDesc = 'Eco Mindful';
  } else if (annualCO2 <= 10.0) {
    grade = 'C';
    gradeDesc = 'Moderate impact';
  } else if (annualCO2 <= 14.0) {
    grade = 'D';
    gradeDesc = 'Marginal';
  }

  const drawUI = () => {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">Action Planner</h1>
          <p class="section-subtitle">Commit to long-term adjustments and evaluate your progress with a Premium Eco Audit.</p>
        </div>
      </div>

      <!-- Pro Promo Banner -->
      <div class="glass-card marketplace-intro" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="font-size: 18px; margin-bottom: 4px;">📊 Pro Sustainability Audit</h3>
          <p style="font-size: 13px; color: var(--text-secondary);">
            Generate a full sustainability audit of your metrics, including an official carbon grade, and download the report for credentials.
          </p>
        </div>
        <button class="btn btn-pro" id="btn-open-audit"><i class="fas fa-file-contract"></i> View Audit Card</button>
      </div>

      <h3 class="glass-card-title" style="margin-bottom: 16px;"><span class="title-icon">🌱</span> Available Eco Pledges</h3>
      
      <div class="pledge-cards-grid">
        ${PLANNER_PLEDGES.map(pledge => {
          const isCommitted = activePledges.includes(pledge.id);
          const diffClass = pledge.difficulty.toLowerCase();
          
          return `
            <div class="glass-card pledge-card">
              <div class="pledge-card-header">
                <div class="pledge-icon-title">
                  <span class="pledge-avatar-emoji">${pledge.icon}</span>
                  <div>
                    <h4 class="pledge-heading">${pledge.name}</h4>
                    <span class="difficulty-badge ${diffClass}">${pledge.difficulty}</span>
                  </div>
                </div>
              </div>
              <p class="pledge-desc">${pledge.desc}</p>
              <div class="pledge-card-footer">
                <div class="pledge-impact">
                  Est. Impact: <span>-${pledge.impact}</span> kg CO₂/yr
                </div>
                ${isCommitted ? `
                  <button class="pledge-btn committed" disabled>✓ Active Commitment</button>
                ` : `
                  <button class="pledge-btn commit" data-pledge-id="${pledge.id}">Commit</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Audit Report Modal (Terrasense Pro Premium Modal) -->
      <div class="modal-overlay" id="audit-modal-overlay">
        <div class="modal-content audit-modal-content" id="print-section">
          <button class="modal-close-btn" id="btn-close-audit">×</button>
          
          <div class="audit-report-container">
            <div class="audit-header">
              <div class="audit-brand-text">TERRA<span>SENSE</span> <span class="pro-badge">Pro</span></div>
              <div class="audit-date-badge">${new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div class="audit-intro">
              This official report evaluates the household energy, commuting transportation, diet profiles, and shopping habits of <strong>${userState.userName || 'Eco Guardian'}</strong>.
            </div>

            <div class="audit-score-summary">
              <div class="audit-grade-box">
                <span class="audit-grade-letter">${grade}</span>
                <span class="audit-grade-label">ECO GRADE</span>
              </div>
              <div class="audit-stats-box">
                <div class="audit-stat-item">
                  <span class="audit-stat-lbl">Annual Footprint</span>
                  <div class="audit-stat-val">${annualCO2 > 0 ? annualCO2 + ' t CO2e' : 'No Data'}</div>
                </div>
                <div class="audit-stat-item">
                  <span class="audit-stat-lbl">Pledges Active</span>
                  <div class="audit-stat-val">${activePledges.length} Active</div>
                </div>
                <div class="audit-stat-item">
                  <span class="audit-stat-lbl">Offsets Tracked</span>
                  <div class="audit-stat-val">${dailyLogs.length} actions</div>
                </div>
                <div class="audit-stat-item" style="border-color: #bbf7d0; background: #f0fdf4;">
                  <span class="audit-stat-lbl" style="color: #15803d;">Rating Status</span>
                  <div class="audit-stat-val" style="color: #16a34a; font-size:11px;">${gradeDesc}</div>
                </div>
              </div>
            </div>

            <div class="audit-breakdown">
              <h4 class="audit-section-heading">Emission Gaps Breakdown</h4>
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Emissions (Tonnes CO₂/yr)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🚗 Transportation</td>
                    <td>${parseFloat(breakdown.transport.toFixed(2))}</td>
                    <td style="color: ${breakdown.transport > 2.0 ? '#ef4444' : '#10b981'}; font-weight:600;">
                      ${breakdown.transport > 2.0 ? 'High Deficit' : 'Optimal'}
                    </td>
                  </tr>
                  <tr>
                    <td>⚡ Home Energy</td>
                    <td>${parseFloat(breakdown.energy.toFixed(2))}</td>
                    <td style="color: ${breakdown.energy > 1.8 ? '#ef4444' : '#10b981'}; font-weight:600;">
                      ${breakdown.energy > 1.8 ? 'High Deficit' : 'Optimal'}
                    </td>
                  </tr>
                  <tr>
                    <td>🥦 Dietary Profile</td>
                    <td>${parseFloat(breakdown.diet.toFixed(2))}</td>
                    <td style="color: ${breakdown.diet > 1.5 ? '#ef4444' : '#10b981'}; font-weight:600;">
                      ${breakdown.diet > 1.5 ? 'Moderate Deficit' : 'Optimal'}
                    </td>
                  </tr>
                  <tr>
                    <td>🛍️ Consumption / Waste</td>
                    <td>${parseFloat(breakdown.consumption.toFixed(2))}</td>
                    <td style="color: ${breakdown.consumption > 1.5 ? '#ef4444' : '#10b981'}; font-weight:600;">
                      ${breakdown.consumption > 1.5 ? 'Deficit' : 'Optimal'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 class="audit-section-heading">AI Action Guidelines</h4>
              <div class="audit-rec-list">
                ${annualCO2 === 0 ? `
                  <div class="audit-rec-item">Please complete your carbon footprint calculator profile to receive automated guidelines.</div>
                ` : ''}
                ${breakdown.transport > 2.0 ? `
                  <div class="audit-rec-item">Transitioning transportation: commit to a minimum of 2 public transit commutes per week, saving ~320 kg CO₂.</div>
                ` : ''}
                ${breakdown.energy > 1.8 ? `
                  <div class="audit-rec-item">Optimizing energy: switch your lighting fixtures to LEDs and program your smart thermostat settings.</div>
                ` : ''}
                ${breakdown.diet > 1.5 ? `
                  <div class="audit-rec-item">Transitioning diet: adopt flexitarian options. Substituting beef with vegetables once daily saves ~730 kg CO₂ annually.</div>
                ` : ''}
                ${activePledges.length === 0 ? `
                  <div class="audit-rec-item">Unlock more badges: pledge to support at least 1 action card to trigger target carbon reductions.</div>
                ` : `
                  <div class="audit-rec-item">Excellent work committing to active pledges. Ensure active execution to achieve your estimated annual reduction of ${activePledges.length * 350} kg.</div>
                `}
              </div>
            </div>

            <div class="audit-footer-stamp">
              Terrasense Pro Audit System Certification • Protected by Gold Standard Multipliers
            </div>

            <div class="cert-buttons-row" style="margin-top: 24px;">
              <button class="btn btn-primary" id="btn-print-audit"><i class="fas fa-print"></i> Print / Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindEvents = () => {
    // 1. Commit Pledge Button Event
    container.querySelectorAll('.pledge-btn.commit').forEach(btn => {
      btn.addEventListener('click', () => {
        const pledgeId = btn.getAttribute('data-pledge-id');
        onCommitPledge(pledgeId);
        drawUI();
      });
    });

    // Modal triggers
    const overlay = container.querySelector('#audit-modal-overlay');
    const btnOpen = container.querySelector('#btn-open-audit');
    const btnClose = container.querySelector('#btn-close-audit');
    const btnPrint = container.querySelector('#btn-print-audit');

    if (btnOpen && overlay) {
      btnOpen.addEventListener('click', () => {
        overlay.classList.add('active');
      });
    }

    if (btnClose && overlay) {
      btnClose.addEventListener('click', () => {
        overlay.classList.remove('active');
      });
    }

    // Print event
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  };

  drawUI();
}
