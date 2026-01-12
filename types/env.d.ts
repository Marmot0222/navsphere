declare namespace NodeJS {
  interface ProcessEnv {
    // 本地化存储，不需要额外环境变量
    NEXT_PUBLIC_API_URL?: string
  }
} 