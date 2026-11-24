import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { MyFameLanding } from './components/MyFameLanding'
import { MyFameDashboard } from './components/MyFameDashboard'
import './App.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session)
      setLoading(false)
    })

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
      <div className="d-flex min-vh-100 align-items-center justify-content-center bg-dark text-white">
        <div className="text-center">
          <img src="https://storage.perfectcdn.com/rpyfx7/kzb17mhrep50yeon.png" alt="MyFame" height="42" className="mb-3" />
          <div className="spinner-border text-primary d-block mx-auto mb-2" role="status"></div>
          <p className="text-muted small">Loading MyFame...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="myfame-app-container">
      {session && session.user ? (
        <MyFameDashboard user={session.user} onSignOut={handleSignOut} />
      ) : (
        <MyFameLanding onAuthSuccess={() => {}} />
      )}
    </div>
  )
}
