import { getAICoachResponse } from './aiCoach.js';

export function renderAiChatTab(container, userState, onSaveState) {
  let chatHistory = userState.chatHistory || [
    { sender: 'bot', text: "Hello! I am TerraAI, your live sustainability assistant. Ask me any environmental question, or click one of the quick guides below to get started!", timestamp: new Date().toISOString() }
  ];

  const drawUI = () => {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">AI Eco-Coach</h1>
          <p class="section-subtitle">Chat live with our specialized ecological intelligence to receive real-time carbon reduction advice.</p>
        </div>
      </div>

      <div class="tracker-split-grid" style="grid-template-columns: 3fr 1.5fr;">
        <!-- Left Side: Immersive Chat Interface -->
        <div class="glass-card" style="display: flex; flex-direction: column; height: 550px; padding: 20px;">
          <!-- Chat Messages Container -->
          <div class="chat-messages-container" id="tab-chat-stream" style="flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px;">
            ${chatHistory.map(msg => {
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return `
                <div class="chat-msg ${msg.sender}" style="max-width: 85%; align-self: ${msg.sender === 'user' ? 'flex-end' : 'flex-start'};">
                  <div class="chat-bubble" style="background: ${msg.sender === 'user' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.02)'}; color: ${msg.sender === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)'}; border: ${msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)'}; border-radius: 12px; border-bottom-${msg.sender === 'user' ? 'right' : 'left'}-radius: 2px; padding: 12px 16px; font-size: 13.5px; line-height: 1.5; white-space: pre-line;">
                    ${msg.text}
                  </div>
                  <span class="chat-msg-time" style="font-size: 9px; color: var(--text-muted); margin-top: 4px; display: block; text-align: ${msg.sender === 'user' ? 'right' : 'left'};">${formattedTime}</span>
                </div>
              `;
            }).join('')}

            <!-- Typing Indicator (Tab-specific) -->
            <div class="typing-indicator" id="tab-chat-typing" style="display: none; align-self: flex-start; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-glass); padding: 8px 12px; border-radius: 12px; border-bottom-left-radius: 2px;">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>

          <!-- Input bar -->
          <div class="nlp-log-bar" style="margin-bottom: 0;">
            <input type="text" class="nlp-input" id="tab-chat-input" placeholder="Type a live question (e.g. 'What is the footprint of beef vs tofu?')...">
            <button class="nlp-submit" id="tab-chat-submit">Send Query</button>
          </div>
        </div>

        <!-- Right Side: Sidebar of Prompt Shortcuts -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Quick Suggestions -->
          <div class="glass-card pro-card">
            <h3 class="glass-card-title" style="font-size:15px; margin-bottom:12px;"><span class="title-icon">💡</span> Quick Questions</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="btn btn-secondary btn-prompt-tag" data-prompt="How can I reduce my transportation footprint?" style="text-align: left; font-size: 11.5px; padding: 8px 12px;">
                🚗 Transport Tips
              </button>
              <button class="btn btn-secondary btn-prompt-tag" data-prompt="What is the carbon footprint of an average diet?" style="text-align: left; font-size: 11.5px; padding: 8px 12px;">
                🥗 Diet Comparisons
              </button>
              <button class="btn btn-secondary btn-prompt-tag" data-prompt="Give me tips to lower my home electricity footprint" style="text-align: left; font-size: 11.5px; padding: 8px 12px;">
                💡 Utility Savings
              </button>
              <button class="btn btn-secondary btn-prompt-tag" data-prompt="What is my current carbon footprint status?" style="text-align: left; font-size: 11.5px; padding: 8px 12px;">
                📊 Check My Status
              </button>
            </div>
          </div>

          <!-- Live Model Status -->
          <div class="glass-card" style="padding: 16px;">
            <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Model Parameters</h4>
            <div style="font-size: 11px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
              <div>Context Window: <strong>8,192 tokens</strong></div>
              <div>Knowledge Cutoff: <strong>Live Sync</strong></div>
              <div>Ecological Profile: <strong style="color: var(--color-green);">Connected</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
    scrollStreamToBottom();
  };

  const scrollStreamToBottom = () => {
    const stream = container.querySelector('#tab-chat-stream');
    if (stream) {
      stream.scrollTop = stream.scrollHeight;
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // 1. Add User message
    chatHistory.push({
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    });
    
    // Save to global user state
    userState.chatHistory = chatHistory;
    onSaveState();
    
    drawUI();

    // 2. Show Typing Indicator
    const typing = container.querySelector('#tab-chat-typing');
    if (typing) {
      typing.style.display = 'block';
      scrollStreamToBottom();
    }

    // 3. Process reply on delay
    setTimeout(() => {
      if (typing) typing.style.display = 'none';

      const reply = getAICoachResponse(text, userState);
      
      chatHistory.push({
        sender: 'bot',
        text: reply,
        timestamp: new Date().toISOString()
      });

      userState.chatHistory = chatHistory;
      onSaveState();
      drawUI();
    }, 700 + Math.random() * 500);
  };

  const bindEvents = () => {
    const input = container.querySelector('#tab-chat-input');
    const submit = container.querySelector('#tab-chat-submit');

    if (input && submit) {
      submit.addEventListener('click', () => {
        handleSendMessage(input.value);
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSendMessage(input.value);
        }
      });
    }

    // Bind Prompt tags
    container.querySelectorAll('.btn-prompt-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        handleSendMessage(prompt);
      });
    });
  };

  drawUI();
}
