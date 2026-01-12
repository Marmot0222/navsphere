#!/bin/bash
# 修复 Docker 部署数据不同步问题

echo "========================================"
echo "  修复 Docker 数据同步问题"
echo "========================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 停止容器
echo "🛑 停止容器..."
docker-compose -f docker/docker-compose.prod.yml down

# 检查数据目录
echo ""
echo "📂 检查数据文件..."
if [ ! -d "navsphere/content" ]; then
    echo "❌ 数据目录 navsphere/content 不存在"
    exit 1
fi

echo "✅ 数据目录存在"
echo ""
echo "数据文件列表："
ls -lh navsphere/content/

# 设置正确的权限（Docker 容器中的 nextjs 用户 UID 是 1001）
echo ""
echo "🔧 设置数据目录权限..."
sudo chown -R 1001:1001 navsphere/content/
sudo chmod -R 755 navsphere/content/

echo "✅ 权限设置完成"
echo ""

# 重新构建并启动
echo "🏗️  重新构建 Docker 镜像..."
docker-compose -f docker/docker-compose.prod.yml build --no-cache

echo ""
echo "🚀 启动容器..."
docker-compose -f docker/docker-compose.prod.yml up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查状态
echo ""
echo "📊 容器状态："
docker-compose -f docker/docker-compose.prod.yml ps

echo ""
echo "📝 查看最近日志："
docker-compose -f docker/docker-compose.prod.yml logs --tail=20

echo ""
echo "========================================"
echo "✅ 修复完成！"
echo "========================================"
echo ""
echo "数据目录挂载路径："
echo "  宿主机：$(pwd)/navsphere/content"
echo "  容器内：/app/navsphere/content"
echo ""
echo "验证步骤："
echo "1. 访问后台：http://your-server-ip:3000/admin"
echo "2. 修改站点信息或导航数据"
echo "3. 刷新前台：http://your-server-ip:3000"
echo "4. 检查数据是否同步"
echo ""
echo "如果仍有问题，查看完整日志："
echo "  docker-compose -f docker/docker-compose.prod.yml logs -f"
echo ""
