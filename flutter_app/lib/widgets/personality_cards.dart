import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../models/models.dart';
import 'custom_widgets.dart';

// ─── Personality Card Data Model ────────────────────────────────────────────

class _CardData {
  final String id;
  final String title;
  final IconData icon;
  final Color accentColor;
  final Color accentBg;
  final Color iconBg;
  final Color iconColor;
  final Color strengthBadge;
  final Color challengeBadge;

  const _CardData({
    required this.id,
    required this.title,
    required this.icon,
    required this.accentColor,
    required this.accentBg,
    required this.iconBg,
    required this.iconColor,
    required this.strengthBadge,
    required this.challengeBadge,
  });
}

class _SignData {
  final String summary;
  final String strength;
  final String challenge;
  const _SignData(this.summary, this.strength, this.challenge);
}

// ─── Card Definitions ───────────────────────────────────────────────────────

const _cardDefs = <_CardData>[
  _CardData(
    id: 'personality', title: 'Your Personality',
    icon: LucideIcons.user, accentColor: Color(0xFFDC2626),
    accentBg: Color(0x15DC2626), iconBg: Color(0x20DC2626),
    iconColor: Color(0xFFDC2626), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'love', title: 'Your Love Style',
    icon: LucideIcons.heart, accentColor: Color(0xFFF43F5E),
    accentBg: Color(0x15F43F5E), iconBg: Color(0x20F43F5E),
    iconColor: Color(0xFFF43F5E), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'career', title: 'Your Career Path',
    icon: LucideIcons.briefcase, accentColor: Color(0xFF059669),
    accentBg: Color(0x15059669), iconBg: Color(0x20059669),
    iconColor: Color(0xFF059669), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'money', title: 'Your Money Pattern',
    icon: LucideIcons.wallet, accentColor: Color(0xFFEAB308),
    accentBg: Color(0x15EAB308), iconBg: Color(0x20EAB308),
    iconColor: Color(0xFFCA8A04), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'emotional', title: 'Your Emotional Nature',
    icon: LucideIcons.droplets, accentColor: Color(0xFF0EA5E9),
    accentBg: Color(0x150EA5E9), iconBg: Color(0x200EA5E9),
    iconColor: Color(0xFF0EA5E9), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'communication', title: 'Your Communication Style',
    icon: LucideIcons.message_square, accentColor: Color(0xFF8B5CF6),
    accentBg: Color(0x158B5CF6), iconBg: Color(0x208B5CF6),
    iconColor: Color(0xFF8B5CF6), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
  _CardData(
    id: 'purpose', title: 'Your Life Purpose',
    icon: LucideIcons.compass, accentColor: Color(0xFF4A7C59),
    accentBg: Color(0x154A7C59), iconBg: Color(0x204A7C59),
    iconColor: Color(0xFF4A7C59), strengthBadge: Color(0x204A7C59),
    challengeBadge: Color(0x20C4973B),
  ),
];

// ─── Zodiac Sign Data (All 7 Categories × 12 Signs) ────────────────────────

const Map<String, Map<String, _SignData>> _allSignData = {
  'personality': {
    'Aries': _SignData('You are a firecracker — bold, impulsive, and impossible to ignore. You jump into things headfirst and figure out the details later. People either love your energy or find you a bit much, and honestly, you don\'t care which.', 'You have the courage to start things others only dream about.', 'You quit things just as fast as you start them when the excitement fades.'),
    'Taurus': _SignData('You are stubborn in the best and worst ways. Once you decide something, you stick with it — which makes you incredibly reliable but also frustratingly rigid. You love comfort, good food, and nice things, and you work hard to get them.', 'Your loyalty and persistence are unmatched — you show up no matter what.', 'You dig your heels in so deep that you miss opportunities staring you in the face.'),
    'Gemini': _SignData('You are the person who knows a little bit about everything and can talk to anyone about anything. Your mind moves fast, maybe too fast, and you often have three conversations going at once.', 'You can adapt to any room, any situation, any person — it\'s a real superpower.', 'You spread yourself so thin that nothing gets your full attention.'),
    'Cancer': _SignData('You feel everything at full volume, even when you pretend you don\'t. You protect the people you love like a guard dog, and your home is your sanctuary. You remember every slight and every kindness, probably forever.', 'Your emotional depth lets you connect with people in a way few others can.', 'You hold onto past hurts so tightly that they weigh you down today.'),
    'Leo': _SignData('You walk into a room like you own it, and usually people let you. You crave recognition — not because you\'re shallow, but because you genuinely want to be seen for who you are.', 'Your warmth and confidence make people feel special just being around you.', 'You take criticism way too personally and can turn a small comment into a crisis.'),
    'Virgo': _SignData('You notice everything — every detail, every flaw, every way things could be better. You genuinely want to help, but your "help" often feels like criticism to others.', 'Your ability to improve anything you touch makes you invaluable.', 'You are never satisfied — with yourself, with others, with the world — and it exhausts you.'),
    'Libra': _SignData('You want everyone to get along and everything to be fair, which makes you the peacemaker but also the person who can\'t make a decision to save their life.', 'You can bring harmony to the most chaotic situations with grace.', 'You avoid confrontation so much that you swallow your own needs until you explode.'),
    'Scorpio': _SignData('You are intense, and you know it. You don\'t do anything halfway — love, work, anger, revenge. You see through people\'s BS instantly, which is both a gift and a curse.', 'Your emotional courage lets you face truths that most people run from.', 'You can be vindictive and controlling when you feel threatened.'),
    'Sagittarius': _SignData('You are the eternal optimist who believes the best is always yet to come. You love freedom more than almost anything and will run from anything that feels like a cage.', 'Your ability to find meaning and humor in any situation lifts everyone around you.', 'You commit to things with your whole heart and then disappear when it gets real.'),
    'Capricorn': _SignData('You are the grown-up in every room, even when you were a kid. You take responsibility seriously, maybe too seriously. You measure your worth by what you\'ve achieved.', 'Your discipline and patience let you build things that actually last.', 'You tie your self-worth so tightly to success that failure destroys you inside.'),
    'Aquarius': _SignData('You think differently than everyone else, and you pride yourself on that. You care about humanity in the abstract but can be oddly detached with people right in front of you.', 'Your vision for how things could be is genuinely revolutionary.', 'You keep people at arm\'s length and call it independence when it\'s really fear of vulnerability.'),
    'Pisces': _SignData('You live between the real world and whatever\'s happening in your head, and the inner world usually wins. You absorb other people\'s emotions like a sponge.', 'Your empathy and imagination let you create and connect in ways others can\'t.', 'You avoid reality when it gets uncomfortable, and reality always catches up.'),
  },
  'love': {
    'Aries': _SignData('You fall hard and fast, chasing the thrill of new love like a sport. The chase excites you more than the relationship sometimes.', 'You make your partner feel like the most exciting person alive.', 'You confuse excitement with love and bolt when things get routine.'),
    'Taurus': _SignData('You love through acts of devotion — cooking, cuddling, building a life together. Physical touch and stability matter more to you than grand romantic gestures.', 'You show up consistently, making your partner feel safe and cherished.', 'You can be possessive and jealous, treating your partner like something you own.'),
    'Gemini': _SignData('You fall in love with people\'s minds first. A great conversation turns you on more than a pretty face. You need mental stimulation in a relationship or you\'ll get bored.', 'You keep relationships fresh, fun, and intellectually alive.', 'You get restless in relationships and often have one foot out the door.'),
    'Cancer': _SignData('You love with your whole chest — nurturing, protecting, and sometimes smothering. You want a deep emotional bond more than anything.', 'You create emotional safety that lets your partner be fully themselves.', 'You guilt-trip and emotionally manipulate when you feel unloved or insecure.'),
    'Leo': _SignData('You love being in love — the romance, the drama, the grand gestures. You want to be adored and you want to adore someone right back.', 'You make love feel magical, generous, and larger than life.', 'You need constant admiration and can turn cold when you feel taken for granted.'),
    'Virgo': _SignData('You show love by fixing things — your partner\'s problems, their schedule, their life. It\'s your awkward way of saying "I care."', 'Your thoughtfulness and reliability make you a partner who truly shows up.', 'Your "helpful suggestions" often feel like criticism and push your partner away.'),
    'Libra': _SignData('You are a romantic at heart who believes in soulmates and fairytale endings. You want a partnership that\'s equal, beautiful, and harmonious.', 'You make your partner feel like they\'re part of a true team.', 'You lose yourself in relationships by putting your partner\'s needs above your own.'),
    'Scorpio': _SignData('You don\'t do casual — love is all or nothing for you. You want to know your partner\'s darkest secrets and share your own.', 'Your devotion is fierce — when you love, your partner feels utterly chosen.', 'You test your partner\'s loyalty constantly and can be destructive when insecure.'),
    'Sagittarius': _SignData('You need a partner who\'s also your best friend and travel buddy. Freedom in a relationship is non-negotiable for you.', 'You bring adventure and growth into your partner\'s life effortlessly.', 'You fear commitment so deeply that you sabotage good relationships to stay free.'),
    'Capricorn': _SignData('You take love as seriously as you take your career — it\'s a long-term investment. You are not the type to fall in love overnight.', 'Your loyalty and dedication make you a rock-solid partner through anything.', 'You prioritize work over emotional connection and leave your partner feeling lonely.'),
    'Aquarius': _SignData('You love unconventionally — you need space, intellectual connection, and a partner who respects your individuality.', 'You accept your partner exactly as they are without trying to change them.', 'You are emotionally unavailable when your partner needs you most.'),
    'Pisces': _SignData('You love with a depth that borders on self-sacrifice. You want to merge with your partner completely — emotionally, spiritually, physically.', 'Your compassion and sensitivity create the most intimate emotional bond possible.', 'You lose yourself in your partner and stay in bad relationships out of empathy.'),
  },
  'career': {
    'Aries': _SignData('You are built for leadership. You thrive in competitive, fast-paced environments where you can take charge. Corporate bureaucracy kills your soul.', 'You have the initiative to launch projects and the courage to take bold professional risks.', 'You hate taking orders and often clash with authority figures.'),
    'Taurus': _SignData('You are the steady builder who creates lasting value. You are drawn to careers involving art, finance, food, or real estate.', 'Your patience and persistence let you outlast everyone else in the room.', 'You resist change so stubbornly that you miss industry shifts.'),
    'Gemini': _SignData('You need a career that keeps your mind busy — writing, teaching, media, sales, or anything involving communication.', 'Your communication skills and adaptability make you valuable in almost any field.', 'You start projects with passion and abandon them when something shinier comes along.'),
    'Cancer': _SignData('You are drawn to careers where you can nurture and care for others — healthcare, education, hospitality, or counseling.', 'Your emotional intelligence makes you an incredible manager and team builder.', 'You take workplace criticism personally and let office politics eat you alive.'),
    'Leo': _SignData('You need to be seen and appreciated at work — not just as a cog in a machine. You are drawn to creative fields and leadership roles.', 'Your charisma and confidence make people want to follow you.', 'You take on too much because you can\'t say no to the spotlight, then burn out.'),
    'Virgo': _SignData('You are the detail-oriented perfectionist who makes everything work better. You excel in analysis, editing, healthcare, research.', 'Your analytical mind catches problems others miss and creates systems that actually work.', 'You overwork yourself because you can\'t delegate — nobody does it "right" enough for you.'),
    'Libra': _SignData('You are built for careers involving people, aesthetics, or justice — law, design, diplomacy, HR, or event planning.', 'Your ability to see all perspectives makes you a brilliant mediator and negotiator.', 'You overthink decisions and avoid necessary conflict until problems become crises.'),
    'Scorpio': _SignData('You are drawn to careers that involve investigation, power, or transformation — research, psychology, finance, surgery.', 'Your intensity and focus let you master complex subjects and uncover truths others miss.', 'You can be paranoid about colleagues\' motives and hold professional grudges.'),
    'Sagittarius': _SignData('You need a career that lets you learn, teach, or explore — travel, education, publishing, philosophy, or entrepreneurship.', 'Your optimism and vision inspire teams and open doors others can\'t see.', 'You lack follow-through — great at starting, terrible at finishing the boring parts.'),
    'Capricorn': _SignData('You are the career powerhouse of the zodiac. Driven, strategic, and willing to put in years of hard work for long-term success.', 'Your discipline and strategic thinking let you climb higher than anyone expects.', 'You sacrifice your personal life for career success and don\'t realize it until it\'s gone.'),
    'Aquarius': _SignData('You are the innovator who wants to change the system, not work within it. You are drawn to tech, science, activism.', 'Your original thinking creates breakthroughs that traditional minds would never see.', 'You dismiss practical constraints as "small thinking" and alienate people who could help.'),
    'Pisces': _SignData('You are drawn to creative or healing careers — art, music, therapy, spirituality, or anything involving imagination and compassion.', 'Your creativity and empathy produce work that touches people deeply.', 'You struggle with structure and deadlines, preferring your own dreamy timeline.'),
  },
  'money': {
    'Aries': _SignData('You spend money as fast as you make it because impulse buying is your love language.', 'Your risk-taking instinct can land you lucrative opportunities others would pass on.', 'You blow through money on impulse purchases and have nothing to show for it.'),
    'Taurus': _SignData('You are the saver of the zodiac — not because you\'re cheap, but because you love security. You spend on quality things that last.', 'Your patience with money lets you build real, lasting wealth over time.', 'You are so cautious with money that you miss investment opportunities.'),
    'Gemini': _SignData('You have money in five different accounts and three different side hustles, and somehow you\'re still broke.', 'Your ability to spot trends and juggle multiple income streams keeps money flowing.', 'You have no financial consistency — your income and spending are all over the place.'),
    'Cancer': _SignData('You save money for security the way a squirrel hoards nuts — aggressively and anxiously. Money represents safety to you.', 'Your instinct to save for a rainy day means you are almost always financially prepared.', 'Your financial anxiety makes you hoard money instead of investing it for growth.'),
    'Leo': _SignData('You spend money to feel good and look good — generous tips, expensive dinners, impressive gifts.', 'Your confidence in investing in yourself often pays off in career advancement.', 'You spend to impress others and end up living beyond your means.'),
    'Virgo': _SignData('You track every rupee, every subscription, every recurring charge. You have a budget spreadsheet that would make an accountant proud.', 'Your attention to financial detail means you rarely waste money or miss an error.', 'You micromanage your finances so tightly that you miss bigger wealth-building opportunities.'),
    'Libra': _SignData('You spend money on beautiful things and shared experiences — dinners, gifts, art.', 'Your taste and social instincts lead you to investments that appreciate.', 'You spend too much trying to maintain a lifestyle that looks good from the outside.'),
    'Scorpio': _SignData('You are secretive about money — nobody knows how much you make, spend, or save. You see money as power.', 'Your strategic mind and research skills make you a savvy, calculated investor.', 'Your obsession with financial control damages trust in relationships.'),
    'Sagittarius': _SignData('Money is just a tool for your next adventure as far as you\'re concerned. You spend freely on travel and experiences.', 'Your willingness to invest in experiences creates unique opportunities.', 'You have zero financial discipline and live in a constant cycle of feast and famine.'),
    'Capricorn': _SignData('You treat money seriously, strategically, and with long-term goals in mind. You invest rather than spend, save rather than splurge.', 'Your long-term financial planning builds wealth that compounds over decades.', 'You are so focused on future wealth that you never enjoy the money you have right now.'),
    'Aquarius': _SignData('You either don\'t care about money at all or you\'re investing in crypto and tech startups — there is no in-between.', 'Your willingness to bet on unconventional ideas can create massive financial breakthroughs.', 'You ignore practical financial basics and take risks that can wipe you out.'),
    'Pisces': _SignData('Money is abstract to you — you know you need it but you don\'t want to think about it. You are generous to a fault.', 'Your generosity and intuition sometimes lead you to investments that feel right and actually are.', 'You avoid managing money entirely and often don\'t know where yours actually goes.'),
  },
  'emotional': {
    'Aries': _SignData('Your emotions are like a match — they flare up fast and hot, then burn out quickly. You feel anger before any other emotion.', 'You process emotions quickly and move on faster than almost anyone.', 'You react before you think and say things in anger that you can\'t take back.'),
    'Taurus': _SignData('Your emotions run deep and slow like a river — steady, powerful, and hard to redirect. You don\'t get upset easily, but when you do, it\'s a full earthquake.', 'Your emotional stability provides a grounding force for everyone around you.', 'You bottle up feelings until they explode.'),
    'Gemini': _SignData('Your emotions change direction like the wind — laughing one minute and deeply anxious the next. You intellectualize your feelings.', 'Your ability to articulate your feelings helps you and others understand complex emotions.', 'You think about your feelings instead of feeling them.'),
    'Cancer': _SignData('You feel everything, always, at maximum volume. Other people\'s emotions affect you as much as your own.', 'Your emotional depth and empathy create connections that feel truly healing.', 'You absorb others\' emotions until you can\'t tell which feelings are yours.'),
    'Leo': _SignData('Your emotions are big, dramatic, and center stage — you feel things intensely and you want people to know it.', 'Your emotional warmth makes people feel safe to express themselves around you.', 'Your pride prevents you from showing vulnerability when you need it most.'),
    'Virgo': _SignData('You process emotions through analysis — you try to understand why you feel something before you let yourself actually feel it.', 'Your emotional self-awareness helps you understand and improve your patterns.', 'You judge your own emotions as "irrational" and suppress them.'),
    'Libra': _SignData('You want emotional harmony above all else — conflict makes you physically uncomfortable.', 'Your ability to hold space for others\' emotions while staying balanced is rare.', 'You suppress your real feelings to maintain peace and end up resenting people.'),
    'Scorpio': _SignData('Your emotional world is like an ocean — deep, dark, and with powerful currents beneath the surface.', 'Your emotional courage lets you face the darkest feelings and come out stronger.', 'You hold onto emotional pain as if letting go means losing a part of yourself.'),
    'Sagittarius': _SignData('You process emotions through movement and meaning — you need to understand the bigger picture.', 'Your ability to find meaning and growth in emotional pain is genuinely inspiring.', 'You run from difficult emotions instead of sitting with them.'),
    'Capricorn': _SignData('You treat emotions like obstacles to productivity — you push them down and push through.', 'Your emotional resilience and composure hold steady in the toughest situations.', 'You repress emotions so deeply they show up as depression or burnout.'),
    'Aquarius': _SignData('You process emotions intellectually — you observe your feelings like a scientist rather than experiencing them.', 'Your emotional objectivity lets you stay calm and find solutions in crises.', 'You detach from your feelings so often that you don\'t know what you actually feel.'),
    'Pisces': _SignData('You don\'t just feel emotions — you absorb them from the atmosphere like a sponge.', 'Your emotional sensitivity lets you understand and comfort people in ways that feel almost magical.', 'You escape painful emotions instead of facing them.'),
  },
  'communication': {
    'Aries': _SignData('You say what you think the moment you think it — no filter, no pause, no regrets (until later).', 'Your directness cuts through confusion and gets to the point fast.', 'You come across as confrontational and often hurt people without realizing it.'),
    'Taurus': _SignData('You communicate slowly and deliberately — you think before you speak and you mean what you say.', 'Your words carry weight because you only say what you truly mean.', 'You communicate so slowly that people think you don\'t care.'),
    'Gemini': _SignData('You are the communicator of the zodiac — you talk, write, text, and think in words constantly.', 'Your ability to articulate complex ideas simply makes you a natural teacher.', 'You talk so much that people stop listening.'),
    'Cancer': _SignData('You communicate through emotion — your tone, your body language, and your actions speak louder than your words.', 'Your emotional intelligence lets you hear what people mean, not just what they say.', 'You use passive-aggressive silence instead of saying what\'s wrong.'),
    'Leo': _SignData('You communicate to be heard and remembered — you have a natural charisma that draws people in.', 'Your expressive, warm communication makes people feel engaged and energized.', 'You dominate conversations and make everything about you.'),
    'Virgo': _SignData('You communicate with precision — every word is chosen carefully, every fact is checked.', 'Your precise, clear communication leaves no room for misunderstanding.', 'You correct people so often that they feel like you\'re grading them.'),
    'Libra': _SignData('You communicate to create harmony — you are diplomatic, charming, and excellent at making people feel heard.', 'Your diplomatic communication resolves conflicts and makes everyone feel respected.', 'You say what people want to hear instead of the truth.'),
    'Scorpio': _SignData('You communicate like a detective — you ask probing questions, reveal little about yourself.', 'Your perceptiveness and honesty cut through superficial conversations.', 'You use words as weapons and can destroy someone\'s confidence with a single comment.'),
    'Sagittarius': _SignData('You communicate with the subtlety of a freight train — you say whatever pops into your head.', 'Your honesty and humor make conversations with you genuinely fun and refreshing.', 'Your "brutal honesty" is often just brutal.'),
    'Capricorn': _SignData('You communicate with authority and economy — you say what needs to be said and nothing more.', 'Your communication is clear, authoritative, and commands respect immediately.', 'You come across as cold and unfeeling.'),
    'Aquarius': _SignData('You communicate in ideas — big, revolutionary, unconventional ideas that excite you but confuse everyone else.', 'Your original perspective brings fresh ideas to every conversation.', 'You communicate so abstractly that people can\'t connect.'),
    'Pisces': _SignData('You communicate through feeling, metaphor, and intuition — not direct statements.', 'Your empathetic, creative communication makes people feel deeply understood.', 'You are so vague that people don\'t know what you actually want.'),
  },
  'purpose': {
    'Aries': _SignData('You are here to learn courage — not the reckless kind you already have, but the kind that means staying when you want to run.', 'Your soul\'s gift is the ability to inspire others to take brave first steps.', 'The lesson you keep avoiding is that true courage means staying, not leaving.'),
    'Taurus': _SignData('You are here to learn what is truly valuable — not just money and possessions, but love, presence, and inner peace.', 'Your soul\'s gift is the ability to create stability and beauty where there was chaos.', 'The lesson you keep avoiding is that holding on too tightly slowly crushes it.'),
    'Gemini': _SignData('You are here to learn depth — to go beyond the surface of everything you skim.', 'Your soul\'s gift is connecting people and ideas that were never supposed to meet.', 'The lesson you keep avoiding is that mastery requires sticking with one thing.'),
    'Cancer': _SignData('You are here to learn emotional independence — to care deeply without losing yourself.', 'Your soul\'s gift is creating emotional safety that transforms people\'s lives.', 'The lesson you keep avoiding is that you can\'t heal everyone.'),
    'Leo': _SignData('You are here to learn authentic self-expression — not performance, not ego, but the real you.', 'Your soul\'s gift is making others feel seen, celebrated, and alive.', 'The lesson you keep avoiding is that your worth exists with or without applause.'),
    'Virgo': _SignData('You are here to learn self-acceptance — to love yourself as imperfectly as you love others.', 'Your soul\'s gift is seeing exactly what needs healing and knowing how to fix it.', 'The lesson you keep avoiding is that your imperfections make you human.'),
    'Libra': _SignData('You are here to learn true partnership — not dependency, not people-pleasing, but two whole people creating something greater.', 'Your soul\'s gift is creating beauty and harmony that elevates everyone.', 'The lesson you keep avoiding is that some battles are worth fighting.'),
    'Scorpio': _SignData('You are here to learn surrender — to let go of control and trust that transformation happens through release.', 'Your soul\'s gift is transforming pain into power.', 'The lesson you keep avoiding is that holding onto pain imprisons you.'),
    'Sagittarius': _SignData('You are here to learn that meaning comes from depth, not distance.', 'Your soul\'s gift is finding meaning everywhere and inspiring others to keep exploring.', 'The lesson you keep avoiding is that staying put can be the greatest adventure.'),
    'Capricorn': _SignData('You are here to learn that your worth is not your work. Your purpose is to build structures that outlast you.', 'Your soul\'s gift is building lasting structures that support generations.', 'The lesson you keep avoiding is that the strongest foundation includes asking for support.'),
    'Aquarius': _SignData('You are here to learn that revolution requires connection, not just ideas.', 'Your soul\'s gift is seeing the future and showing others what\'s possible.', 'The lesson you keep avoiding is that you can\'t change the world while running from your own heart.'),
    'Pisces': _SignData('You are here to learn boundaries — to give without depleting, to dream without escaping.', 'Your soul\'s gift is channeling compassion and creativity that heals the world.', 'The lesson you keep avoiding is facing reality instead of floating above it.'),
  },
};
// ─── Main Widget ────────────────────────────────────────────────────────────

String _getSignFromPosition(Map<String, PlanetaryPositionInfo> positions, String planet, String fallback) {
  final pos = positions[planet];
  if (pos?.sign != null && pos!.sign.isNotEmpty) return pos.sign;
  return fallback;
}

class _LifePathModifier {
  final String personality;
  final String love;
  final String career;
  final String money;
  final String emotional;
  final String communication;
  final String purpose;

  const _LifePathModifier({
    required this.personality,
    required this.love,
    required this.career,
    required this.money,
    required this.emotional,
    required this.communication,
    required this.purpose,
  });
}

const Map<int, _LifePathModifier> _lifePathModifiers = {
  1: _LifePathModifier(
    personality: 'Your Life Path 1 adds a fierce independence to everything you do — you are not built to follow.',
    love: 'Life Path 1 makes you need a partner who respects your autonomy without making you feel alone.',
    career: 'With Life Path 1, you are destined to lead or create something original — working for someone else drains your soul.',
    money: 'Life Path 1 means your financial success comes through self-reliance and bold individual moves.',
    emotional: 'With Life Path 1, your emotional challenge is letting yourself need people when you\'re wired to go it alone.',
    communication: 'Life Path 1 makes you a natural decision-maker in conversations, but you can steamroll others\' opinions.',
    purpose: 'Your Life Path 1 means you\'re here to pioneer — to be the first to do something that opens doors for others.',
  ),
  2: _LifePathModifier(
    personality: 'Your Life Path 2 adds deep sensitivity and a need for partnership — you are not built to go it alone.',
    love: 'Life Path 2 makes you a devoted partner who thrives in harmony but can lose yourself in the relationship.',
    career: 'With Life Path 2, you are at your best in supportive roles — mediating, counseling, or collaborating.',
    money: 'Life Path 2 means you build wealth through partnerships and cooperation, not solo hustle.',
    emotional: 'With Life Path 2, you feel others\' emotions as your own, which is exhausting and beautiful at once.',
    communication: 'Life Path 2 makes you a careful, considerate communicator who avoids conflict at all costs.',
    purpose: 'Your Life Path 2 means you\'re here to bring people together — to be the bridge between worlds.',
  ),
  3: _LifePathModifier(
    personality: 'Your Life Path 3 adds creative fire and charm — you light up rooms but struggle to go deep alone.',
    love: 'Life Path 3 makes you playful and expressive in love, but you use humor to hide what really hurts.',
    career: 'With Life Path 3, you are built for creative expression — writing, performing, teaching, or anything that uses your voice.',
    money: 'Life Path 3 means money comes through creative pursuits but managing it is your weak spot.',
    emotional: 'With Life Path 3, your emotions are colorful and dramatic — you feel life at full volume.',
    communication: 'Life Path 3 makes you a magnetic storyteller who can captivate any audience.',
    purpose: 'Your Life Path 3 means you\'re here to create and inspire — to turn pain into beauty for others.',
  ),
  4: _LifePathModifier(
    personality: 'Your Life Path 4 adds structure and discipline — you are the foundation others build on.',
    love: 'Life Path 4 makes you a loyal, reliable partner, but you can be rigid and emotionally closed off.',
    career: 'With Life Path 4, you are built for methodical work — engineering, organizing, building systems that last.',
    money: 'Life Path 4 means financial stability comes through hard work, budgeting, and long-term planning.',
    emotional: 'With Life Path 4, you process emotions through structure — you want to fix feelings, not feel them.',
    communication: 'Life Path 4 makes you a clear, factual communicator who skips the fluff and gets to work.',
    purpose: 'Your Life Path 4 means you\'re here to build — to create order from chaos and structure that serves many.',
  ),
  5: _LifePathModifier(
    personality: 'Your Life Path 5 adds restlessness and adventure — you are built for change and freedom.',
    love: 'Life Path 5 makes you exciting but noncommittal — you love the spark more than the steady flame.',
    career: 'With Life Path 5, you need variety — travel, media, sales, or entrepreneurship suit you best.',
    money: 'Life Path 5 means money comes in bursts and goes just as fast — consistency is your financial challenge.',
    emotional: 'With Life Path 5, your emotions are wild and free — you feel everything intensely but move on fast.',
    communication: 'Life Path 5 makes you a dynamic, persuasive communicator who can sell anything to anyone.',
    purpose: 'Your Life Path 5 means you\'re here to experience everything and teach others that freedom is worth the risk.',
  ),
  6: _LifePathModifier(
    personality: 'Your Life Path 6 adds responsibility and care — you are the one everyone leans on.',
    love: 'Life Path 6 makes you a nurturing partner who gives everything, sometimes without getting enough back.',
    career: 'With Life Path 6, you are drawn to service — healthcare, teaching, counseling, or hospitality.',
    money: 'Life Path 6 means you spend on others before yourself — generosity is your financial pattern.',
    emotional: 'With Life Path 6, your emotions are tied to how the people you love are doing — their pain is your pain.',
    communication: 'Life Path 6 makes you a warm, supportive communicator who always has kind words ready.',
    purpose: 'Your Life Path 6 means you\'re here to nurture — to create love and safety that transforms lives.',
  ),
  7: _LifePathModifier(
    personality: 'Your Life Path 7 adds depth and introspection — you are the thinker who needs to understand everything.',
    love: 'Life Path 7 makes you cautious in love — you analyze feelings before you let yourself feel them.',
    career: 'With Life Path 7, you are built for research, analysis, or spiritual work — depth is your currency.',
    money: 'Life Path 7 means you are careful with money and prefer investing in knowledge over material things.',
    emotional: 'With Life Path 7, your emotional world is rich but hidden — you process feelings through thinking.',
    communication: 'Life Path 7 makes you a thoughtful, deep communicator who prefers meaningful conversations over small talk.',
    purpose: 'Your Life Path 7 means you\'re here to seek truth — to find answers that illuminate the path for others.',
  ),
  8: _LifePathModifier(
    personality: 'Your Life Path 8 adds ambition and power — you are built to achieve and accumulate.',
    love: 'Life Path 8 makes you a generous but controlling partner — you show love through providing.',
    career: 'With Life Path 8, you are destined for leadership, business, or finance — power is your natural habitat.',
    money: 'Life Path 8 means you are wired for wealth — but the pursuit can consume you if you\'re not careful.',
    emotional: 'With Life Path 8, your emotions are tied to achievement — failure hits you harder than you let on.',
    communication: 'Life Path 8 makes you a commanding, authoritative communicator who expects to be heard.',
    purpose: 'Your Life Path 8 means you\'re here to master the material world and use your power to uplift others.',
  ),
  9: _LifePathModifier(
    personality: 'Your Life Path 9 adds wisdom and compassion — you are the old soul who feels the world\'s pain.',
    love: 'Life Path 9 makes you a romantic idealist who gives too much and receives too little.',
    career: 'With Life Path 9, you are drawn to healing, teaching, or humanitarian work — service is your calling.',
    money: 'Life Path 9 means money is just a tool for you — you give it away faster than you should.',
    emotional: 'With Life Path 9, your emotions are tied to the world\'s suffering — you feel the pain of strangers.',
    communication: 'Life Path 9 makes you an inspiring, philosophical communicator who sees the big picture.',
    purpose: 'Your Life Path 9 means you\'re here to serve — to use your wisdom and compassion to heal the world.',
  ),
  11: _LifePathModifier(
    personality: 'Your Life Path 11 adds intuition and sensitivity at a master level — you feel things others can\'t explain.',
    love: 'Life Path 11 makes you crave soul-level connection — surface relationships feel meaningless to you.',
    career: 'With Life Path 11, you are built for spiritual or creative leadership — you see what others can\'t yet.',
    money: 'Life Path 11 means money flows when you follow your intuition, not when you chase it logically.',
    emotional: 'With Life Path 11, your emotions are electric — you feel the energy of rooms and people instantly.',
    communication: 'Life Path 11 makes you an inspired communicator — your words carry a vibration that moves people.',
    purpose: 'Your Life Path 11 means you\'re here to illuminate — to channel insight that awakens others.',
  ),
  22: _LifePathModifier(
    personality: 'Your Life Path 22 adds master builder energy — you can turn the biggest visions into reality.',
    love: 'Life Path 22 makes you a powerful partner who builds empires but can forget to build intimacy.',
    career: 'With Life Path 22, you are destined to create something massive — a business, a movement, a legacy.',
    money: 'Life Path 22 means you have the potential for extraordinary wealth, but the pressure can crush you.',
    emotional: 'With Life Path 22, you carry the weight of your ambitions emotionally — stress is your constant companion.',
    communication: 'Life Path 22 makes you a visionary communicator who can rally people around impossible goals.',
    purpose: 'Your Life Path 22 means you\'re here to build something that changes the world — no pressure.',
  ),
  33: _LifePathModifier(
    personality: 'Your Life Path 33 adds master healer energy — you are wired to nurture at the highest level.',
    love: 'Life Path 33 makes you the most compassionate partner possible, but you sacrifice yourself endlessly.',
    career: 'With Life Path 33, you are built for healing work — therapy, medicine, teaching, or spiritual leadership.',
    money: 'Life Path 33 means money is secondary to mission — you give until it hurts and then give more.',
    emotional: 'With Life Path 33, your emotions are connected to everyone — you carry the world\'s pain as your own.',
    communication: 'Life Path 33 makes you a healer through words — people feel better just talking to you.',
    purpose: 'Your Life Path 33 means you\'re here to heal — to be the compassionate force the world desperately needs.',
  ),
};

String getAscendantVibe(String sign) {
  final vibes = {
    'Aries': "bold and energized, even when you're tired",
    'Taurus': "calm and grounded, even when you're anxious inside",
    'Gemini': "curious and talkative, even when you're hurting",
    'Cancer': "warm and protective, even when you need protection yourself",
    'Leo': "confident and radiant, even when you're doubting yourself",
    'Virgo': "put-together and helpful, even when your own life is messy",
    'Libra': "charming and agreeable, even when you're screaming inside",
    'Scorpio': "intense and magnetic, even when you're trying to blend in",
    'Sagittarius': "adventurous and optimistic, even when you're lost",
    'Capricorn': "serious and competent, even when you're terrified",
    'Aquarius': "unique and detached, even when you're desperate to belong",
    'Pisces': "dreamy and empathetic, even when you're overwhelmed",
  };
  return vibes[sign] ?? "someone who has it more together than you feel";
}

String getMoonEmotionalNeed(String sign) {
  final needs = {
    'Aries': "independence and excitement",
    'Taurus': "stability and physical comfort",
    'Gemini': "mental stimulation and conversation",
    'Cancer': "emotional safety and family closeness",
    'Leo': "appreciation and genuine admiration",
    'Virgo': "practical support and useful advice",
    'Libra': "harmony and partnership",
    'Scorpio': "deep intimacy and total honesty",
    'Sagittarius': "freedom and philosophical connection",
    'Capricorn': "respect and tangible commitment",
    'Aquarius': "intellectual friendship and space",
    'Pisces': "spiritual connection and unconditional love",
  };
  return needs[sign] ?? "deep emotional connection";
}

String getMarsCareerDrive(String sign) {
  final drives = {
    'Aries': "a relentless, pioneering drive",
    'Taurus': "slow, steady, unstoppable persistence",
    'Gemini': "quick thinking and versatile energy",
    'Cancer': "intuitive, protective dedication",
    'Leo': "dramatic, confident ambition",
    'Virgo': "precise, detail-oriented focus",
    'Libra': "diplomatic, collaborative effort",
    'Scorpio': "intense, strategic determination",
    'Sagittarius': "expansive, adventurous energy",
    'Capricorn': "disciplined, strategic ambition",
    'Aquarius': "innovative, unconventional drive",
    'Pisces': "creative, intuitive motivation",
  };
  return drives[sign] ?? "strong, focused energy";
}

String getSaturnCareerDelay(String sign) {
  final delays = {
    'Aries': "take time to take off — patience is your career lesson",
    'Taurus': "require you to step outside your comfort zone to grow",
    'Gemini': "feel restrictive until you commit to one direction",
    'Cancer': "challenge you to toughen up and separate feelings from business",
    'Leo': "humble you before they elevate you",
    'Virgo': "demand that you stop perfecting and start shipping",
    'Libra': "test your ability to make hard decisions alone",
    'Scorpio': "transform your relationship with power and control",
    'Sagittarius': "require you to stick with something long enough to master it",
    'Capricorn': "come with heavy responsibility that teaches you to delegate",
    'Aquarius': "force you to work within systems before you can change them",
    'Pisces': "demand that you get practical before you can pursue your dreams",
  };
  return delays[sign] ?? "require patience and persistence to overcome";
}

String getSoulUrgeNeed(int num) {
  final needs = {
    1: "to lead and create on your own terms",
    2: "to be in loving partnership and harmony",
    3: "to express yourself creatively and joyfully",
    4: "to build something solid and lasting",
    5: "to experience freedom and change",
    6: "to nurture and be needed by others",
    7: "to understand the deeper meaning of everything",
    8: "to achieve material mastery and abundance",
    9: "to serve humanity and ease suffering",
    11: "to channel higher wisdom and inspire others",
    22: "to build something that transforms the world",
    33: "to heal and uplift everyone you encounter",
  };
  return needs[num] ?? "to find your true purpose and live it fully";
}

String getDestinyCommunication(int num) {
  final destinies = {
    1: "use your voice to lead and innovate",
    2: "bring people together through diplomacy",
    3: "inspire through creative expression",
    4: "build systems and structures that help others",
    5: "challenge the status quo and inspire change",
    6: "nurture and guide others with your words",
    7: "seek and share deep truths",
    8: "command authority and create impact at scale",
    9: "share wisdom that elevates human consciousness",
    11: "channel insights that awaken others",
    22: "communicate visions that mobilize people",
    33: "heal through words and compassionate teaching",
  };
  return destinies[num] ?? "communicate with purpose and impact";
}

class PersonalityCards extends StatefulWidget {
  final AstrologyInfo? astrologyData;
  final NumerologyInfo? numerologyData;
  final List<TraitScore> traitScores;

  const PersonalityCards({
    super.key,
    this.astrologyData,
    this.numerologyData,
    required this.traitScores,
  });

  @override
  State<PersonalityCards> createState() => _PersonalityCardsState();
}

class _PersonalityCardsState extends State<PersonalityCards> {
  final Set<int> _expanded = {};
  bool _allExpanded = false;

  void _toggleAll() {
    setState(() {
      if (_allExpanded) {
        _expanded.clear();
      } else {
        _expanded.addAll(List.generate(_cardDefs.length, (i) => i));
      }
      _allExpanded = !_allExpanded;
    });
  }

  void _toggle(int index) {
    setState(() {
      if (_expanded.contains(index)) {
        _expanded.remove(index);
      } else {
        _expanded.add(index);
      }
      _allExpanded = _expanded.length == _cardDefs.length;
    });
  }

  List<Map<String, String>> _generateCards() {
    final sunSign = widget.astrologyData?.sunSign ?? 'Capricorn';
    final moonSign = widget.astrologyData?.moonSign ?? 'Gemini';
    final ascendant = widget.astrologyData?.ascendant ?? 'Taurus';
    final positions = widget.astrologyData?.planetaryPositions ?? {};
    
    final venusSign = _getSignFromPosition(positions, 'Venus', sunSign);
    final marsSign = _getSignFromPosition(positions, 'Mars', sunSign);
    final mercurySign = _getSignFromPosition(positions, 'Mercury', sunSign);
    final saturnSign = _getSignFromPosition(positions, 'Saturn', sunSign);
    final rahuSign = _getSignFromPosition(positions, 'Rahu', 'Aquarius');
    
    final lifePath = widget.numerologyData?.lifePathNumber ?? 1;
    final soulUrge = widget.numerologyData?.soulUrgeNumber ?? 1;
    final destiny = widget.numerologyData?.destinyNumber ?? 1;
    
    final sortedTraits = List<TraitScore>.from(widget.traitScores)
      ..sort((a, b) => b.score.compareTo(a.score));
    final topTraitName = sortedTraits.isNotEmpty ? (sortedTraits[0].label.isNotEmpty ? sortedTraits[0].label : sortedTraits[0].name) : 'Resilience';
    final secondTraitName = sortedTraits.length > 1 ? (sortedTraits[1].label.isNotEmpty ? sortedTraits[1].label : sortedTraits[1].name) : 'Empathy';
    
    final lpModifier = _lifePathModifiers[lifePath] ?? _lifePathModifiers[1]!;

    final personalityContent = _allSignData['personality']?[sunSign] != null
      ? "${_allSignData['personality']![sunSign]!.summary} With $ascendant rising, you come across as ${getAscendantVibe(ascendant)}. ${lpModifier.personality} Your strongest traits — $topTraitName and $secondTraitName — show up in everything you do."
      : "You are a complex blend of $sunSign energy and $ascendant presence. ${lpModifier.personality} Your top traits of $topTraitName and $secondTraitName define how you move through the world.";

    final loveContent = _allSignData['love']?[venusSign] != null
      ? "${_allSignData['love']![venusSign]!.summary} Your Moon in $moonSign means you need emotional ${getMoonEmotionalNeed(moonSign)} to feel truly connected. ${lpModifier.love}"
      : "You approach love through the lens of $venusSign, seeking deep emotional connection. Your Moon in $moonSign means you need ${getMoonEmotionalNeed(moonSign)}. ${lpModifier.love}";

    final careerContent = _allSignData['career']?[sunSign] != null
      ? "${_allSignData['career']![sunSign]!.summary} Your Mars in $marsSign gives you ${getMarsCareerDrive(marsSign)} at work. Saturn in $saturnSign means your career may ${getSaturnCareerDelay(saturnSign)}. ${lpModifier.career}"
      : "You are driven in your career by $marsSign energy. Saturn in $saturnSign means you'll face career lessons around patience. ${lpModifier.career}";

    final moneyContent = _allSignData['money']?[sunSign] != null
      ? "${_allSignData['money']![sunSign]!.summary} ${lpModifier.money}"
      : "Your relationship with money reflects your $sunSign nature. ${lpModifier.money}";

    final emotionalContent = _allSignData['emotional']?[moonSign] != null
      ? "${_allSignData['emotional']![moonSign]!.summary} With Soul Urge number $soulUrge, your deepest emotional need is ${getSoulUrgeNeed(soulUrge)}. ${lpModifier.emotional}"
      : "You process emotions through your $moonSign nature. Your Soul Urge number $soulUrge reveals your deepest emotional needs. ${lpModifier.emotional}";

    final communicationContent = _allSignData['communication']?[mercurySign] != null
      ? "${_allSignData['communication']![mercurySign]!.summary} With Destiny number $destiny, you are meant to ${getDestinyCommunication(destiny)}. ${lpModifier.communication}"
      : "Your communication style is shaped by $mercurySign. With Destiny number $destiny, your words carry purpose. ${lpModifier.communication}";

    final purposeContent = _allSignData['purpose']?[rahuSign] != null
      ? "${_allSignData['purpose']![rahuSign]!.summary} ${lpModifier.purpose}"
      : "Your life purpose is shaped by $rahuSign energy calling you toward growth. ${lpModifier.purpose}";

    return [
      {
        'id': 'personality',
        'content': personalityContent,
        'strength': _allSignData['personality']?[sunSign]?.strength ?? 'You have a unique combination of traits that makes you unforgettable.',
        'challenge': _allSignData['personality']?[sunSign]?.challenge ?? 'You struggle to see yourself as clearly as others see you.',
        'sign': sunSign,
      },
      {
        'id': 'love',
        'content': loveContent,
        'strength': _allSignData['love']?[venusSign]?.strength ?? 'You have an extraordinary capacity for love when you let yourself be vulnerable.',
        'challenge': _allSignData['love']?[venusSign]?.challenge ?? 'Your fear of vulnerability keeps the right people at a distance.',
        'sign': venusSign,
      },
      {
        'id': 'career',
        'content': careerContent,
        'strength': _allSignData['career']?[sunSign]?.strength ?? 'Your unique approach to work gives you an edge others can\'t replicate.',
        'challenge': _allSignData['career']?[sunSign]?.challenge ?? 'You sabotage your own success by avoiding the parts of work you dislike.',
        'sign': sunSign,
      },
      {
        'id': 'money',
        'content': moneyContent,
        'strength': _allSignData['money']?[sunSign]?.strength ?? 'You have a natural instinct for financial opportunities.',
        'challenge': _allSignData['money']?[sunSign]?.challenge ?? 'Your relationship with money is more emotional than practical.',
        'sign': sunSign,
      },
      {
        'id': 'emotional',
        'content': emotionalContent,
        'strength': _allSignData['emotional']?[moonSign]?.strength ?? 'Your emotional depth is a rare gift that most people never develop.',
        'challenge': _allSignData['emotional']?[moonSign]?.challenge ?? 'You avoid sitting with uncomfortable emotions until they explode.',
        'sign': moonSign,
      },
      {
        'id': 'communication',
        'content': communicationContent,
        'strength': _allSignData['communication']?[mercurySign]?.strength ?? 'Your communication has a unique quality that makes people remember what you say.',
        'challenge': _allSignData['communication']?[mercurySign]?.challenge ?? 'People often misunderstand your intentions because of how you express yourself.',
        'sign': mercurySign,
      },
      {
        'id': 'purpose',
        'content': purposeContent,
        'strength': _allSignData['purpose']?[rahuSign]?.strength ?? 'Your soul carries a gift that the world needs, even if you haven\'t discovered it yet.',
        'challenge': _allSignData['purpose']?[rahuSign]?.challenge ?? 'You keep avoiding the very lesson that would set you free.',
        'sign': rahuSign,
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cards = _generateCards();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.sparkles, color: AppColors.gold, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Your Personality Blueprint',
                    style: TextStyle(
                      fontFamily: 'Serif',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.brown900,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: _toggleAll,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _allExpanded ? LucideIcons.chevron_up : LucideIcons.chevron_down,
                        size: 14,
                        color: AppColors.gold,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _allExpanded ? 'Collapse' : 'Expand All',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? AppColors.gold : AppColors.goldDark,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Cards
        ...List.generate(_cardDefs.length, (index) {
          final def = _cardDefs[index];
          final isExpanded = _expanded.contains(index);
          final cardData = cards[index];
          final content = cardData['content'] ?? '';
          final strength = cardData['strength'] ?? '';
          final challenge = cardData['challenge'] ?? '';
          final sign = cardData['sign'] ?? '';

          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: GestureDetector(
              onTap: () => _toggle(index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeInOut,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard.withValues(alpha: 0.85) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border(
                    left: BorderSide(color: def.accentColor, width: 4),
                    top: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100, width: 0.5),
                    right: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100, width: 0.5),
                    bottom: BorderSide(color: isDark ? Colors.white10 : AppColors.brown100, width: 0.5),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (isDark ? Colors.black : AppColors.brown900).withValues(alpha: isDark ? 0.3 : 0.05),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Header Row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: def.iconBg,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(def.icon, size: 18, color: def.iconColor),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  def.title,
                                  style: TextStyle(
                                    fontFamily: 'Serif',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : AppColors.brown900,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Based on your $sign placement',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark ? AppColors.brown400 : AppColors.brown500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          AnimatedRotation(
                            turns: isExpanded ? 0.5 : 0.0,
                            duration: const Duration(milliseconds: 200),
                            child: Icon(
                              LucideIcons.chevron_down,
                              size: 20,
                              color: isDark ? AppColors.brown400 : AppColors.brown500,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Expandable Content
                    AnimatedCrossFade(
                      firstChild: isExpanded
                          ? const SizedBox.shrink()
                          : Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                              child: Text(
                                content,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  height: 1.5,
                                  color: isDark ? AppColors.brown400 : AppColors.brown500,
                                ),
                              ),
                            ),
                      secondChild: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Divider(
                              color: (isDark ? Colors.white : AppColors.brown900).withValues(alpha: 0.08),
                              height: 1,
                            ),
                            const SizedBox(height: 12),
                            // Summary text
                            Text(
                              content,
                              style: TextStyle(
                                fontSize: 13.5,
                                height: 1.6,
                                color: isDark ? AppColors.brown400 : AppColors.brown700,
                              ),
                            ),
                            const SizedBox(height: 14),
                            // Strength badge
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: def.strengthBadge,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('💪', style: TextStyle(fontSize: 14)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Strength',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            letterSpacing: 0.5,
                                            color: AppColors.sage,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          strength,
                                          style: TextStyle(
                                            fontSize: 12.5,
                                            height: 1.5,
                                            color: isDark ? Colors.white70 : AppColors.brown900,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Challenge badge
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: def.challengeBadge,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('⚡', style: TextStyle(fontSize: 14)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Challenge',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            letterSpacing: 0.5,
                                            color: AppColors.gold,
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          challenge,
                                          style: TextStyle(
                                            fontSize: 12.5,
                                            height: 1.5,
                                            color: isDark ? Colors.white70 : AppColors.brown900,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                      duration: const Duration(milliseconds: 250),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}
