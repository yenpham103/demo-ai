import amqp from 'amqplib';
import { CRISP_MESSAGES_QUEUE } from 'src/constants/crisp.constant';
import { handleCrispMessageConsume } from './crisp.consumer';

export const initConsumeRabbitMQ = async (channel: amqp.Channel): Promise<void> => {
    await channel.assertQueue(CRISP_MESSAGES_QUEUE, { durable: true });

    channel.prefetch(1);
    channel.consume(CRISP_MESSAGES_QUEUE, (message) => {
        if (message) {
            handleCrispMessageConsume(message, channel);
        }
    });
};