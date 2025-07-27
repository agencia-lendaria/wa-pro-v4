'use client'

import { useAuth } from '../../src/hooks/useAuth'
import { LoginForm } from '../../src/components/Auth/LoginForm'
import { Layout } from '../../src/components/Layout/Layout'
import { APIs } from '../../src/pages/APIs'

export default function APIsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <Layout>
      <APIs />
    </Layout>
  )
}