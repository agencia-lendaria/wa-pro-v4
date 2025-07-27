'use client'

import { useAuth } from '../../src/hooks/useAuth'
import { LoginForm } from '../../src/components/Auth/LoginForm'
import { Layout } from '../../src/components/Layout/Layout'

const Contacts = () => <div className="p-6"><h1 className="text-2xl font-bold">Contatos</h1><p className="text-gray-600">Em desenvolvimento...</p></div>

export default function ContactsPage() {
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
      <Contacts />
    </Layout>
  )
}