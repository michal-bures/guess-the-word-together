import { WebSocketServer } from 'ws'
import { config } from '../config'

export function createYjsWebSocketServer(): WebSocketServer {
    const wss = new WebSocketServer({ port: config.wsPort })

    wss.on('connection', (_ws, _req) => {
        // TODO: Implement Yjs collaboration features
        console.log('Yjs WebSocket connection established')
    })

    console.log(`Yjs WebSocket server running on ws://localhost:${config.wsPort}`)

    return wss
}
