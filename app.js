import { renderDashboard } from './components/dashboard.js';
import { renderCalculator } from './components/calculator.js';
import { renderTracker } from './components/tracker.js';
import { renderPlanner } from './components/planner.js';
import { renderMarketplace } from './components/marketplace.js';
import { renderIotGrid } from './components/iotGrid.js';
import { renderAnalytics } from './components/analytics.js';
import { renderAiChatTab } from './components/aiChatTab.js';
import { getAICoachResponse } from './components/aiCoach.js';
import { encryptPayload, decryptPayload } from './components/security.js';

// Define the global application state key
const STATE_STORAGE_KEY = 'terrasense_user_state';

// Default initial state
const DEFAULT_STATE = {
  userName: 'Eco Guardian',
  calculatorData: {
    annualFootprint: 4.8, // Initial seed score so the dashboard is functional instantly
    breakdown: { transport: 2.2, energy: 1.2, diet: 0.9, consumption: 0.5 },
    inputs: { carType: 'sedan', carMil: 6000, transitMil: 1200, flightHrs: 8, electricKwh: 220, gasTherms: 15, dietType: 'average', shoppingType: 'moderate' }
  },
  loggedActivities: [
    { id: 'commute_bike', name: 'Commute by bike/walk', category: 'transport', offset: 4.8, icon: '🚲', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'vegan_meal', name: 'Had a plant-based meal', category: 'diet', offset: 2.1, icon: '🥗', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
  ],
  committedPledges: ['pledge_led'],
  purchasedOffsets: [],
  unlockedBadges: ['badge_initiate'],
  iotState: { temperature: 72, ecoMode: false },
  streak: 3
};

class TerrasenseApp {
  constructor() {
    this.state = this.loadState();
    this.viewport = document.getElementById('app-viewport');
    
    this.initRouter();
    this.initChatbot();
    this.initBadgeEvaluations();
  }

  loadState() {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (raw) {
      try {
        // Try decrypting. If it is plain text JSON, fallback parser works
        const decrypted = decryptPayload(raw);
        if (decrypted) return decrypted;
        return JSON.parse(raw);
      } catch (e) {
        console.error("Failed parsing user state, reverting to defaults.", e);
      }
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    const encrypted = encryptPayload(this.state);
    if (encrypted) {
      localStorage.setItem(STATE_STORAGE_KEY, encrypted);
    } else {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(this.state));
    }
    this.initBadgeEvaluations(); // Check if any new badges were unlocked on state change
  }

  initRouter() {
    const handleRoute = () => {
      const hash = window.location.hash || '#dashboard';
      
      // Update sidebar active highlights
      document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        const route = item.getAttribute('data-route');
        if (route === hash) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Clear viewport and render active page component
      this.viewport.innerHTML = '';
      
      switch (hash) {
        case '#dashboard':
          renderDashboard(this.viewport, this.state, this.logActivity.bind(this));
          break;
        case '#calculator':
          renderCalculator(this.viewport, this.state, (calcResults, shouldSave) => {
            this.state.calculatorData = calcResults;
            if (shouldSave) {
              this.saveState();
            }
          });
          break;
        case '#tracker':
          renderTracker(this.viewport, this.state, 
            this.logActivity.bind(this),
            this.clearActivities.bind(this)
          );
          break;
        case '#aiChatTab':
          renderAiChatTab(this.viewport, this.state, this.saveState.bind(this));
          break;
        case '#planner':
          renderPlanner(this.viewport, this.state,
            this.commitPledge.bind(this),
            this.removePledge.bind(this)
          );
          break;
        case '#marketplace':
          renderMarketplace(this.viewport, this.state, this.purchaseOffset.bind(this));
          break;
        case '#iotGrid':
          renderIotGrid(this.viewport, this.state, this.updateIotState.bind(this));
          break;
        case '#analytics':
          renderAnalytics(this.viewport, this.state);
          break;
        default:
          window.location.hash = '#dashboard';
      }
    };

    // Listen to hash change routing
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('DOMContentLoaded', handleRoute);

    // Sidebar navigation clicks and keyboard support
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      const triggerRoute = () => {
        const route = item.getAttribute('data-route');
        if (route) window.location.hash = route;
      };
      
      item.addEventListener('click', triggerRoute);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerRoute();
        }
      });
    });

    // Invoke route handler initially
    handleRoute();
  }

  initBadgeEvaluations() {
    const unlocked = this.state.unlockedBadges || [];

    // 1. Eco Initiate: Completed calculator
    if (this.state.calculatorData?.annualFootprint > 0 && !unlocked.includes('badge_initiate')) {
      unlocked.push('badge_initiate');
    }
    // 2. Transit Pioneer: Logged bike/walk/transit
    const hasTransitLog = (this.state.loggedActivities || []).some(log => log.id === 'commute_bike' || log.id === 'public_transit');
    if (hasTransitLog && !unlocked.includes('badge_commute')) {
      unlocked.push('badge_commute');
    }
    // 3. Plant Powered: Logged vegan meal
    const hasDietLog = (this.state.loggedActivities || []).some(log => log.id === 'vegan_meal');
    if (hasDietLog && !unlocked.includes('badge_diet')) {
      unlocked.push('badge_diet');
    }
    // 4. Grid Master: Active Nest Eco Mode
    if (this.state.iotState?.ecoMode && !unlocked.includes('badge_iot')) {
      unlocked.push('badge_iot');
    }
    // 5. Net Zero Hero: Purchased offset credit
    if ((this.state.purchasedOffsets || []).length > 0 && !unlocked.includes('badge_offset')) {
      unlocked.push('badge_offset');
    }

    this.state.unlockedBadges = unlocked;
    // Silent save to storage
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(this.state));
  }

  // State manipulation methods passed as callbacks
  logActivity(activityObj) {
    this.state.loggedActivities.push(activityObj);
    
    // Increment streak on action
    const today = new Date().toDateString();
    const lastLogDate = this.state.lastLogDate;
    if (lastLogDate !== today) {
      this.state.streak = (this.state.streak || 0) + 1;
      this.state.lastLogDate = today;
    }

    this.saveState();
    
    // If we are on dashboard or tracker, redraw to reflect points
    const hash = window.location.hash;
    if (hash === '#dashboard') {
      renderDashboard(this.viewport, this.state, this.logActivity.bind(this));
    } else if (hash === '#tracker') {
      renderTracker(this.viewport, this.state, this.logActivity.bind(this), this.clearActivities.bind(this));
    }
  }

  clearActivities() {
    this.state.loggedActivities = [];
    this.saveState();
  }

  commitPledge(pledgeId) {
    if (!this.state.committedPledges.includes(pledgeId)) {
      this.state.committedPledges.push(pledgeId);
      this.saveState();
    }
  }

  removePledge(pledgeId) {
    this.state.committedPledges = this.state.committedPledges.filter(id => id !== pledgeId);
    this.saveState();
  }

  purchaseOffset(offsetOrder) {
    this.state.purchasedOffsets.push(offsetOrder);
    this.saveState();
  }

  updateIotState(iotConfig) {
    this.state.iotState = iotConfig;
    this.saveState();
  }

  /* Chatbot Interactivity Setup */
  initChatbot() {
    const launcher = document.getElementById('chat-launcher');
    const popup = document.getElementById('chat-popup');
    const btnClose = document.getElementById('chat-close');
    const input = document.getElementById('chat-input-field');
    const btnSend = document.getElementById('chat-send');
    const msgStream = document.getElementById('chat-stream');
    const typing = document.getElementById('chat-typing');

    if (!launcher || !popup || !btnClose || !input || !btnSend || !msgStream || !typing) return;

    // Toggle widget
    launcher.addEventListener('click', () => {
      popup.classList.toggle('active');
      input.focus();
    });

    btnClose.addEventListener('click', () => {
      popup.classList.remove('active');
    });

    const appendMessage = (sender, text) => {
      const msg = document.createElement('div');
      msg.classList.add('chat-msg', sender); // 'bot' or 'user'
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      msg.innerHTML = `
        <div class="chat-bubble">${text}</div>
        <span class="chat-msg-time">${timeStr}</span>
      `;
      
      msgStream.appendChild(msg);
      msgStream.scrollTop = msgStream.scrollHeight;
    };

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;

      // 1. User Message
      appendMessage('user', text);
      input.value = '';

      // 2. Show Typing Indicator
      typing.style.display = 'block';
      msgStream.scrollTop = msgStream.scrollHeight;

      // 3. Process reply on delay
      setTimeout(() => {
        typing.style.display = 'none';
        
        // Fetch chatbot logic reply
        const reply = getAICoachResponse(text, this.state);
        appendMessage('bot', reply);
      }, 800 + Math.random() * 500); // Dynamic conversational delay
    };

    btnSend.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    // Seed greeting on load if stream empty
    if (msgStream.children.length === 0) {
      appendMessage('bot', "Hello! I'm TerraAI, your personal eco-coach. How can I help you reduce your environmental footprint today?");
    }
  }
}

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new TerrasenseApp();
});
