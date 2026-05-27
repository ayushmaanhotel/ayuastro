import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/app_state.dart';
import '../widgets/custom_widgets.dart';

// ─── Data Models ─────────────────────────────────────────────────────────────
class SoundChannel {
  final String id;
  final String name;
  final String emoji;
  bool isPlaying;
  double volume; // 0.0 to 1.0 (local channel volume)

  SoundChannel({
    required this.id,
    required this.name,
    required this.emoji,
    this.isPlaying = false,
    this.volume = 0.0,
  });
}

class PresetScene {
  final String id;
  final String name;
  final String emoji;
  final Map<String, double> volumes; // sound id -> local volume (0.0 to 1.0)

  const PresetScene({
    required this.id,
    required this.name,
    required this.emoji,
    required this.volumes,
  });
}

// ─── Constants ──────────────────────────────────────────────────────────────
final List<PresetScene> _presetScenes = [
  const PresetScene(
    id: 'deep-meditation',
    name: 'Deep Meditation',
    emoji: '🧘',
    volumes: {
      'rain': 0.0,
      'ocean': 0.0,
      'fireplace': 0.0,
      'forest': 0.0,
      'cosmic': 0.6,
      'singingBowl': 0.8,
      'crickets': 0.0,
      'wind': 0.3,
    },
  ),
  const PresetScene(
    id: 'sleep-harmony',
    name: 'Sleep Harmony',
    emoji: '🌙',
    volumes: {
      'rain': 0.7,
      'ocean': 0.5,
      'fireplace': 0.0,
      'forest': 0.0,
      'cosmic': 0.0,
      'singingBowl': 0.0,
      'crickets': 0.4,
      'wind': 0.0,
    },
  ),
  const PresetScene(
    id: 'forest-bathing',
    name: 'Forest Bathing',
    emoji: '🌲',
    volumes: {
      'rain': 0.2,
      'ocean': 0.0,
      'fireplace': 0.0,
      'forest': 0.9,
      'cosmic': 0.0,
      'singingBowl': 0.0,
      'crickets': 0.0,
      'wind': 0.3,
    },
  ),
  const PresetScene(
    id: 'cosmic-journey',
    name: 'Cosmic Journey',
    emoji: '✨',
    volumes: {
      'rain': 0.0,
      'ocean': 0.0,
      'fireplace': 0.0,
      'forest': 0.0,
      'cosmic': 0.8,
      'singingBowl': 0.5,
      'crickets': 0.0,
      'wind': 0.4,
    },
  ),
];

final List<Map<String, dynamic>> _timerDurations = [
  {'label': '5 min', 'seconds': 300},
  {'label': '10 min', 'seconds': 600},
  {'label': '15 min', 'seconds': 900},
  {'label': '30 min', 'seconds': 1800},
  {'label': '60 min', 'seconds': 3600},
];

// ─── Main Screen Widget ──────────────────────────────────────────────────────
class CosmicSoundsScreen extends StatefulWidget {
  const CosmicSoundsScreen({Key? key}) : super(key: key);

  @override
  State<CosmicSoundsScreen> createState() => _CosmicSoundsScreenState();
}

class _CosmicSoundsScreenState extends State<CosmicSoundsScreen> with TickerProviderStateMixin {
  // Sound channels state
  final List<SoundChannel> _channels = [
    SoundChannel(id: 'rain', name: 'Rain', emoji: '🌧️'),
    SoundChannel(id: 'ocean', name: 'Ocean', emoji: '🌊'),
    SoundChannel(id: 'fireplace', name: 'Fireplace', emoji: '🔥'),
    SoundChannel(id: 'forest', name: 'Forest', emoji: '🌲'),
    SoundChannel(id: 'cosmic', name: 'Cosmic', emoji: '⭐'),
    SoundChannel(id: 'singingBowl', name: 'Singing Bowl', emoji: '🎵'),
    SoundChannel(id: 'crickets', name: 'Night Crickets', emoji: '🦗'),
    SoundChannel(id: 'wind', name: 'Wind', emoji: '💨'),
  ];

