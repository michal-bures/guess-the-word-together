export const config = {
    // Server configuration
    port: parseInt(process.env.PORT || '3001'),
    wsPort: parseInt(process.env.WS_PORT || '1234'),

    // CORS configuration
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Game configuration
    defaultRoomId: 'main-room',

    // Paths
    frontendDistPath: '../../frontend/dist'
} as const

export const corsConfig = {
    origin: config.frontendUrl,
    credentials: true
}

export const socketCorsConfig = {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true
}
