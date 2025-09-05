import OpenAI from 'openai';
import { SessionService } from './session.service';
import { AnalysisService } from './analysis.service';
import { mapMoodToSentiment, calculateUrgencyScore, categorizeConversation } from '../utils/openai-analysis.utils';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export class OpenAIAnalysisService {
    static async analyzeSession(sessionId: string): Promise<void> {
        const session = await SessionService.getSessionBySessionId(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        if (!session.conversation_text || session.conversation_text.trim().length === 0) {
            console.log(`No conversation text for session ${sessionId}`);
            return;
        }

        const analysisPrompt = `
            Analyze this customer support conversation and extract insights. Return your response as valid JSON only.

            Conversation:
            ${session.conversation_text}

            Return ONLY a JSON object with this exact structure (no other text):
            {
                "customer_needs": ["specific needs/wants mentioned by customer"],
                "pain_points": ["problems or frustrations mentioned"],
                "customer_mood": "happy/satisfied/neutral/confused/frustrated/angry",
                "satisfaction_level": 1-5,
                "conversation_summary": "2-3 sentence summary of what happened",
                "main_topics": ["key topics discussed"],
                "resolution_status": "resolved/pending/escalated/abandoned",
                "mentioned_products": ["products/features/services mentioned"],
                "technical_issues": ["technical problems mentioned"],
                "feature_requests": ["feature requests or suggestions"]
            }

            Be specific and actionable. Focus on business insights. Respond with JSON only.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: analysisPrompt }],
            temperature: 0.3,
            max_tokens: 1000
        });

        let analysisResponse;
        try {
            const responseText = completion.choices[0].message.content?.trim() || '';
            const cleanedResponse = responseText
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            analysisResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', parseError);
            return;
        }

        const customerSentiment = mapMoodToSentiment(analysisResponse.customer_mood);
        const urgencyScore = calculateUrgencyScore(session.conversation_text, analysisResponse.satisfaction_level);
        const category = categorizeConversation(analysisResponse.main_topics, analysisResponse.technical_issues);

        const analysisData = {
            session_id: sessionId,
            openai_model: "gpt-4o-mini",
            customer_needs: JSON.stringify(analysisResponse.customer_needs),
            pain_points: JSON.stringify(analysisResponse.pain_points),
            customer_mood: analysisResponse.customer_mood,
            satisfaction_level: analysisResponse.satisfaction_level,
            conversation_summary: analysisResponse.conversation_summary,
            main_topic: JSON.stringify(analysisResponse.main_topics),
            resolution_status: analysisResponse.resolution_status,
            mentioned_products: JSON.stringify(analysisResponse.mentioned_products),
            technical_issues: JSON.stringify(analysisResponse.technical_issues),
            feature_requests: JSON.stringify(analysisResponse.feature_requests),
            openai_response: analysisResponse
        };

        await AnalysisService.createAnalysis(analysisData);

        await SessionService.updateSessionAnalysis(sessionId, {
            conversation_summary: analysisResponse.conversation_summary,
            category: category,
            customer_sentiment: customerSentiment,
            urgency_score: urgencyScore
        });

        console.log(`Completed AI analysis for session: ${sessionId}`);
    }

    static async batchAnalyzeUnprocessedSessions(batchSize: number = 10): Promise<void> {
        const unanalyzedSessions = await SessionService.getUnanalyzedSessions(batchSize);

        if (unanalyzedSessions.length === 0) {
            console.log('No unanalyzed sessions found');
            return;
        }

        console.log(`Found ${unanalyzedSessions.length} unanalyzed sessions`);

        for (const session of unanalyzedSessions) {
            try {
                await this.analyzeSession(session.session_id);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to analyze session ${session.session_id}:`, (error as Error).message);
            }
        }

        console.log('Batch analysis completed');
    }
}