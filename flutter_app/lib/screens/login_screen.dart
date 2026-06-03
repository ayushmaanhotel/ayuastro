import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  
  bool _isSignUp = false;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  
  bool _obscurePassword = true;
  String? _localError;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _localError = null;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final state = Provider.of<AppState>(context, listen: false);

    try {
      if (_isSignUp) {
        await state.registerUser(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
      } else {
        await state.loginUser(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
      }
    } catch (e) {
      setState(() {
        _localError = e.toString().replaceAll('Exception:', '').trim();
      });
    }
  }

  Future<void> _forgotPassword() async {
    final TextEditingController emailResetController = TextEditingController(text: _emailController.text);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) {
        bool sending = false;
        String? errorMsg;
        String? successMsg;

        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: isDark ? AppColors.darkCard : Colors.white,
              title: const Text(
                "Reset Password",
                style: TextStyle(fontFamily: 'Playfair Display', fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    "Enter your email address to receive a secure link to reset your password.",
                    style: TextStyle(color: AppColors.brown500, fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  if (errorMsg != null) ...[
                    Text(
                      errorMsg!,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (successMsg != null) ...[
                    Text(
                      successMsg!,
                      style: const TextStyle(color: AppColors.sage, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                  ],
                  TextFormField(
                    controller: emailResetController,
                    keyboardType: TextInputType.emailAddress,
                    style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                    decoration: InputDecoration(
                      hintText: "you@example.com",
                      hintStyle: const TextStyle(color: AppColors.brown400, fontSize: 13),
                      prefixIcon: const Icon(LucideIcons.mail, color: AppColors.gold, size: 18),
                      filled: true,
                      fillColor: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.03),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.2)),
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  child: const Text("Cancel", style: TextStyle(color: AppColors.brown500)),
                  onPressed: () => Navigator.pop(context),
                ),
                sending
                    ? const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2),
                        ),
                      )
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: successMsg != null
                            ? () => Navigator.pop(context)
                            : () async {
                                final email = emailResetController.text.trim();
                                if (email.isEmpty) {
                                  setStateDialog(() {
                                    errorMsg = "Email is required";
                                  });
                                  return;
                                }

                                setStateDialog(() {
                                  sending = true;
                                  errorMsg = null;
                                });

                                try {
                                  final state = Provider.of<AppState>(context, listen: false);
                                  await state.forgotPassword(email: email);
                                  setStateDialog(() {
                                    sending = false;
                                    successMsg = "Password reset link sent! Check your inbox.";
                                  });
                                } catch (e) {
                                  setStateDialog(() {
                                    sending = false;
                                    errorMsg = e.toString().replaceAll('Exception:', '').trim();
                                  });
                                }
                              },
                        child: Text(
                          successMsg != null ? "Done" : "Send Link",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      body: StarFieldBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Back button
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      icon: Icon(
                        LucideIcons.arrow_left,
                        color: isDark ? Colors.white70 : AppColors.brown700,
                      ),
                      onPressed: () => state.setView('landing'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Icon/Logo
                  const Center(
                    child: Text(
                      "🔮",
                      style: TextStyle(fontSize: 48),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Title & Subtitle
                  Text(
                    _isSignUp ? "Create Cosmic Profile" : "Welcome Seeker",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isDark ? Colors.white : AppColors.brown900,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Playfair Display',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isSignUp 
                        ? "Begin your journey into Vedic calculations" 
                        : "Sign in to access your birth charts and readings",
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.brown500,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  // Main Login Card
                  GlassPremiumCard(
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (_localError != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.red.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                _localError!,
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 12,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          
                          // Name Field (Only for Sign Up)
                          if (_isSignUp) ...[
                            Text(
                              "Full Name",
                              style: TextStyle(
                                color: isDark ? Colors.white70 : AppColors.brown700,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _nameController,
                              style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                              decoration: _buildInputDecoration(
                                hint: "Enter your full name",
                                icon: LucideIcons.user,
                                isDark: isDark,
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) {
                                  return "Name is required";
                                }
                                if (val.trim().length < 2) {
                                  return "Name must be at least 2 characters";
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                          ],
                          
                          // Email Field
                          Text(
                            "Email Address",
                            style: TextStyle(
                              color: isDark ? Colors.white70 : AppColors.brown700,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                            decoration: _buildInputDecoration(
                              hint: "you@example.com",
                              icon: LucideIcons.mail,
                              isDark: isDark,
                            ),
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                  return "Email is required";
                              }
                              final emailRegExp = RegExp(
                                  r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+");
                              if (!emailRegExp.hasMatch(val.trim())) {
                                return "Enter a valid email address";
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Password Field
                          Text(
                            "Password",
                            style: TextStyle(
                              color: isDark ? Colors.white70 : AppColors.brown700,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                            decoration: _buildInputDecoration(
                              hint: "••••••",
                              icon: LucideIcons.lock,
                              isDark: isDark,
                              suffix: IconButton(
                                icon: Icon(
                                  _obscurePassword ? LucideIcons.eye_off : LucideIcons.eye,
                                  color: AppColors.gold,
                                  size: 18,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                            ),
                            validator: (val) {
                              if (val == null || val.isEmpty) {
                                return "Password is required";
                              }
                              if (val.length < 6) {
                                return "Password must be at least 6 characters";
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 8),
                          if (!_isSignUp)
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: _forgotPassword,
                                child: const Text(
                                  "Forgot Password?",
                                  style: TextStyle(
                                    color: AppColors.goldDark,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          const SizedBox(height: 24),
                          
                          // Submit Button
                          state.isLoading
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 8),
                                    child: CircularProgressIndicator(color: AppColors.gold),
                                  ),
                                )
                              : NeonGoldButton(
                                  text: _isSignUp ? "Create Account" : "Access Blueprint",
                                  icon: LucideIcons.sparkles,
                                  onPressed: _submit,
                                ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Toggle Text
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isSignUp ? "Already have an account? " : "New seeker? ",
                        style: const TextStyle(color: AppColors.brown500, fontSize: 13),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isSignUp = !_isSignUp;
                            _localError = null;
                          });
                        },
                        child: Text(
                          _isSignUp ? "Sign In" : "Sign Up",
                          style: const TextStyle(
                            color: AppColors.goldDark,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String hint,
    required IconData icon,
    required bool isDark,
    Widget? suffix,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppColors.brown400, fontSize: 13),
      prefixIcon: Icon(icon, color: AppColors.gold, size: 18),
      suffixIcon: suffix,
      filled: true,
      fillColor: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.6),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.2)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.gold, width: 1.2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.redAccent),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1.2),
      ),
    );
  }
}
