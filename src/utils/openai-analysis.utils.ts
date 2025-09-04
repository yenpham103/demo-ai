export const mapMoodToSentiment = (mood: string): number => {
    const moodMap: Record<string, number> = {
        'happy': 5,
        'satisfied': 4,
        'neutral': 3,
        'confused': 2,
        'frustrated': 2,
        'angry': 1
    };
    
    return moodMap[mood.toLowerCase()] || 3;
};

export const calculateUrgencyScore = (conversation: string, satisfactionLevel: number): number => {
    let urgencyScore = 5 - satisfactionLevel;
    
    const urgentKeywords = [
        'urgent', 'asap', 'immediately', 'emergency', 'critical', 
        'broken', 'not working', 'down', 'error', 'problem', 
        'issue', 'bug', 'help', 'stuck', 'can\'t'
    ];
    
    const urgentCount = urgentKeywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = conversation.match(regex);
        return count + (matches ? matches.length : 0);
    }, 0);
    
    urgencyScore += Math.min(urgentCount, 3);
    
    return Math.min(Math.max(urgencyScore, 1), 10);
};

export const categorizeConversation = (mainTopics: string[], technicalIssues: string[]): string => {
    const topics = mainTopics.join(' ').toLowerCase();
    const issues = technicalIssues.join(' ').toLowerCase();
    
    if (issues.includes('bug') || issues.includes('error') || issues.includes('broken')) {
        return 'technical_support';
    }
    
    if (topics.includes('billing') || topics.includes('payment') || topics.includes('price')) {
        return 'billing_support';
    }
    
    if (topics.includes('account') || topics.includes('login') || topics.includes('password')) {
        return 'account_support';
    }
    
    if (topics.includes('feature') || topics.includes('request') || topics.includes('enhancement')) {
        return 'feature_request';
    }
    
    if (topics.includes('question') || topics.includes('how to') || topics.includes('guide')) {
        return 'general_inquiry';
    }
    
    return 'general_support';
};