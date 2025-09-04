import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { sequelize } from '../models';
import { SessionService } from '../services/session.service';

interface ParsedSession {
    sessionId: string;
    messages: any[];
    conversationText: string;
}

const parseSessionFile = async (filePath: string): Promise<ParsedSession | null> => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.split('\n---\n');

        if (lines.length < 2) {
            console.log(`⚠️ Invalid file format: ${filePath}`);
            return null;
        }

        const sessionId = lines[0].trim();
        const messageLines = lines.slice(1).filter(line => line.trim() && line.trim() !== '---');

        const messages: any[] = [];
        let conversationText = '';

        for (const line of messageLines) {
            try {
                const message = JSON.parse(line.trim());
                messages.push(message);

                if (message.timestamp) {
                    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    let textContent = '';
                    if (message.type === 'text' && message.content) {
                        textContent = message.content;
                    } else if (message.type === 'file' && typeof message.content === 'object' && message.content.name) {
                        textContent = `File uploaded: ${message.content.name}`;
                    } else if (message.type === 'event' && typeof message.content === 'object' && message.content.namespace) {
                        textContent = `Event: ${message.content.namespace}`;
                    } else if (message.type === 'note' && message.content) {
                        textContent = message.content;
                    }

                    if (textContent.trim()) {
                        conversationText += `[${time}] ${message.speaker || 'unknown'}: ${textContent}\n`;
                    }
                }
            } catch (parseError) {
                console.log(`⚠️ Skipped invalid JSON line in ${filePath}`);
            }
        }

        return {
            sessionId,
            messages,
            conversationText: conversationText.trim()
        };

    } catch (error) {
        console.error(`❌ Error parsing session file ${filePath}:`, (error as Error).message);
        return null;
    }
};

const migrateSession = async (sessionId: string, messages: any[], conversationText: string): Promise<boolean> => {
    try {
        if (!messages || messages.length === 0) {
            console.log(`⚠️ No messages found for session ${sessionId}`);
            return false;
        }

        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];

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

        const resolvedMessage = messages.find(msg =>
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
            conversation_text: conversationText,
            last_message_content: lastMessage?.content || null,
            total_messages: messages.length,
            first_message_at: firstMessage?.timestamp ? new Date(firstMessage.timestamp) : null,
            last_message_at: lastMessage?.timestamp ? new Date(lastMessage.timestamp) : null
        };

        await SessionService.upsertSession(sessionData);
        return true;

    } catch (error) {
        console.error(`❌ Error migrating session ${sessionId}:`, (error as Error).message);
        return false;
    }
};

const migrateAllExistingSessions = async (): Promise<void> => {
    const sessionsPath = path.join(__dirname, '../../data/sessions');

    try {
        console.log('🚀 Starting migration of existing sessions...');

        await sequelize.authenticate();
        console.log('✅ Database connected');

        const sessionFiles = await fs.readdir(sessionsPath);
        const txtFiles = sessionFiles.filter(file =>
            file.endsWith('.txt') && file.startsWith('session_')
        );

        console.log(`📁 Found ${txtFiles.length} session files to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < txtFiles.length; i++) {
            const file = txtFiles[i];
            console.log(`[${i + 1}/${txtFiles.length}] Processing ${file}...`);

            const filePath = path.join(sessionsPath, file);
            const parsedData = await parseSessionFile(filePath);

            if (parsedData && parsedData.messages.length > 0) {
                const success = await migrateSession(
                    parsedData.sessionId,
                    parsedData.messages,
                    parsedData.conversationText
                );

                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } else {
                console.log(`⚠️ Skipped ${file} - no valid messages`);
                errorCount++;
            }

            if (i % 10 === 0 && i > 0) {
                console.log(`📊 Progress: ${i}/${txtFiles.length} files processed (${successCount} success, ${errorCount} errors)`);
            }
        }

        console.log('🎉 Migration completed!');
        console.log(`📊 Final stats: ${successCount} success, ${errorCount} errors out of ${txtFiles.length} total files`);

    } catch (error) {
        console.error('❌ Migration failed:', (error as Error).message);
        throw error;
    }
};

if (require.main === module) {
    migrateAllExistingSessions()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}