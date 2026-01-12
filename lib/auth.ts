// 认证功能已移除，所有用户默认为管理员权限
// GitHub API 访问使用环境变量中的 GITHUB_TOKEN

export async function auth() {
  // 返回一个模拟的 session，确保兼容性
  return null
}

// 导出空的处理器以保持 API 路由兼容
export const GET = async () => {
  return new Response('Authentication disabled', { status: 404 })
}

export const POST = async () => {
  return new Response('Authentication disabled', { status: 404 })
}