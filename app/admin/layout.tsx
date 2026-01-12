import { AdminLayoutClient } from './AdminLayoutClient'
import { Toaster } from "@/registry/new-york/ui/toaster"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavSphere Admin',
  description: 'NavSphere Admin Dashboard',
  icons: {
    icon: '/assets/images/favicon.webp',
    shortcut: '/assets/images/favicon.webp',
    apple: '/assets/images/favicon.webp',
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 认证功能已移除，所有用户默认为管理员权限
  const defaultUser = {
    name: 'Admin',
    email: 'admin@navsphere.local',
    image: null
  }

  return (
    <>
      <AdminLayoutClient user={defaultUser}>
        {children}
      </AdminLayoutClient>
      <Toaster />
    </>
  )
} 