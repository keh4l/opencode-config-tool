import { Router, Request, Response } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';

const router = Router();
const execFileAsync = promisify(execFile);

const buildCommandEnv = (): NodeJS.ProcessEnv => {
  const env = { ...process.env };
  const extraPaths: string[] = [];

  // Add opencode's default installation path
  extraPaths.push(path.join(os.homedir(), '.opencode', 'bin'));

  if (process.platform === 'darwin') {
    extraPaths.push('/usr/local/bin', '/opt/homebrew/bin', '/opt/homebrew/sbin');
  }

  if (process.platform !== 'win32') {
    extraPaths.push(path.join(os.homedir(), '.local', 'bin'));
  }

  if (extraPaths.length > 0) {
    env.PATH = [env.PATH, ...extraPaths].filter(Boolean).join(path.delimiter);
  }

  return env;
};

type OpencodeCommand = {
  command: string;
  args: string[];
};

type OpencodeModelsResult =
  | { ok: true; output: string }
  | { ok: false; message: string; details?: string };

const buildOpencodeCommands = (args: string[]): OpencodeCommand[] => {
  const commands: OpencodeCommand[] = [
    { command: 'opencode', args },
  ];

  if (process.platform === 'win32') {
    commands.unshift({ command: 'opencode.exe', args });
    commands.push({ command: 'opencode.cmd', args });
    commands.push({ command: 'npx.cmd', args: ['opencode', ...args] });
  } else {
    commands.push({ command: 'npx', args: ['opencode', ...args] });
  }

  return commands;
};

async function runOpencodeModels(provider?: string): Promise<string> {
  const args = ['models', ...(provider ? [provider] : [])];
  const commands = buildOpencodeCommands(args);
  let lastError: unknown = null;

  for (const { command, args: cmdArgs } of commands) {
    try {
      const result = await execFileAsync(command, cmdArgs, {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
        env: buildCommandEnv(),
      });
      return result.stdout || '';
    } catch (error) {
      lastError = error;
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue;
      }
      // 如果命令存在但执行失败，尝试后续候选命令（例如 npx opencode）
      continue;
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error('opencode command not found');
}

const formatOpencodeModelsError = (error: unknown): { message: string; details?: string } => {
  const err = error as {
    code?: unknown;
    message?: unknown;
    stderr?: unknown;
  };

  const code = typeof err?.code === 'string' ? err.code : undefined;
  const stderr = typeof err?.stderr === 'string' ? err.stderr : '';
  const rawMessage = typeof err?.message === 'string' ? err.message : '';

  if (code === 'ENOENT') {
    return {
      message: '未找到 opencode 命令：请先安装 OpenCode 并确保终端可执行 `opencode models`。',
      details: rawMessage || stderr || undefined,
    };
  }

  if (stderr.includes('BuildMessage: ENOENT reading') || stderr.includes(`${path.sep}.cache${path.sep}opencode${path.sep}node_modules`)) {
    const logMatch = stderr.match(/check log file at\s+(\S+)/i);
    const logPath = logMatch?.[1];
    const suffix = logPath ? `（日志：${logPath}）` : '';

    return {
      message: `opencode 执行失败（缓存依赖缺失）。建议删除 ~/.cache/opencode 后重试。${suffix}`,
      details: stderr || rawMessage || undefined,
    };
  }

  return {
    message: rawMessage || '无法运行 `opencode models`，请检查 opencode 安装与运行环境。',
    details: stderr || undefined,
  };
};

/**
 * GET /api/models?provider=xxx
 * 读取 opencode models 输出
 */
router.get('/', async (req: Request, res: Response) => {
  const provider = req.query.provider as string | undefined;

  let payload: OpencodeModelsResult;
  try {
    const output = await runOpencodeModels(provider);
    payload = { ok: true, output };
  } catch (error) {
    const formatted = formatOpencodeModelsError(error);
    payload = { ok: false, message: formatted.message, details: formatted.details };
  }

  // 返回 200：由前端决定如何展示错误信息
  res.json(payload);
});

export default router;
