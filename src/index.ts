import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { connectRabbitMQ } from './config/rabbitmq.config';
import { sequelize } from './models';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3002;

const allowedOrigins = [
    process.env.ADMIN_URL,
    'https://api.crisp.chat',
    'https://app.crisp.chat'
].filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
        "DNT",
        "User-Agent",
        "X-Requested-With",
        "If-Modified-Since",
        "Cache-Control",
        "Content-Type",
        "Range",
        "authentication",
        "x-hmac-sign",
        "authorization",
        "x-crisp-request-timestamp",
        "x-crisp-signature",
    ],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/', routes);

const checkEnvironmentVariables = (): boolean => {
    const requiredVars = [
        'PORT',
        'ADMIN_URL',
        'RABBITMQ_URL',
        'CRISP_WEBHOOK_SECRET',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'OPENAI_API_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        return false;
    }

    return true;
};

const startServer = async (): Promise<void> => {
    try {
        if (!checkEnvironmentVariables()) {
            process.exit(1);
        }

        console.log('🔌 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        console.log('📊 Running database migrations...');
        await sequelize.sync();
        console.log('✅ Database migrations completed');

        console.log('🐰 Connecting to RabbitMQ...');
        await connectRabbitMQ();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', (error as Error).message);
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

startServer();