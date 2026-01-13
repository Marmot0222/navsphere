#!/bin/bash
# Docker 部署故障排查脚本

echo "========================================"
echo "  NavSphere Docker 故障排查"
echo "========================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 1. 检查容器状态
echo "📊 1. 检查容器状态"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml ps
echo ""

# 2. 检查容器日志
echo "📝 2. 查看容器日志（最近50行）"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml logs --tail=50
echo ""

# 3. 检查数据目录权限
echo "🔍 3. 检查宿主机数据目录权限"
echo "-----------------------------------"
ls -la navsphere/content/
echo ""

# 4. 检查容器内数据目录
echo "📂 4. 检查容器内数据目录"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml exec -T app ls -la /app/navsphere/content/ 2>/dev/null || echo "❌ 容器未运行或无法访问"
echo ""

# 5. 测试健康检查端点
echo "🏥 5. 测试健康检查端点"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml exec -T app wget -O- http://localhost:3000/api/health 2>/dev/null || echo "❌ 健康检查失败"
echo ""

# 6. 测试导航 API
echo "🔌 6. 测试导航 API"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml exec -T app wget -O- http://localhost:3000/api/navigation 2>/dev/null || echo "❌ 导航 API 失败"
echo ""

# 7. 检查容器内进程
echo "⚙️  7. 检查容器内进程"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml exec -T app ps aux 2>/dev/null || echo "❌ 无法检查进程"
echo ""

# 8. 检查端口占用
echo "🔌 8. 检查端口占用"
echo "-----------------------------------"
docker-compose -f docker/docker-compose.prod.yml exec -T app netstat -tlnp 2>/dev/null || echo "❌ 无法检查端口"
echo ""

# 9. 查看容器资源使用
echo "💻 9. 容器资源使用"
echo "-----------------------------------"
docker stats --no-stream 2>/dev/null | grep navsphere || echo "❌ 无容器在运行"
echo ""

echo "========================================"
echo "✅ 排查完成"
echo "========================================"
echo ""
echo "常用调试命令："
echo "  完整日志: docker-compose -f docker/docker-compose.prod.yml logs -f"
echo "  进入容器: docker-compose -f docker/docker-compose.prod.yml exec app sh