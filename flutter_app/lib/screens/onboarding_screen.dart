import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _nameController = TextEditingController();
  final _placeController = TextEditingController();
  final _latController = TextEditingController();
  final _lonController = TextEditingController();

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String _selectedGender = 'male';
  String _selectedRelationship = 'Single';

  // Cities mapping
  static const Map<String, Map<String, double>> cities = {
    'Mumbai': {'lat': 19.0760, 'lon': 72.8777},
    'New Delhi': {'lat': 28.6139, 'lon': 77.2090},
    'Bangalore': {'lat': 12.9716, 'lon': 77.5946},
    'Chennai': {'lat': 13.0827, 'lon': 80.2707},
    'Kolkata': {'lat': 22.5726, 'lon': 88.3639},
    'Hyderabad': {'lat': 17.3850, 'lon': 78.4867},
    'Pune': {'lat': 18.5204, 'lon': 73.8567},
    'Ahmedabad': {'lat': 23.0225, 'lon': 72.5714},
    'Jaipur': {'lat': 26.9124, 'lon': 75.7873},
  };

  // Questionnaire questions list (16 questions)
  final List<Map<String, dynamic>> _questions = [
    {
      'id': 'q_emotional_1',
      'text': 'I can easily sense when someone is upset, even before they say anything.',
      'category': 'emotional'
    },
    {
      'id': 'q_emotional_2',
      'text': 'I need significant alone time to recharge after emotionally intense situations.',
      'category': 'emotional'
    },
    {
      'id': 'q_emotional_3',
      'text': 'My emotions change quickly — I can go from calm to deeply moved in moments.',
      'category': 'emotional'
    },
    {
      'id': 'q_emotional_4',
      'text': 'I find it difficult to hide what I am truly feeling, even when I try.',
      'category': 'emotional'
    },
    {
      'id': 'q_social_1',
      'text': 'In group settings, I naturally take on the role of mediator or peacemaker.',
      'category': 'social'
    },
    {
      'id': 'q_social_2',
      'text': 'I prefer deep one-on-one conversations over large social gatherings.',
      'category': 'social'
    },
    {
      'id': 'q_social_3',
      'text': 'I feel energized when I can help someone work through a personal problem.',
      'category': 'social'
    },
    {
      'id': 'q_social_4',
      'text': 'I sometimes feel drained after being around too many people, even if I enjoyed it.',
      'category': 'social'
    },
    {
      'id': 'q_behavioral_1',
      'text': 'When faced with a difficult decision, I trust my gut feeling over logical analysis.',
      'category': 'behavioral'
    },
    {
      'id': 'q_behavioral_2',
      'text': 'I tend to revisit past conversations and analyze what I could have said differently.',
      'category': 'behavioral'
    },
    {
      'id': 'q_behavioral_3',
      'text': 'I am more driven by a sense of inner purpose than by external rewards or recognition.',
      'category': 'behavioral'
    },
    {
      'id': 'q_behavioral_4',
      'text': 'When something excites me, I pursue it with full intensity — but I can lose interest just as quickly.',
      'category': 'behavioral'
    },
    {
      'id': 'q_relational_1',
      'text': 'I am deeply affected by the emotional tone of my close relationships.',
      'category': 'relational'
    },
    {
      'id': 'q_relational_2',
      'text': 'I often put others\' needs before my own, even when it costs me personally.',
      'category': 'relational'
    },
    {
      'id': 'q_relational_3',
      'text': 'I crave emotional depth in my relationships — surface-level connections leave me unsatisfied.',
      'category': 'relational'
    },
    {
      'id': 'q_relational_4',
      'text': 'I find it hard to fully trust someone until they have consistently shown they understand me.',
      'category': 'relational'
    },
  ];

  final Map<String, int> _answers = {};

  @override
  void initState() {
    super.initState();
    _placeController.text = 'Mumbai';
    _latController.text = '19.0760';
    _lonController.text = '72.8777';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _placeController.dispose();
    _latController.dispose();
    _lonController.dispose();
    super.dispose();
  }

  void _onCityChanged(String cityName) {
    if (cities.containsKey(cityName)) {
      setState(() {
        _placeController.text = cityName;
        _latController.text = cities[cityName]!['lat']!.toString();
        _lonController.text = cities[cityName]!['lon']!.toString();
      });
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000, 1, 1),
      firstDate: DateTime(1900),
      lastDate: now,
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.gold,
            onPrimary: Colors.white,
            onSurface: AppColors.brown900,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 12, minute: 0),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.gold,
            onPrimary: Colors.white,
            onSurface: AppColors.brown900,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  void _submitData(AppState state) async {
    if (_selectedDate == null || _selectedTime == null) {
      _showSnackBar("Please select birth date and time");
      return;
    }

    final double lat = double.tryParse(_latController.text) ?? 19.0760;
    final double lon = double.tryParse(_lonController.text) ?? 72.8777;

    final dateStr = "${_selectedDate!.year.toString().padLeft(4, '0')}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}";
    final timeStr = "${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}";

    // Set details in provider state
    state.setBirthDetails(
      name: state.userName ?? 'Seeker',
      dateOfBirth: dateStr,
      timeOfBirth: timeStr,
      placeOfBirth: _placeController.text,
      latitude: lat,
      longitude: lon,
      timezone: 'Asia/Kolkata',
      gender: _selectedGender,
      relationshipStatus: _selectedRelationship,
    );

    // Feed the questionnaire answers to state
    _answers.forEach((qId, score) {
      final category = _questions.firstWhere((q) => q['id'] == qId)['category'];
      state.addQuestionnaireAnswer(
        qId,
        _getLikertLabel(score),
        category,
        score,
      );
    });

    // Run computation via API
    await state.fetchCalculations();

    if (state.error != null) {
      _showSnackBar("Computation failed: ${state.error}");
    }
  }

  String _getLikertLabel(int score) {
    switch (score) {
      case 1: return 'Strongly Disagree';
      case 2: return 'Disagree';
      case 3: return 'Neutral';
      case 4: return 'Agree';
      case 5: return 'Strongly Agree';
      default: return 'Neutral';
    }
  }

  void _showSnackBar(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        backgroundColor: AppColors.brown700,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (state.isLoading) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
        body: Center(
          child: CosmicLoader(message: state.loadingMessage),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBg : AppColors.cream,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrow_left, color: isDark ? Colors.white : AppColors.brown900),
          onPressed: () {
            if (state.onboardingStep == 'birth') {
              state.setView('login');
            } else if (state.onboardingStep == 'relationship') {
              state.setOnboardingStep('birth');
            } else if (state.onboardingStep == 'questionnaire') {
              state.setOnboardingStep('relationship');
            }
          },
        ),
        title: Text(
          "Cosmic Onboarding",
          style: TextStyle(
            color: isDark ? Colors.white : AppColors.brown900,
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
      ),
      body: StarFieldBackground(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Step Indicators
              _buildProgressIndicators(state.onboardingStep),
              const SizedBox(height: 24),

              // View switcher based on step
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: _buildStepContent(state),
                ),
              ),

              // Bottom Button bar
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: NeonGoldButton(
                  text: state.onboardingStep == 'questionnaire' ? "Generate Cosmic Profile" : "Continue",
                  icon: LucideIcons.arrow_right,
                  onPressed: () {
                    if (state.onboardingStep == 'birth') {
                      if (_selectedDate == null || _selectedTime == null || _placeController.text.isEmpty) {
                        _showSnackBar("Please fill in all birth details");
                        return;
                      }
                      state.setOnboardingStep('relationship');
                    } else if (state.onboardingStep == 'relationship') {
                      state.setOnboardingStep('questionnaire');
                    } else if (state.onboardingStep == 'questionnaire') {
                      // Check if all answers are filled
                      if (_answers.length < _questions.length) {
                        _showSnackBar("Please answer all questions before proceeding (${_answers.length}/${_questions.length})");
                        return;
                      }
                      _submitData(state);
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressIndicators(String currentStep) {
    int activeIndex = 0;
    if (currentStep == 'relationship') activeIndex = 1;
    if (currentStep == 'questionnaire') activeIndex = 2;

    final steps = ['Birth', 'Heart', 'Quiz'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(3, (index) {
        final isActive = index == activeIndex;
        final isCompleted = index < activeIndex;
        return Expanded(
          child: Row(
            children: [
              Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive
                      ? AppColors.gold
                      : (isCompleted ? AppColors.sage : AppColors.brown100),
                ),
                child: isCompleted
                    ? const Icon(LucideIcons.check, color: Colors.white, size: 14)
                    : Text(
                        (index + 1).toString(),
                        style: TextStyle(
                          color: isActive ? Colors.white : AppColors.brown500,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
              ),
              const SizedBox(width: 8),
              Text(
                steps[index],
                style: TextStyle(
                  color: isActive ? AppColors.gold : AppColors.brown500,
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              if (index < 2)
                Expanded(
                  child: Container(
                    height: 1.5,
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    color: index < activeIndex ? AppColors.sage : AppColors.brown100,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildStepContent(AppState state) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    switch (state.onboardingStep) {

      case 'birth':
        final dobLabel = _selectedDate == null
            ? "Pick Birth Date"
            : "${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}";
        final tobLabel = _selectedTime == null
            ? "Pick Birth Time"
            : _selectedTime!.format(context);

        return GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Celestial Coordinates",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Playfair Display',
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                "Precise date, time, and location are required to calculate your exact planetary longitudes.",
                style: TextStyle(color: AppColors.brown500, fontSize: 11),
              ),
              const SizedBox(height: 16),
              // Birth Date
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(dobLabel, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontWeight: FontWeight.w600)),
                subtitle: const Text("Date of Birth", style: TextStyle(fontSize: 11)),
                leading: const CircleAvatar(
                  backgroundColor: AppColors.sageLight,
                  child: Icon(LucideIcons.calendar, color: AppColors.sage),
                ),
                trailing: const Icon(LucideIcons.chevron_right, color: AppColors.gold),
                onTap: _pickDate,
              ),
              const Divider(height: 20),
              // Birth Time
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(tobLabel, style: TextStyle(color: isDark ? Colors.white : AppColors.brown900, fontWeight: FontWeight.w600)),
                subtitle: const Text("Time of Birth", style: TextStyle(fontSize: 11)),
                leading: const CircleAvatar(
                  backgroundColor: AppColors.sageLight,
                  child: Icon(LucideIcons.clock, color: AppColors.sage),
                ),
                trailing: const Icon(LucideIcons.chevron_right, color: AppColors.gold),
                onTap: _pickTime,
              ),
              const Divider(height: 20),
              // Birth City
              const Text(
                "Place of Birth (India Cities)",
                style: TextStyle(color: AppColors.brown500, fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _placeController.text,
                style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                dropdownColor: isDark ? AppColors.darkCard : Colors.white,
                decoration: InputDecoration(
                  prefixIcon: const Icon(LucideIcons.map_pin, color: AppColors.gold),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.brown100),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: cities.keys.map((city) {
                  return DropdownMenuItem<String>(
                    value: city,
                    child: Text(city),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) _onCityChanged(val);
                },
              ),
              const SizedBox(height: 16),
              // Lat/Lon textfields
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _latController,
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                      decoration: const InputDecoration(labelText: "Latitude", labelStyle: TextStyle(fontSize: 11)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      controller: _lonController,
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: isDark ? Colors.white : AppColors.brown900),
                      decoration: const InputDecoration(labelText: "Longitude", labelStyle: TextStyle(fontSize: 11)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                "Select Gender",
                style: TextStyle(color: AppColors.brown500, fontWeight: FontWeight.bold, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildGenderChip('male', '♂ Male'),
                  const SizedBox(width: 12),
                  _buildGenderChip('female', '♀ Female'),
                  const SizedBox(width: 12),
                  _buildGenderChip('other', '✦ Other'),
                ],
              ),
            ],
          ),
        );

      case 'relationship':
        return GlassPremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Relationship Status",
                style: TextStyle(
                  color: AppColors.goldDark,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Playfair Display',
                ),
              ),
              const SizedBox(height: 16),
              ...['Single', 'Partnered', "It's Complicated", 'Prefer Not to Say'].map((status) {
                final isSelected = _selectedRelationship == status;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedRelationship = status;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.gold.withOpacity(0.12)
                            : (isDark ? Colors.white.withOpacity(0.03) : AppColors.cream.withOpacity(0.5)),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.gold : AppColors.brown100,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            status,
                            style: TextStyle(
                              color: isSelected
                                  ? AppColors.goldDark
                                  : (isDark ? Colors.white : AppColors.brown900),
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 14,
                            ),
                          ),
                          if (isSelected)
                            const Icon(LucideIcons.heart, color: AppColors.gold, size: 18),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        );

      case 'questionnaire':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header stats
            Text(
              "Behavioral Questionnaire (${_answers.length}/${_questions.length})",
              style: TextStyle(
                color: isDark ? Colors.white : AppColors.brown900,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                fontFamily: 'Playfair Display',
              ),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _questions.isEmpty ? 0 : _answers.length / _questions.length,
                minHeight: 6,
                color: AppColors.gold,
                backgroundColor: AppColors.brown100,
              ),
            ),
            const SizedBox(height: 16),
            ..._questions.map((q) => _buildQuestionCard(q)).toList(),
          ],
        );

      default:
        return const Center(child: Text("Invalid Step"));
    }
  }

  Widget _buildGenderChip(String value, String label) {
    final isSelected = _selectedGender == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Expanded(
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.gold.withOpacity(0.2),
        backgroundColor: isDark ? Colors.white.withOpacity(0.04) : Colors.white,
        side: BorderSide(
          color: isSelected ? AppColors.gold : AppColors.brown100,
          width: isSelected ? 1.5 : 1,
        ),
        labelStyle: TextStyle(
          color: isSelected 
              ? AppColors.goldDark 
              : (isDark ? Colors.white70 : AppColors.brown700),
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
        onSelected: (bool selected) {
          if (selected) {
            setState(() {
              _selectedGender = value;
            });
          }
        },
      ),
    );
  }

  Widget _buildQuestionCard(Map<String, dynamic> q) {
    final qId = q['id'] as String;
    final text = q['text'] as String;
    final selectedVal = _answers[qId] ?? 0;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: GlassLightCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              text,
              style: TextStyle(
                color: isDark ? Colors.white : AppColors.brown900,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(5, (index) {
                final score = index + 1;
                final isSelected = selectedVal == score;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _answers[qId] = score;
                    });
                  },
                  child: Container(
                    width: 44,
                    height: 44,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.gold
                          : (isDark ? Colors.white.withOpacity(0.04) : Colors.white),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? AppColors.gold : AppColors.brown100,
                        width: 1.2,
                      ),
                    ),
                    child: Text(
                      score.toString(),
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.brown700,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                );
              }),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.0, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Disagree", style: TextStyle(fontSize: 10, color: AppColors.brown400)),
                  Text("Agree", style: TextStyle(fontSize: 10, color: AppColors.brown400)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
