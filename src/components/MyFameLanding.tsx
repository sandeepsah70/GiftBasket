import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface MyFameLandingProps {
  onAuthSuccess: () => void
}

export const MyFameLanding: React.FC<MyFameLandingProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Auth form states
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(false)

  // Forgot password
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Particle Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const particleCount = 20
    const iconColor = '#2b95e9'

    const iconPaths: Record<string, string> = {
      twitter: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
      facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
      linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z'
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    window.addEventListener('resize', resize)
    resize()

    class Particle {
      x = 0
      y = 0
      size = 20
      speedY = 0.5
      speedX = 0
      rotation = 0
      rotationSpeed = 0
      iconKey = 'twitter'
      sinCounter = 0
      sinSpeed = 0.005
      opacity = 1

      constructor() {
        this.init(true)
      }

      init(firstRun = false) {
        if (!canvas) return
        this.x = Math.random() * (canvas.width / (window.devicePixelRatio || 1))
        this.y = firstRun
          ? Math.random() * (canvas.height / (window.devicePixelRatio || 1))
          : (canvas.height / (window.devicePixelRatio || 1)) + 50
        this.size = 20 + Math.random() * 14
        this.speedY = 0.3 + Math.random() * 0.5
        this.speedX = (Math.random() - 0.5) * 0.25
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.008

        const keys = ['twitter', 'instagram', 'facebook', 'linkedin']
        this.iconKey = keys[Math.floor(Math.random() * keys.length)]
        this.sinCounter = Math.random() * 1000
        this.sinSpeed = 0.004 + Math.random() * 0.008
        this.opacity = 1
      }

      update() {
        if (!canvas) return
        const h = canvas.height / (window.devicePixelRatio || 1)
        this.y -= this.speedY
        this.sinCounter += this.sinSpeed
        this.x += this.speedX + Math.sin(this.sinCounter) * 0.25
        this.rotation += this.rotationSpeed

        const fadeThreshold = h * 0.35
        if (this.y < fadeThreshold) {
          this.opacity = Math.max(0, this.y / fadeThreshold)
        } else {
          this.opacity = 1
        }

        if (this.opacity <= 0 || this.y < -50) {
          this.init()
        }
      }

      draw() {
        if (!ctx || this.opacity <= 0) return
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity * 0.75
        ctx.strokeStyle = iconColor
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        const s = this.size
        const h = s / 2

        if (this.iconKey === 'instagram') {
          // Instagram line icon
          const r = s * 0.22
          ctx.beginPath()
          ctx.moveTo(-h + r, -h)
          ctx.lineTo(h - r, -h)
          ctx.quadraticCurveTo(h, -h, h, -h + r)
          ctx.lineTo(h, h - r)
          ctx.quadraticCurveTo(h, h, h - r, h)
          ctx.lineTo(-h + r, h)
          ctx.quadraticCurveTo(-h, h, -h, h - r)
          ctx.lineTo(-h, -h + r)
          ctx.quadraticCurveTo(-h, -h, -h + r, -h)
          ctx.closePath()
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(h * 0.52, -h * 0.52, 1, 0, Math.PI * 2)
          ctx.stroke()
        } else if (iconPaths[this.iconKey]) {
          const path = new Path2D(iconPaths[this.iconKey])
          ctx.scale(s / 24, s / 24)
          ctx.translate(-12, -12)
          ctx.stroke(path)
        }
        ctx.restore()
      }
    }

    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Initialize Lottie Animation if available
  useEffect(() => {
    const lottieContainer = document.getElementById('myLottie')
    if (lottieContainer && (window as any).lottie) {
      try {
        const anim = (window as any).lottie.loadAnimation({
          container: lottieContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: 'https://cdn.prod.website-files.com/67a0dbea1522d1b7ff6efd38/6884ba8440d710d7fc47c8e7_Lottie%20-%20Vector.json'
        })
        return () => anim.destroy()
      } catch (e) {
        console.warn('Lottie load error', e)
      }
    }
  }, [])

  // Supabase Authentication Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (isLogin) {
      // Login
      if (!username || !password) {
        setMessage({ type: 'error', text: 'Please enter your username/email and password.' })
        return
      }

      setLoading(true)
      try {
        // If input contains '@', treat as email, else format as username@myfame.in
        const loginEmail = username.includes('@') ? username : `${username.trim().toLowerCase()}@myfame.in`

        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password
        })

        if (error) throw error

        if (data.user) {
          setMessage({ type: 'success', text: 'Logged in successfully! Redirecting...' })
          setTimeout(() => onAuthSuccess(), 500)
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Invalid username or password.' })
      } finally {
        setLoading(false)
      }
    } else {
      // Register
      if (!username || !email || !password) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' })
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

      setLoading(true)
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              username: username.trim(),
              phone: phone.trim()
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // Upsert to Supabase public.profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: username,
            phone: phone,
            updated_at: new Date().toISOString()
          })

          setMessage({
            type: 'success',
            text: 'Account created and saved to Supabase! You can now log in.'
          })

          if (data.session) {
            setTimeout(() => onAuthSuccess(), 800)
          } else {
            setTimeout(() => setIsLogin(true), 1500)
          }
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to create account.' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail)
      if (error) throw error
      setMessage({ type: 'success', text: 'Reset link sent to your email.' })
      setShowForgot(false)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error sending reset email.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="myfame-page-wrapper">
      {/* Guest Navigation */}
      <nav className="navbar navbar-expand-lg guestNav">
        <div className="container">
          <a className="navbar-brand" href="#hero">
            <img src="https://storage.perfectcdn.com/rpyfx7/kzb17mhrep50yeon.png" alt="myfame.in" height="40" />
          </a>

          <div className="buttonGrpnav">
            <a
              className="loginBtnnav demobtnNav pulse"
              href="https://youtube.com/shorts/Q8NRJRGQPcg?si=83HtwAvZ0QpowPHN"
              target="_blank"
              rel="noreferrer"
            >
              Watch Demo
            </a>
            <button
              className={`loginBtnnav LoginbtnNav ${isLogin ? 'active-nav-btn' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setShowForgot(false)
                setMessage(null)
              }}
            >
              Login
            </button>
            <button
              className={`loginBtnnav RegisterbtnNav ${!isLogin ? 'active-nav-btn' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setShowForgot(false)
                setMessage(null)
              }}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="smm-hero-section position-relative" id="hero">
        <div className="topshapeimgwrap">
          <img src="https://storage.perfectcdn.com/rpyfx7/9cnxdtcg7cz7r2fb.png" className="topshapeimg" alt="bg shape" />
          <img src="https://storage.perfectcdn.com/rpyfx7/c41lxrf8y6gxtnd7.png" className="topshapeimg topshapeimgmob" alt="bg shape mobile" />
        </div>

        <div className="container position-relative z-2">
          <div className="row justify-content-center align-items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="col-lg-7 text-center text-lg-start mb-5 mb-lg-0">
              <div className="topcont position-relative">
                <canvas id="particleCanvas" ref={canvasRef}></canvas>

                <div className="supabase-live-tag mb-3">
                  <span className="dot-pulse"></span>
                  <span>Supabase Live Connected</span>
                  <i className="fas fa-database text-success ms-1"></i>
                </div>

                <h1 className="heading-style-ultra">
                  <span className="span_rect">1M+ creators</span> grow their social media with Myfame
                </h1>
                
                <div className="text-size-large max-width-xlarge">
                  Creators and entrepreneurs just like you use Myfame automation to boost their engagement and attract thousands of new followers every day
                </div>

                <div className="hero4_buttons mt-4">
                  <div className="button-group d-flex flex-wrap align-items-center gap-3">
                    <button
                      onClick={() => {
                        setIsLogin(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="button button-large"
                    >
                      <span className="text-style-nowrap">START GROWING</span>
                      <span className="button_bg"></span>
                    </button>

                    <div className="sp_wrap">
                      <div className="sp_cloud">
                        <div className="sp-cloud_avatar-wrap">
                          <div className="sp-cloud_avatar">
                            <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28689_271298431_133147079167282_1332606425470690808_n.avif" alt="avatar" />
                          </div>
                          <div className="sp-cloud_avatar">
                            <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db2868a_361951851_969670710948625_8589459234153284974_n.avif" alt="avatar" />
                          </div>
                          <div className="sp-cloud_avatar">
                            <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28688_339448700_121936770852775_6819991127261678053_n.avif" alt="avatar" />
                          </div>
                          <div className="sp-cloud_avatar">
                            <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28672_image%20401476.avif" alt="avatar" />
                          </div>
                          <div className="sp-cloud_avatar">
                            <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28683_image%20401477.avif" alt="avatar" />
                          </div>
                        </div>

                        <div className="sp-cloud_text">
                          Loved by <br /><strong>1M+</strong> creators
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Login / Register Form */}
            <div className="col-lg-5">
              <div className="loginwell">
                {/* Form Tabs */}
                <div className="form-toggle-tabs">
                  <button
                    type="button"
                    className={`form-toggle-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => {
                      setIsLogin(true)
                      setShowForgot(false)
                      setMessage(null)
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`form-toggle-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => {
                      setIsLogin(false)
                      setShowForgot(false)
                      setMessage(null)
                    }}
                  >
                    Register
                  </button>
                </div>

                {message && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 px-3 small mb-3`}>
                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {message.text}
                  </div>
                )}

                {showForgot ? (
                  <form onSubmit={handleForgotPassword}>
                    <h5 className="text-white mb-2">Reset Password</h5>
                    <p className="small text-muted mb-3">Enter your registered email to receive a password reset link.</p>
                    
                    <div className="form-group grpTt mb-3">
                      <label className="d-block text-start">Email Address</label>
                      <div className="inputWraplogin">
                        <i className="fas fa-envelope"></i>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Your email address"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-link text-muted w-100 mt-2 small text-decoration-none"
                      onClick={() => setShowForgot(false)}
                    >
                      Back to Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAuth}>
                    <div className="form-group grpTt mb-3">
                      <label className="d-block text-start">{isLogin ? 'Username or Email' : 'Username'}</label>
                      <div className="inputWraplogin">
                        <i className="fas fa-user"></i>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={isLogin ? 'Username or Email' : 'Desired Username'}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {!isLogin && (
                      <>
                        <div className="form-group grpTt mb-3">
                          <label className="d-block text-start">Email Address</label>
                          <div className="inputWraplogin">
                            <i className="fas fa-envelope"></i>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group grpTt mb-3">
                          <label className="d-block text-start">WhatsApp / Phone (Optional)</label>
                          <div className="inputWraplogin">
                            <i className="fab fa-whatsapp"></i>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-group form-group__password grpTt mb-3">
                      <div className="labelPass d-flex justify-content-between align-items-center mb-1">
                        <label className="mb-0">Password</label>
                        {isLogin && (
                          <a
                            href="#forgot"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowForgot(true)
                              setForgotEmail(username.includes('@') ? username : '')
                            }}
                            className="forgot-password"
                          >
                            Forgot?
                          </a>
                        )}
                      </div>
                      <div className="passwordWrap position-relative">
                        <div className="inputWraplogin">
                          <i className="fas fa-lock"></i>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <i
                          className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute top-50 end-0 translate-middle-y me-3 text-muted`}
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer', zIndex: 5 }}
                        ></i>
                      </div>
                    </div>

                    {!isLogin && (
                      <div className="form-group grpTt mb-3">
                        <label className="d-block text-start">Confirm Password</label>
                        <div className="inputWraplogin">
                          <i className="fas fa-lock"></i>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {isLogin && (
                      <div className="form-check form-switch mb-3 text-start">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label className="form-check-label text-muted" htmlFor="remember">
                          Remember me
                        </label>
                      </div>
                    )}

                    <div className="form-group grpTt">
                      <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                        {loading ? (
                          <span>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            {isLogin ? 'Authenticating...' : 'Creating in Supabase...'}
                          </span>
                        ) : (
                          <span>{isLogin ? 'Sign in' : 'Create MyFame Account'}</span>
                        )}
                      </button>
                    </div>

                    <div className="googleMainwrap mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: { redirectTo: window.location.origin }
                          })
                        }}
                      >
                        <img src="https://storage.perfectcdn.com/40dfxk/dfrm2woiraxcb041.svg" alt="google" />
                        <span>Login with Google</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaNew py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="cta d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                <div className="cta_heading">
                  <h3 className="mb-0 text-white">
                    The <span className="span_strikethrough">harder</span> smarter way to grow your Social Media
                  </h3>
                </div>

                <div className="cta_button-group d-flex align-items-center gap-3">
                  <div className="sp_cloud">
                    <div className="sp-cloud_avatar-wrap">
                      <div className="sp-cloud_avatar">
                        <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db2868a_361951851_969670710948625_8589459234153284974_n.avif" alt="avatar" />
                      </div>
                      <div className="sp-cloud_avatar">
                        <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28688_339448700_121936770852775_6819991127261678053_n.avif" alt="avatar" />
                      </div>
                      <div className="sp-cloud_avatar">
                        <img src="https://cdn.prod.website-files.com/66013c6000b4e0543db285ba/66013c6000b4e0543db28683_image%20401477.avif" alt="avatar" />
                      </div>
                    </div>
                    <div className="sp-cloud_text">
                      Loved by <br /><strong>1M+</strong> creators
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsLogin(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="button button-large button-light"
                  >
                    <span className="text-style-nowrap">Register Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="secSec py-5">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-8 col-12">
              <div className="vidWrap rounded overflow-hidden shadow-lg border border-secondary">
                <video
                  className="w-100 rounded"
                  controls
                  poster="https://storage.perfectcdn.com/rpyfx7/bj2mres4u9e2w8ds.jpg"
                >
                  <source src="https://crewcrafted.com/myfame/myfame.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "WHY CONTENT CREATORS love MyFame" Section */}
      <section className="secondSec py-5">
        <div className="container">
          <div className="kicksta-wrapper p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-6 text-white">
                <h2 className="kicksta-title">
                  WHY CONTENT CREATORS <br />
                  <span className="kicksta-italic text-primary">love</span> MyFame
                </h2>

                <p className="kicksta-desc mt-4 text-muted">
                  Creators who use myfame grow 3x faster than those who don't. They get followers without wasting numerous hours manually searching for the ideal audience. Instead, they rely on myfame and focus on creating.
                </p>

                <div className="row mt-4 gy-4">
                  <div className="col-6">
                    <div className="stat-box">
                      <div className="stat-number">5X</div>
                      <div className="stat-text">more profile visits within the first month</div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-box">
                      <div className="stat-number">4X</div>
                      <div className="stat-text">higher engagement rate than manual outreach</div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-box">
                      <div className="stat-number">+20%</div>
                      <div className="stat-text">revenue increase from brand deals & collaborations</div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-box">
                      <div className="stat-number">3X</div>
                      <div className="stat-text">stronger community & followers who engage with your content</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="kicksta-image-wrapper text-center">
                  <div id="myLottie" style={{ width: '100%', minHeight: '320px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="thirdSec py-5">
        <div className="container">
          <div className="steps">
            <ul className="list-unstyled row g-4">
              <li className="col-md-4">
                <div className="step step-purple">
                  <h6><span>1</span> Pick a package</h6>
                  <p>
                    Choose the Instagram likes, followers, or views package that you're interested in. Feel free to get in touch if you have an inquiry about a bulk order.
                  </p>
                  <img className="imgStps" src="https://storage.perfectcdn.com/40dfxk/d4ers93hacsulwfe.svg" alt="step 1" />
                </div>
              </li>

              <li className="col-md-4">
                <div className="step step-green">
                  <h6><span>2</span> Fill the info</h6>
                  <p>
                    We will never ask you for sensitive details such as your password. All you have to do is provide us with your Instagram username and leave the rest to us.
                  </p>
                  <img className="imgStps" src="https://storage.perfectcdn.com/40dfxk/4c8yx2dxrlewaexs.svg" alt="step 2" />
                </div>
              </li>

              <li className="col-md-4">
                <div className="step step-cyan">
                  <h6><span>3</span> See the growth</h6>
                  <p>
                    All orders start within a few minutes, so you'll see growth in your Instagram account very quickly. We've made the process super easy.
                  </p>
                  <img className="imgStps" src="https://storage.perfectcdn.com/40dfxk/i967i7pjfgkgk31o.svg" alt="step 3" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Payment Sec */}
      <section className="paymentSec py-5">
        <div className="container text-center">
          <div className="headingSectionsnew mb-4">
            <h2><span>Powered</span> By</h2>
          </div>
          <div className="d-flex align-items-center justify-content-center flex-wrap gap-4">
            <img src="https://storage.perfectcdn.com/rpyfx7/xknpme3q6gotnigg.png" alt="Payment partners" className="img-fluid" style={{ maxHeight: '48px' }} />
            <img src="https://storage.perfectcdn.com/rpyfx7/nmjd3r01p4gmf5gr.png" alt="Payment security" className="img-fluid" style={{ maxHeight: '48px' }} />
          </div>
        </div>
      </section>

      {/* Safe & Anonymous Card */}
      <section className="ctaPp py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5 text-center">
              <div className="cardCTA">
                <img src="https://storage.perfectcdn.com/rpyfx7/egr9t2wr8tgeba12.png" alt="Safe and anonymous" className="mb-3" style={{ width: '60px' }} />
                <p>
                  <b>MyFame</b> protects your identity, and your purchase is 100% anonymous. We offer only the highest quality services that are safe to use and trusted by celebrities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-bgsigin py-4 text-center">
        <div className="container">
          <ul className="list-inline mb-0 d-flex justify-content-center gap-4">
            <li className="list-inline-item text-muted">© MyFame - Powered by Supabase</li>
            <li className="list-inline-item"><a href="#hero" className="text-muted text-decoration-none">Privacy &amp; Terms</a></li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
