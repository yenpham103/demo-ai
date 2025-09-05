import amqp from 'amqplib';
import { SessionService } from '../services/session.service';
import { OpenAIAnalysisService } from '../services/openai-analysis.service';

const processConversationData = (sessionId: string, conversationData: any) => {
    const messages = conversationData.messages;
    if (!messages || messages.length === 0) return null;

    let conversationText = '';
    let hasFiles = false;
    let firstCustomerMessage: any = null;
    let firstAgentMessage: any = null;

    messages.forEach((msg: any) => {
        if (msg.timestamp) {
            const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            let textContent = '';
            if (msg.type === 'text' && msg.content) {
                textContent = msg.content;
            } else if (msg.type === 'file') {
                hasFiles = true;
                textContent = 'File uploaded';
            } else if (msg.type === 'event' && msg.content?.namespace) {
                textContent = `Event: ${msg.content.namespace}`;
            }

            if (textContent.trim()) {
                conversationText += `[${time}] ${msg.speaker || 'unknown'}: ${textContent}\n`;
            }

            if (msg.from === 'user' && !firstCustomerMessage) {
                firstCustomerMessage = msg;
            }
            if (msg.from === 'operator' && !firstAgentMessage) {
                firstAgentMessage = msg;
            }
        }
    });

    let customerNickname = null;
    let customerUserId = null;
    let customerEmail = null;
    let agentNickname = null;
    let agentUserId = null;

    for (const msg of messages) {
        if (msg.from === 'user' && msg.user) {
            customerNickname = msg.user.nickname || customerNickname;
            customerUserId = msg.user.user_id || customerUserId;
            customerEmail = msg.user.email || customerEmail;
        } else if (msg.from === 'operator' && msg.user) {
            agentNickname = msg.user.nickname || agentNickname;
            agentUserId = msg.user.user_id || agentUserId;
        }
    }

    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const resolvedMessage = messages.find((msg: any) =>
        msg.type === 'event' && msg.content?.namespace === 'state:resolved'
    );

    let responseTimeMinutes = null;
    if (firstCustomerMessage && firstAgentMessage) {
        const customerTime = new Date(firstCustomerMessage.timestamp).getTime();
        const agentTime = new Date(firstAgentMessage.timestamp).getTime();
        if (agentTime > customerTime) {
            responseTimeMinutes = Math.round((agentTime - customerTime) / (1000 * 60));
        }
    }

    const firstMessageAt = firstMessage?.timestamp ? new Date(firstMessage.timestamp) : null;
    let workDay = null;
    if (firstMessageAt) {
        const hour = firstMessageAt.getHours();
        workDay = new Date(firstMessageAt);
        if (hour < 7) {
            workDay.setDate(workDay.getDate() - 1);
        }
    }

    return {
        session_id: sessionId,
        customer_nickname: customerNickname,
        customer_user_id: customerUserId,
        customer_email: customerEmail,
        agent_nickname: agentNickname,
        agent_user_id: agentUserId,
        is_resolved: !!resolvedMessage,
        resolved_at: resolvedMessage ? new Date(resolvedMessage.timestamp) : null,
        messages,
        conversation_text: conversationText.trim(),
        last_message_content: lastMessage?.content || null,
        total_messages: messages.length,
        first_message_at: firstMessageAt,
        last_message_at: lastMessage?.timestamp ? new Date(lastMessage.timestamp) : null,
        work_day: workDay,
        has_files: hasFiles,
        response_time_minutes: responseTimeMinutes
    };
};

export const handleCrispMessageConsume = async (message: amqp.ConsumeMessage, channel: amqp.Channel): Promise<void> => {
    try {
        const { sessionId, conversationData } = JSON.parse(message.content.toString());

        const sessionData = processConversationData(sessionId, conversationData);
        if (!sessionData) {
            channel.ack(message);
            return;
        }

        await SessionService.upsertSession(sessionData);

        if (sessionData.total_messages >= 3) {
            setImmediate(async () => {
                try {
                    await OpenAIAnalysisService.analyzeSession(sessionId);
                } catch (error) {
                    console.error(`AI analysis failed for ${sessionId}:`, (error as Error).message);
                }
            });
        }

        channel.ack(message);
        console.log(`Processed session: ${sessionId}`);

    } catch (error) {
        console.error('Error processing message:', (error as Error).message);
        channel.nack(message, false, false);
    }
};