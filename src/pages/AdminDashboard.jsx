import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Send, 
  RefreshCw, 
  MoreHorizontal, 
  ChevronRight,
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import './admin.css';

// ── Dynamic Status Styling Helper ──
const getStatusClass = (status) => {
  const s = (status || 'New').toLowerCase();
  if (s.includes('new')) return 'te-status-new';
  if (s.includes('contact')) return 'te-status-contacted';
  if (s.includes('sent') || s.includes('proposal') || s.includes('itinerary')) return 'te-status-itinerary-sent';
  if (s.includes('confirm') || s.includes('paid') || s.includes('success')) return 'te-status-confirmed';
  if (s.includes('close') || s.includes('lost') || s.includes('cancel')) return 'te-status-closed';
  return 'te-status-generic';
};

// ── Admin Dashboard ──
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Check if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('te_admin_auth') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const validUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD || 'travel2024';
    if (username === validUser && password === validPass) {
      setIsLoggedIn(true);
      sessionStorage.setItem('te_admin_auth', 'true');
    } else {
      setLoginError('Invalid credentials. Try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('te_admin_auth');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="te-login-screen">
        <form className="te-login-card" onSubmit={handleLogin}>
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="TravelEpisodes Logo" className="h-20 object-contain" />
          </div>
          <h1>TravelEpisodes</h1>
          <p>Admin Dashboard</p>
          <div className="te-login-field">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" autoFocus />
          </div>
          <div className="te-login-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <button type="submit" className="te-login-btn">Sign In</button>
          {loginError && <div className="te-login-error">{loginError}</div>}
        </form>
      </div>
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

// ── Dashboard Main ──
function Dashboard({ onLogout }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('enquiries');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showSendModal, setShowSendModal] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(true);

  // ── Settings State (Persistent) ──
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('te_admin_settings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      contactNumber: '+91 9876543210',
      whatsappTemplate: "Hi {name}! 🌟 Your dream trip to {destination} is ready. We've crafted a beautiful itinerary for you right here: {link}",
      emailSignature: "Warm regards,\nTeam TravelEpisodes"
    };
  });

  useEffect(() => {
    localStorage.setItem('te_admin_settings', JSON.stringify(settings));
  }, [settings]);

  // ── Fetch enquiries ──
  const fetchEnquiries = useCallback(async () => {
    try {
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
      if (!webhookUrl) {
        setWebhookConfigured(false);
        setLoading(false);
        return;
      }

      setWebhookConfigured(true);
      const res = await fetch(`${webhookUrl}?action=getAll`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEnquiries(data);
      }
    } catch (err) {
      console.error('Fetch enquiries error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEnquiries();
    const interval = setInterval(fetchEnquiries, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [fetchEnquiries]);

  // ── Reset modals on navigation ──
  useEffect(() => {
    setSelectedEnquiry(null);
    setShowSendModal(null);
  }, [activeNav]);

  // ── Body Scroll Lock ──
  useEffect(() => {
    if (selectedEnquiry || showSendModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedEnquiry, showSendModal]);

  // ── Stats computation ──
  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => e.status === 'New').length;
    const sentCount = enquiries.filter(e => e.status === 'Itinerary Sent').length;
    const confirmedCount = enquiries.filter(e => e.status === 'Confirmed').length;
    // Rough revenue estimate: counting Confirmed trips * avg 35k
    const revenue = confirmedCount * 35000;
    return { total, newCount, sentCount, confirmedCount, revenue };
  }, [enquiries]);

  // ── Dynamic Filters ──
  const dynamicFilters = useMemo(() => {
    const statuses = enquiries.map(e => e.status).filter(Boolean);
    const uniqueStatuses = [...new Set(statuses)];
    return ['All', ...uniqueStatuses];
  }, [enquiries]);

  // ── Filtered + sorted enquiries ──
  const filteredEnquiries = useMemo(() => {
    let list = [...enquiries];
    // Filter by status
    if (filter !== 'All') list = list.filter(e => e.status === filter);
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.destination || '').toLowerCase().includes(q) ||
        (e.id || '').toLowerCase().includes(q)
      );
    }
    // Sort
    list.sort((a, b) => {
      let va = a[sortBy] || '';
      let vb = b[sortBy] || '';
      if (sortBy === 'timestamp') {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [enquiries, filter, searchQuery, sortBy, sortDir]);

  // ── Sort handler ──
  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  // ── Checkbox toggle ──
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEnquiries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEnquiries.map(e => e.id)));
    }
  };

  // ── Status update ──
  const updateStatus = async (id, newStatus) => {
    try {
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(`${webhookUrl}?action=updateStatus`, {
          method: 'POST',
          // Omitting Content-Type sends as text/plain, bypassing GAS CORS preflight
          body: JSON.stringify({ action: 'updateStatus', id, status: newStatus })
        });
      }
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      showToast(`✅ Status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // ── Bulk mark contacted ──
  const bulkMarkContacted = () => {
    selectedIds.forEach(id => updateStatus(id, 'Contacted'));
    setSelectedIds(new Set());
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const selected = enquiries.filter(e => selectedIds.has(e.id));
    const data = selected.length > 0 ? selected : filteredEnquiries;
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Source', 'Destination', 'Start Loc', 'Dates', 'Duration', 'Travelers', 'Budget', 'Stay', 'Transport', 'Meals', 'Special', 'Status'];
    const rows = data.map(e => [e.id, e.name, e.phone, e.email, e.source, e.destination, e.start_loc, e.dates, e.duration, e.travelers, e.budget, e.stay, e.transport, e.meals, e.special, e.status]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ CSV exported!');
  };

  // ── Toast ──
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // ── Check if follow-up is due (3+ days with status "Itinerary Sent") ──
  const isFollowupDue = (e) => {
    if (e.status !== 'Itinerary Sent' || !e.sent_at) return false;
    const sentDate = new Date(e.sent_at);
    const daysSince = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 3;
  };

  return (
    <div className="te-admin">
      {/* Mobile menu button */}
      <button className="te-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      {/* Sidebar */}
      <aside className={`te-sidebar ${sidebarOpen ? 'te-sidebar-open' : ''}`}>
        <div className="te-sidebar-brand" style={{padding: '28px 24px'}}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TravelEpisodes Logo" className="h-10 object-contain" style={{filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'}} />
            <div>
              <h2 style={{margin: 0, fontSize: '20px', letterSpacing: '-0.5px'}}>TravelEpisodes</h2>
              <p style={{margin: 0, fontSize: '10px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase'}}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="te-sidebar-nav">
          <button className={`te-nav-item ${activeNav === 'enquiries' ? 'active' : ''}`} onClick={() => { setActiveNav('enquiries'); setSidebarOpen(false); }}>
            <Users size={18} />
            <span>Enquiries</span> 
            {stats.newCount > 0 && <span className="te-nav-badge">{stats.newCount}</span>}
          </button>
          <button className={`te-nav-item ${activeNav === 'packages' ? 'active' : ''}`} onClick={() => { setActiveNav('packages'); setSidebarOpen(false); }}>
            <Briefcase size={18} />
            <span>Packages</span>
          </button>
          <button className={`te-nav-item ${activeNav === 'templates' ? 'active' : ''}`} onClick={() => { setActiveNav('templates'); setSidebarOpen(false); }}>
            <ClipboardList size={18} />
            <span>Templates</span>
          </button>
          <button className={`te-nav-item ${activeNav === 'reports' ? 'active' : ''}`} onClick={() => { setActiveNav('reports'); setSidebarOpen(false); }}>
            <BarChart3 size={18} />
            <span>Reports</span>
          </button>
          <button className={`te-nav-item ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => { setActiveNav('settings'); setSidebarOpen(false); }}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="te-sidebar-footer">
          <button className="te-logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="te-main">
        <header className="te-page-topbar">
          <div className="te-search-container">
            <Search size={18} className="te-search-icon" />
            <input
              className="te-top-search"
              placeholder="Search leads, destinations, or IDs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="te-header-actions">
            <button className="te-icon-action" onClick={fetchEnquiries} title="Refresh Data" disabled={loading}>
              <RefreshCw size={18} className={loading ? 'te-spin' : ''} />
            </button>
            <div className="te-admin-badge">
              <div className="te-badge-avatar">A</div>
              <div className="te-badge-info">
                <span className="name">Admin</span>
                <span className="role">Platform Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="te-stats-grid">
          <div className="te-stat-card">
            <div className="te-stat-icon"><Users size={20} /></div>
            <div className="te-stat-value">{stats.total}</div>
            <div className="te-stat-label">Total Enquiries</div>
          </div>
          <div className="te-stat-card">
            <div className="te-stat-icon"><Bell size={20} /></div>
            <div className="te-stat-value">{stats.newCount}</div>
            <div className="te-stat-label">New / Uncontacted</div>
          </div>
          <div className="te-stat-card">
            <div className="te-stat-icon"><Send size={20} /></div>
            <div className="te-stat-value">{stats.sentCount}</div>
            <div className="te-stat-label">Itineraries Sent</div>
          </div>
          <div className="te-stat-card">
            <div className="te-stat-icon"><CheckCircle2 size={20} /></div>
            <div className="te-stat-value">{stats.confirmedCount}</div>
            <div className="te-stat-label">Confirmed</div>
          </div>
          <div className="te-stat-card highlight">
            <div className="te-stat-icon gold">💰</div>
            <div className="te-stat-value">₹{(stats.revenue / 1000).toFixed(0)}k</div>
            <div className="te-stat-label">Revenue Pipeline</div>
          </div>
        </div>

        {activeNav === 'enquiries' && (
          <>
            {/* Controls */}
            <div className="te-controls-bar">
              <div className="te-filter-tabs">
                {dynamicFilters.map(f => (
                  <button key={f} className={`te-filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="te-bulk-actions">
                {selectedIds.size > 0 && (
                  <button className="te-bulk-btn primary" onClick={bulkMarkContacted}>
                    <Users size={14} /> Mark Contacted ({selectedIds.size})
                  </button>
                )}
                <button className="te-bulk-btn" onClick={exportCSV}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="te-empty-state">
                <div className="te-empty-icon">⏳</div>
                <h3>Syncing with Google Sheets...</h3>
                <p>Loading your latest enquiries securely.</p>
              </div>
            ) : !webhookConfigured ? (
              <div className="te-empty-state">
                <div className="te-empty-icon">🔌</div>
                <h3>Webhook URL Missing</h3>
                <p>Please configure VITE_GOOGLE_SHEET_WEBHOOK_URL in your .env file to connect to your live Google Sheet.</p>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="te-empty-state">
                <div className="te-empty-icon">📭</div>
                <h3>No enquiries found</h3>
                <p>New enquiries from your Google Form and AI Chatbot will appear here automatically.</p>
              </div>
            ) : (
              <div className="te-table-wrapper">
                <table className="te-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" className="te-checkbox" checked={selectedIds.size === filteredEnquiries.length && filteredEnquiries.length > 0} onChange={toggleSelectAll} /></th>
                      <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID {sortBy === 'id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('timestamp')} style={{cursor: 'pointer'}}>Created Time {sortBy === 'timestamp' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>Pax Info {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('destination')} style={{cursor: 'pointer'}}>Trip Details {sortBy === 'destination' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('status')} style={{cursor: 'pointer'}}>Status {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('source')} style={{cursor: 'pointer'}}>Source {sortBy === 'source' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map(enq => (
                      <tr key={enq.id} onClick={() => setSelectedEnquiry(enq)} style={{ cursor: 'pointer' }}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="te-checkbox" checked={selectedIds.has(enq.id)} onChange={() => toggleSelect(enq.id)} />
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13, color: 'var(--te-gold)' }}>
                          {enq.id}
                          {isFollowupDue(enq) && <span className="te-followup-badge">Due</span>}
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--te-text-muted)', whiteSpace: 'nowrap' }}>
                          {enq.timestamp ? new Date(enq.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </td>
                        <td>
                          <span className="te-table-title">{enq.name || 'Unknown'}</span>
                          <span className="te-table-sub">{enq.phone || enq.email}</span>
                        </td>
                        <td>
                          <span className="te-table-title">{enq.destination} - {enq.dates || 'Flexible'}</span>
                          <span className="te-table-sub">{enq.travelers || '?'} Pax</span>
                        </td>
                        <td><span className={`te-status ${getStatusClass(enq.status)}`}>{enq.status || 'New'}</span></td>
                        <td><span className="te-source-label">{enq.source || 'Direct'}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="te-actions">
                            <button className="te-action-btn view" title="View Details" onClick={() => setSelectedEnquiry(enq)}>
                              <Eye size={16} />
                            </button>
                            <button className="te-action-btn send" title="Send Package" onClick={() => setShowSendModal(enq)}>
                              <Send size={16} />
                            </button>
                            <button className="te-action-btn more" title="More Options">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeNav === 'reports' && (
          <ReportsView enquiries={enquiries} />
        )}

        {activeNav === 'packages' && (
          <div className="te-empty-state"><div className="te-empty-icon">📦</div><h3>Package Templates</h3><p>Manage standard itineraries here.</p></div>
        )}

        {activeNav === 'templates' && (
          <div className="te-empty-state"><div className="te-empty-icon">📝</div><h3>Message Templates</h3><p>Customize WhatsApp and Email templates.</p></div>
        )}

        {activeNav === 'settings' && (
          <div className="te-settings-panel">
            <h2 className="te-settings-title">Platform Settings</h2>
            
            <div className="te-settings-card">
              <h3>🎨 Appearance</h3>
              <div className="te-setting-row">
                <div>
                  <label>Admin Theme</label>
                  <p className="te-help-text">Choose the color preference for the admin panel.</p>
                </div>
                <select 
                  className="te-status-dropdown" 
                  style={{width: '200px'}}
                  value={settings.theme}
                  onChange={e => setSettings({...settings, theme: e.target.value})}
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>

            <div className="te-settings-card">
              <h3>📞 Communication Defaults</h3>
              <div className="te-setting-row">
                <div>
                  <label>Official WhatsApp Number</label>
                  <p className="te-help-text">Shown in message previews and signatures.</p>
                </div>
                <input 
                  type="text" 
                  value={settings.contactNumber} 
                  onChange={e => setSettings({...settings, contactNumber: e.target.value})}
                  className="te-modal-input" 
                  style={{width: '300px'}} 
                />
              </div>
              <div className="te-setting-row" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
                <label>WhatsApp Template</label>
                <p className="te-help-text">Use keywords like {'{name}'}, {'{destination}'}, and {'{link}'}.</p>
                <textarea 
                  value={settings.whatsappTemplate}
                  onChange={e => setSettings({...settings, whatsappTemplate: e.target.value})}
                  className="te-modal-input" 
                  style={{height: '100px', resize: 'vertical'}}
                />
              </div>
            </div>

            <div className="te-settings-card">
              <h3>🔑 API Configuration</h3>
              <div className="te-setting-row">
                <div>
                  <label>Gemini AI Key</label>
                  <p className="te-help-text">Used for the Aria Chatbot and Itinerary generation.</p>
                </div>
                <input type="password" value="••••••••••••••••••••••••" readOnly className="te-modal-input" style={{width: '300px', background: 'rgba(0,0,0,0.1)'}} />
              </div>
              <p className="te-help-text" style={{marginTop: '16px', color: 'var(--te-gold)'}}>* Sensitive API keys must be updated in the deployment environment variables (.env)</p>
            </div>
            
            <button className="te-btn-sm te-primary" onClick={() => showToast('✅ Settings saved to your device!')}>
              💾 Save Settings
            </button>
          </div>
        )}
      </main>

      {/* Detail Panel */}
      {selectedEnquiry && (
        <DetailPanel
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusUpdate={updateStatus}
          onSendPackage={() => { setShowSendModal(selectedEnquiry); setSelectedEnquiry(null); }}
          showToast={showToast}
          availableStatuses={dynamicFilters.filter(f => f !== 'All')}
        />
      )}

      {/* Send Package Modal */}
      {showSendModal && (
        <SendPackageModal
          enquiry={showSendModal}
          onClose={() => setShowSendModal(null)}
          showToast={showToast}
          onStatusUpdate={updateStatus}
          settings={settings}
        />
      )}

      {/* Toast */}
      {toast && <div className="te-toast">{toast}</div>}
    </div>
  );
}

// ── Detail Panel ──
function DetailPanel({ enquiry, onClose, onStatusUpdate, onSendPackage, showToast, availableStatuses }) {
  const [notes, setNotes] = useState(enquiry.notes || '');
  const [status, setStatus] = useState(enquiry.status || 'New');
  
  // Ensure "New" is always available even if not in sheet yet
  const statuses = useMemo(() => {
    const s = [...availableStatuses];
    if (!s.includes('New')) s.unshift('New');
    return s;
  }, [availableStatuses]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSaveNotes = async () => {
    try {
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'updateStatus', id: enquiry.id, status, notes })
        });
      }
      onStatusUpdate(enquiry.id, status);
      showToast('✅ Status and notes saved!');
    } catch (err) {
      console.error(err);
    }
  };

  const formattedTime = enquiry.timestamp ? new Date(enquiry.timestamp).toLocaleString() : '—';

  return (
    <>
      <div className="te-modal-overlay transparent" onClick={onClose} />
      <div className="te-detail-panel">
      <div className="te-detail-header" style={{gap: '16px', justifyContent: 'flex-start'}}>
        <img src="/logo.png" alt="TravelEpisodes logo" style={{height: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}} />
        <h2 style={{flex: 1, display: 'flex', alignItems: 'center', gap: '8px'}}><Users size={20} /> {enquiry.name || 'Enquiry Details'}</h2>
        <button className="te-modal-close" onClick={onClose}><LogOut size={16} style={{transform: 'rotate(90deg)'}} /></button>
      </div>
      <div className="te-detail-body">
        
        <div className="te-detail-grid">
          <div className="te-detail-item">
            <div className="te-detail-label">ID</div>
            <div className="te-detail-value" style={{color: 'var(--te-gold)'}}>{enquiry.id}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Source</div>
            <div className="te-detail-value">{enquiry.source || 'Form'}</div>
          </div>
          <div className="te-detail-item full-width">
            <div className="te-detail-label">Submitted</div>
            <div className="te-detail-value">{formattedTime}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Phone</div>
            <div className="te-detail-value" style={{fontWeight: 700}}>{enquiry.phone || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Email</div>
            <div className="te-detail-value" style={{wordBreak: 'break-all', fontWeight: 700, color: 'var(--te-gold)'}}>{enquiry.email || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Destination</div>
            <div className="te-detail-value">{enquiry.destination}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Start Location</div>
            <div className="te-detail-value">{enquiry.start_loc || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Dates</div>
            <div className="te-detail-value" style={{color: 'var(--te-gold)', fontWeight: 700}}>{enquiry.dates || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Duration</div>
            <div className="te-detail-value" style={{fontWeight: 700}}>{enquiry.duration || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Travelers</div>
            <div className="te-detail-value" style={{fontWeight: 700, color: 'var(--te-gold)'}}>{enquiry.travelers}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Budget</div>
            <div className="te-detail-value" style={{fontWeight: 700}}>{enquiry.budget || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Stay Type</div>
            <div className="te-detail-value">{enquiry.stay || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Transport</div>
            <div className="te-detail-value">{enquiry.transport || '—'}</div>
          </div>
          <div className="te-detail-item">
            <div className="te-detail-label">Meals</div>
            <div className="te-detail-value">{enquiry.meals || '—'}</div>
          </div>
          <div className="te-detail-item full-width">
            <div className="te-detail-label">Special Requests / Anything Else</div>
            <div className="te-detail-value">{enquiry.special || '—'}</div>
          </div>
        </div>

        <div className="te-detail-row">
          <div className="te-detail-label">Progress Status</div>
          <select className="te-status-dropdown" value={status} onChange={e => setStatus(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="te-detail-row te-detail-notes" style={{marginTop: '20px'}}>
          <div className="te-detail-label">Admin Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add private notes about this enquiry..." />
        </div>
      </div>

      <div className="te-detail-actions">
        <button className="te-btn-sm te-primary" onClick={handleSaveNotes}><RefreshCw size={14} /> Save Updates</button>
        <button className="te-btn-sm te-secondary" onClick={onSendPackage} style={{marginLeft: 'auto'}}><Send size={14} /> Send Package</button>
      </div>
    </div>
    </>
  );
}

// ── Send Package Modal ──
function SendPackageModal({ enquiry, onClose, showToast, onStatusUpdate, settings }) {
  const [canvaLink, setCanvaLink] = useState(enquiry.canva_link || '');
  const [packageRate, setPackageRate] = useState(enquiry.package_rate || '');
  const [sending, setSending] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const whatsappMessage = settings.whatsappTemplate
    .replace('{name}', enquiry.name || 'there')
    .replace('{destination}', enquiry.destination || 'your destination')
    .replace('{link}', canvaLink || '[Itinerary Link]')
    .replace('{rate}', packageRate ? `₹${packageRate}` : '[Rate]') + 
    `\n\nTo confirm your booking or for any questions:\n📞 Call / WhatsApp: ${settings.contactNumber}\n\nWe look forward to making your trip unforgettable! 🌍\n— Team TravelEpisodes`;

  const emailSubject = `Your custom plan for ${enquiry.destination}`;

  // Extracted simple plain HTML for email
  const emailHtml = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1120; color: #e2e8f0; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="background: linear-gradient(135deg, #c8714a, #a85a38); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">✈️ TravelEpisodes.in</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 15px;">Your personalised travel story awaits!</p>
      </div>
      <div style="padding: 40px 30px;">
        <p style="font-size: 16px;">Dear ${enquiry.name || 'Traveller'},</p>
        <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">Thank you for your interest in travelling to <strong>${enquiry.destination}</strong>! We're thrilled to share the customised itinerary we've curated just for you.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden;">
          <tr><td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d4a853; width: 140px; font-weight: 600;">📅 Dates</td><td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">${enquiry.dates || 'Flexible'}</td></tr>
          <tr><td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d4a853; font-weight: 600;">👥 Travelers</td><td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">${enquiry.travelers || 'As discussed'}</td></tr>
          <tr><td style="padding: 16px; font-weight: 600; color: #d4a853;">💰 Total Rate</td><td style="padding: 16px; font-weight: 600;">₹${packageRate || 'TBA'}</td></tr>
        </table>
        
        <div style="text-align: center; margin: 40px 0;">
          ${canvaLink ? `<a href="${canvaLink}" style="display: inline-block; padding: 16px 32px; background: #c8714a; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">📄 View Complete Itinerary</a>` : ''}
        </div>
        
        <p style="font-size: 15px; color: #94a3b8;">For any questions or to lock in these dates:</p>
        <p style="font-size: 15px;">📞 <strong>Call / WhatsApp:</strong> ${settings.contactNumber}</p>
        <p style="font-size: 15px;">📧 <strong>Email:</strong> bookings@travelepisodes.in</p>
        
        <p style="margin-top: 32px; font-size: 15px; color: #94a3b8;">Warm regards,<br/><strong style="color: #f8fafc;">Team TravelEpisodes</strong></p>
      </div>
    </div>`;

  const handleSend = async (via) => {
    if (!canvaLink) {
      showToast('⚠️ Please paste a Canva / PDF link first');
      return;
    }
    setSending(via);

    try {
      // Send WhatsApp
      if (via === 'whatsapp' || via === 'both') {
        const waRes = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: enquiry.phone, message: whatsappMessage })
        });
        const waData = await waRes.json();
        if (waData.method === 'fallback' && waData.waLink) {
          window.open(waData.waLink, '_blank');
        }
      }

      // Send Email
      if (via === 'email' || via === 'both') {
        if (enquiry.email) {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_email: enquiry.email,
              to_name: enquiry.name,
              subject: emailSubject,
              html_content: emailHtml,
              attachment_url: canvaLink // Try to attach if it's a PDF
            })
          });
        }
      }

      // Update sheet
      const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(`${webhookUrl}?action=updateCanvaLink`, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateCanvaLink',
            id: enquiry.id,
            canva_link: canvaLink,
            sent_via: via,
            package_rate: packageRate,
            sent_at: new Date().toISOString()
          })
        });
      }

      onStatusUpdate(enquiry.id, 'Itinerary Sent');
      const viaLabel = via === 'both' ? 'WhatsApp + Email' : via === 'whatsapp' ? 'WhatsApp' : 'Email';
      showToast(`✅ Sent to ${enquiry.name || 'Client'} via ${viaLabel}!`);
      onClose();

    } catch (err) {
      console.error('Send error:', err);
      showToast('❌ Error sending. Please try again.');
    }
    setSending('');
  };

  return (
    <div className="te-modal-overlay" onClick={onClose}>
      <div className="te-modal" onClick={e => e.stopPropagation()}>
        <div className="te-modal-header">
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Send size={24} /> Send Proposal: {enquiry.name || enquiry.id}</h2>
          <button className="te-modal-close" onClick={onClose}><LogOut size={16} style={{transform: 'rotate(90deg)'}} /></button>
        </div>

        <div className="te-modal-body">
          <div className="te-modal-section">
            <h3>📎 Presentation Link</h3>
            <input
              className="te-modal-input"
              placeholder="https://www.canva.com/design/..."
              value={canvaLink}
              onChange={e => setCanvaLink(e.target.value)}
            />
            <p className="te-help-text">Paste your Canva View link, PDF, or Google Drive share link</p>
          </div>

          <div className="te-modal-section">
            <h3>💰 Package Rate</h3>
            <div className="te-cost-inputs">
              <span style={{color: 'var(--te-text-muted)', fontSize: '13px'}}>Total Proposal Amount (₹)</span>
              <input type="number" placeholder="e.g. 45000" value={packageRate} onChange={e => setPackageRate(e.target.value)} />
            </div>
          </div>

          <div className="te-modal-section">
            <h3>💬 WhatsApp Message Preview</h3>
            <div className="te-preview-box">{whatsappMessage}</div>
          </div>

          <div className="te-modal-section">
            <h3>📧 Email Preview</h3>
            <div className="te-preview-box">
              Subject: {emailSubject}
              {'\n\n'}Dear {enquiry.name || 'Traveller'},{'\n\n'}Your personalised {enquiry.destination} itinerary is ready!{'\n'}Package: ₹{packageRate || 'TBA'}{'\n'}Link: {canvaLink || '[Itinerary link]'}
            </div>
          </div>
        </div>

        <div className="te-modal-actions">
          <button className="te-modal-btn te-whatsapp" onClick={() => handleSend('whatsapp')} disabled={!!sending}>
            {sending === 'whatsapp' ? <RefreshCw className="te-spin" size={18} /> : <Users size={18} />} Send WhatsApp
          </button>
          <button className="te-modal-btn te-email-btn" onClick={() => handleSend('email')} disabled={!!sending}>
            {sending === 'email' ? <RefreshCw className="te-spin" size={18} /> : <Mail size={18} />} Send Email
          </button>
          <button className="te-modal-btn te-send-both" onClick={() => handleSend('both')} disabled={!!sending}>
            {sending === 'both' ? <RefreshCw className="te-spin" size={18} /> : <Send size={18} />} Send Both
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ enquiries }) {
  const COLORS = ['#c8714a', '#d4a853', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  // 1. Lead Source Data
  const sourceData = useMemo(() => {
    const counts = {};
    enquiries.forEach(e => counts[e.source || 'Direct'] = (counts[e.source || 'Direct'] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enquiries]);

  // 2. Destination Popularity
  const destData = useMemo(() => {
    const counts = {};
    enquiries.forEach(e => counts[e.destination] = (counts[e.destination] || 0) + 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [enquiries]);

  // 3. Status Conversion
  const statusData = useMemo(() => {
    const counts = {};
    enquiries.forEach(e => counts[e.status] = (counts[e.status] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enquiries]);

  return (
    <div className="te-reports-container" style={{animation: 'te-fade-in 0.4s ease'}}>
      <div className="te-page-header">
        <h1>Business Insights</h1>
        <p>Track lead sources, conversion rates, and revenue pipeline.</p>
      </div>

      <div className="te-reports-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '32px'}}>
        
        {/* Lead Sources */}
        <div className="te-stat-card chart-card">
          <h3 style={{marginBottom: '20px', fontSize: '16px'}}>Lead Source Distribution</h3>
          <div style={{height: '300px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background: '#1e293b', border: '1px solid #334155', borderRadius: '8px'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="te-stat-card chart-card">
          <h3 style={{marginBottom: '20px', fontSize: '16px'}}>Popular Destinations</h3>
          <div style={{height: '300px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{background: '#1e293b', border: '1px solid #334155', borderRadius: '8px'}} />
                <Bar dataKey="value" fill="url(#colorTerra)" radius={[0, 4, 4, 0]} barSize={20} />
                <defs>
                  <linearGradient id="colorTerra" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#c8714a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a85a38" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="te-stat-card chart-card" style={{gridColumn: '1 / -1'}}>
          <h3 style={{marginBottom: '20px', fontSize: '16px'}}>Leads Lifecycle Pipeline</h3>
          <div style={{height: '350px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{background: '#1e293b', border: '1px solid #334155', borderRadius: '8px'}} />
                <Area type="monotone" dataKey="value" stroke="#d4a853" fill="rgba(212, 168, 83, 0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

