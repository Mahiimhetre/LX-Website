import { defineConfig, mergeConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default mergeConfig(
    // Provide a minimal base so viteConfig's factory function is called with safe defaults
    defineConfig({}),
    defineConfig({
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: ['./tests/setup.js'],
            exclude: [...configDefaults.exclude, '**/tmp/**'],
        },
    })
);
