import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../services/firebase'
import { getUserProfile, watchUserProfile } from '../services/clinicService'
import { ROLES } from '../utils/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false)
      return undefined
    }
    return onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setAuthLoading(false)
      },
      (authError) => {
        setError(authError?.message || 'Unable to restore your session.')
        setAuthLoading(false)
      },
    )
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      setProfileLoading(false)
      return undefined
    }
    setProfileLoading(true)
    return watchUserProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile)
        setProfileLoading(false)
      },
      () => {
        setError('We could not load your staff profile.')
        setProfileLoading(false)
      },
    )
  }, [user?.uid])

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return null
    const next = await getUserProfile(user.uid)
    setProfile(next)
    return next
  }, [user?.uid])

  const value = useMemo(
    () => ({
      user,
      profile,
      clinicId: profile?.clinicId || null,
      role: profile?.role || null,
      isAdmin: profile?.role === ROLES.ADMIN,
      loading: authLoading || profileLoading,
      error,
      refreshProfile,
    }),
    [user, profile, authLoading, profileLoading, error, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
