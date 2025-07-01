/**
 * 多语言Toast消息工具
 */

export interface ToastMessage {
  title: string
  description?: string
}

export interface ToastMessages {
  en: ToastMessage
  zh: ToastMessage
  [key: string]: ToastMessage
}

// 注册相关消息
export const signUpMessages: ToastMessages = {
  en: {
    title: "Registration Successful!",
    description: "Welcome! Your account has been created successfully."
  },
  zh: {
    title: "注册成功！",
    description: "欢迎！您的账户已成功创建。"
  }
}

export const signUpErrorMessages: ToastMessages = {
  en: {
    title: "Registration Failed",
    description: "Please check your information and try again."
  },
  zh: {
    title: "注册失败",
    description: "请检查您的信息并重试。"
  }
}

// 登录相关消息
export const signInMessages: ToastMessages = {
  en: {
    title: "Welcome Back!",
    description: "You have successfully signed in."
  },
  zh: {
    title: "欢迎回来！",
    description: "您已成功登录。"
  }
}

export const signInErrorMessages: ToastMessages = {
  en: {
    title: "Sign In Failed",
    description: "Please check your email and password."
  },
  zh: {
    title: "登录失败",
    description: "请检查您的邮箱和密码。"
  }
}

// 登出相关消息
export const signOutMessages: ToastMessages = {
  en: {
    title: "Signed Out",
    description: "You have been successfully signed out."
  },
  zh: {
    title: "已登出",
    description: "您已成功登出。"
  }
}

// 通用错误消息
export const genericErrorMessages: ToastMessages = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again."
  },
  zh: {
    title: "出现错误",
    description: "发生了意外错误，请重试。"
  }
}

/**
 * 获取指定语言的toast消息
 */
export function getToastMessage(messages: ToastMessages, locale: string = 'en'): ToastMessage {
  return messages[locale] || messages.en
}

/**
 * 创建带有自定义错误信息的toast消息
 */
export function createErrorToastMessage(error: string, locale: string = 'en'): ToastMessage {
  const baseMessage = getToastMessage(genericErrorMessages, locale)
  return {
    ...baseMessage,
    description: error
  }
}
