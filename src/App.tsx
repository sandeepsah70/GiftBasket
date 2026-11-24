import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { Gift } from 'lucide-react'
import './App.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-box">
          <div className="loader-icon-bounce">
            <Gift size={44} className="icon-gold" />
          </div>
          <h2>Gift Basket</h2>
          <p>Connecting to Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root">
      {session && session.user ? (
        <Dashboard user={session.user} onSignOut={handleSignOut} />
      ) : (
        <Auth />
      )}
    </div>
  )
}
