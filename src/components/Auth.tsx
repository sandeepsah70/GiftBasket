import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Gift,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'

interface AuthProps {
  onSuccess?: () => void
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // Reset password state
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    if (!isLogin) {
      if (!fullName) {
        setMessage({ type: 'error', text: 'Please enter your full name.' })
        return
      }
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
        return
      }
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' })
        return
      }
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (data?.user) {
          setMessage({ type: 'success', text: 'Welcome back! Logged in successfully.' })
          if (onSuccess) onSuccess()
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        })

        if (error) throw error

        if (data?.user) {
          // Explicitly sync profile to public.profiles table as well
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            phone: phone,
            updated_at: new Date().toISOString()
          })

          if (profileError) {
            console.warn('Profile sync note:', profileError.message)
          }

          setMessage({
            type: 'success',
            text: 'Account created successfully! Your data is saved to Supabase.'
          })

          if (data.session && onSuccess) {
            onSuccess()
          } else {
            // Auto switch to login
            setTimeout(() => {
              setIsLogin(true)
            }, 1500)
          }
        }
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please check your credentials.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin
      })
      if (error) throw error
      setResetSent(true)
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset link.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Gift className="icon-gold" size={32} />
          </div>
          <h1 className="auth-title">Gift Basket</h1>
          <p className="auth-subtitle">Handcrafted Luxury Hampers & Curated Gifts</p>

          <div className="supabase-status-pill">
            <span className="pulsing-dot"></span>
            <span>Connected to Supabase</span>
            <ShieldCheck size={14} className="ml-1 text-emerald-500" />
          </div>
        </div>

        {/* Tab switch */}
        {!showForgot && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setMessage(null)
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setMessage(null)
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {message && (
          <div className={`auth-alert ${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {showForgot ? (
          /* Forgot Password View */
          <form onSubmit={handleResetPassword} className="auth-form">
            <h3 className="form-heading">Reset Password</h3>
            <p className="form-subheading">
              Enter your registered email address to receive a secure password recovery link.
            </p>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || resetSent}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              className="text-link mt-3"
              onClick={() => {
                setShowForgot(false)
                setMessage(null)
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          /* Login & Signup Form */
          <form onSubmit={handleAuth} className="auth-form">
            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-field">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Phone Number (Optional)</label>
                  <div className="input-field">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                {isLogin && (
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => {
                      setShowForgot(true)
                      setResetEmail(email)
                      setMessage(null)
                    }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="input-field">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-field">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner-row">
                  <span className="spinner"></span>
                  <span>{isLogin ? 'Signing In...' : 'Registering in Supabase...'}</span>
                </span>
              ) : (
                <span className="btn-content">
                  <span>{isLogin ? 'Sign In to Gift Basket' : 'Create Supabase Account'}</span>
                  <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="auth-footer">
          <Sparkles size={14} className="text-amber-500" />
          <span>Real-time authentication powered by Supabase</span>
        </div>
      </div>
    </div>
  )
}
