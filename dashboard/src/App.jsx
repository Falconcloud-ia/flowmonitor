import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = 'http://localhost:8001'

// ═══════════════════════════════════════════════════════════════════════════════
// Custom Hook: Dashboard Data
// ═══════════════════════════════════════════════════════════════════════════════

function useDashboardData() {
  const [data, setData] = useState({
    readings: [],
    alerts: [],
    stats: {
      total_readings: 0,
      readings_by_risk: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      alerts_sent: 0,
      uptime_seconds: 0
    }
  })
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const eventSourceRef = useRef(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/data`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
      setConnected(true)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setConnected(false)
      setLoading(false)
    }
  }, [])

  // Setup SSE connection
  useEffect(() => {
    fetchData()

    // Connect to SSE stream
    const eventSource = new EventSource(`${API_BASE_URL}/api/dashboard/stream`)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('connected', () => {
      setConnected(true)
      console.log('📡 SSE Connected')
    })

    eventSource.addEventListener('reading', (event) => {
      const reading = JSON.parse(event.data)
      setData(prev => ({
        ...prev,
        readings: [...prev.readings.slice(-99), reading],
        stats: {
          ...prev.stats,
          total_readings: prev.stats.total_readings + 1,
          readings_by_risk: {
            ...prev.stats.readings_by_risk,
            [reading.risk_level]: (prev.stats.readings_by_risk[reading.risk_level] || 0) + 1
          }
        }
      }))
    })

    eventSource.addEventListener('heartbeat', () => {
      setConnected(true)
    })

    eventSource.onerror = () => {
      setConnected(false)
      // Retry connection after 5 seconds
      setTimeout(() => {
        eventSource.close()
        fetchData()
      }, 5000)
    }

    // Polling fallback for alerts
    const alertsInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/alerts?limit=20`)
        if (response.ok) {
          const result = await response.json()
          setData(prev => ({ ...prev, alerts: result.alerts }))
        }
      } catch { }
    }, 3000)

    return () => {
      eventSource.close()
      clearInterval(alertsInterval)
    }
  }, [fetchData])

  return { data, connected, loading, error, refetch: fetchData }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sidebar Component
// ═══════════════════════════════════════════════════════════════════════════════

