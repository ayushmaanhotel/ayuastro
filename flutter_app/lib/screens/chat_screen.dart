import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';

class _Astrologer {
  final String id;
  final String name;
  final String title;
  final String specialization;
  final String avatar;
  final Gradient avatarBg;
  final bool online;
  final double rating;
  final String experience;
  final String description;
  final List<String> suggestedQuestions;
  final String systemPromptAddOn;

  const _Astrologer({
    required this.id,
    required this.name,
    required this.title,
    required this.specialization,
    required this.avatar,
    required this.avatarBg,
    required this.online,
    required this.rating,
    required this.experience,
    required this.description,
    required this.suggestedQuestions,
    required this.systemPromptAddOn,
  });
}

final List<_Astrologer> _astrologers = [
  const _Astrologer(
    id: 'rishi-parasher',
    name: 'Rishi Parasher',
    title: 'Vedic Scholar',
    specialization: 'Kundali Analysis & Life Path',
    avatar: '🕉️',
    avatarBg: LinearGradient(
      colors: [Color(0xFFD97706), Color(0xFFC2410C)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: true,
    rating: 4.9,
    experience: '35+ years',
    description: 'Master of Parashari system with deep knowledge of planetary combinations and their life impacts. Known for his no-nonsense, direct readings.',
    suggestedQuestions: [
      'What does my birth chart reveal about my life direction?',
      'How are my planetary combinations affecting my career?',
      'What remedies would you suggest for my current dasha period?',
    ],
    systemPromptAddOn: 'You are Rishi Parasher, a seasoned Vedic scholar with 35+ years of experience in the traditional Parashari system. You speak with warm, grandfatherly authority, blending Vedic calculations with behavioral insights. You analyze Lagna (Ascendant), Sun sign, active Mahadashas, and major Yogas. You speak directly and honestly ("Nothing to Hide") and naturally explain Hindi/Sanskrit terms like dasha, bhukti, and graha. You ground cosmic timings in realistic career choices.',
  ),
  const _Astrologer(
    id: 'jyoti-nanda',
    name: 'Jyoti Nanda',
    title: 'Relationship Expert',
    specialization: 'Love, Marriage & Compatibility',
    avatar: '💫',
    avatarBg: LinearGradient(
      colors: [Color(0xFFEC4899), Color(0xFFE11D48)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: true,
    rating: 4.8,
    experience: '20+ years',
    description: 'Specialist in relationship astrology, synastry, and marriage timing. Known for her empathetic approach and practical relationship guidance.',
    suggestedQuestions: [
      'When will I find my life partner?',
      'What does my chart say about marriage compatibility?',
      'How can I improve my current relationship based on astrology?',
    ],
    systemPromptAddOn: 'You are Jyoti Nanda, a warm, older-sisterly relationship astrologer with 20+ years of experience. You specialize in love, marriage timing, and compatibility analysis. You speak with high empathy, compassion, and practical guidance. You analyze Venus, Mars, 7th House, and Upapada Lagna, blending these with the user\'s trust and attachment style scores to address anxious/avoidant patterns. You enforce "Nothing to Hide" by addressing relationship dynamics honestly.',
  ),
  const _Astrologer(
    id: 'santanu-mishra',
    name: 'Santanu Mishra',
    title: 'Nakshatra Master',
    specialization: 'Nakshatra & Lunar Wisdom',
    avatar: '🌙',
    avatarBg: LinearGradient(
      colors: [Color(0xFF4F46E5), Color(0xFF6D28D9)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: false,
    rating: 4.7,
    experience: '25+ years',
    description: 'Deep expertise in Nakshatra-based analysis, lunar wisdom, and psychological astrology. Connects ancient star wisdom with modern emotional intelligence.',
    suggestedQuestions: [
      'What does my Nakshatra reveal about my personality?',
      'How does my Moon\'s Nakshatra affect my emotional world?',
      'What is the significance of my birth star in my life journey?',
    ],
    systemPromptAddOn: 'You are Santanu Mishra, a contemplative Nakshatra master with 25+ years of study. You speak thoughtfully, poetically, and introspectively. You specialize in Moon Nakshatras, lunar deity myths, and shadow work, connecting star placements with the user\'s emotionalIntensity and empathy scores. You look at core fears and unconscious emotional patterns. Your "Nothing to Hide" means showing that challenging Nakshatras are invitations to self-awareness, not doom.',
  ),
  const _Astrologer(
    id: 'dr-om-thakur',
    name: 'Dr. Om Thakur',
    title: 'Jyotish Acharya',
    specialization: 'Medical & Financial Astrology',
    avatar: '🔬',
    avatarBg: LinearGradient(
      colors: [Color(0xFF059669), Color(0xFF0D9488)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: true,
    rating: 4.9,
    experience: '30+ years',
    description: 'Holds a PhD in Jyotish and combines traditional Vedic astrology with modern analytical methods. Expert in medical and financial astrology predictions.',
    suggestedQuestions: [
      'What does my chart indicate about my health tendencies?',
      'When is a favorable period for financial investments?',
      'How can I use astrology for better decision-making in business?',
    ],
    systemPromptAddOn: 'You are Dr. Om Thakur, a methodical, scientific Jyotish Acharya with a PhD in Jyotish and 30+ years of practice. You specialize in medical and financial astrology, analyzing the 2nd & 11th houses (wealth) and 6th & 8th houses (health), as well as planet combustions and transits. You speak in an objective, analytical, clear, and logical tone, combining planetary positions with user trait scores. Your "Nothing to Hide" approach means delivering precise, realistic assessments, never false hope.',
  ),
  const _Astrologer(
    id: 'anjali-tripathi',
    name: 'Anjali Tripathi',
    title: 'Spiritual Counselor',
    specialization: 'Doshas, Remedies & Growth',
    avatar: '🙏',
    avatarBg: LinearGradient(
      colors: [Color(0xFFEAB308), Color(0xFFD97706)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: true,
    rating: 4.8,
    experience: '18+ years',
    description: 'Expert in identifying and remedying doshas, karmic patterns, and spiritual blocks. Combines astrology with practical spiritual counseling and mantra therapy.',
    suggestedQuestions: [
      'What doshas are present in my birth chart?',
      'What remedies can help balance my planetary energies?',
      'How can I work with my karmic patterns for spiritual growth?',
    ],
    systemPromptAddOn: 'You are Anjali Tripathi, a warm, protective spiritual counselor with 18+ years of experience in dosha analysis and remedies. You speak with clear authority, suggesting practical remedies like mantras, gemstones, and lifestyle changes to mitigate Sade Sati, Mangal Dosha, and karmic blocks. You address serious placements directly and honestly ("Nothing to Hide") and empower the user with proactive steps.',
  ),
  const _Astrologer(
    id: 'markandaya',
    name: 'Markandaya',
    title: 'Dasha & Timing Expert',
    specialization: 'Muhurta, Dasha & Timing',
    avatar: '⏳',
    avatarBg: LinearGradient(
      colors: [Color(0xFF475569), Color(0xFF374151)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    online: false,
    rating: 4.7,
    experience: '40+ years',
    description: 'The most experienced astrologer on the platform. Master of Vimshottari Dasha system, Muhurta (electional astrology), and precise timing of life events.',
    suggestedQuestions: [
      'What does my current Dasha period mean for my life?',
      'When is the best time to start a new venture?',
      'How do my upcoming planetary periods affect my life decisions?',
    ],
    systemPromptAddOn: 'You are Markandaya, the senior-most astrologer on the platform with 40+ years of mastery in Vimshottari Dasha systems and transits. You speak sparingly but with deep, sage-like weight. You focus on timing cycles, Dasha periods, and the concept of time ("Everything has its season"). You explain when to act and when to wait based on planetary periods. Your "Nothing to Hide" philosophy means providing realistic cycle timelines without sugarcoating.',
  ),
];

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  _Astrologer? _selectedAstrologer;
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _showSuggestions = true;
  int _lastMessageCount = 0;

  // For pulsing story outline
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage(AppState state, _Astrologer astrologer, String text) {
    if (text.trim().isEmpty) return;
    state.sendAstrologerMessage(astrologer.id, text, astrologer.systemPromptAddOn);
    _messageController.clear();
    setState(() {
      _showSuggestions = false;
    });
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_selectedAstrologer != null) {
      final messages = state.astrologerChats[_selectedAstrologer!.id] ?? [];
      if (messages.length > _lastMessageCount) {
        _lastMessageCount = messages.length;
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      } else if (messages.length < _lastMessageCount) {
        _lastMessageCount = messages.length;
      }

      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: StarFieldBackground(
          child: Column(
            children: [
              // ─── INDIVIDUAL CHAT HEADER ───
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
                        onPressed: () {
                          setState(() {
                            _selectedAstrologer = null;
                            _showSuggestions = true;
                            _lastMessageCount = 0;
                          });
                        },
                      ),
                      const SizedBox(width: 4),
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            child: Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: _selectedAstrologer!.avatarBg,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                _selectedAstrologer!.avatar,
                                style: const TextStyle(fontSize: 18),
                              ),
                            ),
                          ),
                          if (_selectedAstrologer!.online)
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isDark ? AppColors.darkBg : AppColors.cream,
                                    width: 1.5,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _selectedAstrologer!.name,
                              style: TextStyle(
                                color: isDark ? Colors.white : AppColors.brown900,
                                fontFamily: 'Playfair Display',
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            Row(
                              children: [
                                Text(
                                  _selectedAstrologer!.title,
                                  style: const TextStyle(
                                    color: AppColors.goldDark,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Icon(Icons.star, color: Colors.amber, size: 10),
                                const SizedBox(width: 2),
                                Text(
                                  _selectedAstrologer!.rating.toString(),
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : AppColors.brown500,
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.trash_2, color: AppColors.brown500, size: 20),
                        onPressed: () {
                          state.clearAstrologerChat(_selectedAstrologer!.id);
                          setState(() {
                            _showSuggestions = true;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1),

              // ─── CHAT BODY ───
              Expanded(
                child: messages.isEmpty
                    ? _buildWelcomeCard(isDark)
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(20),
                        physics: const BouncingScrollPhysics(),
                        itemCount: messages.length + (state.isChatLoading ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == messages.length && state.isChatLoading) {
                            return _buildTypingIndicator(isDark);
                          }
                          return _buildChatBubble(messages[index], isDark);
                        },
                      ),
              ),

              // ─── RATE LIMIT REMAINING INDICATOR ───
              if (state.astrologerRemaining.containsKey(_selectedAstrologer!.id))
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: Text(
                    "Remaining messages this hour: ${state.astrologerRemaining[_selectedAstrologer!.id]}",
                    style: const TextStyle(
                      color: AppColors.brown400,
                      fontSize: 10,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),

              // ─── SUGGESTIONS ───
              if (_showSuggestions && messages.isEmpty)
                Container(
                  height: 48,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _selectedAstrologer!.suggestedQuestions.length,
                    itemBuilder: (context, index) {
                      final sug = _selectedAstrologer!.suggestedQuestions[index];
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ActionChip(
                          backgroundColor: isDark ? AppColors.darkCard : Colors.white,
                          side: const BorderSide(color: AppColors.gold, width: 0.5),
                          label: Text(
                            sug,
                            style: const TextStyle(color: AppColors.goldDark, fontSize: 11),
                          ),
                          onPressed: () => _sendMessage(state, _selectedAstrologer!, sug),
                        ),
                      );
                    },
                  ),
                ),

              // ─── INPUT AREA ───
              Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                  left: 16,
                  right: 16,
                  top: 8,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkCard : Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.brown100),
                        ),
                        child: Row(
                          children: [
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: _messageController,
                                style: TextStyle(
                                  color: isDark ? Colors.white : AppColors.brown900,
                                  fontSize: 13,
                                ),
                                maxLines: null,
                                decoration: InputDecoration(
                                  hintText: "Ask ${_selectedAstrologer!.name} anything...",
                                  hintStyle: const TextStyle(color: AppColors.brown400, fontSize: 13),
                                  border: InputBorder.none,
                                  isDense: true,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => _sendMessage(state, _selectedAstrologer!, _messageController.text),
                      child: CircleAvatar(
                        radius: 22,
                        backgroundColor: AppColors.gold,
                        child: const Icon(LucideIcons.send, color: Colors.white, size: 18),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Default: ASTROLOGER PICKER DASHBOARD
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: StarFieldBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── HEADER ───
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Vedic Consultations",
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontFamily: 'Playfair Display',
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            "Direct wisdom with Nothing to Hide",
                            style: TextStyle(
                              color: AppColors.brown500,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(LucideIcons.message_circle, color: AppColors.gold, size: 28),
                  ],
                ),
              ),

              // ─── ASTROLOGER STORIES ROW ───
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  "Online Consultations",
                  style: TextStyle(
                    color: AppColors.goldDark,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 80,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _astrologers.length,
                  itemBuilder: (context, index) {
                    final ast = _astrologers[index];
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedAstrologer = ast;
                          _lastMessageCount = 0;
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: Column(
                          children: [
                            AnimatedBuilder(
                              animation: _pulseController,
                              builder: (context, child) {
                                return Container(
                                  padding: const EdgeInsets.all(2.5),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: ast.online
                                          ? AppColors.gold.withValues(alpha: 0.3 + 0.7 * _pulseController.value)
                                          : Colors.transparent,
                                      width: 2.0,
                                    ),
                                  ),
                                  child: child,
                                );
                              },
                              child: CircleAvatar(
                                radius: 22,
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: ast.avatarBg,
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    ast.avatar,
                                    style: const TextStyle(fontSize: 20),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              ast.name.split(' ')[0],
                              style: TextStyle(
                                color: isDark ? Colors.white70 : AppColors.brown800,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const Divider(height: 1),

              // ─── VERTICAL LIST ───
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  itemCount: _astrologers.length,
                  itemBuilder: (context, index) {
                    final ast = _astrologers[index];

                    // Antigravity Design Rule: Staggered entry animation
                    return TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0.0, end: 1.0),
                      duration: Duration(milliseconds: 300 + (index * 80)),
                      curve: Curves.easeOut,
                      builder: (context, value, child) {
                        return Opacity(
                          opacity: value,
                          child: Transform.translate(
                            offset: Offset(0, 30 * (1 - value)),
                            child: child,
                          ),
                        );
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkCard : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark
                                ? AppColors.brown100.withValues(alpha: 0.1)
                                : AppColors.brown100.withValues(alpha: 0.4),
                            width: 0.8,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  _selectedAstrologer = ast;
                                  _lastMessageCount = 0;
                                });
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Avatar
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 26,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              gradient: ast.avatarBg,
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              ast.avatar,
                                              style: const TextStyle(fontSize: 24),
                                            ),
                                          ),
                                        ),
                                        if (ast.online)
                                          Positioned(
                                            bottom: 0,
                                            right: 0,
                                            child: Container(
                                              width: 13,
                                              height: 13,
                                              decoration: BoxDecoration(
                                                color: Colors.green,
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: isDark ? AppColors.darkCard : Colors.white,
                                                  width: 2.0,
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(width: 16),
                                    // Content details
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                ast.name,
                                                style: TextStyle(
                                                  color: isDark ? Colors.white : AppColors.brown900,
                                                  fontFamily: 'Playfair Display',
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                ),
                                              ),
                                              Row(
                                                children: [
                                                  const Icon(Icons.star, color: Colors.amber, size: 13),
                                                  const SizedBox(width: 2),
                                                  Text(
                                                    ast.rating.toString(),
                                                    style: TextStyle(
                                                      color: isDark ? Colors.white70 : AppColors.brown500,
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            ast.title,
                                            style: const TextStyle(
                                              color: AppColors.goldDark,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            ast.description,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              color: AppColors.brown500,
                                              fontSize: 11,
                                              height: 1.45,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: AppColors.gold.withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Text(
                                                  ast.experience,
                                                  style: const TextStyle(
                                                    color: AppColors.goldDark,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Expanded(
                                                child: Text(
                                                  ast.specialization,
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(
                                                    color: AppColors.brown400,
                                                    fontSize: 10,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeCard(bool isDark) {
    // Antigravity Design Rule: Soft transparent weightless float look
    return Center(
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOutBack,
          builder: (context, value, child) {
            return Transform.scale(
              scale: value,
              child: child,
            );
          },
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard.withValues(alpha: 0.8) : Colors.white.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _selectedAstrologer!.avatar,
                  style: const TextStyle(fontSize: 48),
                ),
                const SizedBox(height: 16),
                Text(
                  _selectedAstrologer!.name,
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.brown900,
                    fontFamily: 'Playfair Display',
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                Text(
                  _selectedAstrologer!.title,
                  style: const TextStyle(
                    color: AppColors.goldDark,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _selectedAstrologer!.description,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.brown500,
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.brown100.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        "${_selectedAstrologer!.rating} rating",
                        style: TextStyle(
                          color: isDark ? Colors.white70 : AppColors.brown700,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text("|", style: TextStyle(color: AppColors.brown400)),
                      const SizedBox(width: 8),
                      const Icon(LucideIcons.flame, color: AppColors.gold, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        _selectedAstrologer!.experience,
                        style: TextStyle(
                          color: isDark ? Colors.white70 : AppColors.brown700,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChatBubble(ChatMessage message, bool isDark) {
    final isUser = message.role == 'user';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser
              ? AppColors.brown700
              : (isDark ? AppColors.darkCard : Colors.white),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
          border: isUser
              ? null
              : Border(
                  left: const BorderSide(color: AppColors.gold, width: 3.5),
                  top: BorderSide(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
                  right: BorderSide(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
                  bottom: BorderSide(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
                ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isUser ? 0.05 : 0.02),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Text(
          message.content,
          style: TextStyle(
            color: isUser ? Colors.white : (isDark ? Colors.white70 : AppColors.brown900),
            fontSize: 13,
            height: 1.4,
          ),
        ),
      ),
    );
  }

  Widget _buildTypingIndicator(bool isDark) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(18),
          ),
          border: Border.all(color: AppColors.brown100.withValues(alpha: 0.4), width: 0.8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "${_selectedAstrologer!.name} is writing",
              style: const TextStyle(
                color: AppColors.brown400,
                fontSize: 10,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (index) {
                return TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: Duration(milliseconds: 400 + (index * 150)),
                  builder: (context, value, child) {
                    return Transform.translate(
                      offset: Offset(0, -4 * value),
                      child: child,
                    );
                  },
                  child: Container(
                    width: 6,
                    height: 6,
                    margin: const EdgeInsets.symmetric(horizontal: 2.0),
                    decoration: const BoxDecoration(
                      color: AppColors.gold,
                      shape: BoxShape.circle,
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
