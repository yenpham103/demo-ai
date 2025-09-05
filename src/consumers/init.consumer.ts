import amqp from 'amqplib';
import { handleCrispMessageConsume } from './crisp.consumer';
import { CRISP_MESSAGES_QUEUE } from '../constants/rabbitmq.constant';

export const initConsumeRabbitMQ = async (channel: amqp.Channel): Promise<void> => {
    await channel.assertQueue(CRISP_MESSAGES_QUEUE, { durable: true });

    channel.prefetch(1);
    channel.consume(CRISP_MESSAGES_QUEUE, (message) => {
        if (message) {
            handleCrispMessageConsume(message, channel);
        }
    });
};