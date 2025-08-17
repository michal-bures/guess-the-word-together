import Koa from 'koa'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import fs from 'fs'
import type { ClientToServerEvents, ServerToClientEvents } from 'shared'
import { config, corsConfig, socketCorsConfig } from './config'
import { router } from './routes'

export function createKoaApp(): Koa {
    const app = new Koa()

    // CORS middleware
    app.use(cors(corsConfig))

    // Body parser middleware
    app.use(bodyParser())

    // Serve static frontend files
    const frontendPath = path.join(__dirname, config.frontendDistPath)
    app.use(serve(frontendPath))

    // Routes (including health check)
    app.use(router.routes())
    app.use(router.allowedMethods())

    // SPA fallback - serve index.html for non-API routes that don't match static files
    app.use(async (ctx, next) => {
        // Skip API routes and Socket.IO
        if (
            ctx.path.startsWith('/api') ||
            ctx.path.startsWith('/socket.io') ||
            ctx.path === '/health'
        ) {
            await next()
            return
        }

        // For non-API routes that don't have file extensions, serve index.html (SPA routing)
        if (!ctx.path.includes('.') && ctx.method === 'GET') {
            try {
                ctx.type = 'html'
                ctx.body = fs.readFileSync(path.join(frontendPath, 'index.html'))
            } catch (error) {
                console.warn('Could not serve index.html:', error)
                await next()
            }
        } else {
            await next()
        }
    })

    return app
}

export function createSocketServer(httpServer: ReturnType<typeof createServer>): Server<ClientToServerEvents, ServerToClientEvents> {
    return new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
        cors: socketCorsConfig
    })
}