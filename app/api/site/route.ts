import { NextResponse } from 'next/server'
import { commitFile, getFileContent } from '@/lib/github'
import type { SiteInfo } from '@/types/site'

export const runtime = 'nodejs'
export const maxDuration = 60
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
    const data = await getFileContent('navsphere/content/site.json') as SiteInfo
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to read site data:', error)
    return NextResponse.json({
      basic: {
        title: '',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system'
      },
      navigation: {
        linkTarget: '_blank'
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    // 使用流式读取请求体，支持大数据
    const text = await request.text()
    const data: SiteInfo = JSON.parse(text)
    
    console.log('Saving site configuration...')
    // 提交到本地
    await commitFile(
      'navsphere/content/site.json',
      JSON.stringify(data, null, 2),
      'Update site configuration'
    )
    console.log('Site configuration saved successfully')

    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Failed to save site data:', error)
    return NextResponse.json(
      { error: 'Failed to save site data', details: (error as Error).message },
      { status: 500 }
    )
  }
} 