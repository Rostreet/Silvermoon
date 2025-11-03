import { IPC_EVENTS } from "@common/constants";
import { promisify } from "util";
import { app, ipcMain } from "electron";
import log from "electron-log";
import * as path from "path";
import * as fs from "fs";
// 转换为Promise形式的fs方法
//读取目录内容
const readdirAsync = promisify(fs.readdir);
//读取文件信息
const statAsync = promisify(fs.stat);
//删除文件
const unlinkAsync = promisify(fs.unlink);
class LogService {
  private static _instance: LogService;
  private LOG_RETENTION_DAYS = 7; //日志保留天数
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; //每天清理一次

  private constructor() {
    const logPath = path.join(app.getPath("userData"), "logs");
    //userData => c:users/{username}/AppData/Roaming/{appName}/logs

    //创建日志目录
    try {
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }
    } catch (err) {
      this.error("Failed to create log directory", err);
    }

    log.transports.file.resolvePathFn = () => {
      //使用当前日期作为日志文件名，格式为 log-YYYY-MM-DD.log
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return path.join(logPath, `log-${formattedDate}.log`);
    };

    //配置日志格式文件
    log.transports.file.format = "[{y}:{m}:{d} {h}:{i}:{s}] [{level}] {text}";

    //配置日志文件大小限制
    log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB

    //配置控制台日志级别，开发环境可以设置 debug，生产环境可以设置 info
    log.transports.console.level =
      process.env.NODE_ENV === "development" ? "debug" : "info";

    //配置文件日志级别
    log.transports.file.level = "debug";

    //重写console方法
    this._rewriteConsole();

    this._cleanupOldLogs();
    this._setupIpcEvents();

    this.info("LogService initialized successfully.");
    //设置定时清理旧日志任务
    setInterval(() => {
      this._cleanupOldLogs();
    }, this.CLEANUP_INTERVAL_MS);
  }

  public _setupIpcEvents(): void {
    ipcMain.on(IPC_EVENTS.LOG_DEBUG, (_e, message: string, ...meta: any[]) => {
      this.debug(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_INFO, (_e, message: string, ...meta: any[]) => {
      this.info(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_WARN, (_e, message: string, ...meta: any[]) => {
      this.warn(message, ...meta);
    });
    ipcMain.on(IPC_EVENTS.LOG_ERROR, (_e, message: string, ...meta: any[]) => {
      this.error(message, ...meta);
    });
  }

  public async _cleanupOldLogs(): Promise<void> {
    try {
      const logPath = path.join(app.getPath("userData"), "logs");
      if (!fs.existsSync(logPath)) return;
      const files = await readdirAsync(logPath);
      const now = Date.now();
      const expirationDate = new Date(
        now - this.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000
      );
      let deletedCount = 0;
      for (const file of files) {
        if (!file.endsWith(".log")) continue;
        const filePath = path.join(logPath, file);
        try {
          const stats = await statAsync(filePath);
          if (stats.isFile() && stats.birthtime < expirationDate) {
            await unlinkAsync(filePath);
            deletedCount++;
          }
        } catch (err) {
          this.error(`Failed to delete log file: ${filePath}`, err);
        }
      }
    } catch (err) {
      this.error("Failed to clean up old log files", err);
    }
  }

  private _rewriteConsole(): void {
    console.log = log.info;
    console.info = log.info;
    console.warn = log.warn;
    console.error = log.error;
    console.debug = log.debug;
  }

  /**
   * 记录调试信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public debug(message: string, ...meta: any[]): void {
    log.debug(message, ...meta);
  }

  /**
   * 记录一般信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public info(message: string, ...meta: any[]): void {
    log.info(message, ...meta);
  }

  /**
   * 记录警告信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据
   */
  public warn(message: string, ...meta: any[]): void {
    log.warn(message, ...meta);
  }

  /**
   * 记录错误信息
   * @param {string} message - 日志消息
   * @param {any[]} meta - 附加的元数据，通常是错误对象
   */
  public error(message: string, ...meta: any[]): void {
    log.error(message, ...meta);
  }

  public static getInstance(): LogService {
    if (!this._instance) {
      this._instance = new LogService();
    }
    return this._instance;
  }
}

export const logManager = LogService.getInstance();
export default logManager;
