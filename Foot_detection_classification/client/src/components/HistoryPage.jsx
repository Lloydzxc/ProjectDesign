import React, { useEffect, useState } from 'react'

export default function HistoryPage({ onBack }) {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }

      const data = await response.json()
      setHistory(data.detections || [])
    } catch (err) {
      console.error('History fetch error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this detection?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      // Remove from local state
      setHistory(history.filter(item => item._id !== id))
      alert('✅ Detection deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      alert('❌ Failed to delete detection')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <span className="loading" style={{ width: 40, height: 40 }}></span>
        <p style={{ marginTop: 16 }}>Loading history...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2> Detection History</h2>
            <p className="small">View all your previous foot detection results</p>
          </div>
          <button className="secondary" onClick={onBack}>
            ← Back to Detection
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3>No Detection History</h3>
          <p className="small" style={{ marginTop: 8 }}>
            Start detecting feet to build your history
          </p>
          <button onClick={onBack} style={{ marginTop: 20 }}>
            Start Detection
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {history.map((item) => (
            <div key={item._id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Image */}
                <div style={{ flex: '0 0 300px', maxWidth: 300 }}>
                  <img 
                    src={item.imageUrl} 
                    alt="Detection result"
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      objectFit: 'cover',
                      borderRadius: 10,
                      border: '2px solid var(--card-border)'
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {formatDate(item.createdAt)}
                      </div>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 600,
                        color: item.detectionCount > 0 ? 'var(--success)' : 'var(--text-secondary)'
                      }}>
                        {item.detectionCount} {item.detectionCount === 1 ? 'Detection' : 'Detections'} Found
                      </div>
                    </div>
                    <button 
                      className="secondary"
                      onClick={() => handleDelete(item._id)}
                      style={{ 
                        padding: '8px 12px',
                        fontSize: 13,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)'
                      }}
                    >
                       Delete
                    </button>
                  </div>

                  {/* Detection Results */}
                  {item.detections && item.detections.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.detections.map((det, i) => (
                        <div key={i} className="detection-item" style={{ marginBottom: 0 }}>
                          <strong> {det.class_name}</strong>
                          <span className="confidence">{(det.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="small" style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
                      No detections found in this scan
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}