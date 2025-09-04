import amqp from 'amqplib';
import fs from 'fs/promises';
import path from 'path';
import { OpenAIAnalysisService } from 'src/services/openai-analysis.service';
import { SessionService } from 'src/services/session.service';

const sessionLocks = new Map<string, number>();

const acquireLock = async (sessionId: string): Promise<void> => {
    while (sessionLocks.has(sessionId)) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    sessionLocks.set(sessionId, Date.now());
};

const releaseLock = (sessionId: string): void => {
    sessionLocks.delete(sessionId);
};

const ensureDataDir = async (): Promise<string> => {
    const dataDir = path.join(__dirname, '../../data/sessions');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        return dataDir;
    } catch (error) {
        console.error('❌ Error creating data directory:', error);
        throw error;
    }
};

const checkMessageExists = async (filePath: string, messageId: string): Promise<boolean> => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent.includes(`"id":"${messageId}"`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
};

const storeSessionInDatabase = async (sessionId: string, conversationData: any): Promise<void> => {
    try {
        const messages = conversationData.messages;
        if (!messages || messages.length === 0) return;
        
        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];
        
        let conversationText = '';
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
                } else if (msg.type === 'file' && typeof msg.content === 'object' && msg.content.name) {
                    textContent = `File uploaded: ${msg.content.name}`;
                } else if (msg.type === 'event' && typeof msg.content === 'object' && msg.content.namespace) {
                    textContent = `Event: ${msg.content.namespace}`;
                } else if (msg.type === 'note' && msg.content) {
                    textContent = msg.content;
                }
                
                if (textContent.trim()) {
                    conversationText += `[${time}] ${msg.speaker || 'unknown'}: ${textContent}\n`;
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
        
        const resolvedMessage = messages.find((msg: any) => 
            msg.type === 'event' && 
            msg.content?.namespace === 'state:resolved'
        );
        
        const sessionData = {
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
            first_message_at: firstMessage?.timestamp ? new Date(firstMessage.timestamp) : null,
            last_message_at: lastMessage?.timestamp ? new Date(lastMessage.timestamp) : null
        };
        
        await SessionService.upsertSession(sessionData);
        
        if (messages.length >= 5 && Math.random() < 0.2) { 
            setImmediate(async () => {
                try {
                    await OpenAIAnalysisService.analyzeSession(sessionId);
                } catch (error) {
                    console.error(`Background AI analysis failed for ${sessionId}:`, (error as Error).message);
                }
            });
        }
        
    } catch (error) {
        console.error(`❌ Error storing session in database:`, (error as Error).message);
    }
};

const writeSessionFile = async (sessionId: string, conversationData: any): Promise<boolean> => {
    await acquireLock(sessionId);

    try {
        const dataDir = await ensureDataDir();
        const filePath = path.join(dataDir, `${sessionId}.txt`);
        const lastMessage = conversationData.messages[conversationData.messages.length - 1];
        
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (!fileExists) {
            const header = `${sessionId}\n---\n`;
            await fs.writeFile(filePath, header, 'utf8');
            console.log(`📝 Creating new file for session: ${sessionId}`);
        }
        
        const messageExists = await checkMessageExists(filePath, lastMessage.id);
        
        let fileWriteResult = false;
        if (!messageExists) {
            const messageData = `${JSON.stringify(lastMessage)}\n---\n`;
            await fs.appendFile(filePath, messageData, 'utf8');
            fileWriteResult = true;
        }
        
        await storeSessionInDatabase(sessionId, conversationData);
        
        return fileWriteResult;

    } finally {
        releaseLock(sessionId);
    }
};

export const handleCrispMessageConsume = async (message: amqp.ConsumeMessage, channel: amqp.Channel): Promise<void> => {
    const startTime = Date.now();

    try {
        const { sessionId, conversationData } = JSON.parse(message.content.toString());

        const result = await writeSessionFile(sessionId, conversationData);

        channel.ack(message);

        const processingTime = Date.now() - startTime;

        if (result) {
            console.log(`✅ Processed message for session: ${sessionId} (${processingTime}ms)`);
        } else {
            console.log(`ℹ️ Duplicate message ignored for session: ${sessionId}`);
        }

    } catch (error) {
        console.error('❌ Error processing message:', (error as Error).message);
        channel.nack(message, false, false);
    }
};