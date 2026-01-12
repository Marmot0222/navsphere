export default {
  async fetch(request, env) {
    // 本地化部署，无需环境变量设置
    
    // 处理路由
    try {
      return await env.ASSETS.fetch(request)
    } catch (e) {
      // 如果是 404，重定向到首页
      if (e.status === 404) {
        return Response.redirect(new URL('/', request.url))
      }
      throw e
    }
  }
} 