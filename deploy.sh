#!/bin/bash
# NavSphere Docker 部署脚本

echo "========================================"
echo "  NavSphere Docker 部署脚本"
echo "========================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"
echo ""

# 检查数据目录
echo "📂 检查数据目录..."
if [ ! -d "navsphere/content" ]; then
    echo "❌ 数据目录不存在，请确保 navsphere/content 目录存在"
    exit 1
fi

if [ ! -f "navsphere/content/navigation.json" ] || [ ! -f "navsphere/content/site.json" ]; then
    echo "⚠️  数据文件不完整，请检查以下文件是否存在："
    echo "   - navsphere/content/navigation.json"
    echo "   - navsphere/content/site.json"
    echo "   - navsphere/content/resource-metadata.json"
    exit 1
fi

echo "✅ 数据目录检查通过"
echo ""

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose -f docker/docker-compose.prod.yml down

# 构建新镜像
echo "🏗️  构建 Docker 镜像..."
docker-compose -f docker/docker-compose.prod.yml build --no-cache

# 启动容器
echo "🚀 启动容器..."
docker-compose -f docker/docker-compose.prod.yml up -d

# 检查状态
echo ""
echo "📊 检查容器状态..."
docker-compose -f docker/docker-compose.prod.yml ps

echo ""
echo "========================================"
echo "✅ 部署完成！"
echo "========================================"
echo ""
echo "访问地址："
echo "  前台：http://your-server-ip:3000"
echo "  后台：http://your-server-ip:3000/admin"
echo ""
echo "常用命令："
echo "  查看日志：docker-compose -f docker/docker-compose.prod.yml logs -f"
echo "  停止服务：docker-compose -f docker/docker-compose.prod.yml down"
echo "  重启服务：docker-compose -f docker/docker-compose.prod.yml restart"
echo ""
