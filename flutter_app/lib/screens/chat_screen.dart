import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/models.dart';
import '../widgets/custom_widgets.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  final List<String> _suggestions = [
    "What is my dominant trait?",
    "Analyze my sun and moon signs",
    "What does my current dasha mean?",
    "What are my doshas and remedies?",
  ];

  bool _showSuggestions = true;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage(AppState state, String text) {
    if (text.trim().isEmpty) return;
    state.sendChatMessage(text);
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

    // Trigger scroll when history changes or loading changes
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: StarFieldBackground(
        child: Column(
          children: [
            // ─── CHAT HEADER ───
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Row(
                  children: [
                    const CircleAvatar(
                      backgroundColor: AppColors.gold,
                      child: Icon(LucideIcons.sparkles, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Cosmic Counselor",
                            style: TextStyle(
                              color: isDark ? Colors.white : AppColors.brown900,
                              fontFamily: 'Playfair Display',
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            state.isChatLoading ? "Counselor is tuning with stars..." : "Empathetic Vedic Guide",
                            style: TextStyle(
                              color: state.isChatLoading ? AppColors.gold : AppColors.brown500,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.trash_2, color: AppColors.brown500, size: 20),
                      onPressed: () {
                        state.clearChat();
                      },
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // ─── CHAT MESSAGES ───
            Expanded(
              child: state.chatMessages.isEmpty
                  ? _buildWelcomeMessage()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(20),
                      physics: const BouncingScrollPhysics(),
                      itemCount: state.chatMessages.length + (state.isChatLoading ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == state.chatMessages.length && state.isChatLoading) {
                          return _buildTypingIndicator();
                        }
                        return _buildChatBubble(state.chatMessages[index]);
                      },
                    ),
            ),

            // ─── SUGGESTIONS ───
            if (_showSuggestions && state.chatMessages.isEmpty)
              Container(
                height: 48,
                margin: const EdgeInsets.only(bottom: 8),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _suggestions.length,
                  itemBuilder: (context, index) {
                    final sug = _suggestions[index];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(
                        backgroundColor: isDark ? AppColors.darkCard : Colors.white,
                        side: const BorderSide(color: AppColors.gold, width: 0.5),
                        label: Text(sug, style: const TextStyle(color: AppColors.goldDark, fontSize: 11)),
                        onPressed: () => _sendMessage(state, sug),
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
                              style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontSize: 13),
                              maxLines: null,
                              decoration: const InputDecoration(
                                hintText: "Ask about your traits, dasha, or planets...",
                                hintStyle: TextStyle(color: AppColors.brown400, fontSize: 13),
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
                    onTap: () => _sendMessage(state, _messageController.text),
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

  Widget _buildWelcomeMessage() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text("🔮", style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text(
            "Greetings, Seeker.",
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.brown900,
              fontFamily: 'Playfair Display',
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "I am the AyuAstro Cosmic Counselor. I have analyzed your planetary coordinates, your behavioral traits, and your numerological blueprint. Ask me anything to understand your patterns deeper.",
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.brown500, fontSize: 13, height: 1.45),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBubble(ChatMessage message) {
    final isUser = message.role == 'user';
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser
              ? null
              : Border(
                  left: const BorderSide(color: AppColors.gold, width: 3.5),
                  top: BorderSide(color: AppColors.brown100, width: 0.5),
                  right: BorderSide(color: AppColors.brown100, width: 0.5),
                  bottom: BorderSide(color: AppColors.brown100, width: 0.5),
                ),
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

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkCard : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(16),
          ),
          border: Border.all(color: AppColors.brown100),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            return Container(
              width: 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
            );
          }),
        ),
      ),
    );
  }
}
