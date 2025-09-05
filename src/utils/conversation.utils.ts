import { CRISP_MESSAGES_QUEUE } from '../constants/rabbitmq.constant';
import { getRabbitChannel } from '../config/rabbitmq.config';

interface ConversationData {
    sessionId: string;
    messages: any[];
    participants: {
        customer?: {
            nickname?: string;
            userId?: string;
        };
        agent?: {
            nickname?: string;
            userId?: string;
        };
    };
}

const conversationStorage = new Map<string, ConversationData>();

export const updateParticipants = (conversation: ConversationData, data: any): void => {
    if (data.from === 'user') {
        conversation.participants.customer = {
            nickname: data.user?.nickname,
            userId: data.user?.user_id
        };
    } else if (data.from === 'operator') {
        conversation.participants.agent = {
            nickname: data.user?.nickname,
            userId: data.user?.user_id
        };
    }
};

export const publishToQueue = async (sessionId: string, conversationData: ConversationData): Promise<void> => {
    try {
        const channel = await getRabbitChannel();

        const payload = {
            sessionId,
            conversationData,
            timestamp: new Date().toISOString()
        };

        await channel.sendToQueue(CRISP_MESSAGES_QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });

    } catch (error) {
        console.error('❌ Failed to queue message:', (error as Error).message);
    }
};

export const processMessage = async (data: any): Promise<void> => {
    const sessionId = data.session_id;

    if (!conversationStorage.has(sessionId)) {
        conversationStorage.set(sessionId, {
            sessionId,
            messages: [],
            participants: {}
        });
    }

    const conversation = conversationStorage.get(sessionId)!;

    const message = {
        id: data.fingerprint?.toString(),
        type: data.type,
        from: data.from,
        speaker: data.from === 'user' ? 'customer' : 'agent',
        content: data.content,
        timestamp: new Date(data.timestamp),
        user: data.user
    };

    conversation.messages.push(message);
    updateParticipants(conversation, data);

    await publishToQueue(sessionId, conversation);
};