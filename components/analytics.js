import { MOCK_HISTORY } from '../data.js';

export function renderAnalytics(container, userState) {
  const annualCO2 = parseFloat((userState.calculatorData?.annualFootprint || 0).toFixed(1));
  const breakdown = userState.calculatorData?.breakdown || { transport: 0, energy: 0, diet: 0, consumption: 0 };

  const drawUI = () => {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">Footprint Analytics</h1>
          <p class="section-subtitle">Detailed data reports, category breakdowns, and performance tracks over time.</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Chart 1: Breakdown -->
        <div class="glass-card span-2-cols" style="min-height: 380px; display: flex; flex-direction: column;">
          <h3 class="glass-card-title"><span class="title-icon">📊</span> Category Distribution</h3>
          <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center;">
            ${annualCO2 === 0 ? `
              <div style="text-align: center; color: var(--text-muted);">
                <p style="font-size: 32px;">📈</p>
                <p>Complete the calculator to view your carbon distribution chart.</p>
              </div>
            ` : `
              <canvas id="chart-breakdown" style="max-height: 280px; max-width: 100%;"></canvas>
            `}
          </div>
        </div>

        <!-- Stats Overview Panel -->
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <h3 class="glass-card-title"><span class="title-icon">📉</span> Target Benchmarks</h3>
          
          <div style="display: flex; flex-direction: column; gap: 16px; flex: 1; justify-content: center;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-size:13px;">Your Carbon Intensity:</span>
              <span style="font-weight: 700; color: ${annualCO2 > 4.0 ? 'var(--color-red)' : 'var(--color-green)'};">${annualCO2 > 0 ? annualCO2 + ' tonnes' : '--'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-size:13px;">Paris Agreement Goal:</span>
              <span style="font-weight: 700; color: var(--color-green);">2.0 tonnes</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-size:13px;">National US Average:</span>
              <span style="font-weight: 700; color: var(--text-muted);">16.0 tonnes</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary); font-size:13px;">Overall Reduction Grade:</span>
              <span style="font-weight: 700; color: var(--color-teal);">${annualCO2 <= 4.0 ? 'Exemplary (A)' : annualCO2 <= 8.0 ? 'Moderate (B)' : 'Needs Work'}</span>
            </div>
          </div>
          
          <div style="font-size:11px; color: var(--text-muted); border-top:1px solid var(--border-glass); padding-top:12px;">
            Benchmarks calculate total equivalent emissions including direct transit and electric generation offsets.
          </div>
        </div>

        <!-- Chart 2: Historical trends -->
        <div class="glass-card span-3-cols" style="min-height: 400px; display: flex; flex-direction: column;">
          <h3 class="glass-card-title"><span class="title-icon">📈</span> Weekly Footprint Reduction Trend</h3>
          <div style="flex: 1; position: relative;">
            <canvas id="chart-trends" style="max-height: 320px; width: 100%;"></canvas>
          </div>
        </div>
      </div>
    `;

    // Initialize Chart.js instances if scripts are loaded
    setTimeout(initCharts, 200);
  };

  const initCharts = () => {
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js is not loaded yet.");
      return;
    }

    // 1. Render Breakdown doughnut
    const ctxBreakdown = document.getElementById('chart-breakdown');
    if (ctxBreakdown && annualCO2 > 0) {
      new Chart(ctxBreakdown, {
        type: 'doughnut',
        data: {
          labels: ['Transport', 'Home Utilities', 'Dietary Choice', 'Consumption'],
          datasets: [{
            data: [
              parseFloat(breakdown.transport.toFixed(1)),
              parseFloat(breakdown.energy.toFixed(1)),
              parseFloat(breakdown.diet.toFixed(1)),
              parseFloat(breakdown.consumption.toFixed(1))
            ],
            backgroundColor: [
              '#3b82f6', // Blue
              '#f59e0b', // Amber
              '#10b981', // Green
              '#8b5cf6'  // Purple
            ],
            borderWidth: 1,
            borderColor: 'rgba(7, 10, 19, 0.8)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#94a3b8',
                font: { family: 'Inter' }
              }
            }
          }
        }
      });
    }

    // 2. Render Historical Trends Bar Chart
    const ctxTrends = document.getElementById('chart-trends');
    if (ctxTrends) {
      // Create trends labels and stacks
      const labels = MOCK_HISTORY.map(h => h.week);
      const transportData = MOCK_HISTORY.map(h => h.transport);
      const energyData = MOCK_HISTORY.map(h => h.energy);
      const dietData = MOCK_HISTORY.map(h => h.diet);
      const consumptionData = MOCK_HISTORY.map(h => h.consumption);

      new Chart(ctxTrends, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Transport', data: transportData, backgroundColor: '#3b82f6' },
            { label: 'Home Energy', data: energyData, backgroundColor: '#f59e0b' },
            { label: 'Diet', data: dietData, backgroundColor: '#10b981' },
            { label: 'Shopping', data: consumptionData, backgroundColor: '#8b5cf6' }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              stacked: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' },
              title: { display: true, text: 'Emissions (kg CO2)', color: '#94a3b8' }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { family: 'Inter' }
              }
            }
          }
        }
      });
    }
  };

  drawUI();
}
