import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', fullyParallel: false, use: { baseURL: 'http://localhost:3001', launchOptions: { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } }, reporter: 'list' });
