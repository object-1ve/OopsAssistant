# 🚀 项目模板

基于 **Tauri 2 + Vite + React + TypeScript** 的桌面应用项目模板。

## 📦 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **桌面框架** | [Tauri 2](https://v2.tauri.app) | 跨平台桌面应用框架，基于 Rust，安全轻量 |
| **前端框架** | [React 19](https://react.dev) | 声明式 UI 组件库 |
| **开发语言** | [TypeScript 6](https://www.typescriptlang.org) | 类型安全的 JavaScript 超集 |
| **构建工具** | [Vite 8](https://vite.dev) | 极速前端构建与 HMR 开发体验 |
| **后端语言** | [Rust 1.93](https://www.rust-lang.org) | 高性能系统级语言，驱动 Tauri 后端 |
| **包管理** | npm 10 | Node.js 包管理 |

## 🏗️ 项目结构

```
├── src/                  # React 前端源码
│   ├── App.tsx           # 主组件
│   ├── App.css           # 主样式
│   ├── main.tsx          # 应用入口
│   ├── index.css         # 全局样式
│   └── assets/           # 静态资源
├── src-tauri/            # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs       # Windows 入口
│   │   └── lib.rs        # Tauri 应用初始化
│   ├── Cargo.toml        # Rust 依赖配置
│   ├── tauri.conf.json   # Tauri 应用配置
│   └── capabilities/     # 权限声明
├── public/               # 公共静态资源
├── package.json          # 前端依赖与脚本
├── vite.config.ts        # Vite 构建配置
└── tsconfig*.json        # TypeScript 编译配置
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动 Tauri 开发模式（自动启动前端 + 桌面窗口）
npm run tauri dev

# 仅启动前端开发服务器（浏览器预览）
npm run dev

# 生产构建
npm run tauri build
```

## 📋 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 (http://localhost:5173) |
| `npm run build` | 构建前端静态资源 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 代码检查 |
| `npm run tauri dev` | 启动 Tauri 桌面开发模式 |
| `npm run tauri build` | 打包为桌面应用安装包 |

## 🧩 特性

- **跨平台** — 一套代码构建 Windows / macOS / Linux 桌面应用
- **热更新 (HMR)** — Vite 驱动的极速模块热替换开发体验
- **类型安全** — 全栈 TypeScript + Rust 强类型保障
- **轻量体积** — Tauri 应用打包体积远小于 Electron 方案
- **安全优先** — Tauri 权限管理系统，默认无网络/文件访问权限

## 📄 许可证

MIT
