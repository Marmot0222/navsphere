import { NextResponse } from 'next/server'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'nodejs'
export const maxDuration = 60 // 最大执行时间 60 秒

// 配置请求体大小（App Router 方式）
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// 增加请求体大小限制到 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export async function GET() {
  try {
    const data = await getFileContent('navsphere/content/navigation.json')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch navigation data:', error)
    // 返回默认数据结构
    return NextResponse.json({
      navigationItems: []
    })
  }
}

async function validateAndSaveNavigationData(data: any) {
  // 简化日志输出，避免大数据量日志
  console.log('Received navigation data with', data?.navigationItems?.length || 0, 'items')
  
  // 严格验证数据结构
  if (!data || typeof data !== 'object') {
    console.error('Invalid data: not an object')
    throw new Error('Invalid navigation data: not an object')
  }

  if (!('navigationItems' in data)) {
    console.error('Missing navigationItems key')
    throw new Error('Invalid navigation data: missing navigationItems')
  }

  if (!Array.isArray(data.navigationItems)) {
    console.error('navigationItems is not an array', typeof data.navigationItems)
    throw new Error('Invalid navigation data: navigationItems must be an array')
  }

  // 额外的数据验证
  const invalidItems = data.navigationItems.filter((item: NavigationItem) => 
    !item.id || 
    !item.title || 
    (item.items && !Array.isArray(item.items)) ||
    (item.subCategories && !Array.isArray(item.subCategories))
  )

  if (invalidItems.length > 0) {
    console.error('Invalid navigation items count:', invalidItems.length)
    throw new Error('Invalid navigation data: some items are malformed')
  }

  await commitFile(
    'navsphere/content/navigation.json',
    JSON.stringify(data, null, 2),
    'Update navigation data'
  )
}

export async function POST(request: Request) {
  try {
    // 使用流式读取请求体，支持大数据
    const text = await request.text()
    const data = JSON.parse(text)
    
    console.log('Saving navigation data...')
    await validateAndSaveNavigationData(data)
    console.log('Navigation data saved successfully')

    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Failed to save navigation data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save navigation data', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // 使用流式读取请求体，支持大数据
    const text = await request.text()
    const data = JSON.parse(text)
    
    console.log('Updating navigation data...')
    await validateAndSaveNavigationData(data)
    console.log('Navigation data updated successfully')

    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Failed to update navigation data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update navigation data', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
} 