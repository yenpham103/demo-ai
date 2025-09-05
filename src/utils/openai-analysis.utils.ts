export const mapMoodToSentiment = (mood: string): number => {
    const moodMap: Record<string, number> = {
        'angry': -1,
        'frustrated': -0.7,
        'confused': -0.3,
        'neutral': 0,
        'satisfied': 0.7,
        'happy': 1
    };

    return moodMap[mood.toLowerCase()] || 0;
};

export const calculateUrgencyScore = (conversationText: string, satisfactionLevel: number): number => {
    let urgencyScore = 3;

    if (satisfactionLevel >= 4) {
        urgencyScore = Math.max(1, urgencyScore - 1);
    } else if (satisfactionLevel <= 2) {
        urgencyScore = Math.min(5, urgencyScore + 1);
    }

    const urgentKeywords = [
        'urgent', 'emergency', 'asap', 'immediately', 'critical',
        'không hoạt động', 'lỗi', 'không thể', 'gấp', 'khẩn cấp'
    ];

    const lowUrgencyKeywords = [
        'when you have time', 'no rush', 'whenever', 'không gấp', 'từ từ'
    ];

    const text = conversationText.toLowerCase();

    const urgentMatches = urgentKeywords.filter(keyword => text.includes(keyword)).length;
    const lowUrgencyMatches = lowUrgencyKeywords.filter(keyword => text.includes(keyword)).length;

    if (urgentMatches > lowUrgencyMatches) {
        urgencyScore = Math.min(5, urgencyScore + urgentMatches);
    } else if (lowUrgencyMatches > urgentMatches) {
        urgencyScore = Math.max(1, urgencyScore - lowUrgencyMatches);
    }

    return urgencyScore;
};

export const categorizeConversation = (mainTopics: string[], technicalIssues: string[]): string => {
    if (!mainTopics || mainTopics.length === 0) return 'general';

    const categories: Record<string, string[]> = {
        'technical': ['bug', 'error', 'issue', 'problem', 'lỗi', 'vấn đề kỹ thuật'],
        'billing': ['payment', 'invoice', 'billing', 'charge', 'thanh toán', 'hóa đơn'],
        'feature': ['feature', 'request', 'enhancement', 'tính năng', 'yêu cầu'],
        'support': ['help', 'assistance', 'guide', 'tutorial', 'hỗ trợ', 'hướng dẫn'],
        'feedback': ['feedback', 'suggestion', 'improvement', 'phản hồi', 'góp ý'],
        'account': ['account', 'profile', 'login', 'password', 'tài khoản', 'đăng nhập']
    };

    const allText = [...mainTopics, ...technicalIssues].join(' ').toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => allText.includes(keyword))) {
            return category;
        }
    }

    return 'general';
};