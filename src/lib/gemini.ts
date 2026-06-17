import { GoogleGenerativeAI } from '@google/generative-ai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env and restart the dev server.');
}

// --- Chatbot Types and Service ---
export interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  businessProfile: any;
  userProfile: any;
  recentWebsites: any[];
  recentInsights: any[];
  recentEmailCampaigns: any[];
}

export class GeminiService {
  private chat: any;
  private userContext: UserContext | null = null;
  private userId: string | null = null;

  constructor() {
    this.initializeChat();
  }

  private initializeChat() {
    if (!genAI) return; // no key, skip chat init
  
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful AI business assistant. ..." }]
        },
        {
          role: "model",
          parts: [{ text: "I understand! I'm here to help you ..." }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
  }
  

  // Method to set user context
  async setUserContext(userId: string) {
    this.userId = userId;
    try {
      // Get user context from localStorage for now
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      
      const context: UserContext = {
        businessProfile: onboardingData,
        userProfile: user,
        recentWebsites: [],
        recentInsights: [],
        recentEmailCampaigns: []
      };
      
      this.userContext = context;
      console.log('✅ User context loaded:', context);
      
      // Update chat with user context
      if (context.businessProfile) {
        await this.updateChatWithContext(context);
      }
    } catch (error) {
      console.error('❌ Error loading user context:', error);
    }
  }

  private async updateChatWithContext(context: UserContext) {
    if (!context.businessProfile) return;

    const contextPrompt = `
IMPORTANT: You now have access to the user's business information. Use this context to provide more personalized and relevant advice.

USER'S BUSINESS CONTEXT:
- Business Name: ${context.businessProfile.businessName || 'Not specified'}
- Business Type: ${context.businessProfile.businessType || 'Not specified'}
- Brand Tone: ${context.businessProfile.brandTone || 'professional'}
- User Goal: ${context.businessProfile.userGoal || 'Not specified'}
- Services Offered: ${context.businessProfile.topOfferings?.join(', ') || 'Not specified'}

RECENT ACTIVITY:
- Recent Websites: ${context.recentWebsites.length} websites created
- Recent AI Insights: ${context.recentInsights.length} insights generated
- Recent Email Campaigns: ${context.recentEmailCampaigns.length} campaigns created

Use this information to:
1. Provide personalized advice based on their specific business type
2. Reference their recent activities when relevant
3. Suggest improvements based on their brand tone and goals
4. Offer specific recommendations for their target audience
5. Consider their existing services and offerings

Always maintain a professional, helpful tone while being conversational.
`;

    try {
      await this.chat.sendMessage(contextPrompt);
    } catch (error) {
      console.error('Error updating chat with context:', error);
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Check if the message is business/marketing related
      const businessKeywords = [
        'business', 'marketing', 'website', 'copy', 'strategy', 'growth', 'sales', 'customer', 'product', 'service',
        'brand', 'advertising', 'promotion', 'campaign', 'social media', 'content', 'seo', 'analytics', 'revenue',
        'profit', 'market', 'industry', 'competitor', 'target audience', 'conversion', 'lead', 'client', 'company',
        'startup', 'entrepreneur', 'business plan', 'pricing', 'positioning', 'value proposition', 'tagline',
        'slogan', 'description', 'about us', 'contact', 'email', 'newsletter', 'blog', 'content marketing',
        'digital marketing', 'traditional marketing', 'branding', 'logo', 'design', 'user experience', 'conversion rate',
        'customer acquisition', 'retention', 'loyalty', 'feedback', 'review', 'testimonial', 'case study', 'roi',
        'kpi', 'metrics', 'performance', 'optimization', 'improvement', 'development', 'launch', 'release',
        'feature', 'benefit', 'advantage', 'unique selling proposition', 'competitive advantage', 'market research',
        'survey', 'analysis', 'trend', 'opportunity', 'challenge', 'problem', 'solution', 'innovation', 'technology',
        'automation', 'process', 'workflow', 'efficiency', 'productivity', 'quality', 'service', 'support',
        'communication', 'presentation', 'pitch', 'proposal', 'quote', 'invoice', 'payment', 'billing', 'finance',
        'budget', 'cost', 'investment', 'funding', 'capital', 'cash flow', 'expense', 'income', 'revenue stream',
        'business model', 'revenue model', 'pricing strategy', 'distribution', 'supply chain', 'inventory',
        'logistics', 'shipping', 'delivery', 'fulfillment', 'customer service', 'support', 'help', 'faq',
        'knowledge base', 'documentation', 'training', 'onboarding', 'partnership', 'collaboration', 'alliance',
        'joint venture', 'merger', 'acquisition', 'expansion', 'scaling', 'growth strategy', 'market expansion',
        'international', 'global', 'local', 'regional', 'national', 'franchise', 'licensing', 'certification',
        'compliance', 'regulation', 'legal', 'contract', 'agreement', 'terms', 'policy', 'procedure', 'guideline',
        'best practice', 'industry standard', 'benchmark', 'comparison', 'evaluation', 'assessment', 'audit',
        'review', 'report', 'dashboard', 'analytics', 'insights', 'data', 'statistics', 'metrics', 'measurement',
        'tracking', 'monitoring', 'reporting', 'communication', 'messaging', 'storytelling', 'narrative', 'voice',
        'tone', 'style', 'personality', 'character', 'identity', 'image', 'reputation', 'credibility', 'trust',
        'authority', 'expertise', 'knowledge', 'skill', 'experience', 'qualification', 'certification', 'accreditation',
        'recognition', 'award', 'achievement', 'success', 'milestone', 'goal', 'objective', 'target', 'aim',
        'purpose', 'mission', 'vision', 'values', 'culture', 'team', 'staff', 'employee', 'personnel', 'human resources',
        'recruitment', 'hiring', 'interview', 'candidate', 'applicant', 'resume', 'cv', 'portfolio', 'profile',
        'background', 'experience', 'skill', 'talent', 'expertise', 'specialization', 'niche', 'focus', 'concentration',
        'domain', 'field', 'sector', 'industry', 'market', 'segment', 'audience', 'demographic', 'psychographic',
        'behavioral', 'geographic', 'location', 'area', 'region', 'territory', 'market', 'customer base', 'client base',
        'user base', 'subscriber', 'member', 'follower', 'fan', 'advocate', 'ambassador', 'influencer', 'partner',
        'affiliate', 'reseller', 'distributor', 'retailer', 'wholesaler', 'supplier', 'vendor', 'provider', 'service provider',
        'consultant', 'advisor', 'mentor', 'coach', 'trainer', 'educator', 'instructor', 'teacher', 'professor',
        'expert', 'specialist', 'professional', 'practitioner', 'consultant', 'advisor', 'counselor', 'therapist',
        'counselor', 'mentor', 'coach', 'trainer', 'educator', 'instructor', 'teacher', 'professor', 'expert',
        'specialist', 'professional', 'practitioner', 'consultant', 'advisor', 'counselor', 'therapist'
      ];

      const messageLower = message.toLowerCase();
      const isBusinessRelated = businessKeywords.some(keyword => 
        messageLower.includes(keyword.toLowerCase())
      );

      if (!isBusinessRelated) {
        return "I apologize, but I'm specifically designed to help with business and marketing topics. I can assist you with:\n\n• Marketing strategies and campaigns\n• Website copy and content\n• Business growth ideas\n• Brand development\n• Customer acquisition\n• Social media marketing\n• Content creation\n• Business strategies\n\nPlease ask me something related to your business or marketing needs!";
      }

      // Add user context to the message if available
      let enhancedMessage = message;
      if (this.userContext && this.userContext.businessProfile) {
        enhancedMessage = `[CONTEXT: ${this.userContext.businessProfile.businessName} - ${this.userContext.businessProfile.businessType} business in ${this.userContext.businessProfile.industry} industry. Brand tone: ${this.userContext.businessProfile.brandTone}. Goal: ${this.userContext.businessProfile.userGoal}]\n\nUser question: ${message}`;
      }

      const result = await this.chat.sendMessage(enhancedMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }

  // Method to start a new chat session
  startNewChat() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    
    // Re-apply user context if available
    if (this.userContext && this.userContext.businessProfile) {
      this.updateChatWithContext(this.userContext);
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();

// --- Website Generation Types and Logic ---
export interface WebsiteGenerationRequest {
  description: string;
  persona: string;
}

export interface WebsiteGenerationResponse {
  html: string;
  css: string;
  title: string;
  description: string;
}

export interface EmailGenerationRequest {
  objective: string;
  businessType?: string;
  tone?: string;
  emailType?: 'draft' | 'newsletter';
}

export interface EmailGenerationResponse {
  subject: string;
  content: string;
  description: string;
}


// --- Image Generation Types and Logic ---
export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  style: string;
  size: string;
  quality: string;

}

const WEBSITE_GENERATION_MODELS = [
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

function isGeminiQuotaError(error: any): boolean {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests")
  );
}

async function generateGeminiTextWithFallbackModels(prompt: string): Promise<string> {
  let lastError: any = null;

  for (const modelName of WEBSITE_GENERATION_MODELS) {
    try {
      console.log(`🚀 Sending website request to Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Gemini model ${modelName} failed:`, error);

      if (!isGeminiQuotaError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function generateWebsite(request: WebsiteGenerationRequest): Promise<WebsiteGenerationResponse> {
  try {
    console.log('🔍 Starting website generation for:', request.description);
    
    if (!genAI) {
      return {
        html: '<div style="padding: 20px; text-align: center;"><h2>❌ API Key Missing</h2><p>Please set VITE_GEMINI_API_KEY in your .env file</p></div>',
        css: 'body { font-family: Arial, sans-serif; background: #f5f5f5; }',
        title: 'API Key Error',
        description: 'Gemini API key not configured'
      };
    }
    
    console.log('🔑 API key found, initializing Gemini...');
    

    // Analyze business type from description
    const businessType = analyzeBusinessType(request.description);
    const colorScheme = getColorScheme(businessType, request.persona);
    const layoutStyle = getLayoutStyle(request.persona);
    const relevantImages = getRelevantImages(businessType);

    console.log('📊 Business Analysis:', { businessType, persona: request.persona, colorScheme });
    console.log('🖼️ Selected Images for', businessType, ':', relevantImages);

    const prompt = `
SYSTEM PROMPT — Foolproof Website Generator

MISSION: Generate a stunning, modern, and responsive website with full styling, structured layout, high-quality visuals, and engaging animations. NO plain designs. NO lorem ipsum. NO empty or unstyled sections. This is a personalized, AI-generated site — NOT a generic template.

🧠 BUSINESS CONTEXT (HIGH PRIORITY — MUST FOLLOW):
You are building a website tailored specifically to a real business. The site must reflect the business type, audience, and visual identity. Do NOT create a generic layout or content. The tone, design, features, and visuals must directly relate to the nature of the business, such as a bakery, fitness studio, law firm, tech tool, clothing brand, or portfolio site.

🎨 VISUAL & BRAND INPUTS:
Use a consistent and modern design language. Choose a color scheme, layout style, and visual assets that match the business type. The site must look professional, vibrant, and engaging — with real images, icons, and call-to-action content.

-------------------------------------------
✅ ABSOLUTE STRUCTURE (MANDATORY SECTIONS)
-------------------------------------------
1. Hero Section:
- Full screen or 80vh height
- Large, bold headline tailored to the business
- Subheading with clear value proposition
- Prominent call-to-action button like "Order Now", "Book a Session", or "Start Free Trial"
- Use a relevant high-resolution background image
- Include entrance animation (fadeIn, zoomIn, etc.)

2. About Section:
- Split layout: image on the left, text on the right
- Tell a brief story or describe the mission of the business
- Subtle scroll-triggered animation
- Professional tone matching the business

3. Features / Services Section:
- Display 3 to 6 service or feature cards
- Each must include a real feature or offering — no fake services
- Use icons or images in each card
- Include hover effects (lift, shadow, glow)
- Benefit-driven descriptions

4. Testimonials:
- At least 2 or 3 real-looking reviews with names and avatars
- Smooth animated carousel or card-style layout
- Scroll or load-in animations

5. Call to Action Section:
- Bold message encouraging user action
- Background must use a contextual image or pattern
- Strong CTA button like "Get Started", "Try Now", "Contact Us"

6. Footer:
- Include logo, navigation links, social icons, and copyright text

-------------------------------------------
🎨 DESIGN ENFORCEMENT (NO EXCEPTIONS)
-------------------------------------------
- Must use at least 2 sections with glassmorphism, gradient backgrounds, or vibrant color overlays
- Responsive layout with modern font (e.g., Poppins, Inter, or similar)
- All buttons and cards must have hover and transition effects
- Use scroll-triggered animations (e.g., via AOS or similar)
- Use icons from libraries like Lucide, Heroicons, or Font Awesome
- Use at least 3 relevant high-resolution images (Unsplash, Pexels, etc.)

-------------------------------------------
🖼 IMAGE RULES (STRICT)
-------------------------------------------
- Do NOT use placeholder or broken images
- Use real, relevant Unsplash or Pexels URLs in this format:  
  https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=800&q=80
- Images must reflect the business context (e.g., food for bakery, weights for gym)
- Add descriptive alt text for accessibility
- All images must be responsive and optimized

-------------------------------------------
📱 RESPONSIVE DESIGN (MANDATORY)
-------------------------------------------
- Mobile-first layout
- Sections must stack properly on smaller screens
- Use touch-friendly spacing and sizing

-------------------------------------------
✍ CONTENT GUIDELINES
-------------------------------------------
- No lorem ipsum or placeholders
- Use clear, persuasive, and benefit-focused language
- Avoid generic phrases like "We are the best"
- Use real CTAs like "Join Now", "Explore Menu", "Book a Free Call"

-------------------------------------------
📦 OUTPUT FORMAT (STRICT)
-------------------------------------------
Return the result in the following JSON format:

{
  "html": "COMPLETE HTML as a string here with proper section structure, animation, images, and content.",
  "css": "COMPLETE CSS as a string here with styling, media queries, animations, and transitions.",
  "title": "Meaningful Business Title",
  "description": "Short, engaging description of the business and visual design."
}

-------------------------------------------
🚫 REJECTION CONDITIONS
-------------------------------------------
- ❌ Any missing section → REJECT
- ❌ Any generic layout or digital agency content for unrelated business types → REJECT
- ❌ Any use of placeholder images or lorem ipsum → REJECT
- ❌ Any unstyled or animation-less section → REJECT

⚠ This is not a one-size-fits-all website. You are building a visually stunning, business-specific site with custom content and visuals. Every output must feel intentional and fully tailored to the business type.
`;

    const text = await generateGeminiTextWithFallbackModels(prompt);
    
    console.log('📥 Raw API response received:', text.substring(0, 200) + '...');
    
    // Try multiple approaches to extract JSON
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in API response');
      return {
        html: '<div style="padding: 20px; text-align: center;"><h2>❌ Invalid Response</h2><p>API returned invalid format. Please try again.</p></div>',
        css: 'body { font-family: Arial, sans-serif; background: #f5f5f5; }',
        title: 'Generation Error',
        description: 'Invalid response format from API'
      };
    }

    try {
      console.log('🔍 Extracted JSON from response');
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('🔍 Raw JSON string:', jsonMatch[0]);
      
      // Try to clean the JSON string
      let cleanedJson = jsonMatch[0];
      
      // Remove any text before the first {
      cleanedJson = cleanedJson.substring(cleanedJson.indexOf('{'));
      
      // Remove any text after the last }
      cleanedJson = cleanedJson.substring(0, cleanedJson.lastIndexOf('}') + 1);
      
      // Try to fix common JSON issues
      cleanedJson = cleanedJson.replace(/,\s*}/g, '}'); // Remove trailing commas
      cleanedJson = cleanedJson.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      try {
        parsedResponse = JSON.parse(cleanedJson);
        console.log('✅ Successfully parsed cleaned JSON');
      } catch (secondError) {
        console.error('❌ Second JSON parsing attempt failed:', secondError);
        return {
          html: '<div style="padding: 20px; text-align: center;"><h2>❌ JSON Parse Error</h2><p>API returned malformed JSON. Please try again.</p><details><summary>Error Details</summary><pre>' + secondError.message + '</pre></details></div>',
          css: 'body { font-family: Arial, sans-serif; background: #f5f5f5; } details { margin-top: 10px; } pre { background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px; }',
          title: 'JSON Parse Error',
          description: 'API returned malformed JSON: ' + secondError.message
        };
      }
    }

    if (!parsedResponse.html || !parsedResponse.css || !parsedResponse.title) {
      console.error('❌ Incomplete response from API:', parsedResponse);
      return {
        html: '<div style="padding: 20px; text-align: center;"><h2>❌ Incomplete Response</h2><p>API response missing required fields. Please try again.</p></div>',
        css: 'body { font-family: Arial, sans-serif; background: #f5f5f5; }',
        title: 'Generation Error',
        description: 'Incomplete response from API'
      };
    }

    console.log('✅ Successfully generated website with Gemini API');
    console.log('📝 Title:', parsedResponse.title);
    console.log('📄 Description:', parsedResponse.description);
    console.log('🔧 HTML length:', parsedResponse.html.length);
    console.log('🎨 CSS length:', parsedResponse.css.length);
    
    return {
      html: parsedResponse.html,
      css: parsedResponse.css,
      title: parsedResponse.title,
      description: parsedResponse.description || "A futuristic full-stack website for your business"
    };
  } catch (error: any) {
    console.error('❌ Error generating website with Gemini API:', error);
    if (isGeminiQuotaError(error)) {
      const fallback = generateFuturisticFallbackWebsite(request);
      return {
        ...fallback,
        description: `${fallback.description}. Gemini quota was exhausted, so this was generated locally.`
      };
    }

    return {
      html: `<div style="padding: 20px; text-align: center;"><h2>❌ Generation Failed</h2><p>Error: ${error.message}</p><p>Please check your API key and try again.</p></div>`,
      css: 'body { font-family: Arial, sans-serif; background: #f5f5f5; }',
      title: 'Generation Error',
      description: `Failed to generate website: ${error.message}`
    };
  }
}

export async function generateEmail(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
  try {
    console.log('📧 Starting email generation for:', request.objective);
    
    // Check if API key is set
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ No Gemini API key found in environment variables');
      return {
        subject: '❌ API Key Missing',
        content: 'Please set VITE_GEMINI_API_KEY in your .env file',
        description: 'Gemini API key not configured'
      };
    }
    
    console.log('🔑 API key found, initializing Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Analyze business type from objective
    const businessType = analyzeBusinessType(request.objective);
    const tone = request.tone || 'professional';
    const emailType = request.emailType || 'draft';

    console.log('📊 Email Analysis:', { businessType, tone, emailType });

    // Create different prompts based on email type
    let prompt = '';
    
    if (emailType === 'draft') {
      prompt = `
Create a professional email draft for: "${request.objective}"

Business Type: ${businessType}
Tone: ${tone}

REQUIREMENTS FOR EMAIL DRAFT:
- Professional and formal tone
- Clear subject line
- Structured content with proper greeting and closing
- Include all necessary details and context
- Professional signature format
- Use proper email etiquette
- Keep it concise but comprehensive
- Include any relevant attachments or links mentioned

Return ONLY this JSON format:
{
  "subject": "Professional subject line",
  "content": "Complete email draft with proper formatting",
  "description": "Professional email draft"
}
`;
    } else if (emailType === 'newsletter') {
      prompt = `
Create an engaging newsletter email content for: "${request.objective}"

Business Type: ${businessType}
Tone: ${tone}

REQUIREMENTS FOR NEWSLETTER:
- Create actual newsletter content, not HTML code
- Engaging and informative content with clear sections
- Include updates, tips, or valuable content for subscribers
- Personal and conversational tone
- Clear call-to-action
- Professional but friendly approach
- Use emojis strategically
- Include social media links and contact information
- Mobile-friendly content structure
- Include unsubscribe option text
- Make it feel like a real newsletter people would want to read

Return ONLY this JSON format:
{
  "subject": "Engaging newsletter subject line",
  "content": "Complete newsletter content with proper formatting and sections",
  "description": "Engaging newsletter email"
}

The content should be the actual newsletter text, not HTML code. Include sections like:
- Welcome message
- Updates or news
- Tips or valuable content
- Call-to-action
- Contact information
- Unsubscribe notice

Do not forget to make sure that it is in the correct JSON format.
{
  "subject": "Engaging newsletter subject line",
  "content": "Complete newsletter content with proper formatting and sections",
  "description": "Engaging newsletter email"
}
`;
    }

    console.log('🚀 Sending email request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Raw API response received:', text.substring(0, 200) + '...');

    // Try multiple approaches to extract JSON
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in API response');
      return {
        subject: '❌ Invalid Response',
        content: 'API returned invalid format. Please try again.',
        description: 'Invalid response format from API'
      };
    }

    try {
      console.log('🔍 Extracted JSON from response');
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('🔍 Raw JSON string:', jsonMatch[0]);
      
      // Try to clean the JSON string
      let cleanedJson = jsonMatch[0];
      
      // Remove any text before the first {
      cleanedJson = cleanedJson.substring(cleanedJson.indexOf('{'));
      
      // Remove any text after the last }
      cleanedJson = cleanedJson.substring(0, cleanedJson.lastIndexOf('}') + 1);
      
      // Try to fix common JSON issues
      cleanedJson = cleanedJson.replace(/,\s*}/g, '}'); // Remove trailing commas
      cleanedJson = cleanedJson.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      try {
        parsedResponse = JSON.parse(cleanedJson);
        console.log('✅ Successfully parsed cleaned JSON');
      } catch (secondError) {
        console.error('❌ Second JSON parsing attempt failed:', secondError);
        return {
          subject: '❌ JSON Parse Error',
          content: 'API returned malformed JSON. Please try again.\n\nError Details: ' + secondError.message,
          description: 'API returned malformed JSON: ' + secondError.message
        };
      }
    }

    if (!parsedResponse.subject || !parsedResponse.content) {
      console.error('❌ Incomplete response from API:', parsedResponse);
      return {
        subject: '❌ Incomplete Response',
        content: 'API response missing required fields. Please try again.',
        description: 'Incomplete response from API'
      };
    }

    console.log('✅ Successfully generated email with Gemini API');
    console.log('📝 Subject:', parsedResponse.subject);
    console.log('📄 Content length:', parsedResponse.content.length);

    return {
      subject: parsedResponse.subject,
      content: parsedResponse.content,
      description: parsedResponse.description || `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} email`
    };
  } catch (error: any) {
    console.error('❌ Error generating email with Gemini API:', error);
    return {
      subject: '❌ Generation Failed',
      content: `Error: ${error.message}\n\nPlease check your API key and try again.`,
      description: `Failed to generate email: ${error.message}`
    };
  }
}

// --- AI Insights Types and Logic ---
export interface InsightGenerationRequest {
  businessDescription: string;
}

export interface InsightResponse {
  competitors: string;
  seo: string;
  prosAndCons: string;
  marketRelevance: string;
  futureScore: string;
}

export async function generateInsights(request: InsightGenerationRequest): Promise<InsightResponse> {
  try {
    console.log('🔍 Starting insights generation for:', request.businessDescription);
    
    // Check if API key is set
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ No Gemini API key found in environment variables');
      return {
        competitors: '❌ API Key Missing - Please set VITE_GEMINI_API_KEY in your .env file',
        seo: '❌ API Key Missing - Please set VITE_GEMINI_API_KEY in your .env file',
        prosAndCons: '❌ API Key Missing - Please set VITE_GEMINI_API_KEY in your .env file',
        marketRelevance: '❌ API Key Missing - Please set VITE_GEMINI_API_KEY in your .env file',
        futureScore: '❌ API Key Missing - Please set VITE_GEMINI_API_KEY in your .env file'
      };
    }
    
    console.log('🔑 API key found, initializing Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a friendly business consultant who gives practical, human advice. Based on the business description provided, give general market insights and trends that would be relevant for this type of business.

Business: "${request.businessDescription}"

Give me 5 general market insights in this exact JSON format with exactly 2 strong bullet points for each section:

{
  "competitors": "• [First strong bullet point about competitive landscape]\\n• [Second strong bullet point about market positioning]",
  "seo": "• [First strong bullet point about search trends]\\n• [Second strong bullet point about digital strategies]",
  "prosAndCons": "• [First strong bullet point about industry strengths]\\n• [Second strong bullet point about key challenges]",
  "marketRelevance": "• [First strong bullet point about market demand]\\n• [Second strong bullet point about growth opportunities]",
  "futureScore": "• [First strong bullet point about growth potential]\\n• [Second strong bullet point about strategic recommendations]"
}

IMPORTANT: Use exactly 2 bullet points (•) for each section, no more, no less. Make each bullet point strong, actionable, and specific to the business type. Keep it conversational, practical, and insightful.
`;

    console.log('🚀 Sending insights request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Raw API response received:', text.substring(0, 200) + '...');

    // Try multiple approaches to extract JSON
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in API response');
      return {
        competitors: '❌ Invalid Response - API returned invalid format. Please try again.',
        seo: '❌ Invalid Response - API returned invalid format. Please try again.',
        prosAndCons: '❌ Invalid Response - API returned invalid format. Please try again.',
        marketRelevance: '❌ Invalid Response - API returned invalid format. Please try again.',
        futureScore: '❌ Invalid Response - API returned invalid format. Please try again.'
      };
    }

    try {
      console.log('🔍 Extracted JSON from response');
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('🔍 Raw JSON string:', jsonMatch[0]);
      
      // Try to clean the JSON string
      let cleanedJson = jsonMatch[0];
      
      // Remove any text before the first {
      cleanedJson = cleanedJson.substring(cleanedJson.indexOf('{'));
      
      // Remove any text after the last }
      cleanedJson = cleanedJson.substring(0, cleanedJson.lastIndexOf('}') + 1);
      
      // Try to fix common JSON issues
      cleanedJson = cleanedJson.replace(/,\s*}/g, '}'); // Remove trailing commas
      cleanedJson = cleanedJson.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      try {
        parsedResponse = JSON.parse(cleanedJson);
        console.log('✅ Successfully parsed cleaned JSON');
      } catch (secondError) {
        console.error('❌ Second JSON parsing attempt failed:', secondError);
        return {
          competitors: '❌ JSON Parse Error - API returned malformed JSON. Please try again.',
          seo: '❌ JSON Parse Error - API returned malformed JSON. Please try again.',
          prosAndCons: '❌ JSON Parse Error - API returned malformed JSON. Please try again.',
          marketRelevance: '❌ JSON Parse Error - API returned malformed JSON. Please try again.',
          futureScore: '❌ JSON Parse Error - API returned malformed JSON. Please try again.'
        };
      }
    }

    if (!parsedResponse.competitors || !parsedResponse.seo || !parsedResponse.prosAndCons || !parsedResponse.marketRelevance || !parsedResponse.futureScore) {
      console.error('❌ Incomplete response from API:', parsedResponse);
      return {
        competitors: '❌ Incomplete Response - API response missing required fields. Please try again.',
        seo: '❌ Incomplete Response - API response missing required fields. Please try again.',
        prosAndCons: '❌ Incomplete Response - API response missing required fields. Please try again.',
        marketRelevance: '❌ Incomplete Response - API response missing required fields. Please try again.',
        futureScore: '❌ Incomplete Response - API response missing required fields. Please try again.'
      };
    }

    console.log('✅ Successfully generated insights with Gemini API');
    console.log('📊 Competitors analysis length:', parsedResponse.competitors.length);
    console.log('🔍 SEO insights length:', parsedResponse.seo.length);
    console.log('📈 Pros/Cons length:', parsedResponse.prosAndCons.length);
    console.log('🎯 Market relevance length:', parsedResponse.marketRelevance.length);
    console.log('🚀 Future score length:', parsedResponse.futureScore.length);

    return {
      competitors: parsedResponse.competitors,
      seo: parsedResponse.seo,
      prosAndCons: parsedResponse.prosAndCons,
      marketRelevance: parsedResponse.marketRelevance,
      futureScore: parsedResponse.futureScore
    };
  } catch (error: any) {
    console.error('❌ Error generating insights with Gemini API:', error);
    return {
      competitors: `❌ Generation Failed - Error: ${error.message}. Please check your API key and try again.`,
      seo: `❌ Generation Failed - Error: ${error.message}. Please check your API key and try again.`,
      prosAndCons: `❌ Generation Failed - Error: ${error.message}. Please check your API key and try again.`,
      marketRelevance: `❌ Generation Failed - Error: ${error.message}. Please check your API key and try again.`,
      futureScore: `❌ Generation Failed - Error: ${error.message}. Please check your API key and try again.`
    };
  }
}

function analyzeBusinessType(description: string): string {
  const desc = description.toLowerCase();
  
  // More comprehensive keyword matching
  const businessTypes = {
    'restaurant': ['restaurant', 'cafe', 'dining', 'food', 'cuisine', 'kitchen', 'chef', 'menu', 'dining', 'eatery', 'bistro', 'pub', 'bar', 'grill'],
    'bakery': ['bakery', 'bread', 'pastry', 'cake', 'dessert', 'baking', 'confectionery', 'patisserie', 'sweets', 'cookies', 'muffins', 'croissant'],
    'tech': ['technology', 'software', 'app', 'startup', 'digital', 'web', 'mobile', 'programming', 'coding', 'development', 'ai', 'artificial intelligence', 'machine learning', 'data', 'analytics', 'saas', 'platform'],
    'fitness': ['fitness', 'gym', 'workout', 'exercise', 'training', 'health', 'wellness', 'yoga', 'pilates', 'crossfit', 'personal trainer', 'sports', 'athletic'],
    'beauty': ['beauty', 'salon', 'spa', 'cosmetics', 'makeup', 'hair', 'skincare', 'aesthetic', 'beauty salon', 'nail', 'facial', 'massage', 'wellness'],
    'consulting': ['consulting', 'consultant', 'business', 'strategy', 'management', 'advisory', 'professional services', 'corporate', 'enterprise', 'business solutions'],
    'retail': ['retail', 'store', 'shop', 'ecommerce', 'online store', 'fashion', 'clothing', 'accessories', 'shopping', 'boutique', 'marketplace'],
    'healthcare': ['healthcare', 'medical', 'doctor', 'clinic', 'hospital', 'pharmacy', 'dental', 'therapy', 'wellness', 'health', 'medicine', 'patient care'],
    'education': ['education', 'school', 'university', 'college', 'learning', 'training', 'course', 'academy', 'institute', 'tutoring', 'online learning'],
    'real_estate': ['real estate', 'property', 'realty', 'housing', 'home', 'apartment', 'condo', 'house', 'property management', 'real estate agent'],
    'automotive': ['automotive', 'car', 'auto', 'vehicle', 'dealership', 'garage', 'repair', 'maintenance', 'tire', 'oil change', 'mechanic'],
    'construction': ['construction', 'building', 'contractor', 'renovation', 'remodeling', 'architecture', 'engineering', 'construction company', 'home improvement'],
    'legal': ['legal', 'law', 'attorney', 'lawyer', 'law firm', 'legal services', 'litigation', 'legal advice', 'court', 'justice'],
    'financial': ['financial', 'finance', 'banking', 'investment', 'accounting', 'tax', 'insurance', 'wealth management', 'financial services', 'credit'],
    'travel': ['travel', 'tourism', 'hotel', 'vacation', 'trip', 'booking', 'travel agency', 'tour', 'destination', 'adventure'],
    'pet': ['pet', 'veterinary', 'animal', 'dog', 'cat', 'pet care', 'veterinarian', 'pet grooming', 'pet store', 'animal hospital'],
    'home_services': ['cleaning', 'lawn care', 'landscaping', 'plumbing', 'electrical', 'hvac', 'home services', 'maintenance', 'repair services'],
    'creative': ['design', 'creative', 'art', 'photography', 'graphic design', 'branding', 'marketing', 'advertising', 'media', 'content creation'],
    'food_delivery': ['delivery', 'takeout', 'food delivery', 'meal prep', 'catering', 'food service', 'delivery service', 'meal delivery'],
    'coffee': ['coffee', 'cafe', 'espresso', 'latte', 'coffee shop', 'barista', 'coffee roaster', 'specialty coffee']
  };

  // Count matches for each business type
  const scores: { [key: string]: number } = {};
  
  for (const [type, keywords] of Object.entries(businessTypes)) {
    scores[type] = keywords.filter(keyword => desc.includes(keyword)).length;
  }

  // Find the business type with the highest score
  const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
  
  // Only return a match if there's at least one keyword match
  if (bestMatch[1] > 0) {
    console.log(`🎯 Business type detected: ${bestMatch[0]} (score: ${bestMatch[1]})`);
    return bestMatch[0];
  }

  // Fallback based on common words
  if (desc.includes('honey') || desc.includes('bee') || desc.includes('apiary')) return 'food_delivery';
  if (desc.includes('organic') || desc.includes('natural')) return 'food_delivery';
  if (desc.includes('craft') || desc.includes('artisan')) return 'creative';
  
  console.log('🎯 No specific business type detected, using default');
  return 'consulting';
}

function getColorScheme(businessType: string, persona: string): string {
  const schemes: Record<string, Record<string, string>> = {
    'Food & Beverage': {
      professional: 'Warm oranges (#ff6b35), deep browns (#8b4513), cream whites (#fafafa)',
      playful: 'Vibrant reds (#ff4757), bright yellows (#ffa502), fresh greens (#2ed573)',
      minimal: 'Soft beiges (#f5f5dc), warm grays (#696969), accent oranges (#ff8c00)'
    },
    'Technology': {
      professional: 'Deep blues (#1e3a8a), electric purples (#7c3aed), clean whites (#ffffff)',
      playful: 'Neon blues (#00d2ff), bright cyans (#06b6d4), dark grays (#1f2937)',
      minimal: 'Cool grays (#6b7280), accent blues (#3b82f6), pure whites (#ffffff)'
    },
    'Health & Fitness': {
      professional: 'Forest greens (#059669), deep blues (#1e40af), clean whites (#ffffff)',
      playful: 'Bright greens (#10b981), energetic oranges (#f59e0b), white (#ffffff)',
      minimal: 'Soft greens (#d1fae5), light grays (#f3f4f6), accent mint (#34d399)'
    },
    'Beauty & Wellness': {
      professional: 'Soft pinks (#fce7f3), rose golds (#fbbf24), elegant whites (#ffffff)',
      playful: 'Bright pinks (#ec4899), purples (#8b5cf6), sparkle accents (#fbbf24)',
      minimal: 'Pale pinks (#fdf2f8), soft grays (#f3f4f6), rose accents (#f472b6)'
    },
    'Professional Services': {
      professional: 'Navy blues (#1e3a8a), gold accents (#f59e0b), clean whites (#ffffff)',
      playful: 'Bright blues (#3b82f6), energetic oranges (#f59e0b), white (#ffffff)',
      minimal: 'Cool grays (#6b7280), accent blues (#3b82f6), pure whites (#ffffff)'
    },
    'Retail': {
      professional: 'Deep purples (#7c3aed), gold accents (#f59e0b), clean whites (#ffffff)',
      playful: 'Bright purples (#8b5cf6), pinks (#ec4899), vibrant colors (#f59e0b)',
      minimal: 'Soft purples (#f3f4f6), light grays (#f3f4f6), accent lavender (#a78bfa)'
    },
    'Education': {
      professional: 'Deep blues (#1e3a8a), academic reds (#dc2626), clean whites (#ffffff)',
      playful: 'Bright blues (#3b82f6), energetic greens (#10b981), white (#ffffff)',
      minimal: 'Soft blues (#dbeafe), light grays (#f3f4f6), accent blue (#3b82f6)'
    },
    'Creative & Arts': {
      professional: 'Deep purples (#7c3aed), creative oranges (#f59e0b), clean whites (#ffffff)',
      playful: 'Bright purples (#8b5cf6), creative pinks (#ec4899), vibrant colors (#f59e0b)',
      minimal: 'Soft purples (#f3f4f6), light grays (#f3f4f6), accent purple (#8b5cf6)'
    },
    'General Business': {
      professional: 'Navy blues (#1e3a8a), gray accents (#6b7280), clean whites (#ffffff)',
      playful: 'Bright blues (#3b82f6), energetic colors (#f59e0b), white (#ffffff)',
      minimal: 'Cool grays (#6b7280), accent colors (#3b82f6), pure whites (#ffffff)'
    }
  };
  
  return schemes[businessType]?.[persona] || 'Professional blues and grays';
}

function getLayoutStyle(persona: string): string {
  switch (persona.toLowerCase()) {
    case 'modern':
      return 'clean, minimalist, lots of white space, grid-based layout';
    case 'creative':
      return 'asymmetric, bold colors, overlapping elements, artistic';
    case 'professional':
      return 'structured, corporate, conservative colors, formal layout';
    case 'friendly':
      return 'warm colors, rounded corners, approachable, welcoming';
    case 'luxury':
      return 'elegant, premium, sophisticated, high-end aesthetics';
    default:
      return 'modern, clean, professional layout';
  }
}

function getRelevantImages(businessType: string): string[] {
  const imageMap: { [key: string]: string[] } = {
    'restaurant': [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'
    ],
    'bakery': [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
    ],
    'tech': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
    ],
    'beauty': [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80'
    ],
    'consulting': [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
    ],
    'retail': [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
    ],
    'healthcare': [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80'
    ],
    'education': [
      'https://images.unsplash.com/photo-1523240798131-33771e4e0b2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523240798131-33771e4e0b2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
    ],
    'real_estate': [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
    ],
    'automotive': [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
    ],
    'construction': [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
    ],
    'legal': [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
    ],
    'financial': [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
    ],
    'travel': [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
    ],
    'pet': [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'
    ],
    'home_services': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
    ],
    'creative': [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
    ],
    'food_delivery': [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80'
    ],
    'coffee': [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ]
  };

  // Return relevant images for the business type, or default images if not found
  return imageMap[businessType] || [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
  ];
}

function generateFuturisticFallbackWebsite(request: WebsiteGenerationRequest): WebsiteGenerationResponse {
  const businessType = analyzeBusinessType(request.description);
  const colors = getColorScheme(businessType, request.persona);
  
  const layouts = {
    professional: {
      header: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#667eea',
      layout: 'grid-template-columns: 1fr 1fr;',
      borderRadius: '20px',
      shadow: '0 20px 40px rgba(0,0,0,0.1)',
      cardBg: 'rgba(255,255,255,0.95)',
      backdrop: 'backdrop-filter: blur(10px);'
    },
    playful: {
      header: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      accent: '#ff6b6b',
      layout: 'grid-template-columns: 1fr; border-radius: 25px;',
      borderRadius: '25px',
      shadow: '0 25px 50px rgba(0,0,0,0.15)',
      cardBg: 'rgba(255,255,255,0.9)',
      backdrop: 'backdrop-filter: blur(15px);'
    },
    minimal: {
      header: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      accent: '#6c757d',
      layout: 'grid-template-columns: 1fr; max-width: 800px;',
      borderRadius: '12px',
      shadow: '0 10px 30px rgba(0,0,0,0.08)',
      cardBg: 'rgba(255,255,255,0.98)',
      backdrop: 'backdrop-filter: blur(5px);'
    }
  };
  
  const style = layouts[request.persona as keyof typeof layouts] || layouts.professional;
  
  return {
    html: `
      <header style="background: ${style.header}; color: white; padding: 4rem 2rem; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.1);"></div>
        <div style="position: relative; z-index: 1;">
          <h1 style="font-size: 3.5rem; margin-bottom: 1rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${request.description.split(' ').slice(0, 3).join(' ')}</h1>
          <p style="font-size: 1.3rem; opacity: 0.9; margin-bottom: 2rem;">${businessType} Excellence</p>
          <button style="background: rgba(255,255,255,0.2); color: white; padding: 1rem 2.5rem; border: 2px solid rgba(255,255,255,0.3); border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);">Learn More</button>
        </div>
      </header>
      
      <main style="padding: 4rem 2rem; max-width: 1200px; margin: 0 auto;">
        <section style="margin-bottom: 5rem; display: grid; gap: 3rem; ${style.layout}">
          <div style="background: ${style.cardBg}; padding: 3rem; border-radius: ${style.borderRadius}; box-shadow: ${style.shadow}; ${style.backdrop} border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease;">
            <h2 style="color: ${style.accent}; font-size: 2.5rem; margin-bottom: 1.5rem; font-weight: 700;">About Us</h2>
            <p style="font-size: 1.2rem; line-height: 1.8; color: #374151;">${request.description}</p>
          </div>
          <div style="background: ${style.cardBg}; padding: 3rem; border-radius: ${style.borderRadius}; box-shadow: ${style.shadow}; ${style.backdrop} border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease;">
            <h2 style="color: ${style.accent}; font-size: 2.5rem; margin-bottom: 1.5rem; font-weight: 700;">Our Services</h2>
            <p style="font-size: 1.2rem; line-height: 1.8; color: #374151;">We provide exceptional ${businessType.toLowerCase()} services tailored to your needs with excellence and dedication.</p>
          </div>
        </section>
        
        <section style="text-align: center; background: ${style.header}; color: white; padding: 4rem 2rem; border-radius: 30px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.1);"></div>
          <div style="position: relative; z-index: 1;">
            <h2 style="font-size: 3rem; margin-bottom: 1.5rem; font-weight: 800;">Get In Touch</h2>
            <p style="font-size: 1.3rem; margin-bottom: 3rem; opacity: 0.9;">Ready to work with us?</p>
            <button style="background: white; color: ${style.accent}; padding: 1.5rem 3rem; border: none; border-radius: 50px; font-size: 1.2rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">Contact Us</button>
          </div>
        </section>
      </main>
      
      <footer style="background: #1f2937; color: white; padding: 3rem 2rem; text-align: center; margin-top: 4rem;">
        <p style="font-size: 1.1rem; opacity: 0.8;">© 2024 ${request.description.split(' ').slice(0, 3).join(' ')}. All rights reserved.</p>
      </footer>
    `,
    css: `
      html, body, div, header, main, section, p, h1, h2, h3, button {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }
      
      header {
        background: ${style.header};
        color: white;
        padding: 4rem 2rem;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        font-weight: 800;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      h2 {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        font-weight: 700;
        color: ${style.accent};
      }
      
      main {
        padding: 4rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      section {
        margin-bottom: 5rem;
      }
      
      p {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        line-height: 1.8;
      }
      
      button {
        transition: all 0.3s ease;
        font-weight: 600;
      }
      
      button:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      }
      
      div:hover {
        transform: translateY(-5px);
      }
      
      @media (max-width: 768px) {
        h1 {
          font-size: 2.5rem;
        }
        
        h2 {
          font-size: 2rem;
        }
        
        main {
          padding: 2rem 1rem;
        }
        
        section {
          grid-template-columns: 1fr !important;
        }
      }
    `,
    title: `${request.description.split(' ').slice(0, 3).join(' ')} - ${businessType}`,
    description: `A futuristic ${request.persona} website for your ${businessType.toLowerCase()} business`
  };
} 

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    console.log('🖼️ Starting image generation for:', request.prompt);
    
    // Try free image generation first
    console.log('🎨 Attempting free image generation...');
    
    // Option 1: Try Stable Diffusion via Hugging Face (Free)
    try {
      const stableDiffusionUrl = await generateWithStableDiffusion(request.prompt, request.style);
      if (stableDiffusionUrl) {
        console.log('✅ Successfully generated image with Stable Diffusion');
        return {
          imageUrl: stableDiffusionUrl,
          prompt: request.prompt,
          style: request.style || 'realistic',
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
        };
      }
    } catch (error) {
      console.log('⚠️ Stable Diffusion failed, trying Unsplash...');
    }
    
    // Option 2: Try Unsplash API (Free stock photos)
    try {
      const unsplashUrl = await generateWithUnsplash(request.prompt);
      if (unsplashUrl) {
        console.log('✅ Successfully generated image with Unsplash');
        return {
          imageUrl: unsplashUrl,
          prompt: request.prompt,
          style: request.style || 'realistic',
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
        };
      }
    } catch (error) {
      console.log('⚠️ Unsplash failed, using canvas generation...');
    }
    
    // Option 3: Fallback to canvas generation (browser only)
    if (typeof document === 'undefined') {
      throw new Error('Canvas generation is not available in this environment.');
    }
    
    // Parse the prompt to extract key elements for image generation
    const promptWords = request.prompt.toLowerCase().split(' ');
    const style = request.style || 'realistic';
    
    // Create a sophisticated AI-generated image
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a complex, AI-style background
      createAIStyleBackground(ctx, promptWords, style);
      
      // Add AI-generated elements based on the prompt
      addAIGeneratedElements(ctx, promptWords, style);
      
      // Add sophisticated lighting and effects
      addAILightingEffects(ctx, style);
      
      // Add the AI signature overlay
      addAISignature(ctx, request.prompt, style);
    }
    
    const imageUrl = canvas.toDataURL('image/png');
    
    console.log('✅ Successfully generated AI image with canvas');
    
    return {
      imageUrl,
      prompt: request.prompt,
      style: request.style || 'realistic',
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
    };
  } catch (error: any) {
    console.error('❌ Error generating image:', error);
    
    // Create a fallback placeholder image
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Image Generation', 256, 200);
      ctx.font = '16px Arial';
      ctx.fillText('Failed to generate image', 256, 240);
      ctx.fillText('Please try again', 256, 270);
      
      ctx.beginPath();
      ctx.arc(256, 350, 40, 0, 2 * Math.PI);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillText('🖼️', 256, 365);
    }
    
    const fallbackUrl = canvas.toDataURL('image/png');
    
    return {
      imageUrl: fallbackUrl,
      prompt: request.prompt,
      style: request.style || 'realistic',
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
    };
  }
}

function enhanceImagePrompt(prompt: string, style?: string): string {
  const styleEnhancements: Record<string, string> = {
    'realistic': 'photorealistic, high quality, detailed',
    'artistic': 'artistic style, creative, expressive',
    'minimalist': 'minimalist design, clean, simple',
    'vintage': 'vintage style, retro, classic',
    'modern': 'modern design, contemporary, sleek',
    'cartoon': 'cartoon style, animated, colorful',
    'watercolor': 'watercolor painting style, soft, flowing',
    'digital-art': 'digital art style, vibrant, modern',
    'oil-painting': 'oil painting style, textured, artistic',
    'sketch': 'sketch style, hand-drawn, artistic'
  };
  
  const enhancement = styleEnhancements[style || 'realistic'] || styleEnhancements.realistic;
  
  return `${prompt}, ${enhancement}, high resolution, professional quality`;
}

function createStyleGradient(ctx: CanvasRenderingContext2D, style: string): CanvasGradient {
  const gradients: Record<string, [string, string]> = {
    'realistic': ['#667eea', '#764ba2'],
    'artistic': ['#ff6b6b', '#feca57'],
    'minimalist': ['#f8f9fa', '#e9ecef'],
    'vintage': ['#8b4513', '#daa520'],
    'modern': ['#1e3a8a', '#3b82f6'],
    'cartoon': ['#ff6b9d', '#c44569'],
    'watercolor': ['#74b9ff', '#0984e3'],
    'digital-art': ['#a29bfe', '#6c5ce7'],
    'oil-painting': ['#fd79a8', '#e84393'],
    'sketch': ['#636e72', '#2d3436']
  };
  
  const [color1, color2] = gradients[style] || gradients.realistic;
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

function addArtisticElements(ctx: CanvasRenderingContext2D, description: string, style: string): void {
  // Add some artistic elements based on the style
  if (style === 'artistic' || style === 'digital-art') {
    // Add geometric shapes
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(200 + i * 150, 300 + i * 100, 30 + i * 10, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + i * 0.1})`;
      ctx.fill();
    }
  } else if (style === 'minimalist') {
    // Add simple lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.lineTo(900, 400);
    ctx.stroke();
  } else if (style === 'vintage') {
    // Add vintage texture
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
  }
}

// AI Image Generation Functions
function createAIStyleBackground(ctx: CanvasRenderingContext2D, promptWords: string[], style: string): void {
  // Create a complex, AI-style background based on the prompt
  const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 600);
  
  // Determine colors based on prompt keywords
  let color1 = '#667eea';
  let color2 = '#764ba2';
  
  if (promptWords.includes('candy') || promptWords.includes('sweet') || promptWords.includes('colorful')) {
    color1 = '#ff6b9d';
    color2 = '#feca57';
  } else if (promptWords.includes('nature') || promptWords.includes('forest') || promptWords.includes('green')) {
    color1 = '#10b981';
    color2 = '#059669';
  } else if (promptWords.includes('ocean') || promptWords.includes('sea') || promptWords.includes('blue')) {
    color1 = '#3b82f6';
    color2 = '#1d4ed8';
  } else if (promptWords.includes('sunset') || promptWords.includes('warm') || promptWords.includes('orange')) {
    color1 = '#f59e0b';
    color2 = '#d97706';
  }
  
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Add AI-style noise and texture
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 1);
  }
}

function addAIGeneratedElements(ctx: CanvasRenderingContext2D, promptWords: string[], style: string): void {
  // Add AI-generated elements based on the prompt
  if (promptWords.includes('candy') || promptWords.includes('sweet')) {
    // Draw candy elements
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = 20 + Math.random() * 40;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
      ctx.fill();
      
      // Add shine
      ctx.beginPath();
      ctx.arc(x - size/3, y - size/3, size/4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }
  } else if (promptWords.includes('landscape') || promptWords.includes('mountain')) {
    // Draw landscape elements
    for (let i = 0; i < 5; i++) {
      const x = i * 200;
      const height = 200 + Math.random() * 300;
      
      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.lineTo(x + 100, 1024 - height);
      ctx.lineTo(x + 200, 1024);
      ctx.closePath();
      ctx.fillStyle = `hsl(${120 + Math.random() * 40}, 60%, ${40 + Math.random() * 20}%)`;
      ctx.fill();
    }
  } else {
    // Generic AI elements
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = 30 + Math.random() * 50;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.7)`;
      ctx.fill();
    }
  }
}

function addAILightingEffects(ctx: CanvasRenderingContext2D, style: string): void {
  // Add sophisticated lighting effects
  const gradient = ctx.createRadialGradient(512, 200, 0, 512, 200, 800);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Add lens flare effect
  ctx.beginPath();
  ctx.arc(512, 200, 100, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
}

function addAISignature(ctx: CanvasRenderingContext2D, prompt: string, style: string): void {
  // Add AI signature and prompt info
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AI Generated', 512, 100);
  
  ctx.font = '16px Arial';
  ctx.fillText(`Style: ${style}`, 512, 130);
  
  // Add prompt text (truncated if too long)
  const maxLength = 50;
  const displayPrompt = prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
  ctx.fillText(displayPrompt, 512, 160);
}

// Free Image Generation Functions
async function generateWithStableDiffusion(prompt: string, style?: string): Promise<string | null> {
  try {
    console.log('🎨 Attempting Stable Diffusion generation...');
    
    // Enhanced prompt based on style
    const enhancedPrompt = enhanceImagePrompt(prompt, style);
    
    const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: You can get a free API key from https://huggingface.co/settings/tokens
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY || 'hf_demo'}`,
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Stable Diffusion API error: ${response.status}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log('✅ Stable Diffusion image generated successfully');
    return imageUrl;
  } catch (error) {
    console.error('❌ Stable Diffusion generation failed:', error);
    return null;
  }
}

async function generateWithUnsplash(prompt: string): Promise<string | null> {
  try {
    console.log('📸 Attempting Unsplash image search...');
    
    // Search for relevant images on Unsplash
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${import.meta.env.VITE_UNSPLASH_API_KEY || 'demo'}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log('✅ Unsplash image found successfully');
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Unsplash image search failed:', error);
    return null;
  }
} 
