// server/routes/config.ts
import { Router, Request, Response } from 'express';
import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

// ES modules 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 获取默认配置路径
function getDefaultConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.config', 'opencode', 'opencode.json');
}

// 确保目录存在
async function ensureDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
}

// 扩展路径中的 ~ 符号
function expandPath(filePath: string): string {
  return filePath.replace(/^~/, os.homedir());
}

/**
 * GET /api/config/path
 * 获取默认配置文件路径
 */
router.get('/path', (req: Request, res: Response) => {
  try {
    res.json({ path: getDefaultConfigPath() });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get config path',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/config?path=xxx
 * 读取配置文件
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const configPath = (req.query.path as string) || getDefaultConfigPath();
    const expandedPath = expandPath(configPath);

    // 检查文件是否存在
    const exists = await fs.pathExists(expandedPath);

    if (!exists) {
      // 返回默认空配置
      return res.json({
        "$schema": "https://opencode.ai/config.json"
      });
    }

    // 读取文件内容
    const content = await fs.readFile(expandedPath, 'utf-8');

    // 验证是否为有效 JSON
    try {
      JSON.parse(content);
      res.type('application/json').send(content);
    } catch (parseError) {
      res.status(400).json({
        error: 'Invalid JSON in config file',
        message: parseError instanceof Error ? parseError.message : 'Parse error'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/config
 * 保存配置文件
 * Body: { path?: string, content: string }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { path: configPath, content } = req.body;

    // 验证请求体
    if (!content) {
      return res.status(400).json({
        error: 'Missing required field: content'
      });
    }

    // 验证 JSON 格式
    try {
      JSON.parse(content);
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid JSON content',
        message: parseError instanceof Error ? parseError.message : 'Parse error'
      });
    }

    const expandedPath = expandPath(configPath || getDefaultConfigPath());

    // 确保目录存在
    await ensureDir(expandedPath);

    // 写入文件
    await fs.writeFile(expandedPath, content, 'utf-8');

    res.json({
      success: true,
      path: expandedPath
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to save config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/templates
 * 获取模板列表
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    // 读取内置模板
    const templatesPath = path.join(__dirname, '../../src/lib/templates.ts');

    // 由于是 TypeScript 文件，我们返回预定义的模板列表
    // 在实际部署中，这些模板应该从编译后的 JS 文件或 JSON 文件中读取
    const builtinTemplates = [
      {
        id: 'developer-default',
        name: '开发者常用',
        description: '适合日常开发的平衡配置，Claude Sonnet 作为主模型',
        icon: '💻',
        category: 'general',
      },
      {
        id: 'security-strict',
        name: '安全模式',
        description: '严格的权限控制，所有危险操作都需要确认',
        icon: '🔒',
        category: 'security',
      },
      {
        id: 'local-ollama',
        name: '本地模型 (Ollama)',
        description: '使用 Ollama 运行本地模型，完全离线',
        icon: '🏠',
        category: 'local',
      },
      {
        id: 'local-lmstudio',
        name: '本地模型 (LM Studio)',
        description: '使用 LM Studio 运行本地模型',
        icon: '🖥️',
        category: 'local',
      },
      {
        id: 'enterprise',
        name: '企业级',
        description: '适合企业环境，禁用分享，严格权限',
        icon: '🏢',
        category: 'enterprise',
      },
      {
        id: 'openrouter-multi',
        name: 'OpenRouter 多模型',
        description: '通过 OpenRouter 访问多种模型',
        icon: '🌐',
        category: 'general',
      },
      {
        id: 'custom-provider',
        name: '自定义 Provider',
        description: '配置自定义 AI 提供商 (OpenAI 兼容)',
        icon: '⚙️',
        category: 'custom',
      },
    ];

    res.json({
      templates: builtinTemplates,
      count: builtinTemplates.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/templates/:id
 * 获取特定模板的完整配置
 */
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 这里应该从实际的模板源加载完整配置
    // 暂时返回错误，提示需要在前端使用内置模板
    res.status(501).json({
      error: 'Template detail endpoint not implemented',
      message: 'Please use the built-in templates from the frontend'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
