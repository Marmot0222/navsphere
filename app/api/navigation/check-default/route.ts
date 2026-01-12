import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'

export const runtime = 'nodejs'

export async function GET() {
  try {
    try {
      const defaultData = await getFileContent('navsphere/content/navigation-default.json')
      
      // 验证文件格式
      const isValid = defaultData && 
                     typeof defaultData === 'object' && 
                     Array.isArray(defaultData.navigationItems)

      return NextResponse.json({
        exists: true,
        valid: isValid,
        itemCount: isValid ? defaultData.navigationItems.length : 0
      })
    } catch (error) {
      // 文件不存在
      if ((error as Error).message.includes('404') || (error as Error).message.includes('not found')) {
        return NextResponse.json({
          exists: false,
          valid: false,
          itemCount: 0
        })
      }
      throw error
    }
  } catch (error) {
    console.error('Failed to check default file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check default file', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}