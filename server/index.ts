// server/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
import configRoutes from './routes/config';

// ES modules 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API Routes
// ============================================================================

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 配置相关路由
app.use('/api/config', configRoutes);

// 模板路由（直接挂载到 /api/templates）
app.get('/api/templates', configRoutes);

// ============================================================================
// Static Files (生产环境)
// ============================================================================

// 静态文件服务 - 提供 Vite 构建产物
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback - 所有未匹配的路由返回 index.html
app.get('*', (req: Request, res: Response) => {
  // 排除 API 路由
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path
    });
  }

  res.sendFile(path.join(distPath, 'index.html'));
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 处理（API 路由）
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// 全局错误处理中间件
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  // 记录错误
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 确定状态码
  const statusCode = err.status || err.statusCode || 500;

  // 返回错误响应
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString(),
    // 仅在开发环境返回堆栈信息
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 OpenCode Config Tool WebUI Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Static files: ${distPath}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/config/path`);
  console.log(`   - GET  /api/config?path=xxx`);
  console.log(`   - POST /api/config`);
  console.log(`   - GET  /api/templates`);
  console.log('='.repeat(60));
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
