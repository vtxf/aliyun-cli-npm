# aliyun-cli-npm

阿里云 CLI (Alibaba Cloud CLI) 的 npm 封装包，支持按需下载，轻量高效。

[aliyun-cli](https://github.com/aliyun/aliyun-cli) 是阿里云官方提供的命令行工具，用于管理和调用阿里云服务。本项目提供智能的按需下载机制，首次使用时自动下载对应平台的二进制文件。

## 特性

- ✅ **智能下载**：首次运行时自动检测平台并下载对应二进制文件
- ✅ **多源支持**：支持阿里云官方 CDN、GitHub Releases 等多个下载源
- ✅ **跨平台支持**：支持 Windows、macOS、Linux 主要平台
- ✅ **轻量级**：npm 包仅包含 JavaScript 代码，几 KB 大小
- ✅ **自动更新**：支持下载最新版本的官方二进制文件
- ✅ **零依赖**：只使用 Node.js 原生模块
- ✅ **官方二进制**：直接使用阿里云官方发布的二进制文件
- ✅ **智能重试**：下载失败时自动尝试备用源

## 支持的平台

- **Windows 64位** (windows-amd64)
- **macOS Intel** (mac-amd64)
- **macOS Apple Silicon** (mac-arm64)
- **Linux 64位** (linux-amd64)

## 安装

### 使用 npx（推荐）

无需安装，直接使用：

```bash
npx aliyun-cli-npm version
```

首次运行时会自动下载对应平台的二进制文件。

### 全局安装

```bash
npm install -g aliyun-cli-npm
```

安装后可以直接使用 `aliyun` 命令：

```bash
aliyun version
```

### 项目中使用

```bash
npm install aliyun-cli-npm
```

然后使用 npx：

```bash
npx aliyun-cli-npm configure
```

或者在 package.json 的 scripts 中添加：

```json
{
  "scripts": {
    "aliyun": "aliyun"
  }
}
```

## 使用示例

### 首次使用（自动下载）

```bash
npx aliyun-cli-npm help
```

首次运行时会显示下载进度：

```
🔍 Binary not found, initiating download...

📡 Trying source: Aliyun CDN (https://aliyuncli.alicdn.com/...)
⏳ Downloading: 45.2% (45.2MB/100.0MB) - 1250KB/s - 43s remaining
✅ Download completed!
📦 Extracting archive...
✅ Extraction completed!
✅ Successfully installed aliyun-cli to /path/to/bin/windows-amd64/aliyun.exe
```

### 查看版本

```bash
npx aliyun-cli-npm version
```

### 配置凭证

```bash
npx aliyun-cli-npm configure
```

### 调用阿里云 API

```bash
# 查询 ECS 区域列表
npx aliyun-cli-npm ecs DescribeRegions

# 查询 RDS 实例
npx aliyun-cli-npm rds DescribeDBInstances --PageSize 50

# 查询 OSS 存储空间
npx aliyun-cli-npm oss ListBuckets
```

### 获取帮助

```bash
# 查看所有产品
npx aliyun-cli-npm help

# 查看特定产品的帮助
npx aliyun-cli-npm help ecs

# 查看特定 API 的帮助
npx aliyun-cli-npm help ecs CreateInstance
```

## 下载源优先级

系统按以下优先级尝试下载源：

1. **阿里云官方 CDN**（最快，推荐）
   - 下载地址：`https://aliyuncli.alicdn.com/`
   - 自动提供最新版本

2. **GitHub Releases**（备用源）
   - 下载地址：`https://github.com/aliyun/aliyun-cli/releases`
   - 可指定特定版本

3. **GitHub Mirror**（备用源）
   - 使用国内镜像加速 GitHub 访问
   - 适用于网络受限情况

如某个源下载失败，系统会自动尝试下一个源。

## 二进制文件存储

下载的二进制文件存储位置：

- **Windows**: `node_modules/aliyun-cli-npm/bin/windows-amd64/aliyun.exe`
- **macOS Intel**: `node_modules/aliyun-cli-npm/bin/mac-amd64/aliyun`
- **macOS Apple Silicon**: `node_modules/aliyun-cli-npm/bin/mac-arm64/aliyun`
- **Linux**: `node_modules/aliyun-cli-npm/bin/linux-amd64/aliyun`

### 手动管理二进制文件

如果需要重新下载或更换版本：

```bash
# 删除现有二进制文件
rm -rf node_modules/aliyun-cli-npm/bin/*/

# 下次运行时会自动重新下载
npx aliyun-cli-npm version
```

## 版本说明

本包支持两种版本模式：

1. **自动获取最新版本**：从阿里云官方 CDN 下载最新版本
2. **锁定特定版本**：从 GitHub Releases 下载指定版本

当前默认配置：从官方 CDN 获取最新版本。

## 故障排除

### 下载失败

如果遇到下载失败，请检查：

1. **网络连接**：确保能够访问互联网
2. **防火墙设置**：某些网络可能阻止外网访问
3. **代理配置**：如使用代理，确保 Node.js 环境变量正确配置
4. **重试机制**：系统会自动尝试多个下载源

### 找不到二进制文件

如果出现 "找不到对应平台的aliyun二进制文件" 错误：

1. 删除 `bin/` 目录内容，重新下载
2. 检查磁盘空间是否充足
3. 查看错误信息中的具体原因

### 权限错误（Unix 系统）

在 macOS 或 Linux 上，如果遇到权限错误：

```bash
chmod +x node_modules/aliyun-cli-npm/bin/*/aliyun
```

### 其他问题

如遇到其他问题，请访问：
- [aliyun-cli GitHub Issues](https://github.com/aliyun/aliyun-cli/issues)
- [阿里云官方文档](https://www.alibabacloud.com/help)

## 包大小对比

**传统方案（内置所有平台）**：
- npm 包大小：~144 MB
- 下载时间：较慢
- 磁盘占用：~565 MB（包含所有平台）

**按需下载方案（当前）**：
- npm 包大小：~几 KB
- 下载时间：快速
- 磁盘占用：~95 MB（仅当前平台）

## 开发

### 项目结构

```
aliyun-cli-npm/
├── bin/              # 二进制文件目录（运行时下载）
│   ├── windows-amd64/  # Windows 64位
│   ├── mac-amd64/      # macOS Intel
│   ├── mac-arm64/      # macOS Apple Silicon
│   └── linux-amd64/    # Linux 64位
├── lib/              # JavaScript 封装代码
│   ├── main.js       # CLI 入口点
│   ├── platform.js   # 平台检测模块
│   ├── executor.js   # 二进制执行器
│   └── downloader.js # 多源下载器
├── package.json
└── README.md
```

### 本地测试

```bash
# 克隆项目
git clone https://github.com/vtxf/aliyun-cli-npm.git
cd aliyun-cli-npm

# 本地链接
npm link

# 测试（会触发首次下载）
aliyun version
```

## 许可证

MIT License

本项目使用 MIT 许可证。aliyun-cli 二进制文件的使用遵循阿里云官方许可证。

## 致谢

- [阿里云官方 aliyun-cli 项目](https://github.com/aliyun/aliyun-cli)
- [vtxf-ossutil 项目](https://github.com/vtxf/ossutil-npm) - 参考了其实现方式

## 链接

- [aliyun-cli GitHub](https://github.com/aliyun/aliyun-cli)
- [aliyun-cli 官方文档](https://www.alibabacloud.com/help/doc-detail/110341.htm)
- [npm 包页面](https://www.npmjs.com/package/aliyun-cli-npm)

---

**注意**：本项目为第三方封装的 npm 包，非阿里云官方产品。如有问题建议先到 [aliyun-cli 官方仓库](https://github.com/aliyun/aliyun-cli) 查找解决方案。

## 更新日志

### v3.3.17（按需下载版本）
- ✅ 实现多源下载机制
- ✅ 支持按需下载对应平台二进制文件
- ✅ 添加下载进度显示
- ✅ 智能重试和错误处理
- ✅ 大幅减小 npm 包体积（从 144MB 到几 KB）
