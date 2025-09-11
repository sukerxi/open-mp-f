import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { resolve } from 'node:path'
import federation from '@originjs/vite-plugin-federation'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    vuetify({
      styles: {
        configFile: 'src/styles/variables/_vuetify.scss',
      },
    }),
    Components({
      dirs: ['src/@core/components'],
      dts: true,
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'pinia', 'vue-i18n'],
      vueTemplate: true,
    }),
    VueI18n({
      include: [resolve(__dirname, 'src/locales/*.ts')],
    }),
    federation({
      name: 'MoviePilot',
      filename: 'remoteEntry.js',
      // @ts-ignore
      remotes: {
        // 动态remotes将在运行时注入
        dummy: {
          external: '',
          format: 'var',
        },
      },
      shared: ['vue', 'vuetify'],
    }),
    VitePWA({
      injectRegister: 'script',
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf,otf,eot}'],
        // 确保关键资源被预缓存
        additionalManifestEntries: [
          {
            url: '/offline.html',
            revision: null,
          },
          // 预缓存App Shell关键资源
          {
            url: '/logo.png',
            revision: null,
          },
        ],
        // 启用导航预加载
        navigationPreload: true,
        runtimeCaching: [
          // App Shell缓存 - 优先缓存
          {
            urlPattern: /^\/$|\/index\.html$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|html)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|ico|webp|avif|gif|bmp|tiff)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
              },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
              },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 24 * 60 * 60, // 24小时
              },
            },
          },
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-image-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pages-cache',
            },
          },
        ],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/.*\/api\/.*/, /\/offline\.html$/],
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^gclid$/],
        skipWaiting: true,
        clientsClaim: true,
      },
      injectManifest: {
        rollupFormat: 'iife',
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        'name': 'MoviePilot',
        'short_name': 'MoviePilot',
        'description': 'MoviePilot - 智能影视媒体库管理工具',
        'start_url': './',
        'scope': './',
        'display': 'standalone',
        'display_override': ['window-controls-overlay', 'standalone'],
        'orientation': 'portrait-primary',
        'lang': 'zh-CN',
        'dir': 'ltr',
        'categories': ['entertainment', 'multimedia', 'utilities'],
        'icons': [
          {
            'src': './android-chrome-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': './android-chrome-192x192_maskable.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'maskable',
          },
          {
            'src': './android-chrome-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': './android-chrome-512x512_maskable.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'maskable',
          },
        ],
        'theme_color': '#0E1116',
        'background_color': '#0E1116',
        'edge_side_panel': {
          'preferred_width': 320,
        },
        'launch_handler': {
          'client_mode': 'navigate-existing',
        },
        'handle_links': 'preferred',
        'id': 'moviepilot-app',
        'shortcuts': [
          {
            'name': '推荐',
            'short_name': '推荐',
            'description': '查看推荐内容',
            'url': './recommend',
            'icons': [
              {
                'src': './sparkles-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
          {
            'name': '探索',
            'short_name': '探索',
            'description': '探索新内容',
            'url': './discover',
            'icons': [
              {
                'src': './clock-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
          {
            'name': '更多',
            'short_name': '更多',
            'description': '更多功能',
            'url': './apps',
            'icons': [
              {
                'src': './cog-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
        ],
        'screenshots': [
          {
            'src': './android-chrome-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'form_factor': 'wide',
            'label': 'MoviePilot 主界面',
          },
          {
            'src': './android-chrome-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'form_factor': 'narrow',
            'label': 'MoviePilot 移动端',
          },
        ],
        'protocol_handlers': [
          {
            'protocol': 'web+moviepilot',
            'url': './?handler=%s',
          },
        ],
        'prefer_related_applications': false,
        'related_applications': [],
      },
    }),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__mp_tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__mp_tla_${i}`,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles/', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/styles/variables/_template.scss', import.meta.url)),
      'apexcharts': fileURLToPath(new URL('node_modules/apexcharts', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 5000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: ['./src/**/*.vue'],
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
})
