import amqp from 'amqplib';
import { initConsumeRabbitMQ } from '../consumers/init.consumer';

const url = process.env.RABBITMQ_URL || 'amqp://localhost';

let globalChannel: amqp.Channel | null = null;

export const getRabbitChannel = async (): Promise<amqp.Channel> => {
    try {
        if (globalChannel) return globalChannel;
        
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        globalChannel = channel;
        
        return channel;
    } catch (error) {
        console.error('❌ Error getting RabbitMQ channel:', (error as Error).message);
        throw error;
    }
};

export const connectRabbitMQ = async (): Promise<void> => {
    try {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        globalChannel = channel;

        await initConsumeRabbitMQ(channel);

        console.log('🚀 Connecting to RabbitMQ OK');
        
        connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err.message);
            globalChannel = null;
            setTimeout(connectRabbitMQ, 10000);
        });
        
        connection.on('close', () => {
            console.error('🔌 Connection to RabbitMQ closed!');
            globalChannel = null;
            setTimeout(connectRabbitMQ, 10000);
        });
        
    } catch (error) {
        console.error('❌ RabbitMQ connection failed:', (error as Error).message);
        setTimeout(connectRabbitMQ, 10000);
    }
};