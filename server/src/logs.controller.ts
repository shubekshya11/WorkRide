import { Controller, Get, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AdminGuard } from './auth/admin.guard';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

interface LogEntry {
  from?: string;
  to?: string;
  level: string;
  message: string;
  role?: string;
  tag: string;
  timestamp: string;
  userId?: number;
  rideId?: number;
  expirationTime?: string;
  karmaPoints?: number;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Controller('logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LogsController {
  @Get('today')
  async getTodayLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('level') level?: string,
    @Query('tag') tag?: string,
    @Query('userId') userId?: string,
  ): Promise<LogsResponse> {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    if (!process.env.LOGS_DIR) {
      return { logs: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
    }

    const logsDir = path.resolve(__dirname, process.env.LOGS_DIR);
    const logFileName = `application-${yyyy}-${mm}-${dd}.log`;
    const logFile = path.join(logsDir, logFileName);
    
    // Validate that logFile is inside logsDir
    if (!logFile.startsWith(logsDir)) {
      throw new Error('Invalid log file path');
    }
    
    try {
      await fs.promises.access(logFile, fs.constants.F_OK);
    } catch {
      return { logs: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
    }

    try {
      const data = await fs.promises.readFile(logFile, 'utf-8');
      const lines = data.split('\n').filter(Boolean);
      const entries: LogEntry[] = lines
        .map((line) => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return undefined;
          }
        })
        .filter((entry): entry is LogEntry => !!entry);

      // Apply filters
      let filteredEntries = entries;
      if (level) {
        filteredEntries = filteredEntries.filter(entry => entry.level === level);
      }
      if (tag) {
        filteredEntries = filteredEntries.filter(entry => entry.tag === tag);
      }
      if (userId) {
        filteredEntries = filteredEntries.filter(entry => String(entry.userId) === userId);
      }

      // Apply pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 100;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredEntries.length / limitNum);

      return {
        logs: paginatedEntries,
        pagination: {
          total: filteredEntries.length,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      };
    } catch {
      return { logs: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
    }
  }

  @Get('all')
  async getAllLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('level') level?: string,
    @Query('tag') tag?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<LogsResponse> {
    if (!process.env.LOGS_DIR) {
      return { logs: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
    }

    const logsDir = path.resolve(__dirname, process.env.LOGS_DIR);
    let files: string[] = [];
    try {
      files = (await fs.promises.readdir(logsDir)).filter((file) =>
        file.endsWith('.log'),
      );
    } catch {
      return { logs: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
    }

    // Filter files by date range if specified
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      
      files = files.filter((file) => {
        const match = file.match(/application-(\d{4}-\d{2}-\d{2})\.log$/);
        if (!match) return false;
        
        const fileDate = new Date(match[1]);
        return fileDate >= start && fileDate <= end;
      });
    }

    const allEntriesArrays: LogEntry[][] = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(logsDir, file);
        // Validate that filePath is inside logsDir
        if (!filePath.startsWith(logsDir)) {
          return [];
        }
        try {
          await fs.promises.access(filePath, fs.constants.F_OK);
          const data = await fs.promises.readFile(filePath, 'utf-8');
          const lines = data.split('\n').filter(Boolean);
          const entries: LogEntry[] = lines
            .map((line) => {
              try {
                return JSON.parse(line) as LogEntry;
              } catch {
                return undefined;
              }
            })
            .filter((entry): entry is LogEntry => !!entry);
          return entries;
        } catch {
          // skip unreadable files
          return [];
        }
      }),
    );

    const allEntries: LogEntry[] = ([] as LogEntry[]).concat(
      ...allEntriesArrays,
    );

    // Apply filters
    let filteredEntries = allEntries;
    if (level) {
      filteredEntries = filteredEntries.filter(entry => entry.level === level);
    }
    if (tag) {
      filteredEntries = filteredEntries.filter(entry => entry.tag === tag);
    }
    if (userId) {
      filteredEntries = filteredEntries.filter(entry => String(entry.userId) === userId);
    }

    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredEntries.length / limitNum);

    return {
      logs: paginatedEntries,
      pagination: {
        total: filteredEntries.length,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }
}
