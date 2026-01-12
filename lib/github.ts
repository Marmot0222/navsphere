import { promises as fs } from 'fs'
import path from 'path'

// 本地数据存储目录（使用 navsphere/content 以便前台可以直接导入）
const DATA_DIR = path.join(process.cwd(), 'navsphere', 'content')

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// 获取文件完整路径
function getFilePath(relativePath: string): string {
  // 移除路径前缀，只保留文件名
  const fileName = relativePath.split('/').pop() || relativePath
  return path.join(DATA_DIR, fileName)
}

// 读取文件内容
export async function getFileContent(filePath: string) {
  await ensureDataDir()
  
  const fullPath = getFilePath(filePath)
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8')
    return JSON.parse(content)
  } catch (error: any) {
    console.log(`File not found: ${filePath}, returning default data`)
    
    // 返回默认数据结构
    if (filePath.includes('navigation.json')) {
      return { navigationItems: [] }
    }
    if (filePath.includes('site.json')) {
      return {
        basic: {
          title: 'NavSphere',
          description: '导航管理系统',
          keywords: '导航,网站,管理'
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        },
        navigation: {
          linkTarget: '_blank'
        }
      }
    }
    if (filePath.includes('resource-metadata.json')) {
      return { metadata: [] }
    }
    return {}
  }
}

// 保存文件内容
export async function commitFile(
  filePath: string,
  content: string,
  message: string,
  _token?: string  // 保留参数以保持 API 兼容性，但不使用
) {
  await ensureDataDir()
  
  const fullPath = getFilePath(filePath)
  
  try {
    await fs.writeFile(fullPath, content, 'utf-8')
    console.log(`File saved: ${filePath}`)
    return { success: true, message }
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error(`Failed to save file: ${(error as Error).message}`)
  }
} 