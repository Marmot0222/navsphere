import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import { getFileContent } from '@/lib/github'

// 禁用页面缓存，确保每次都读取最新数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  // 从本地文件动态读取数据，确保后台修改后能立即生效
  const navigationData = await getFileContent('navsphere/content/navigation.json')
  const siteDataRaw = await getFileContent('navsphere/content/site.json')
  // 确保 theme 类型正确
  const siteData: SiteConfig = {
    ...siteDataRaw,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance.theme === 'light' ||
        siteDataRaw.appearance.theme === 'dark' ||
        siteDataRaw.appearance.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
  }

  // 过滤只显示启用的分类和网站
  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter((category: any) => category.enabled !== false) // 过滤启用的分类
      .map((category: any) => {
        const filteredSubCategories = category.subCategories
          ? (category.subCategories as any[])
              .filter((sub: any) => sub.enabled !== false) // 过滤启用的子分类
              .map((sub: any) => ({
                ...sub,
                items: sub.items?.filter((item: any) => item.enabled !== false) // 过滤启用的网站
              }))
          : undefined
        
        return {
          ...category,
          items: category.items?.filter((item: any) => item.enabled !== false), // 过滤启用的网站
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData || { navigationItems: [] },
    siteData: siteData || {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system' as const
      },
      navigation: {
        linkTarget: '_blank' as const
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
