import Router from '@koa/router'
import type { Context } from 'koa'

const router = new Router()

// Health check endpoint for Docker
router.get('/health', (ctx: Context) => {
    ctx.status = 200
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() }
})

export { router }