function Sidebar({ connected, activeView, setActiveView }) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'sensores', icon: '🌡️', label: 'Sensores' },
    { id: 'alertas', icon: '🔔', label: 'Alertas' },
    { id: 'analitica', icon: '📈', label: 'Analítica' },
    { id: 'configuracion', icon: '⚙️', label: 'Configuración' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔥</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Flow-Monitor</span>
            <span className="sidebar-logo-subtitle">Industrial IoT</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${item.id === activeView ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`status-card ${connected ? '' : 'disconnected'}`}>
          <div className="status-indicator-dot"></div>
          <div className="status-text">
            <div className="status-label">Estado del Sistema</div>
            <div className="status-value">
              {connected ? 'Operativo' : 'Desconectado'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Stat Card Component
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({ label, value, icon, riskLevel, isCritical, trend }) {
  return (
    <div className={`stat-card ${isCritical ? 'critical' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className={`stat-card-value ${riskLevel?.toLowerCase() || ''}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div className={`stat-card-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs anterior
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sparkline Chart Component
// ═══════════════════════════════════════════════════════════════════════════════

function SparklineChart({ readings }) {
  const width = 150;
  const height = 40;
  
  if (!readings || readings.length === 0) return null;
  
  const values = readings.map(r => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;
  
  const points = values.map((val, i) => {
    const x = (i / Math.max(readings.length - 1, 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const latestRisk = readings[readings.length - 1]?.risk_level || 'LOW';
  const strokeColor = `var(--color-risk-${latestRisk.toLowerCase()})`;

  return (
    <div style={{ width: '100%', height: '40px' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Failure Probability Gauge Component
// ═══════════════════════════════════════════════════════════════════════════════

function FailureProbabilityGauge({ probability, riskLevel }) {
  const percentage = Math.min(Math.max(probability * 100, 0), 100);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const riskClass = riskLevel?.toLowerCase() || 'low';

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px' }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="28" cy="28" r="24"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
        />
        <circle
          cx="28" cy="28" r="24"
          fill="none"
          stroke={`var(--color-risk-${riskClass})`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{percentage.toFixed(0)}%</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sensor Card Component
// ═══════════════════════════════════════════════════════════════════════════════

function SensorCard({ sensorId, readings }) {
  const latest = readings[readings.length - 1];
  const probability = latest?.prediction?.failure_probability || 0;
  const riskLevel = latest?.risk_level || 'LOW';
  const isAnomaly = latest?.anomaly_detected;

  return (
    <div className={`stat-card ${isAnomaly ? 'critical' : ''}`} style={{ padding: 'var(--space-md)' }}>
      <div className="stat-card-header" style={{ margin: 0 }}>
        <span className="stat-card-label" style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{sensorId}</span>
        <span className={`risk-badge ${riskLevel.toLowerCase()}`}>{riskLevel}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={`stat-card-value ${riskLevel.toLowerCase()}`} style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 0 }}>
            {latest?.value.toFixed(1)}{latest?.unit}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {latest?.location || 'Planta Principal'}
          </div>
        </div>
        <FailureProbabilityGauge probability={probability} riskLevel={riskLevel} />
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <SparklineChart readings={readings} />
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// Temperature Chart Component
// ═══════════════════════════════════════════════════════════════════════════════

function TemperatureChart({ readings }) {
  const maxValue = 120 // Max temp for scaling
  const chartData = readings.slice(-60)

  if (chartData.length === 0) {
    return (
      <div className="temperature-chart">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>Esperando datos del sensor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="temperature-chart">
      {chartData.map((reading, index) => {
        const height = Math.min((reading.value / maxValue) * 100, 100)
        return (
          <div
            key={`${reading.sensor_id}-${reading.timestamp}-${index}`}
            className={`chart-bar ${reading.risk_level.toLowerCase()}`}
            style={{ height: `${height}%` }}
            title={`${reading.value.toFixed(1)}${reading.unit} - ${reading.risk_level}`}
          />
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Alerts List Component
// ═══════════════════════════════════════════════════════════════════════════════

function AlertsList({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔔</div>
        <p>Sin alertas activas</p>
      </div>
    )
  }

  return (
    <div className="alerts-list">
      {alerts.slice().reverse().slice(0, 20).map((alert, index) => (
        <div key={alert.id || `${alert.sensor_id}-${alert.timestamp}-${index}`} className={`alert-item ${alert.risk_level.toLowerCase()}`}>
          <div className="alert-header">
            <span className="alert-sensor">
              <span className="alert-sensor-icon">🔥</span>
              {alert.sensor_id}
            </span>
            <span className="alert-time">
              {new Date(alert.timestamp).toLocaleTimeString('es-CL')}
            </span>
          </div>
          <p className="alert-message">{alert.message?.substring(0, 80)}...</p>
          <span className={`alert-badge ${alert.channel}`}>
            {alert.channel === 'whatsapp' ? '📱' : '📧'} {alert.channel}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Readings Table Component
// ═══════════════════════════════════════════════════════════════════════════════

function ReadingsTable({ readings }) {
  const displayReadings = readings.slice(-8).reverse()

  if (displayReadings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📈</div>
        <p>Sin lecturas registradas</p>
      </div>
    )
  }

  return (
    <table className="readings-table">
      <thead>
        <tr>
          <th>Sensor</th>
          <th>Valor</th>
          <th>Ubicación</th>
          <th>Riesgo</th>
          <th>Prob. Fallo</th>
          <th>Hora</th>
        </tr>
      </thead>
      <tbody>
        {displayReadings.map((reading) => {
          const probability = reading.prediction?.failure_probability || 0
          const probColor = probability > 0.7 ? 'var(--color-risk-critical)' :
            probability > 0.4 ? 'var(--color-risk-high)' :
              probability > 0.2 ? 'var(--color-risk-medium)' :
                'var(--color-risk-low)'

          return (
            <tr key={`${reading.sensor_id}-${reading.timestamp}`} className={reading.risk_level.toLowerCase()}>
              <td>
                <span style={{ fontWeight: 600 }}>{reading.sensor_id}</span>
              </td>
              <td>
                <span className="reading-value">
                  {reading.value.toFixed(1)}{reading.unit}
                </span>
              </td>
              <td>
                <span className="reading-location">{reading.location}</span>
              </td>
              <td>
                <span className={`risk-badge ${reading.risk_level.toLowerCase()}`}>
                  {reading.risk_emoji} {reading.risk_level}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="probability-bar">
                    <div
                      className="probability-fill"
                      style={{
                        width: `${probability * 100}%`,
                        background: probColor
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {(probability * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(reading.timestamp).toLocaleTimeString('es-CL')}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sensor Grid Component
// ═══════════════════════════════════════════════════════════════════════════════

function SensorGrid({ readings }) {
  const grouped = useMemo(() => {
    const map = new Map();
    readings.forEach(r => {
      if (!map.has(r.sensor_id)) map.set(r.sensor_id, []);
      map.get(r.sensor_id).push(r);
    });
    return Array.from(map.entries()).map(([id, arr]) => ({
      id,
      data: arr.slice(-60) // Keep last 60 for sparklines
    }));
  }, [readings]);

  if (grouped.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p>Esperando datos del sensor...</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 'var(--space-md)',
      width: '100%'
    }}>
      {grouped.map(({ id, data }) => (
        <SensorCard key={id} sensorId={id} readings={data} />
      ))}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// Main App Component
// ═══════════════════════════════════════════════════════════════════════════════

function App() {
  const { data, connected, loading } = useDashboardData()
  const [activeView, setActiveView] = useState('dashboard')
  const hasCritical = data.stats.readings_by_risk.CRITICAL > 0

  // Get current temperature from latest reading
  const latestReading = data.readings[data.readings.length - 1]
  const currentTemp = latestReading?.value || 0
  const currentRisk = latestReading?.risk_level || 'LOW'

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Conectando al servidor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar connected={connected} activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h2>{activeView === 'dashboard' ? 'Panel de Monitoreo' : activeView === 'sensores' ? 'Estado de Sensores' : 'Panel de Monitoreo'}</h2>
            <span>{activeView === 'sensores' ? 'Monitoreo detallado de cada sensor operando en planta' : 'Monitoreo en tiempo real de sensores industriales'}</span>
          </div>
          <div className="header-actions">
            <div className="header-stat">
              <span className="header-stat-icon">⏱️</span>
              <span>Uptime: {Math.floor(data.stats.uptime_seconds / 60)}m</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-icon">📡</span>
              <span>{data.stats.total_readings} lecturas</span>
            </div>
          </div>
        </header>

        {/* Main Grid / Dynamic View */}
        {activeView === 'dashboard' && (
          <main className="dashboard-main">
            {/* Stats Cards Row */}
            <div className="stats-grid">
              <StatCard
                label="Total Lecturas"
                value={data.stats.total_readings}
                icon="📊"
              />
              <StatCard
                label="Nivel Bajo"
                value={data.stats.readings_by_risk.LOW}
                icon="🟢"
                riskLevel="low"
              />
              <StatCard
                label="Nivel Alto"
                value={data.stats.readings_by_risk.HIGH}
                icon="🟠"
                riskLevel="high"
              />
              <StatCard
                label="Críticos"
                value={data.stats.readings_by_risk.CRITICAL}
                icon="🔴"
                riskLevel="critical"
                isCritical={hasCritical}
              />
            </div>

            {/* Chart Section */}
            <section className="chart-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-icon">📈</span>
                  <span>Temperatura en Tiempo Real</span>
                </h2>
                <div className="section-actions">
                  <button className="btn-icon" title="Actualizar">🔄</button>
                  <button className="btn-icon" title="Expandir">⛶</button>
                </div>
              </div>
              <div className="chart-container">
                <TemperatureChart readings={data.readings} />
              </div>
            </section>

            {/* Alerts Panel */}
            <section className="alerts-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-icon">🔔</span>
                  <span>Alertas ({data.stats.alerts_sent})</span>
                </h2>
              </div>
              <AlertsList alerts={data.alerts} />
            </section>

            {/* Readings Table */}
            <section className="readings-section" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-title-icon">📋</span>
                  <span>Últimas Lecturas</span>
                </h2>
              </div>
              <ReadingsTable readings={data.readings} />
            </section>
          </main>
        )}

        {/* SENSORES VIEW */}
        {activeView === 'sensores' && (
          <main style={{ padding: 'var(--space-xl)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--color-bg-card)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', flex: 1 }}>
               <SensorGrid readings={data.readings} />
            </div>
          </main>
        )}
        
      </div>
    </div>
  )
}

export default App
