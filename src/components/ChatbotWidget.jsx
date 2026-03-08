import React, { useState, useRef, useEffect, useCallback } from 'react';
import './chatbot.css';

// ── Conversation flow configuration ──
const STEPS = [
  { id: 'greeting', question: "Awesome! Let's plan your dream trip. ✈️ First, what's your name?", type: 'text', field: 'name' },
  { id: 'destination', question: "Nice to meet you, {name}! 🌍 Where would you love to travel?", type: 'chips', field: 'destination',
    chips: ['Manali 🏔️', 'Goa 🏖️', 'Kerala 🌴', 'Rajasthan 🏰', 'Bali 🌺', 'Maldives 🏝️', 'Dubai 🌆', 'Thailand 🛕', 'Vietnam 🍜', 'Other'] },
  { id: 'start_date', question: "Awesome choice! 💡 *Tip: Traveling during long weekends gets booked fast!* 🌴\n\nWhat is your preferred **Start Date**? (e.g., 15 Aug 2026)", type: 'text', field: 'start_date', placeholder: 'DD/MM/YYYY or Date' },
  { id: 'end_date', question: "And what is your approximate **End Date**?", type: 'text', field: 'end_date', placeholder: 'DD/MM/YYYY or Date' },
  { id: 'duration', question: "How many nights will this trip be?", type: 'chips', field: 'duration',
    chips: ['3 nights', '5 nights', '7 nights', '10+ nights'] },
  { id: 'travelers', question: "How many travelers?", type: 'chips', field: 'travelers',
    chips: ['Solo', '2 (Couple)', '3–4', '5–8', '9+ (Group)'] },
  { id: 'budget', question: "What's your total budget per person?", type: 'chips', field: 'budget',
    chips: ['₹10k–25k', '₹25k–50k', '₹50k–1L', '₹1L+'] },
  { id: 'stay', question: "What kind of stay do you prefer? 🏨", type: 'chips', field: 'stay',
    chips: ['Budget', 'Comfort (3★)', 'Premium (4★)', 'Luxury (5★)'] },
  { id: 'special', question: "Any special requirements? ✨", type: 'chips', field: 'special',
    chips: ['Honeymoon 💑', 'Family with kids 👨‍👩‍👧', 'Adventure 🧗', 'Relaxation 🧘', 'Sightseeing 📸', 'None'] },
  { id: 'meals', question: "Any meal preferences we should know about? 🍽️", type: 'chips', field: 'meals',
    chips: ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan', 'No preference'] },
  { id: 'transport', question: "How would you like to travel to the destination? ✈️", type: 'chips', field: 'transport',
    chips: ['Flight ✈️', 'Train 🚂', 'Self drive 🚗', 'Bus 🚌', 'Flexible'] },
  { id: 'generate', question: "Perfect! Let me create a sample itinerary for you... ✨", type: 'ai' },
  { id: 'confirm', question: "Shall I send your details to our expert team for a fully customised package? They'll contact you within 2 hours! 📞", type: 'chips', field: 'confirm',
    chips: ['Yes, send my details ✅', 'Not now'] },
  { id: 'phone', question: "Great! 📱 What's your phone number so we can reach you?", type: 'text', field: 'phone', placeholder: 'e.g. +91 9876543210' },
  { id: 'email', question: "And your email address? 📧", type: 'text', field: 'email', placeholder: 'e.g. your@email.com' },
  { id: 'submit', question: "Submitting your enquiry...", type: 'submit' },
];

const TOTAL_STEPS = STEPS.length;

// ── SVG Icons ──
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ── Helper: parse bold markdown ──
function renderMarkdown(text) {
  if (!text) return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ── Main Component ──
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(() => !sessionStorage.getItem('te_chatbot_interacted'));
  const [isClosing, setIsClosing] = useState(false);
  const [mode, setMode] = useState('welcome'); // 'welcome', 'chat', 'enquiry'
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [submissionRef, setSubmissionRef] = useState(null);
  const [showBadge, setShowBadge] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Restore from sessionStorage ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('te_chatbot_state');
      if (saved) {
        const state = JSON.parse(saved);
        setMessages(state.messages || []);
        setCurrentStep(state.currentStep || 0);
        setFormData(state.formData || {});
        setItinerary(state.itinerary || null);
        setSubmissionRef(state.submissionRef || null);
        setMode(state.mode || 'welcome');
        if ((state.currentStep || 0) > 0 || state.mode !== 'welcome') setShowBadge(false);
      }
    } catch (e) { /* ignore parse errors */ }
  }, []);

  // ── Save to sessionStorage on changes ──
  useEffect(() => {
    try {
      sessionStorage.setItem('te_chatbot_state', JSON.stringify({
        messages, currentStep, formData, itinerary, submissionRef, mode
      }));
    } catch (e) { /* ignore quota errors */ }
  }, [messages, currentStep, formData, itinerary, submissionRef, mode]);

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Start conversation when opened ──
  useEffect(() => {
    if (isOpen) {
      sessionStorage.setItem('te_chatbot_interacted', 'true');
      setShowBadge(false);
    }
    if (isOpen && messages.length === 0 && mode === 'welcome') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ 
          type: 'bot', 
          text: "Hi! 👋 I'm **Aria**, your AI travel assistant at TravelEpisodes.in.\n\nHow can I help you today?",
          chips: ['Plan a Trip ✈️', 'Ask a Question 🧐']
        }]);
      }, 600);
    }
  }, [isOpen]);

  // ── Listen for custom event to open chat ──
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setShowBadge(false);
      // If user came via Enquiry CTA, automatically trigger "Plan a Trip"
      if (mode === 'welcome' && messages.length <= 1) {
        startEnquiryMode();
      }
    };
    window.addEventListener('open-te-chatbot', handleOpenChat);
    return () => window.removeEventListener('open-te-chatbot', handleOpenChat);
  }, [mode, messages.length]);

  // ── Toggle chat ──
  const toggleChat = useCallback(() => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => { setIsClosing(false); setIsOpen(false); }, 250);
    } else {
      setIsOpen(true);
      setShowBadge(false);
    }
  }, [isOpen]);

  // ── Show bot message with typing delay ──
  const showBotMessage = useCallback((text, delay = 800, additionalProps = {}) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text, ...additionalProps }]);
    }, delay);
  }, []);

  // ── Replace {name} in template ──
  const interpolate = useCallback((text) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => formData[key] || key);
  }, [formData]);

  // ── Progress percentage ──
  const progress = mode === 'enquiry' ? Math.round((currentStep / (TOTAL_STEPS - 1)) * 100) : 0;

  // ── Start Enquiry Flow ──
  const startEnquiryMode = () => {
    setMessages(prev => [...prev, { type: 'user', text: 'Plan a Trip ✈️' }]);
    setMode('enquiry');
    setCurrentStep(0);
    showBotMessage(STEPS[0].question, 600);
  };

  // ── Handle Generic AI Chat ──
  const handleGenericChat = async (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
    setMode('chat');
    setIsTyping(true);
    try {
      const historySummary = messages.map(m => (m.type === 'user' ? 'User: ' : 'Aria: ') + m.text).slice(-6).join('\n');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: historySummary })
      });
      const data = await res.json();
      setIsTyping(false);
      const reply = data.reply || "I'm sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { type: 'bot', text: reply, chips: ['Plan a Trip ✈️'] }]);
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, my AI brain is resting right now. We can still plan a trip though!", chips: ['Plan a Trip ✈️'] }]);
    }
  };

  // ── Handle advancing to next step ──
  const advanceStep = useCallback(async (stepIdx, value) => {
    const step = STEPS[stepIdx];
    if (!step) return;

    // Save field value
    if (step.field && value) {
      setFormData(prev => ({ ...prev, [step.field]: value }));
    }

    const nextIdx = stepIdx + 1;
    if (nextIdx >= TOTAL_STEPS) return;

    const nextStep = STEPS[nextIdx];
    setCurrentStep(nextIdx);

    // Special handling for AI generation step
    if (nextStep.type === 'ai') {
      showBotMessage(interpolate(nextStep.question), 500);
      // Call Gemini API
      setTimeout(() => generateItinerary(nextIdx), 1200);
      return;
    }

    const updatedFormData = { ...formData, ...(step.field && value ? { [step.field]: value } : {}) };

    // Special handling for submit step
    if (nextStep.type === 'submit') {
      showBotMessage(nextStep.question, 400);
      // Pass the fully updated formData directly to submitEnquiry to avoid closure staleness
      setTimeout(() => submitEnquiry(nextIdx, updatedFormData), 800);
      return;
    }

    // Skip phone/email steps if user said "Not now"
    if (step.id === 'confirm' && value === 'Not now') {
      showBotMessage("No problem! 😊 You can always reach us at travelepisodes.in or WhatsApp us anytime. Have a wonderful day! ✈️", 600);
      return;
    }

    // Show next question
    let questionText = nextStep.question;
    questionText = questionText.replace(/\{(\w+)\}/g, (_, key) => updatedFormData[key] || key);
    showBotMessage(questionText, 700);

  }, [formData, interpolate, showBotMessage]);

  // ── Handle chip click ──
  const handleChipClick = useCallback((value) => {
    if (value === 'Plan a Trip ✈️') {
      startEnquiryMode();
      return;
    }
    if (value === 'Ask a Question 🧐') {
      setMessages(prev => [...prev, { type: 'user', text: value }]);
      setMode('chat');
      showBotMessage("Sure! Ask me anything about our destinations, packages, or travel advice.", 600);
      return;
    }

    // Enquiry flow
    if (mode === 'enquiry') {
      setMessages(prev => [...prev, { type: 'user', text: value }]);
      advanceStep(currentStep, value);
    } else {
      // Chat mode standard response handling
      handleGenericChat(value);
    }
  }, [currentStep, advanceStep, mode]);

  // ── Handle text input ──
  const handleSend = useCallback(() => {
    const value = inputValue.trim();
    if (!value) return;

    setInputValue('');

    if (mode === 'welcome' || mode === 'chat') {
      handleGenericChat(value);
    } else if (mode === 'enquiry') {
      setMessages(prev => [...prev, { type: 'user', text: value }]);
      advanceStep(currentStep, value);
    }
  }, [inputValue, currentStep, advanceStep, mode, messages]);

  // ── Handle Enter key ──
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // ── Generate AI itinerary ──
  const generateItinerary = useCallback(async (stepIdx) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination || '',
          duration: formData.duration || '',
          travelers: formData.travelers || '',
          budget: formData.budget || '',
          stay: formData.stay || '',
          special: formData.special || 'None'
        })
      });

      const data = await res.json();

      if (data.success && data.itinerary) {
        setItinerary(data.itinerary);
        setIsTyping(false);
        setMessages(prev => [...prev, { type: 'itinerary', data: data.itinerary }]);
        // Advance to confirmation step
        const nextIdx = stepIdx + 1;
        setCurrentStep(nextIdx);
        const nextStep = STEPS[nextIdx];
        if (nextStep) {
          setTimeout(() => showBotMessage(nextStep.question, 500), 600);
        }
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('Itinerary generation failed:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "I couldn't generate the itinerary right now, but don't worry! Our travel experts will create a detailed, personalised plan for you. 😊"
      }]);
      // Skip to confirmation step
      const nextIdx = stepIdx + 1;
      setCurrentStep(nextIdx);
      const nextStep = STEPS[nextIdx];
      if (nextStep) {
        setTimeout(() => showBotMessage(nextStep.question, 500), 600);
      }
    }
  }, [formData, showBotMessage]);

  // ── Submit enquiry to Google Sheets ──
  const submitEnquiry = useCallback(async (stepIdx, finalData) => {
    setIsTyping(true);
    const refId = 'TE' + String(Date.now()).slice(-6);

    try {
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        // Omitting Content-Type allows the body to be sent as text/plain, 
        // which bypasses the CORS preflight OPTIONS request that Google Apps Script rejects.
        body: JSON.stringify({
          action: 'submitEnquiry',
          name: finalData.name || '',
          phone: finalData.phone || '',
          email: finalData.email || '',
          destination: finalData.destination || '',
          dates: finalData.start_date || '',  // Map start_date to dates
          duration: finalData.end_date || finalData.duration || '', // Map end_date or fallback to duration
          travelers: finalData.travelers || '',
          budget: finalData.budget || '',
          stay: finalData.stay || '',
          special: finalData.special || '',
          meals: finalData.meals || '',
          transport: finalData.transport || '',
          source: 'AI Chatbot',
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmissionRef(refId);
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'success', refId }]);

    } catch (error) {
      console.error('Submission error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Uh oh! I had some trouble saving your enquiry properly. But don’t worry, you can easily save it by filling the traditional form below!' 
      }]);
    }
  }, [formData]);

  // ── Determine current input mode ──
  const currentStepData = STEPS[currentStep];
  
  // Decide whether to show chips or input depending on the mode
  let showChips = false;
  let showInput = false;
  let inputPlaceholder = 'Type your answer...';
  
  if (mode === 'enquiry') {
    showChips = currentStepData?.type === 'chips' && !isTyping;
    showInput = currentStepData?.type === 'text' && !isTyping;
    inputPlaceholder = currentStepData?.placeholder || 'Type your answer...';
  } else {
    // Welcome and Chat Modes: Always allow text input, chips depend on message property
    showInput = !isTyping;
    inputPlaceholder = mode === 'welcome' ? 'Type "hello" or select an option...' : 'Ask me anything or type here...';
  }

  // Get chips from the LAST message if in welcome/chat mode
  let lastMessageChips = null;
  if (!isTyping && (mode === 'welcome' || mode === 'chat') && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === 'bot' && lastMsg.chips) {
      lastMessageChips = lastMsg.chips;
      showChips = true;
    }
  }

  const isFinished = submissionRef !== null || (mode === 'enquiry' && currentStepData?.id === 'confirm' && messages.some(m => m.type === 'user' && m.text === 'Not now'));

  return (
    <>
      {/* Floating Bubble */}
      <button
        className={`te-chat-bubble ${isOpen ? 'te-open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Chat with Aria'}
        id="te-chatbot-bubble"
      >
        {showBadge && !isOpen && <span className="te-bubble-badge">1</span>}
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`te-chat-window ${isClosing ? 'te-closing' : ''}`} id="te-chatbot-window">
          {/* Header */}
          <div className="te-chat-header">
            <div className="te-chat-avatar overflow-hidden">
              <img src="/favicon.jpg" alt="Aria" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="te-chat-header-info">
              <h3>Aria</h3>
              <p>TravelEpisodes.in • {mode === 'enquiry' ? 'Planning Trip' : 'Online'}</p>
            </div>
            <button className="te-chat-close" onClick={toggleChat} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          {/* Progress Bar (Only visible in enquiry mode) */}
          {mode === 'enquiry' && (
            <div className="te-progress-bar">
              <div className="te-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Messages */}
          <div className="te-chat-messages">
            {messages.map((msg, idx) => {
              if (msg.type === 'bot') {
                return (
                  <div key={idx} className="te-message te-bot">
                    <div className="te-msg-avatar overflow-hidden">
                      <img src="/favicon.jpg" alt="Aria" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="te-msg-content">{renderMarkdown(msg.text)}</div>
                  </div>
                );
              }
              if (msg.type === 'user') {
                return (
                  <div key={idx} className="te-message te-user">
                    <div className="te-msg-content">{msg.text}</div>
                  </div>
                );
              }
              if (msg.type === 'itinerary' && msg.data) {
                return <ItineraryCard key={idx} data={msg.data} />;
              }
              if (msg.type === 'success') {
                return <SuccessCard key={idx} refId={msg.refId} />;
              }
              return null;
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="te-typing">
                <div className="te-typing-dots">
                  <div className="te-typing-dot" />
                  <div className="te-typing-dot" />
                  <div className="te-typing-dot" />
                </div>
              </div>
            )}

            {/* Quick reply chips */}
            {showChips && mode === 'enquiry' && currentStepData?.chips && (
              <div className="te-chips">
                {currentStepData.chips.map((chip) => (
                  <button key={chip} className="te-chip" onClick={() => handleChipClick(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            )}
            
            {showChips && (mode === 'welcome' || mode === 'chat') && lastMessageChips && (
              <div className="te-chips">
                {lastMessageChips.map((chip) => (
                  <button key={chip} className="te-chip" onClick={() => handleChipClick(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!isFinished && (
            <div className="te-chat-input-area">
              <input
                ref={inputRef}
                type={currentStepData?.field === 'phone' ? 'tel' : currentStepData?.field === 'email' ? 'email' : 'text'}
                className="te-chat-input"
                placeholder={
                  showInput
                    ? inputPlaceholder
                    : showChips
                    ? 'Pick an option above or type...'
                    : 'Please wait...'
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button
                className="te-chat-send"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          )}

          {/* Powered By */}
          <div className="te-powered-by">
            Powered by <a href="https://travelepisodes.in" target="_blank" rel="noopener noreferrer">TravelEpisodes.in</a>
          </div>
        </div>
      )}
    </>
  );
}

// ── Itinerary Card Component ──
function ItineraryCard({ data }) {
  return (
    <div className="te-itinerary-card">
      <div className="te-itinerary-header">
        <span className="te-itinerary-title">📋 Your Sample Itinerary</span>
        {data.costMin && data.costMax && (
          <span className="te-cost-badge">{data.costMin} – {data.costMax}</span>
        )}
      </div>
      {data.days?.map((day, idx) => (
        <div key={idx} className="te-day-item">
          <div className="te-day-label">{day.day}</div>
          <div className="te-day-title">{day.title}</div>
          <div className="te-day-activities">{day.activities}</div>
        </div>
      ))}
      <div className="te-itinerary-footer">
        {data.includes && (
          <div className="te-includes">
            <strong>✅ Includes:</strong> {data.includes}
          </div>
        )}
        {data.note && (
          <div className="te-tip">💡 {data.note}</div>
        )}
      </div>
    </div>
  );
}

// ── Success Card Component ──
function SuccessCard({ refId }) {
  return (
    <div className="te-success-card">
      <div className="te-success-icon">🎉</div>
      <div className="te-success-ref">✅ Enquiry Submitted!</div>
      <div className="te-success-ref" style={{ fontSize: '14px', color: '#94a3b8' }}>{refId}</div>
      <div className="te-success-text">
        Our travel expert will WhatsApp you<br />
        within 2 hours with your customised<br />
        itinerary and pricing! ✈️
      </div>
    </div>
  );
}
