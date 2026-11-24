import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, SavedBasket, GiftBasketItem } from '../types'
import {
  Gift,
  LogOut,
  User,
  Mail,
  Phone,
  Edit2,
  Check,
  Save,
  Trash2,
  Database,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  X
} from 'lucide-react'

interface DashboardProps {
  user: any
  onSignOut: () => void
}

const SAMPLE_BASKETS: GiftBasketItem[] = [
  {
    id: 'b1',
    name: 'The Royal Sovereign Hamper',
    category: 'Luxury & Gourmet',
    price: 189.99,
    rating: 4.9,
    description: 'Artisanal champagne truffles, smoked wild salmon, vintage English cheddar, and organic blossom honey.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    items: ['Single Origin Chocolates', 'Aged Cheddar & Crackers', 'Wildflower Honey', 'Organic Coffee Roast']
  },
  {
    id: 'b2',
    name: 'Serenity Spa & Wellness Retreat',
    category: 'Relaxation & Spa',
    price: 135.50,
    rating: 4.8,
    description: 'Hand-poured soy scented candle, lavender bath salts, organic body butter, and a silk sleep mask.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    items: ['Soy Wax Candle', 'Dead Sea Bath Soak', 'Pure Silk Sleep Mask', 'Herbal Chamomile Tea']
  },
  {
    id: 'b3',
    name: 'Chocolatier’s Grand Symphony',
    category: 'Sweet Indulgence',
    price: 98.00,
    rating: 5.0,
    description: 'An exquisite curation of 24 handcrafted Belgian pralines, dark chocolate caramels, and ruby cocoa bars.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    items: ['24 Artisanal Pralines', 'Salted Caramel Clusters', 'Ruby Berry Bar', 'Hazelnut Gianduja']
  },
  {
    id: 'b4',
    name: 'Harvest Vineyard Celebration',
    category: 'Festive & Wine',
    price: 159.00,
    rating: 4.7,
    description: 'Handpicked roasted nuts, Mediterranean olive tapenade, sourdough crisps, and sparkling cider.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    items: ['Sparkling Reserve Cider', 'Truffle Glazed Almonds', 'Rosemary Flatbreads', 'Olive Tapenade']
  }
]

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [savedBaskets, setSavedBaskets] = useState<SavedBasket[]>([])
  const [loadingBaskets, setLoadingBaskets] = useState(true)

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Save/Order Basket modal
  const [selectedBasket, setSelectedBasket] = useState<GiftBasketItem | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [savingBasket, setSavingBasket] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Fetch Profile from Supabase
  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      if (data) {
        setProfile(data)
        setEditName(data.full_name || '')
        setEditPhone(data.phone || '')
      } else {
        // Fallback to auth metadata
        const fallbackProfile: Profile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || ''
        }
        setProfile(fallbackProfile)
        setEditName(fallbackProfile.full_name)
        setEditPhone(fallbackProfile.phone)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Fetch Saved Baskets from Supabase
  const loadSavedBaskets = async () => {
    try {
      setLoadingBaskets(true)
      const { data, error } = await supabase
        .from('saved_baskets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching baskets:', error)
      } else {
        setSavedBaskets(data || [])
      }
    } finally {
      setLoadingBaskets(false)
    }
  }

  useEffect(() => {
    loadProfile()
    loadSavedBaskets()
  }, [user])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  // Update profile in Supabase
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: editName,
        phone: editPhone,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      setProfile((prev) =>
        prev
          ? { ...prev, full_name: editName, phone: editPhone }
          : { id: user.id, email: user.email, full_name: editName, phone: editPhone }
      )
      setIsEditingProfile(false)
      showToast('Profile updated and saved to Supabase!')
    } catch (err: any) {
      alert('Failed to update profile: ' + err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // Save a customized basket to Supabase
  const handleSaveBasket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBasket) return
    setSavingBasket(true)

    try {
      const { data, error } = await supabase
        .from('saved_baskets')
        .insert({
          user_id: user.id,
          basket_name: selectedBasket.name,
          recipient_name: recipientName || 'Myself',
          custom_message: customMessage || 'With love and warmest regards.',
          price: selectedBasket.price,
          status: 'Customized & Saved'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setSavedBaskets([data, ...savedBaskets])
      }
      setSelectedBasket(null)
      setRecipientName('')
      setCustomMessage('')
      showToast(`"${selectedBasket.name}" saved to your Supabase account!`)
    } catch (err: any) {
      alert('Failed to save basket: ' + err.message)
    } finally {
      setSavingBasket(false)
    }
  }

  // Delete saved basket from Supabase
  const handleDeleteBasket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_baskets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setSavedBaskets(savedBaskets.filter((b) => b.id !== id))
      showToast('Basket removed from Supabase.')
    } catch (err: any) {
      alert('Failed to delete basket: ' + err.message)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {notification && (
        <div className="floating-toast">
          <Sparkles size={18} className="text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="dash-header">
        <div className="dash-brand">
          <div className="dash-logo">
            <Gift size={24} className="icon-gold" />
          </div>
          <div>
            <h1 className="brand-text">Gift Basket</h1>
            <span className="brand-tag">Luxury Hampers & Gifts</span>
          </div>
        </div>

        <div className="dash-nav-actions">
          <div className="db-sync-badge">
            <Database size={14} className="text-emerald-400" />
            <span>Supabase Live Sync</span>
          </div>

          <div className="user-profile-pill">
            <div className="avatar-circle">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="user-pill-text">
              <span className="user-name">{profile?.full_name || user.email}</span>
              <span className="user-role">Member</span>
            </div>
          </div>

          <button onClick={onSignOut} className="signout-btn" title="Sign Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dash-main">
        {/* Welcome & Profile Banner */}
        <section className="profile-banner-card">
          <div className="profile-info-col">
            <div className="banner-greeting">
              <h2>
                Welcome, {profile?.full_name || 'Valued Guest'}! <Sparkles size={22} className="inline-sparkle" />
              </h2>
              <p>Your account is authenticated via Supabase. Manage your profile and gift baskets below.</p>
            </div>

            {!isEditingProfile ? (
              <div className="profile-details-grid">
                <div className="profile-stat">
                  <Mail size={16} className="stat-icon" />
                  <div>
                    <span className="stat-label">Email</span>
                    <span className="stat-value">{user.email}</span>
                  </div>
                </div>

                <div className="profile-stat">
                  <User size={16} className="stat-icon" />
                  <div>
                    <span className="stat-label">Name in Supabase</span>
                    <span className="stat-value">{profile?.full_name || 'Not set'}</span>
                  </div>
                </div>

                <div className="profile-stat">
                  <Phone size={16} className="stat-icon" />
                  <div>
                    <span className="stat-label">Phone</span>
                    <span className="stat-value">{profile?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="edit-profile-btn"
                >
                  <Edit2 size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                <div className="edit-input-row">
                  <div className="edit-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Your phone"
                    />
                  </div>
                </div>
                <div className="edit-actions">
                  <button type="submit" className="save-btn" disabled={savingProfile}>
                    <Check size={16} />
                    <span>{savingProfile ? 'Saving...' : 'Save to Supabase'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Section: Curated Gift Baskets */}
        <section className="catalog-section">
          <div className="section-header">
            <div>
              <h3>Curated Gift Baskets</h3>
              <p>Select any luxury basket to personalize and save to your Supabase account</p>
            </div>
          </div>

          <div className="baskets-grid">
            {SAMPLE_BASKETS.map((basket) => (
              <div key={basket.id} className="basket-card">
                <div className="basket-img-wrapper">
                  <img src={basket.image} alt={basket.name} className="basket-img" />
                  <span className="basket-tag">{basket.category}</span>
                </div>
                <div className="basket-body">
                  <div className="basket-title-row">
                    <h4 className="basket-name">{basket.name}</h4>
                    <span className="basket-price">${basket.price.toFixed(2)}</span>
                  </div>
                  <p className="basket-desc">{basket.description}</p>
                  
                  <div className="basket-items-list">
                    {basket.items.map((item, idx) => (
                      <span key={idx} className="basket-item-pill">
                        • {item}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedBasket(basket)}
                    className="customize-btn"
                  >
                    <PlusCircle size={16} />
                    <span>Personalize & Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Saved Baskets from Supabase */}
        <section className="saved-baskets-section">
          <div className="section-header">
            <div>
              <h3>Your Saved Hampers in Supabase</h3>
              <p>Real-time records stored in the `saved_baskets` table for your user ID</p>
            </div>
            <div className="count-pill">
              {savedBaskets.length} {savedBaskets.length === 1 ? 'Hamper' : 'Hampers'} Stored
            </div>
          </div>

          {loadingBaskets ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <span>Loading saved hampers from Supabase...</span>
            </div>
          ) : savedBaskets.length === 0 ? (
            <div className="empty-saved-state">
              <ShoppingBag size={48} className="empty-icon" />
              <p className="empty-title">No personalized baskets saved yet</p>
              <p className="empty-sub">
                Click <strong>"Personalize & Save"</strong> on any gift basket above to send and store it directly in your Supabase database.
              </p>
            </div>
          ) : (
            <div className="saved-grid">
              {savedBaskets.map((basket) => (
                <div key={basket.id} className="saved-item-card">
                  <div className="saved-card-header">
                    <div>
                      <h4 className="saved-basket-title">{basket.basket_name}</h4>
                      <span className="saved-date">
                        Saved {new Date(basket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="saved-price-tag">${basket.price}</span>
                  </div>

                  <div className="saved-details">
                    <div className="saved-field">
                      <span className="saved-label">Recipient:</span>
                      <span className="saved-value">{basket.recipient_name}</span>
                    </div>
                    <div className="saved-field">
                      <span className="saved-label">Gift Message:</span>
                      <p className="saved-quote">"{basket.custom_message}"</p>
                    </div>
                  </div>

                  <div className="saved-card-footer">
                    <span className="status-badge">{basket.status}</span>
                    <button
                      onClick={() => handleDeleteBasket(basket.id)}
                      className="delete-item-btn"
                      title="Remove from Supabase"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Customize & Save Modal */}
      {selectedBasket && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Gift size={20} className="icon-gold" />
                <h3>Personalize {selectedBasket.name}</h3>
              </div>
              <button
                onClick={() => setSelectedBasket(null)}
                className="close-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBasket} className="modal-form">
              <div className="modal-price-bar">
                <span>Selected Hamper Price:</span>
                <span className="modal-price">${selectedBasket.price.toFixed(2)}</span>
              </div>

              <div className="input-group">
                <label>Recipient's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grandma, Alexander, My Best Friend"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Handwritten Greeting Message</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Wishing you a season filled with warmth, happiness, and joy!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedBasket(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={savingBasket}
                >
                  <Save size={18} />
                  <span>{savingBasket ? 'Saving to Supabase...' : 'Save to Supabase Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
