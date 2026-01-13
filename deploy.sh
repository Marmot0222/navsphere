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

# 设置数据目录权限
echo "🔧 设置数据目录权限..."
echo "  目标目录: $(pwd)/navsphere/content"
echo "  设置所有者: 1001:1001 (nextjs用户)"
echo "  设置权限: 775 (所有者和组可读写执行，其他用户可读执行)"

# 设置所有者和权限
sudo chown -R 1001:1001 navsphere/content/
sudo chmod -R 775 navsphere/content/

# 验证权限设置
echo ""
echo "验证权限设置:"
ls -ld navsphere/content/
ls -lh navsphere/content/

echo "✅ 权限设置完成"
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

# 等待服务完全启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 验证容器内权限
echo ""
echo "🔍 验证容器内数据目录权限..."
docker-compose -f docker/docker-compose.prod.yml exec -T app ls -la /app/navsphere/content/ || echo "⚠️  无法验证容器内权限，请手动检查"

# 测试写入权限
echo ""
echo "📝 测试文件写入权限..."
docker-compose -f docker/docker-compose.prod.yml exec -T app touch /app/navsphere/content/.write-test 2>/dev/null && \
  docker-compose -f docker/docker-compose.prod.yml exec -T app rm /app/navsphere/content/.write-test 2>/dev/null && \
  echo "✅ 写入权限正常" || \
  echo "❌ 写入权限异常，请检查文件权限设置"

echo ""
echo "========================================"
echo "✅ 部署完成！"
echo "========================================"
echo ""
echo "访问地址："
echo "  前台：http://your-server-ip:3000"
echo "  后台：http://your-server-ip:3000/admin"
echo ""
echo "数据目录挂载："
echo "  宿主机：$(pwd)/navsphere/content"
echo "  容器内：/app/navsphere/content"
echo ""
echo "配置说明："
echo "  - API 请求体大小限制：10MB"
echo "  - API 响应体大小限制：10MB"
echo "  - 页面缓存：已禁用（实时读取最新数据）"
echo "  - 最大执行时间：60秒"
echo ""
echo "常用命令："
echo "  查看日志：docker-compose -f docker/docker-compose.prod.yml logs -f"
echo "  停止服务：docker-compose -f docker/docker-compose.prod.yml down"
echo "  重启服务：docker-compose -f docker/docker-compose.prod.yml restart"
echo ""