  double _masterVolume = 0.75;
  String? _activePresetId;

  // Timer state
  int _selectedDurationSeconds = 600; // 10 min default
  bool _timerRunning = false;
  bool _timerPaused = false;
  int _timeRemainingSeconds = 600;
  bool _timerComplete = false;
  int _sessionsCompleted = 0;
  Timer? _countdownTimer;

  // Animations controllers
  late AnimationController _ambientController;
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _ambientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _ambientController.dispose();
    _waveController.dispose();
    super.dispose();
  }

  // Timer Handlers
  void _startTimer() {
    _countdownTimer?.cancel();
    setState(() {
      _timeRemainingSeconds = _selectedDurationSeconds;
      _timerRunning = true;
      _timerPaused = false;
      _timerComplete = false;
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timerPaused) return;

      setState(() {
        if (_timeRemainingSeconds > 1) {
          _timeRemainingSeconds--;
        } else {
          _timeRemainingSeconds = 0;
          _timerRunning = false;
          _timerComplete = true;
          _sessionsCompleted++;
          _countdownTimer?.cancel();
          _pauseAll();
        }
      });
    });
  }

  void _togglePauseTimer() {
    setState(() {
      _timerPaused = !_timerPaused;
    });
  }

  void _resetTimer() {
    _countdownTimer?.cancel();
    setState(() {
      _timerRunning = false;
      _timerPaused = false;
      _timeRemainingSeconds = _selectedDurationSeconds;
      _timerComplete = false;
    });
  }

  void _selectDuration(int seconds) {
    setState(() {
      _selectedDurationSeconds = seconds;
      _timeRemainingSeconds = seconds;
      _timerRunning = false;
      _timerPaused = false;
      _timerComplete = false;
    });
  }

  // Channel Handlers
  void _toggleChannel(String id) {
    setState(() {
      final idx = _channels.indexWhere((c) => c.id == id);
      if (idx >= 0) {
        final channel = _channels[idx];
        channel.isPlaying = !channel.isPlaying;
        if (channel.isPlaying && channel.volume == 0.0) {
          channel.volume = 0.5;
        }
      }
      _activePresetId = null;
    });
  }

  void _setChannelVolume(String id, double volume) {
    setState(() {
      final idx = _channels.indexWhere((c) => c.id == id);
      if (idx >= 0) {
        final channel = _channels[idx];
        channel.volume = volume;
        if (volume > 0.0) {
          channel.isPlaying = true;
        }
      }
      _activePresetId = null;
    });
  }

  void _playAll() {
    setState(() {
      for (final c in _channels) {
        c.isPlaying = true;
        if (c.volume == 0.0) {
          c.volume = 0.5;
        }
      }
      _activePresetId = null;
    });
  }

  void _pauseAll() {
    setState(() {
      for (final c in _channels) {
        c.isPlaying = false;
      }
    });
  }

  void _resetAll() {
    setState(() {
      for (final c in _channels) {
        c.isPlaying = false;
        c.volume = 0.0;
      }
      _activePresetId = null;
    });
  }

  void _applyPreset(PresetScene preset) {
    setState(() {
      _activePresetId = preset.id;
      for (final c in _channels) {
        final vol = preset.volumes[c.id] ?? 0.0;
        c.volume = vol;
        c.isPlaying = vol > 0.0;
      }
    });
  }

  bool _anyPlaying() => _channels.any((c) => c.isPlaying);
  bool _allPlaying() => _channels.every((c) => c.isPlaying);
  int _activeCount() => _channels.where((c) => c.isPlaying).length;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = Provider.of<AppState>(context);

    final hasRain = _channels.firstWhere((c) => c.id == 'rain').isPlaying;
    final hasCosmic = _channels.firstWhere((c) => c.id == 'cosmic').isPlaying;

    return WillPopScope(
      onWillPop: () async {
        state.setView('breathing');
        return false;
      },
      child: Scaffold(
        backgroundColor: Colors.transparent, // Controlled by atmospheric painter
        body: Stack(
          children: [
            // ─── Atmospheric Custom Background ───
            AnimatedBuilder(
              animation: _ambientController,
              builder: (context, _) {
                return CustomPaint(
                  size: Size.infinite,
                  painter: _AtmosphericBackgroundPainter(
                    ambientProgress: _ambientController.value,
                    anyPlaying: _anyPlaying(),
                    hasRain: hasRain,
                    hasCosmic: hasCosmic,
                  ),
                );
              },
            ),

            // ─── Scrollable Controls ───
            SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Row
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 24),
                          onPressed: () => state.setView('breathing'),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Cosmic Sounds',
                              style: TextStyle(
                                fontFamily: 'Playfair Display',
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Ambient soundscapes for meditation',
                              style: TextStyle(fontSize: 12, color: Colors.white60),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.gold.withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.music, color: AppColors.gold, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                '${_activeCount()} active',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.gold,
                                ),
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // ─── Master Volume card ───
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D2320).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.gold.withOpacity(0.1)),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    _masterVolume > 0.0 ? LucideIcons.volume_2 : LucideIcons.volume_x,
                                    color: AppColors.gold,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Master Volume',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.cream,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                '${(_masterVolume * 100).round()}%',
                                style: const TextStyle(fontSize: 11, color: Colors.white70),
                              )
                            ],
                          ),
                          const SizedBox(height: 12),
                          SliderTheme(
                            data: SliderThemeData(
                              activeTrackColor: AppColors.gold,
                              inactiveTrackColor: Colors.white24,
                              thumbColor: AppColors.gold,
                              trackHeight: 3,
                              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                            ),
                            child: Slider(
                              value: _masterVolume,
                              onChanged: (v) {
                                setState(() {
                                  _masterVolume = v;
                                });
                              },
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextButton.icon(
                                  onPressed: _allPlaying() ? _pauseAll : _playAll,
                                  icon: Icon(
                                    _allPlaying() ? LucideIcons.pause : LucideIcons.play,
                                    size: 14,
                                    color: AppColors.gold,
                                  ),
                                  label: Text(
                                    _allPlaying() ? 'Pause All' : 'Play All',
                                    style: const TextStyle(fontSize: 11, color: AppColors.gold, fontWeight: FontWeight.bold),
                                  ),
                                  style: TextButton.styleFrom(
                                    backgroundColor: AppColors.gold.withOpacity(0.12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _resetAll,
                                  icon: const Icon(LucideIcons.rotate_ccw, size: 14, color: Colors.white70),
                                  label: const Text(
                                    'Reset All',
                                    style: TextStyle(fontSize: 11, color: Colors.white70),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Colors.white24),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Preset Scenes card ───
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D2320).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.gold.withOpacity(0.1)),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(LucideIcons.sparkles, color: AppColors.gold, size: 16),
                              SizedBox(width: 8),
                              Text(
                                'Preset Scenes',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.cream,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _presetScenes.length,
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 10,
                              childAspectRatio: 2.1,
                            ),
                            itemBuilder: (context, idx) {
                              final scene = _presetScenes[idx];
                              final isSelected = _activePresetId == scene.id;
                              return GestureDetector(
                                onTap: () => _applyPreset(scene),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppColors.gold.withOpacity(0.15)
                                        : Colors.white.withOpacity(0.04),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: isSelected
                                          ? AppColors.gold.withOpacity(0.4)
                                          : Colors.white10,
                                    ),
                                  ),
                                  padding: const EdgeInsets.all(10),
                                  child: Stack(
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(scene.emoji, style: const TextStyle(fontSize: 18)),
                                          const SizedBox(height: 4),
                                          Text(
                                            scene.name,
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: isSelected ? AppColors.gold : AppColors.cream,
                                            ),
                                          )
                                        ],
                                      ),
                                      if (isSelected)
                                        const Positioned(
                                          top: 0,
                                          right: 0,
                                          child: Icon(Icons.check_circle, color: AppColors.gold, size: 14),
                                        ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Sound Mixer Channels ───
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D2320).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.gold.withOpacity(0.1)),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(LucideIcons.music, color: AppColors.gold, size: 16),
                              SizedBox(width: 8),
                              Text(
                                'Sound Mixer',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.cream,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _channels.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, idx) {
                              final channel = _channels[idx];
                              final effectiveVol = (channel.volume * _masterVolume * 100).round();

                              return Container(
                                decoration: BoxDecoration(
                                  color: channel.isPlaying
                                      ? AppColors.gold.withOpacity(0.05)
                                      : Colors.white.withOpacity(0.03),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: channel.isPlaying
                                        ? AppColors.gold.withOpacity(0.2)
                                        : Colors.white.withOpacity(0.05),
                                  ),
                                ),
                                padding: const EdgeInsets.all(10),
                                child: Row(
                                  children: [
                                    // Emoji Container
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: channel.isPlaying
                                            ? AppColors.gold.withOpacity(0.1)
                                            : Colors.white.withOpacity(0.05),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(channel.emoji, style: const TextStyle(fontSize: 20)),
                                    ),
                                    const SizedBox(width: 10),

                                    // Mixer Details
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                channel.name,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: channel.isPlaying ? AppColors.gold : Colors.white70,
                                                ),
                                              ),
                                              Row(
                                                children: [
                                                  if (channel.isPlaying)
                                                    _AnimatedWaveformIndicator(
                                                      waveProgress: _waveController.value,
                                                    ),
                                                  const SizedBox(width: 6),
                                                  Text(
                                                    '$effectiveVol%',
                                                    style: const TextStyle(fontSize: 10, color: Colors.white38),
                                                  )
                                                ],
                                              )
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          SliderTheme(
                                            data: SliderThemeData(
                                              activeTrackColor: AppColors.gold,
                                              inactiveTrackColor: Colors.white10,
                                              thumbColor: AppColors.gold,
                                              trackHeight: 2,
                                              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5),
                                            ),
                                            child: Slider(
                                              value: channel.volume,
                                              onChanged: (v) => _setChannelVolume(channel.id, v),
                                            ),
                                          )
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 10),

                                    // Toggle Button
                                    GestureDetector(
                                      onTap: () => _toggleChannel(channel.id),
                                      child: Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: channel.isPlaying
                                              ? AppColors.gold.withOpacity(0.15)
                                              : Colors.white.withOpacity(0.05),
                                          border: Border.all(
                                            color: channel.isPlaying
                                                ? AppColors.gold.withOpacity(0.3)
                                                : Colors.white10,
                                          ),
                                        ),
                                        child: Icon(
                                          channel.isPlaying ? LucideIcons.pause : LucideIcons.play,
                                          color: channel.isPlaying ? AppColors.gold : Colors.white54,
                                          size: 14,
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Session Timer card ───
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D2320).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.gold.withOpacity(0.1)),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: const [
                                  Icon(LucideIcons.timer, color: AppColors.gold, size: 16),
                                  SizedBox(width: 8),
                                  Text(
                                    'Session Timer',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.cream,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '$_sessionsCompleted completed',
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.gold,
                                  ),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Duration selectors
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: _timerDurations.map((d) {
                                final label = d['label'] as String;
                                final seconds = d['seconds'] as int;
                                final isSelected = _selectedDurationSeconds == seconds;

                                return Padding(
                                  padding: const EdgeInsets.only(right: 6.0),
                                  child: GestureDetector(
                                    onTap: _timerRunning ? null : () => _selectDuration(seconds),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: isSelected && !_timerRunning
                                            ? AppColors.gold.withOpacity(0.15)
                                            : Colors.white.withOpacity(0.04),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: isSelected && !_timerRunning
                                              ? AppColors.gold.withOpacity(0.3)
                                              : Colors.transparent,
                                        ),
                                      ),
                                      child: Text(
                                        label,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: _timerRunning
                                              ? Colors.white24
                                              : (isSelected ? AppColors.gold : Colors.white60),
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Timer Orb / Complete State
                          Center(
                            child: _timerComplete
                                ? Column(
                                    children: [
                                      const Text(
                                        '✦',
                                        style: TextStyle(fontSize: 32, color: AppColors.gold),
                                      ),
                                      const SizedBox(height: 6),
                                      const Text(
                                        'Session Complete ✦',
                                        style: TextStyle(
                                          fontFamily: 'Playfair Display',
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.gold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Your soundscape journey has ended',
                                        style: TextStyle(fontSize: 12, color: Colors.white54),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton.icon(
                                        onPressed: () {
                                          setState(() {
                                            _timeRemainingSeconds = _selectedDurationSeconds;
                                            _timerComplete = false;
                                          });
                                        },
                                        icon: const Icon(LucideIcons.rotate_ccw, size: 14),
                                        label: const Text('New Session'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.gold.withOpacity(0.2),
                                          foregroundColor: AppColors.gold,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                      ),
                                    ],
                                  )
                                : Column(
                                    children: [
                                      SizedBox(
                                        width: 140,
                                        height: 140,
                                        child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            CustomPaint(
                                              size: const Size(140, 140),
                                              painter: _TimerProgressPainter(
                                                progress: 1.0 - (_timeRemainingSeconds / _selectedDurationSeconds),
                                              ),
                                            ),
                                            Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  '${_timeRemainingSeconds ~/ 60}:${(_timeRemainingSeconds % 60).toString().padLeft(2, '0')}',
                                                  style: const TextStyle(
                                                    fontFamily: 'Playfair Display',
                                                    fontSize: 26,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppColors.cream,
                                                  ),
                                                ),
                                                const Text(
                                                  'remaining',
                                                  style: TextStyle(fontSize: 9, color: Colors.white30),
                                                )
                                              ],
                                            )
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 16),

                                      // Timer Controls
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          if (!_timerRunning)
                                            ElevatedButton.icon(
                                              onPressed: _startTimer,
                                              icon: const Icon(LucideIcons.play, size: 14),
                                              label: const Text('Start'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.gold.withOpacity(0.2),
                                                foregroundColor: AppColors.gold,
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                              ),
                                            )
                                          else ...[
                                            ElevatedButton.icon(
                                              onPressed: _togglePauseTimer,
                                              icon: Icon(_timerPaused ? LucideIcons.play : LucideIcons.pause, size: 14),
                                              label: Text(_timerPaused ? 'Resume' : 'Pause'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.gold.withOpacity(0.2),
                                                foregroundColor: AppColors.gold,
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            OutlinedButton.icon(
                                              onPressed: _resetTimer,
                                              icon: const Icon(LucideIcons.rotate_ccw, size: 14, color: Colors.white70),
                                              label: const Text('Reset', style: TextStyle(color: Colors.white70)),
                                              style: OutlinedButton.styleFrom(
                                                side: const BorderSide(color: Colors.white24),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                              ),
                                            )
                                          ]
                                        ],
                                      )
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

// ─── Custom Painter for Atmospheric Twinkling Stars & Falling Rain ──────────
class _AtmosphericBackgroundPainter extends CustomPainter {
  final double ambientProgress;
  final bool anyPlaying;
  final bool hasRain;
  final bool hasCosmic;

  const _AtmosphericBackgroundPainter({
    required this.ambientProgress,
    required this.anyPlaying,
    required this.hasRain,
    required this.hasCosmic,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Draw base atmospheric gradients
    final bgPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF1A1410), Color(0xFF2D2320), Color(0xFF1A1410)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, w, h));
    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

    if (anyPlaying) {
      final glowPaint = Paint()
        ..shader = RadialGradient(
          center: const Alignment(0, -0.4),
          radius: 1.1,
          colors: [
            const Color(0xFFD4AF37).withOpacity(0.12),
            const Color(0xFFA5D6A7).withOpacity(0.04),
            Colors.transparent,
          ],
        ).createShader(Rect.fromLTWH(0, 0, w, h));
      canvas.drawRect(Rect.fromLTWH(0, 0, w, h), glowPaint);
    }

    // 2. Draw falling rain lines (simulate 30 drops)
    if (hasRain) {
      final rainPaint = Paint()
        ..strokeWidth = 1.0
        ..shader = const LinearGradient(
          colors: [Colors.transparent, Color(0x3093C5FD), Colors.transparent],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTWH(0, 0, w, h));

      for (int i = 0; i < 30; i++) {
        // Deterministic positioning based on index
        final double x = ((i / 30.0) * w) + (sin(i.toDouble()) * 15.0);
        final double velocityScale = 1.0 + (cos(i.toDouble()) * 0.3);
        final double progressOffset = i * 0.033;
        final double progress = (ambientProgress * velocityScale + progressOffset) % 1.0;
        final double y = progress * (h + 100) - 50;

        canvas.drawLine(Offset(x, y), Offset(x, y + 50), rainPaint);
      }
    }

    // 3. Draw twinkling stars (simulate 25 stars)
    if (hasCosmic) {
      final starPaint = Paint()..color = AppColors.gold;

      for (int i = 0; i < 25; i++) {
        // Deterministic positioning
        final double x = (cos(i * 1.5) * 0.5 + 0.5) * w;
        final double y = (sin(i * 2.3) * 0.5 + 0.5) * h;
        
        // Sinusoidal opacity oscillation
        final double twinkle = sin(ambientProgress * 2 * pi + i) * 0.4 + 0.5;
        starPaint.color = AppColors.gold.withOpacity(twinkle.clamp(0.0, 1.0));

        canvas.drawCircle(Offset(x, y), 1.2, starPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _AtmosphericBackgroundPainter oldDelegate) {
    return oldDelegate.ambientProgress != ambientProgress ||
        oldDelegate.anyPlaying != anyPlaying ||
        oldDelegate.hasRain != hasRain ||
        oldDelegate.hasCosmic != hasCosmic;
  }
}

// ─── Custom Painter for Circular Progress Timer ──────────────────────────────
class _TimerProgressPainter extends CustomPainter {
  final double progress;

  _TimerProgressPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = (size.width - 8) / 2;

    // Draw background ring
    final bgPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    canvas.drawCircle(Offset(cx, cy), radius, bgPaint);

    // Draw active gold ring
    final activePaint = Paint()
      ..color = AppColors.gold.withOpacity(0.8)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3;

    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: radius),
      -pi / 2,
      2 * pi * progress,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _TimerProgressPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

// ─── Simulated Animated Waveform Indicator ───────────────────────────────────
class _AnimatedWaveformIndicator extends StatelessWidget {
  final double waveProgress;

  const _AnimatedWaveformIndicator({Key? key, required this.waveProgress}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 14,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(5, (index) {
          // Calculate sinusoidal height offset per bar
          final phase = waveProgress * 2 * pi + (index * 0.8);
          final barHeight = 4.0 + (sin(phase) * 4.0).abs();
          
          return Container(
            width: 2,
            height: barHeight,
            margin: const EdgeInsets.only(left: 2),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.7),
              borderRadius: BorderRadius.circular(1),
            ),
          );
        }),
      ),
    );
  }
}
