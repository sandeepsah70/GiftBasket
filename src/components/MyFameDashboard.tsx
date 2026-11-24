import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface MyFameDashboardProps {
  user: any
  onSignOut: () => void
}

interface OrderItem {
  id: string
  service_name: string
  category: string
  target_link: string
  quantity: number
  charge: number
  status: string
  created_at: string
}

const SMM_SERVICES = [
  { id: 'ig-f1', category: 'Instagram Followers', name: 'Instagram Real Followers [Non-Drop & Instant]', ratePer1k: 89.0 },
  { id: 'ig-f2', category: 'Instagram Followers', name: 'Instagram Premium Bollywood Targeted Followers', ratePer1k: 149.0 },
  { id: 'ig-l1', category: 'Instagram Likes', name: 'Instagram HQ Instant Likes [Fast 50K/Day]', ratePer1k: 29.0 },
  { id: 'ig-v1', category: 'Instagram Views', name: 'Instagram Reels Viral Views [High Retention]', ratePer1k: 9.99 },
  { id: 'yt-s1', category: 'YouTube Services', name: 'YouTube Subscribers [Monetization Safe]', ratePer1k: 399.0 }
]

export const MyFameDashboard: React.FC<MyFameDashboardProps> = ({ user, onSignOut }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(SMM_SERVICES[0].id)
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState(500)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const activeService = SMM_SERVICES.find((s) => s.id === selectedServiceId) || SMM_SERVICES[0]
  const calculatedCharge = ((activeService.ratePer1k / 1000) * quantity).toFixed(2)

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Creator'

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  // Load orders from Supabase
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
      } else {
        setOrders(data || [])
      }
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [user])

  // Place SMM Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link) return
    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_name: activeService.name,
          category: activeService.category,
          target_link: link,
          quantity: quantity,
          charge: parseFloat(calculatedCharge),
          status: 'Processing'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setOrders([data, ...orders])
      }
      setLink('')
      showToast(`Order for ${quantity} ${activeService.category} placed successfully in Supabase!`)
    } catch (err: any) {
      alert('Order failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="myfame-dash-wrapper">
      {/* Toast Alert */}
      {notification && (
        <div className="myfame-toast">
          <i className="fas fa-check-circle text-success me-2"></i>
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="dash-nav-header py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <img src="https://storage.perfectcdn.com/rpyfx7/kzb17mhrep50yeon.png" alt="MyFame" height="36" />
          <span className="badge bg-primary-subtle text-primary border border-primary">Dashboard</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="user-badge px-3 py-1 rounded-pill bg-dark border border-secondary text-white small">
            <i className="fas fa-user-circle text-primary me-2"></i>
            <span>{username}</span>
            <span className="text-muted ms-1">({user.email})</span>
          </div>

          <div className="balance-pill px-3 py-1 rounded-pill bg-success-subtle border border-success text-success small fw-semibold">
            <i className="fas fa-wallet me-1"></i> Balance: ₹150.00
          </div>

          <button onClick={onSignOut} className="btn btn-outline-danger btn-sm">
            <i className="fas fa-sign-out-alt me-1"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Order Placement Form */}
          <div className="col-lg-5">
            <div className="card-smm p-4">
              <h4 className="text-white mb-1">
                <i className="fas fa-rocket text-primary me-2"></i>
                New Order
              </h4>
              <p className="text-muted small mb-4">Fast delivery backed by Supabase cloud storage</p>

              <form onSubmit={handlePlaceOrder}>
                <div className="mb-3">
                  <label className="form-label text-muted small text-uppercase fw-semibold">Service Package</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                  >
                    {SMM_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.ratePer1k} / 1k)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small text-uppercase fw-semibold">Target Link (Instagram / YouTube)</label>
                  <input
                    type="url"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="https://instagram.com/username or reel link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small text-uppercase fw-semibold">Quantity</label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="50"
                    className="form-control bg-dark text-white border-secondary"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(50, parseInt(e.target.value) || 0))}
                    required
                  />
                  <div className="form-text text-muted small">Min: 100 • Max: 50,000</div>
                </div>

                <div className="price-summary-box p-3 rounded mb-4 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Charge:</span>
                  <span className="h4 mb-0 text-primary fw-bold">₹{calculatedCharge}</span>
                </div>

                <button type="submit" className="button button-large w-100" disabled={submitting}>
                  <span className="text-style-nowrap">
                    {submitting ? 'Placing Order in Supabase...' : 'Submit Order'}
                  </span>
                  <span className="button_bg"></span>
                </button>
              </form>
            </div>
          </div>

          {/* Orders History from Supabase */}
          <div className="col-lg-7">
            <div className="card-smm p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="text-white mb-0">
                    <i className="fas fa-list-check text-primary me-2"></i>
                    Orders History
                  </h4>
                  <p className="text-muted small mb-0">Real-time records from Supabase `orders` table</p>
                </div>
                <span className="badge bg-primary">{orders.length} Orders</span>
              </div>

              {loadingOrders ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                  <div>Fetching orders from Supabase...</div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-box-open fa-3x mb-3 opacity-50"></i>
                  <h6 className="text-white">No orders placed yet</h6>
                  <p className="small">Fill in the order form on the left to start growing your social media.</p>
                </div>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-dark table-hover align-middle">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th>Service</th>
                        <th>Target</th>
                        <th>Qty</th>
                        <th>Charge</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td>
                            <div className="fw-semibold text-white small">{ord.service_name}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(ord.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <a
                              href={ord.target_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-info text-decoration-none small"
                              style={{ maxWidth: '140px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {ord.target_link}
                            </a>
                          </td>
                          <td className="small">{ord.quantity.toLocaleString()}</td>
                          <td className="small fw-semibold text-warning">₹{ord.charge}</td>
                          <td>
                            <span className="badge bg-info-subtle text-info border border-info" style={{ fontSize: '11px' }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
