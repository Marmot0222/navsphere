import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 认证功能已移除，允许直接访问管理页面
export async function middleware(request: NextRequest) {
  // 所有用户默认拥有管理员权限，无需认证
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}