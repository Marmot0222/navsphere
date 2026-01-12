import { NextResponse } from 'next/server'
import { commitFile, getFileContent } from '@/lib/github'
import type { ResourceMetadata } from '@/types/resource-metadata'
import { uint8ArrayToBase64 } from '@/lib/buffer-utils'

export const runtime = 'nodejs'



export async function GET() {
    try {
        const data = await getFileContent('navsphere/content/resource-metadata.json') as ResourceMetadata
        if (!data?.metadata || !Array.isArray(data.metadata)) {
            throw new Error('Invalid data structure');
        }
        return NextResponse.json(data)
    } catch (error) {
        console.error('Failed to fetch resource metadata:', error)
        return NextResponse.json({ error: 'Failed to fetch resource metadata' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { image } = await request.json(); // Get the Base64 image
        const base64Data = image.split(",")[1]; // Extract the Base64 part
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)); // Convert Base64 to binary

        // 获取上传结果，包含路径和 commit hash
        const { path: imageUrl, commitHash } = await uploadImageToLocal(binaryData);

        // Handle metadata
        const metadata = await getFileContent('navsphere/content/resource-metadata.json') as ResourceMetadata;
        metadata.metadata.unshift({
            commit: commitHash,  // 使用实际的 commit hash
            hash: commitHash,    // 使用相同的 hash 作为资源标识
            path: imageUrl
        });

        await commitFile(
            'navsphere/content/resource-metadata.json',
            JSON.stringify(metadata, null, 2),
            'Update resource metadata'
        );

        return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Failed to save resource metadata:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save resource metadata' },
            { status: 500 }
        );
    }
}

// 上传图片到本地
async function uploadImageToLocal(binaryData: Uint8Array): Promise<{ path: string, commitHash: string }> {
    const fileName = `img_${Date.now()}.png`
    const path = `/assets/${fileName}`
    const fullPath = `public${path}`
    
    // 确保 public/assets目录存在
    const fs = require('fs').promises
    const pathModule = require('path')
    const assetsDir = pathModule.join(process.cwd(), 'public', 'assets')
    
    try {
        await fs.access(assetsDir)
    } catch {
        await fs.mkdir(assetsDir, { recursive: true })
    }
    
    // 写入文件
    const filePath = pathModule.join(process.cwd(), fullPath)
    await fs.writeFile(filePath, binaryData)
    
    // 生成一个简单的 hash作为 commitHash
    const commitHash = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return { path, commitHash }
}

export async function DELETE(request: Request) {
    try {
        const { resourceHashes } = await request.json();

        if (!Array.isArray(resourceHashes) || resourceHashes.length === 0) {
            return NextResponse.json({ error: 'Invalid resource hashes' }, { status: 400 });
        }

        // 获取当前的资源元数据
        const metadata = await getFileContent('navsphere/content/resource-metadata.json') as ResourceMetadata;

        // 过滤掉要删除的资源
        const originalCount = metadata.metadata.length;
        metadata.metadata = metadata.metadata.filter(item => !resourceHashes.includes(item.hash));
        const deletedCount = originalCount - metadata.metadata.length;

        // 更新资源元数据文件
        await commitFile(
            'navsphere/content/resource-metadata.json',
            JSON.stringify(metadata, null, 2),
            `Delete ${deletedCount} resource(s)`
        );

        // 注意：这里只是从元数据中删除了引用，实际的图片文件仍然存在于GitHub仓库中
        // 如果需要删除实际文件，需要额外的GitHub API调用

        return NextResponse.json({
            success: true,
            deletedCount,
            message: `成功删除 ${deletedCount} 个资源`
        });
    } catch (error) {
        console.error('Failed to delete resources:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete resources' },
            { status: 500 }
        );
    }
}
