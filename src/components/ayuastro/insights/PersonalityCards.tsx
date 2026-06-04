'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Heart,
  Briefcase,
  Wallet,
  Droplets,
  MessageSquare,
  Compass,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react';
import type { AstrologyInfo, NumerologyInfo, TraitScore } from '@/store/ayuastro-store';
// ─── Personality Card Interface ─────────────────────────────────────────────
export interface PersonalityCard {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string;
  strength: string;
  challenge: string;
  accentColor: string;        // Tailwind border-left color
  accentBg: string;           // Tailwind background tint
  strengthBadge: string;      // Badge class for strength
  challengeBadge: string;     // Badge class for challenge
  iconBg: string;             // Icon background
  iconColor: string;          // Icon text color
}
// ─── Zodiac Personality Data (Simple, Honest, No Jargon) ────────────────────
const PERSONALITY: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You are a firecracker — bold, impulsive, and impossible to ignore. You jump into things headfirst and figure out the details later. People either love your energy or find you a bit much, and honestly, you don\'t care which. You get bored fast and hate waiting.',
    strength: 'You have the courage to start things others only dream about.',
    challenge: 'You quit things just as fast as you start them when the excitement fades.',
  },
  Taurus: {
    summary: 'You are stubborn in the best and worst ways. Once you decide something, you stick with it — which makes you incredibly reliable but also frustratingly rigid. You love comfort, good food, and nice things, and you work hard to get them. Change is not your friend.',
    strength: 'Your loyalty and persistence are unmatched — you show up no matter what.',
    challenge: 'You dig your heels in so deep that you miss opportunities staring you in the face.',
  },
  Gemini: {
    summary: 'You are the person who knows a little bit about everything and can talk to anyone about anything. Your mind moves fast, maybe too fast, and you often have three conversations going at once. People think you\'re two-faced, but really you\'re just genuinely interested in everything.',
    strength: 'You can adapt to any room, any situation, any person — it\'s a real superpower.',
    challenge: 'You spread yourself so thin that nothing gets your full attention.',
  },
  Cancer: {
    summary: 'You feel everything at full volume, even when you pretend you don\'t. You protect the people you love like a guard dog, and your home is your sanctuary. You remember every slight and every kindness, probably forever. Your moods shift like the tides and you know it.',
    strength: 'Your emotional depth lets you connect with people in a way few others can.',
    challenge: 'You hold onto past hurts so tightly that they weigh you down today.',
  },
  Leo: {
    summary: 'You walk into a room like you own it, and usually people let you. You crave recognition — not because you\'re shallow, but because you genuinely want to be seen for who you are. You are generous to a fault, but you also have a temper when you feel unappreciated.',
    strength: 'Your warmth and confidence make people feel special just being around you.',
    challenge: 'You take criticism way too personally and can turn a small comment into a crisis.',
  },
  Virgo: {
    summary: 'You notice everything — every detail, every flaw, every way things could be better. You genuinely want to help, but your "help" often feels like criticism to others. You are your own worst enemy, setting standards nobody could meet, then beating yourself up for falling short.',
    strength: 'Your ability to improve anything you touch makes you invaluable.',
    challenge: 'You are never satisfied — with yourself, with others, with the world — and it exhausts you.',
  },
  Libra: {
    summary: 'You want everyone to get along and everything to be fair, which makes you the peacemaker but also the person who can\'t make a decision to save their life. You see every side of every argument, which is wise but paralyzing. You bend over backwards to keep the peace, even when you shouldn\'t.',
    strength: 'You can bring harmony to the most chaotic situations with grace.',
    challenge: 'You avoid confrontation so much that you swallow your own needs until you explode.',
  },
  Scorpio: {
    summary: 'You are intense, and you know it. You don\'t do anything halfway — love, work, anger, revenge. You see through people\'s BS instantly, which is both a gift and a curse. Trust is everything to you, and once it\'s broken, it\'s gone forever. You keep your secrets close.',
    strength: 'Your emotional courage lets you face truths that most people run from.',
    challenge: 'You can be vindictive and controlling when you feel threatened, and you feel threatened a lot.',
  },
  Sagittarius: {
    summary: 'You are the eternal optimist who believes the best is always yet to come. You love freedom more than almost anything and will run from anything that feels like a cage — including relationships, jobs, and routines. Your honesty is refreshing until it\'s brutal.',
    strength: 'Your ability to find meaning and humor in any situation lifts everyone around you.',
    challenge: 'You commit to things with your whole heart and then disappear when it gets real.',
  },
  Capricorn: {
    summary: 'You are the grown-up in every room, even when you were a kid. You take responsibility seriously, maybe too seriously. You measure your worth by what you\'ve achieved, which means you\'re always achieving and rarely celebrating. Beneath the serious exterior is a dry humor and deep loyalty.',
    strength: 'Your discipline and patience let you build things that actually last.',
    challenge: 'You tie your self-worth so tightly to success that failure destroys you inside.',
  },
  Aquarius: {
    summary: 'You think differently than everyone else, and you pride yourself on that. You care about humanity in the abstract but can be oddly detached with the people right in front of you. You march to your own drum and don\'t care if anyone follows, which is both inspiring and isolating.',
    strength: 'Your vision for how things could be is genuinely revolutionary.',
    challenge: 'You keep people at arm\'s length and call it independence when it\'s really fear of vulnerability.',
  },
  Pisces: {
    summary: 'You live between the real world and whatever\'s happening in your head, and the inner world usually wins. You absorb other people\'s emotions like a sponge, which makes you deeply empathetic but also easily overwhelmed. You have a hard time saying no and an easy time escaping.',
    strength: 'Your empathy and imagination let you create and connect in ways others can\'t.',
    challenge: 'You avoid reality when it gets uncomfortable, and reality always catches up.',
  },
};
// ─── Love Style Data ────────────────────────────────────────────────────────
const LOVE_STYLE: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You fall hard and fast, chasing the thrill of new love like a sport. The chase excites you more than the relationship sometimes. You need a partner who keeps things exciting or you\'ll start looking elsewhere. Passion is your love language, and without it, you feel dead inside.',
    strength: 'You make your partner feel like the most exciting person alive.',
    challenge: 'You confuse excitement with love and bolt when things get routine.',
  },
  Taurus: {
    summary: 'You love through acts of devotion — cooking, cuddling, building a life together. Physical touch and stability matter more to you than grand romantic gestures. You are in it for the long haul, but you need to feel secure or jealousy eats you alive.',
    strength: 'You show up consistently, making your partner feel safe and cherished.',
    challenge: 'You can be possessive and jealous, treating your partner like something you own.',
  },
  Gemini: {
    summary: 'You fall in love with people\'s minds first. A great conversation turns you on more than a pretty face. You need mental stimulation in a relationship or you\'ll get bored and start flirting with the next interesting person who comes along. Variety isn\'t cheating to you — it\'s oxygen.',
    strength: 'You keep relationships fresh, fun, and intellectually alive.',
    challenge: 'You get restless in relationships and often have one foot out the door.',
  },
  Cancer: {
    summary: 'You love with your whole chest — nurturing, protecting, and sometimes smothering. You want a deep emotional bond more than anything, and you\'ll create a cozy home life to make it happen. Your partner is your family, and you treat them like it, for better or worse.',
    strength: 'You create emotional safety that lets your partner be fully themselves.',
    challenge: 'You guilt-trip and emotionally manipulate when you feel unloved or insecure.',
  },
  Leo: {
    summary: 'You love being in love — the romance, the drama, the grand gestures. You want to be adored and you want to adore someone right back. You are fiercely loyal when you feel appreciated, but you need a lot of attention. Ignoring a Leo in love is asking for trouble.',
    strength: 'You make love feel magical, generous, and larger than life.',
    challenge: 'You need constant admiration and can turn cold when you feel taken for granted.',
  },
  Virgo: {
    summary: 'You show love by fixing things — your partner\'s problems, their schedule, their life. It\'s your awkward way of saying "I care." You\'re not big on mushy declarations, but you\'ll remember their doctor\'s appointment and pack their lunch. You need someone who reads between the lines.',
    strength: 'Your thoughtfulness and reliability make you a partner who truly shows up.',
    challenge: 'Your "helpful suggestions" often feel like criticism and push your partner away.',
  },
  Libra: {
    summary: 'You are a romantic at heart who believes in soulmates and fairytale endings. You want a partnership that\'s equal, beautiful, and harmonious. You\'ll compromise endlessly to keep the peace, sometimes giving up pieces of yourself in the process. Being single feels wrong to you.',
    strength: 'You make your partner feel like they\'re part of a true team.',
    challenge: 'You lose yourself in relationships by putting your partner\'s needs above your own.',
  },
  Scorpio: {
    summary: 'You don\'t do casual — love is all or nothing for you. You want to know your partner\'s darkest secrets and share your own. Intimacy is everything, and without deep emotional and physical connection, you\'re just going through the motions. Betrayal is unforgivable, period.',
    strength: 'Your devotion is fierce — when you love, your partner feels utterly chosen.',
    challenge: 'You test your partner\'s loyalty constantly and can be destructive when insecure.',
  },
  Sagittarius: {
    summary: 'You need a partner who\'s also your best friend and travel buddy. Freedom in a relationship is non-negotiable for you. You love deeply but hate feeling trapped, and you\'ll choose adventure over a night in almost every time. Commitment scares you, but so does being alone.',
    strength: 'You bring adventure and growth into your partner\'s life effortlessly.',
    challenge: 'You fear commitment so deeply that you sabotage good relationships to stay free.',
  },
  Capricorn: {
    summary: 'You take love as seriously as you take your career — it\'s a long-term investment. You are not the type to fall in love overnight. You show love through commitment, financial security, and building a future together. Romance without structure feels unstable to you.',
    strength: 'Your loyalty and dedication make you a rock-solid partner through anything.',
    challenge: 'You prioritize work and achievement over emotional connection and leave your partner feeling lonely.',
  },
  Aquarius: {
    summary: 'You love unconventionally — you need space, intellectual connection, and a partner who respects your individuality. Traditional romance feels a bit silly to you. You\'d rather have a deep 3am conversation than a candlelit dinner. Emotional demands make you pull away.',
    strength: 'You accept your partner exactly as they are without trying to change them.',
    challenge: 'You are emotionally unavailable when your partner needs you most and call it "giving space."',
  },
  Pisces: {
    summary: 'You love with a depth that borders on self-sacrifice. You want to merge with your partner completely — emotionally, spiritually, physically. You romanticize relationships and often fall in love with who you want someone to be, not who they actually are. Boundaries are your eternal struggle.',
    strength: 'Your compassion and sensitivity create the most intimate emotional bond possible.',
    challenge: 'You lose yourself in your partner and stay in bad relationships because you feel too much empathy to leave.',
  },
};
// ─── Career Path Data ───────────────────────────────────────────────────────
const CAREER_PATH: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You are built for leadership, or at least for being the one who starts things. You thrive in competitive, fast-paced environments where you can take charge. Corporate bureaucracy kills your soul. You do best when you can move fast and break things, literally or figuratively.',
    strength: 'You have the initiative to launch projects and the courage to take bold professional risks.',
    challenge: 'You hate taking orders and often clash with authority figures who you think are slower than you.',
  },
  Taurus: {
    summary: 'You are the steady builder who creates lasting value. You are drawn to careers involving art, finance, food, or real estate — anything you can see and touch. You work methodically and hate being rushed. A stable paycheck matters more to you than a flashy title.',
    strength: 'Your patience and persistence let you outlast everyone else in the room.',
    challenge: 'You resist change so stubbornly that you miss industry shifts until it\'s too late.',
  },
  Gemini: {
    summary: 'You need a career that keeps your mind busy — writing, teaching, media, sales, or anything involving communication. You get bored doing the same thing every day and need variety to stay engaged. You are the person who has had five different career ideas this year.',
    strength: 'Your communication skills and adaptability make you valuable in almost any field.',
    challenge: 'You start projects with passion and abandon them when something shinier comes along.',
  },
  Cancer: {
    summary: 'You are drawn to careers where you can nurture and care for others — healthcare, education, hospitality, or counseling. You need to feel emotionally connected to your work or it feels meaningless. A toxic workplace drains you faster than anyone else.',
    strength: 'Your emotional intelligence makes you an incredible manager and team builder.',
    challenge: 'You take workplace criticism personally and let office politics eat you alive.',
  },
  Leo: {
    summary: 'You need to be seen and appreciated at work — not just as a cog in a machine. You are drawn to creative fields, leadership roles, entertainment, or any career where your personality can shine. Being ignored at work is your personal nightmare.',
    strength: 'Your charisma and confidence make people want to follow you and buy from you.',
    challenge: 'You take on too much because you can\'t say no to the spotlight, then burn out.',
  },
  Virgo: {
    summary: 'You are the detail-oriented perfectionist who makes everything work better. You excel in analysis, editing, healthcare, research, or any field where precision matters. You are the person everyone comes to when they need something done right. But you already know that.',
    strength: 'Your analytical mind catches problems others miss and creates systems that actually work.',
    challenge: 'You overwork yourself because you can\'t delegate — nobody does it "right" enough for you.',
  },
  Libra: {
    summary: 'You are built for careers involving people, aesthetics, or justice — law, design, diplomacy, HR, or event planning. You create harmony in chaotic work environments and make clients feel valued. But decision-making is your professional Achilles heel.',
    strength: 'Your ability to see all perspectives makes you a brilliant mediator and negotiator.',
    challenge: 'You overthink decisions and avoid necessary conflict until problems become crises.',
  },
  Scorpio: {
    summary: 'You are drawn to careers that involve investigation, power, or transformation — research, psychology, finance, surgery, or crisis management. You need work that feels meaningful at a deep level, not just a paycheck. Superficial jobs bore you to tears.',
    strength: 'Your intensity and focus let you master complex subjects and uncover truths others miss.',
    challenge: 'You can be paranoid about colleagues\' motives and hold professional grudges forever.',
  },
  Sagittarius: {
    summary: 'You need a career that lets you learn, teach, or explore — travel, education, publishing, philosophy, or entrepreneurship. Sitting at a desk doing repetitive work is your version of prison. You need freedom and meaning in your work, or you\'ll find a way to escape.',
    strength: 'Your optimism and vision inspire teams and open doors others can\'t see.',
    challenge: 'You lack follow-through — great at starting, terrible at finishing the boring parts.',
  },
  Capricorn: {
    summary: 'You are the career powerhouse of the zodiac. You are driven, strategic, and willing to put in years of hard work for long-term success. You respect authority and hierarchy because you plan to be at the top someday. You measure your value by your achievements.',
    strength: 'Your discipline and strategic thinking let you climb higher than anyone expects.',
    challenge: 'You sacrifice your personal life and health for career success and don\'t realize it until it\'s gone.',
  },
  Aquarius: {
    summary: 'You are the innovator who wants to change the system, not work within it. You are drawn to tech, science, activism, or any field where you can challenge the status quo. You work best with independence and a mission. Corporate conformity is your kryptonite.',
    strength: 'Your original thinking creates breakthroughs that traditional minds would never see.',
    challenge: 'You dismiss practical constraints as "small thinking" and alienate people who could help you.',
  },
  Pisces: {
    summary: 'You are drawn to creative or healing careers — art, music, therapy, spirituality, or anything that involves imagination and compassion. You need work that feels meaningful or you\'ll just drift. You are terrible at office politics because you can feel everyone\'s hidden agendas.',
    strength: 'Your creativity and empathy produce work that touches people deeply.',
    challenge: 'You struggle with structure and deadlines, preferring to work in your own dreamy timeline.',
  },
};
// ─── Money Pattern Data ─────────────────────────────────────────────────────
const MONEY_PATTERN: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You spend money as fast as you make it because impulse buying is your love language. You see something, you want it, you buy it — budget be damned. You are generous to a fault with friends but terrible at long-term financial planning.',
    strength: 'Your risk-taking instinct can land you lucrative opportunities others would pass on.',
    challenge: 'You blow through money on impulse purchases and have nothing to show for it.',
  },
  Taurus: {
    summary: 'You are the saver of the zodiac — not because you\'re cheap, but because you love security. You spend on quality things that last: good furniture, good food, good clothes. But you can be stingy when it comes to spending on experiences over possessions.',
    strength: 'Your patience with money lets you build real, lasting wealth over time.',
    challenge: 'You are so cautious with money that you miss investment opportunities that could change your life.',
  },
  Gemini: {
    summary: 'You have money in five different accounts and three different side hustles, and somehow you\'re still broke. Your spending follows your interests — whatever you\'re currently obsessed with gets all your money. Financial consistency is not your strong suit.',
    strength: 'Your ability to spot trends and juggle multiple income streams keeps money flowing.',
    challenge: 'You have no financial consistency — your income and spending are all over the place.',
  },
  Cancer: {
    summary: 'You save money for security the way a squirrel hoards nuts — aggressively and anxiously. Money represents safety to you, and not having enough keeps you up at night. You spend generously on your home and family but can be surprisingly frugal with yourself.',
    strength: 'Your instinct to save for a rainy day means you are almost always financially prepared.',
    challenge: 'Your financial anxiety makes you hoard money instead of investing it for growth.',
  },
  Leo: {
    summary: 'You spend money to feel good and look good — generous tips, expensive dinners, impressive gifts. You want the best of everything and you want people to see it. Your financial self-control is weak when your ego is involved, which is always.',
    strength: 'Your confidence in investing in yourself often pays off in career advancement.',
    challenge: 'You spend to impress others and end up living beyond your means regularly.',
  },
  Virgo: {
    summary: 'You track every rupee, every subscription, every recurring charge. You have a budget spreadsheet that would make an accountant proud. You are practical about money but can be so focused on details that you miss the big financial picture.',
    strength: 'Your attention to financial detail means you rarely waste money or miss an error.',
    challenge: 'You micromanage your finances so tightly that you miss bigger wealth-building opportunities.',
  },
  Libra: {
    summary: 'You spend money on beautiful things and shared experiences — dinners, gifts, art, and anything that makes life more elegant. You can\'t stand cheap anything. You often spend to keep peace or make someone happy, even when you shouldn\'t.',
    strength: 'Your taste and social instincts lead you to investments and purchases that appreciate.',
    challenge: 'You spend too much trying to maintain a lifestyle that looks good from the outside.',
  },
  Scorpio: {
    summary: 'You are secretive about money — nobody knows how much you make, spend, or save. You are strategic with investments and can be ruthless in financial negotiations. You see money as power, and you use it that way. Joint finances are a minefield for you.',
    strength: 'Your strategic mind and research skills make you a savvy, calculated investor.',
    challenge: 'Your obsession with financial control damages trust in relationships with shared money.',
  },
  Sagittarius: {
    summary: 'Money is just a tool for your next adventure as far as you\'re concerned. You spend freely on travel, education, and experiences, and you figure the money will come back somehow. It usually does, but not always in time. Budgeting feels like a cage.',
    strength: 'Your willingness to invest in experiences and learning creates unique opportunities.',
    challenge: 'You have zero financial discipline and live in a constant cycle of feast and famine.',
  },
  Capricorn: {
    summary: 'You treat money seriously, strategically, and with long-term goals in mind. You invest rather than spend, save rather than splurge, and always have a retirement plan. But you can be so focused on building wealth that you forget money is meant to be enjoyed too.',
    strength: 'Your long-term financial planning and discipline build wealth that compounds over decades.',
    challenge: 'You are so focused on future wealth that you never enjoy the money you have right now.',
  },
  Aquarius: {
    summary: 'You either don\'t care about money at all or you\'re investing in cryptocurrency and tech startups — there is no in-between. You are drawn to unconventional ways of making and spending money. Traditional financial advice goes in one ear and out the other.',
    strength: 'Your willingness to bet on unconventional ideas can create massive financial breakthroughs.',
    challenge: 'You ignore practical financial basics and take risks that can wipe you out.',
  },
  Pisces: {
    summary: 'Money is abstract to you — you know you need it but you don\'t want to think about it. You are generous to a fault, often giving money to people who need it more than you do (or so you think). You avoid looking at your bank account because the numbers stress you out.',
    strength: 'Your generosity and intuition sometimes lead you to investments that feel right and actually are.',
    challenge: 'You avoid managing money entirely and often don\'t know where yours actually goes.',
  },
};
// ─── Emotional Nature Data ──────────────────────────────────────────────────
const EMOTIONAL_NATURE: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'Your emotions are like a match — they flare up fast and hot, then burn out quickly. You feel anger before any other emotion and you express it before you even process it. You don\'t hold grudges, which is great, but you also don\'t sit with uncomfortable feelings long enough to learn from them.',
    strength: 'You process emotions quickly and move on faster than almost anyone.',
    challenge: 'You react before you think and say things in anger that you can\'t take back.',
  },
  Taurus: {
    summary: 'Your emotions run deep and slow like a river — steady, powerful, and hard to redirect. You don\'t get upset easily, but when you do, it\'s a full earthquake. You process feelings through your body — tension, eating, or physical comfort. Change to your emotional world feels like a threat.',
    strength: 'Your emotional stability provides a grounding force for everyone around you.',
    challenge: 'You bottle up feelings until they explode, and your stubbornness prevents you from seeking help.',
  },
  Gemini: {
    summary: 'Your emotions change direction like the wind — you can be laughing one minute and deeply anxious the next. You intellectualize your feelings instead of feeling them, which helps you understand them but keeps you from actually processing them. You talk about emotions more than you sit with them.',
    strength: 'Your ability to articulate your feelings helps you and others understand complex emotions.',
    challenge: 'You think about your feelings instead of feeling them, and you distract yourself from pain.',
  },
  Cancer: {
    summary: 'You feel everything, always, at maximum volume. Other people\'s emotions affect you as much as your own, which is both your gift and your curse. You process the world through feelings first and logic second. Your moods shift with the Moon, and you need alone time to recharge your emotional batteries.',
    strength: 'Your emotional depth and empathy create connections that feel truly healing.',
    challenge: 'You absorb others\' emotions until you can\'t tell which feelings are yours and which are theirs.',
  },
  Leo: {
    summary: 'Your emotions are big, dramatic, and center stage — you feel things intensely and you want people to know it. You process feelings through expression — talking, creating, performing. Being ignored hurts you more than being criticized. Your pride protects your fragile heart more than you\'d like to admit.',
    strength: 'Your emotional warmth and generosity make people feel safe to express themselves around you.',
    challenge: 'Your pride prevents you from showing vulnerability and asking for help when you need it most.',
  },
  Virgo: {
    summary: 'You process emotions through analysis — you try to understand why you feel something before you let yourself actually feel it. You express care through acts of service, not emotional declarations. Your inner critic is loud and mean, and you often mistake anxiety for intuition.',
    strength: 'Your emotional self-awareness helps you understand and improve your patterns over time.',
    challenge: 'You judge your own emotions as "irrational" and suppress them until they show up as anxiety or physical symptoms.',
  },
  Libra: {
    summary: 'You want emotional harmony above all else — conflict makes you physically uncomfortable. You process your feelings through relationships and need to talk things out. But you often minimize your own emotions to keep the peace, which means you carry hidden resentment like a backpack of stones.',
    strength: 'Your ability to hold space for others\' emotions while staying balanced is rare and valuable.',
    challenge: 'You suppress your real feelings to maintain peace and end up resenting people who don\'t do the same for you.',
  },
  Scorpio: {
    summary: 'Your emotional world is like an ocean — deep, dark, and with powerful currents beneath the surface. You feel everything intensely but show very little on the outside. You process emotions through transformation — you need to feel things fully to move through them. Emotional pain transforms you.',
    strength: 'Your emotional courage lets you face the darkest feelings and come out stronger every time.',
    challenge: 'You hold onto emotional pain as if letting go means losing a part of yourself.',
  },
  Sagittarius: {
    summary: 'You process emotions through movement and meaning — you need to understand the bigger picture of why you feel something. You use humor as your primary defense mechanism and philosophy as your coping strategy. Sitting with sadness feels like a waste of time to you, but avoiding it costs you more.',
    strength: 'Your ability to find meaning and growth in emotional pain is genuinely inspiring.',
    challenge: 'You run from difficult emotions — physically, mentally, or spiritually — instead of sitting with them.',
  },
  Capricorn: {
    summary: 'You treat emotions like obstacles to productivity — you push them down and push through. You were probably told to "be strong" growing up and took it literally. Your emotional world is rich but private, and you only show vulnerability to people who have earned it over years. Feelings feel like weakness to you.',
    strength: 'Your emotional resilience and composure hold steady in the toughest situations.',
    challenge: 'You repress emotions so deeply that they eventually show up as depression, burnout, or physical illness.',
  },
  Aquarius: {
    summary: 'You process emotions intellectually — you observe your feelings like a scientist rather than experiencing them. You can talk about emotions objectively but struggle to actually feel them in real time. Detachment is both your coping mechanism and your prison. You care about humanity but freeze when someone cries in front of you.',
    strength: 'Your emotional objectivity lets you stay calm and find solutions in emotional crises.',
    challenge: 'You detach from your feelings so often that you don\'t know what you actually feel anymore.',
  },
  Pisces: {
    summary: 'You don\'t just feel emotions — you absorb them from the atmosphere like a sponge. Your emotional boundaries are so thin that you often can\'t tell where your feelings end and others\' begin. You process the world through feeling, and you escape when it gets too heavy — through sleep, daydreaming, or less healthy habits.',
    strength: 'Your emotional sensitivity lets you understand and comfort people in ways that feel almost magical.',
    challenge: 'You escape painful emotions instead of facing them, and your avoidance makes everything worse.',
  },
};
// ─── Communication Style Data ───────────────────────────────────────────────
const COMMUNICATION_STYLE: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You say what you think the moment you think it — no filter, no pause, no regrets (until later). Your communication is direct, sometimes aggressive, and always honest. You don\'t do subtle hints. If something bothers you, people will know immediately.',
    strength: 'Your directness cuts through confusion and gets to the point fast.',
    challenge: 'You come across as confrontational and often hurt people without realizing it.',
  },
  Taurus: {
    summary: 'You communicate slowly and deliberately — you think before you speak and you mean what you say. You are not one for big speeches or emotional declarations. You prefer showing over telling. When you do speak up, people listen because they know you\'re not wasting words.',
    strength: 'Your words carry weight because you only say what you truly mean.',
    challenge: 'You communicate so slowly and stubbornly that people think you don\'t care.',
  },
  Gemini: {
    summary: 'You are the communicator of the zodiac — you talk, write, text, and think in words constantly. You can explain anything to anyone and make it interesting. But you also talk so much that you sometimes don\'t listen, and you change your story depending on who you\'re talking to.',
    strength: 'Your ability to articulate complex ideas simply makes you a natural teacher and storyteller.',
    challenge: 'You talk so much that people stop listening, and you contradict yourself without noticing.',
  },
  Cancer: {
    summary: 'You communicate through emotion — your tone, your body language, and your actions speak louder than your words. You are deeply intuitive and can sense what someone really means even when they say something different. But you also use silence as a weapon and expect people to read your mind.',
    strength: 'Your emotional intelligence lets you hear what people mean, not just what they say.',
    challenge: 'You use passive-aggressive silence instead of saying what\'s wrong and expect people to just know.',
  },
  Leo: {
    summary: 'You communicate to be heard and remembered — you have a natural charisma that draws people in. You tell great stories, give confident opinions, and command attention. But you can dominate conversations and turn every topic back to yourself without meaning to.',
    strength: 'Your expressive, warm communication style makes people feel engaged and energized.',
    challenge: 'You dominate conversations and make everything about you, leaving no room for others.',
  },
  Virgo: {
    summary: 'You communicate with precision — every word is chosen carefully, every fact is checked. You are brilliant at explaining complicated things clearly, but you also correct people constantly and it drives them crazy. You think you\'re being helpful; they think you\'re being annoying.',
    strength: 'Your precise, clear communication leaves no room for misunderstanding.',
    challenge: 'You correct people so often that they feel like you\'re grading them, not talking to them.',
  },
  Libra: {
    summary: 'You communicate to create harmony — you are diplomatic, charming, and excellent at making people feel heard. You can see every side of an argument and articulate it fairly. But your desire to please everyone means you sometimes say what people want to hear instead of what you actually think.',
    strength: 'Your diplomatic communication resolves conflicts and makes everyone feel respected.',
    challenge: 'You say what people want to hear instead of the truth, and people stop trusting your word.',
  },
  Scorpio: {
    summary: 'You communicate like a detective — you ask probing questions, reveal little about yourself, and see right through people\'s BS. Your words are powerful and you know it. You use silence strategically and can cut people deep with a single sentence when you choose to.',
    strength: 'Your perceptiveness and honesty cut through superficial conversations to what actually matters.',
    challenge: 'You use words as weapons and can destroy someone\'s confidence with a single comment.',
  },
  Sagittarius: {
    summary: 'You communicate with the subtlety of a freight train — you say whatever pops into your head with zero filter. You are funny, blunt, and philosophically rambling. You think you\'re being honest; other people think you\'re being rude. You mean well but your foot lives in your mouth.',
    strength: 'Your honesty and humor make conversations with you genuinely fun and refreshing.',
    challenge: 'Your "brutal honesty" is often just brutal, and you hurt people while calling it truth-telling.',
  },
  Capricorn: {
    summary: 'You communicate with authority and economy — you say what needs to be said and nothing more. You are not one for small talk or emotional discussions. Your dry wit surprises people who expect you to be all business. You show care through practical advice, not warm words.',
    strength: 'Your communication is clear, authoritative, and commands respect immediately.',
    challenge: 'You come across as cold and unfeeling because you communicate facts instead of feelings.',
  },
  Aquarius: {
    summary: 'You communicate in ideas — big, revolutionary, unconventional ideas that excite you but confuse everyone else. You are great at explaining concepts but terrible at expressing feelings. You communicate in theories when people just want to know how you\'re doing. Your texts read like academic papers.',
    strength: 'Your original perspective brings fresh ideas to every conversation you\'re in.',
    challenge: 'You communicate so abstractly that people can\'t connect with what you\'re actually saying.',
  },
  Pisces: {
    summary: 'You communicate through feeling, metaphor, and intuition — not direct statements. You speak in a way that\'s poetic and sometimes vague, which makes people feel something even when they\'re not sure what you mean. You are an incredible listener when you\'re present, but your mind often drifts.',
    strength: 'Your empathetic, creative communication makes people feel deeply understood.',
    challenge: 'You are so vague that people don\'t know what you actually want or need from them.',
  },
};
// ─── Life Purpose Data ──────────────────────────────────────────────────────
const LIFE_PURPOSE: Record<string, { summary: string; strength: string; challenge: string }> = {
  Aries: {
    summary: 'You are here to learn courage — not the reckless kind you already have, but the kind that means staying when you want to run and being vulnerable when you want to fight. Your purpose is to lead by example, showing others that fear is not the enemy. The lesson you keep avoiding? Patience and persistence.',
    strength: 'Your soul\'s gift is the ability to inspire others to take brave first steps.',
    challenge: 'The lesson you keep avoiding is that true courage means staying, not leaving when things get hard.',
  },
  Taurus: {
    summary: 'You are here to learn what is truly valuable — not just money and possessions, but love, presence, and inner peace. Your purpose is to build something lasting, whether that\'s a home, a legacy, or a body of work. The lesson you keep avoiding? Letting go of what no longer serves you.',
    strength: 'Your soul\'s gift is the ability to create stability and beauty where there was chaos.',
    challenge: 'The lesson you keep avoiding is that holding on too tightly to anything slowly crushes it.',
  },
  Gemini: {
    summary: 'You are here to learn depth — to go beyond the surface of everything you skim. Your purpose is to be the bridge between ideas and people, translating complex truths into language everyone can understand. The lesson you keep avoiding? Commitment and staying power.',
    strength: 'Your soul\'s gift is the ability to connect people and ideas that were never supposed to meet.',
    challenge: 'The lesson you keep avoiding is that mastery requires sticking with one thing long past the point of boredom.',
  },
  Cancer: {
    summary: 'You are here to learn emotional independence — to care deeply without losing yourself in other people\'s feelings. Your purpose is to create spaces where people feel safe to be real, starting with yourself. The lesson you keep avoiding? Letting people take care of you for once.',
    strength: 'Your soul\'s gift is the ability to create emotional safety that transforms people\'s lives.',
    challenge: 'The lesson you keep avoiding is that you can\'t heal everyone, and trying to is destroying you.',
  },
  Leo: {
    summary: 'You are here to learn authentic self-expression — not performance, not ego, but the real you underneath the spotlight. Your purpose is to shine so brightly that others give themselves permission to do the same. The lesson you keep avoiding? That you are worthy even without an audience.',
    strength: 'Your soul\'s gift is the ability to make others feel seen, celebrated, and alive.',
    challenge: 'The lesson you keep avoiding is that your worth exists with or without applause.',
  },
  Virgo: {
    summary: 'You are here to learn self-acceptance — to love yourself as imperfectly as you love others. Your purpose is to bring order to chaos, to heal through service, and to show the world that small improvements create big change. The lesson you keep avoiding? That you are enough exactly as you are.',
    strength: 'Your soul\'s gift is the ability to see exactly what needs healing and know how to fix it.',
    challenge: 'The lesson you keep avoiding is that your imperfections are not flaws — they\'re what make you human.',
  },
  Libra: {
    summary: 'You are here to learn true partnership — not dependency, not people-pleasing, but the kind of relationship where two whole people create something greater together. Your purpose is to bring beauty, fairness, and connection to a world that desperately needs all three. The lesson you keep avoiding? Standing alone when necessary.',
    strength: 'Your soul\'s gift is the ability to create beauty and harmony that elevates everyone around you.',
    challenge: 'The lesson you keep avoiding is that some battles are worth fighting, even if they break the peace.',
  },
  Scorpio: {
    summary: 'You are here to learn surrender — to let go of control and trust that transformation happens through release, not force. Your purpose is to be the phoenix that shows others that death of the old self is not the end but the beginning. The lesson you keep avoiding? Forgiveness, of others and yourself.',
    strength: 'Your soul\'s gift is the ability to transform pain into power and show others how to do the same.',
    challenge: 'The lesson you keep avoiding is that holding onto pain doesn\'t protect you — it imprisons you.',
  },
  Sagittarius: {
    summary: 'You are here to learn that meaning comes from depth, not distance. Your purpose is to be the seeker who brings back wisdom from every corner of life and shares it generously. The lesson you keep avoiding? That the most important journey is the one inward, not outward.',
    strength: 'Your soul\'s gift is the ability to find meaning everywhere and inspire others to keep exploring.',
    challenge: 'The lesson you keep avoiding is that staying put and going deep can be the greatest adventure.',
  },
  Capricorn: {
    summary: 'You are here to learn that your worth is not your work. Your purpose is to build structures that outlast you — not just companies and careers, but families, communities, and legacies of integrity. The lesson you keep avoiding? Letting yourself be vulnerable and asking for help.',
    strength: 'Your soul\'s gift is the ability to build lasting structures that support generations.',
    challenge: 'The lesson you keep avoiding is that the strongest foundation includes asking for support.',
  },
  Aquarius: {
    summary: 'You are here to learn that revolution requires connection, not just ideas. Your purpose is to envision a better future and make it real — but not alone. The change you want to see in the world starts with your willingness to be truly seen by the people closest to you. The lesson you keep avoiding? Emotional intimacy.',
    strength: 'Your soul\'s gift is the ability to see the future and show others what\'s possible.',
    challenge: 'The lesson you keep avoiding is that you can\'t change the world while running from your own heart.',
  },
  Pisces: {
    summary: 'You are here to learn boundaries — to give without depleting, to dream without escaping, and to serve without self-sacrifice. Your purpose is to remind the world that compassion and imagination are the most powerful forces on Earth. The lesson you keep avoiding? Facing reality instead of floating above it.',
    strength: 'Your soul\'s gift is the ability to channel compassion and creativity that heals the world.',
    challenge: 'The lesson you keep avoiding is that you can\'t save others if you keep drowning yourself.',
  },
};
// ─── Numerology Modifiers ───────────────────────────────────────────────────
const LIFE_PATH_MODIFIER: Record<number, { personality: string; love: string; career: string; money: string; emotional: string; communication: string; purpose: string }> = {
  1: {
    personality: 'Your Life Path 1 adds a fierce independence to everything you do — you are not built to follow.',
    love: 'Life Path 1 makes you need a partner who respects your autonomy without making you feel alone.',
    career: 'With Life Path 1, you are destined to lead or create something original — working for someone else drains your soul.',
    money: 'Life Path 1 means your financial success comes through self-reliance and bold individual moves.',
    emotional: 'With Life Path 1, your emotional challenge is letting yourself need people when you\'re wired to go it alone.',
    communication: 'Life Path 1 makes you a natural decision-maker in conversations, but you can steamroll others\' opinions.',
    purpose: 'Your Life Path 1 means you\'re here to pioneer — to be the first to do something that opens doors for others.',
  },
  2: {
    personality: 'Your Life Path 2 adds deep sensitivity and a need for partnership — you are not built to go it alone.',
    love: 'Life Path 2 makes you a devoted partner who thrives in harmony but can lose yourself in the relationship.',
    career: 'With Life Path 2, you are at your best in supportive roles — mediating, counseling, or collaborating.',
    money: 'Life Path 2 means you build wealth through partnerships and cooperation, not solo hustle.',
    emotional: 'With Life Path 2, you feel others\' emotions as your own, which is exhausting and beautiful at once.',
    communication: 'Life Path 2 makes you a careful, considerate communicator who avoids conflict at all costs.',
    purpose: 'Your Life Path 2 means you\'re here to bring people together — to be the bridge between worlds.',
  },
  3: {
    personality: 'Your Life Path 3 adds creative fire and charm — you light up rooms but struggle to go deep alone.',
    love: 'Life Path 3 makes you playful and expressive in love, but you use humor to hide what really hurts.',
    career: 'With Life Path 3, you are built for creative expression — writing, performing, teaching, or anything that uses your voice.',
    money: 'Life Path 3 means money comes through creative pursuits but managing it is your weak spot.',
    emotional: 'With Life Path 3, your emotions are colorful and dramatic — you feel life at full volume.',
    communication: 'Life Path 3 makes you a magnetic storyteller who can captivate any audience.',
    purpose: 'Your Life Path 3 means you\'re here to create and inspire — to turn pain into beauty for others.',
  },
  4: {
    personality: 'Your Life Path 4 adds structure and discipline — you are the foundation others build on.',
    love: 'Life Path 4 makes you a loyal, reliable partner, but you can be rigid and emotionally closed off.',
    career: 'With Life Path 4, you are built for methodical work — engineering, organizing, building systems that last.',
    money: 'Life Path 4 means financial stability comes through hard work, budgeting, and long-term planning.',
    emotional: 'With Life Path 4, you process emotions through structure — you want to fix feelings, not feel them.',
    communication: 'Life Path 4 makes you a clear, factual communicator who skips the fluff and gets to work.',
    purpose: 'Your Life Path 4 means you\'re here to build — to create order from chaos and structure that serves many.',
  },
  5: {
    personality: 'Your Life Path 5 adds restlessness and adventure — you are built for change and freedom.',
    love: 'Life Path 5 makes you exciting but noncommittal — you love the spark more than the steady flame.',
    career: 'With Life Path 5, you need variety — travel, media, sales, or entrepreneurship suit you best.',
    money: 'Life Path 5 means money comes in bursts and goes just as fast — consistency is your financial challenge.',
    emotional: 'With Life Path 5, your emotions are wild and free — you feel everything intensely but move on fast.',
    communication: 'Life Path 5 makes you a dynamic, persuasive communicator who can sell anything to anyone.',
    purpose: 'Your Life Path 5 means you\'re here to experience everything and teach others that freedom is worth the risk.',
  },
  6: {
    personality: 'Your Life Path 6 adds responsibility and care — you are the one everyone leans on.',
    love: 'Life Path 6 makes you a nurturing partner who gives everything, sometimes without getting enough back.',
    career: 'With Life Path 6, you are drawn to service — healthcare, teaching, counseling, or hospitality.',
    money: 'Life Path 6 means you spend on others before yourself — generosity is your financial pattern.',
    emotional: 'With Life Path 6, your emotions are tied to how the people you love are doing — their pain is your pain.',
    communication: 'Life Path 6 makes you a warm, supportive communicator who always has kind words ready.',
    purpose: 'Your Life Path 6 means you\'re here to nurture — to create love and safety that transforms lives.',
  },
  7: {
    personality: 'Your Life Path 7 adds depth and introspection — you are the thinker who needs to understand everything.',
    love: 'Life Path 7 makes you cautious in love — you analyze feelings before you let yourself feel them.',
    career: 'With Life Path 7, you are built for research, analysis, or spiritual work — depth is your currency.',
    money: 'Life Path 7 means you are careful with money and prefer investing in knowledge over material things.',
    emotional: 'With Life Path 7, your emotional world is rich but hidden — you process feelings through thinking.',
    communication: 'Life Path 7 makes you a thoughtful, deep communicator who prefers meaningful conversations over small talk.',
    purpose: 'Your Life Path 7 means you\'re here to seek truth — to find answers that illuminate the path for others.',
  },
  8: {
    personality: 'Your Life Path 8 adds ambition and power — you are built to achieve and accumulate.',
    love: 'Life Path 8 makes you a generous but controlling partner — you show love through providing.',
    career: 'With Life Path 8, you are destined for leadership, business, or finance — power is your natural habitat.',
    money: 'Life Path 8 means you are wired for wealth — but the pursuit can consume you if you\'re not careful.',
    emotional: 'With Life Path 8, your emotions are tied to achievement — failure hits you harder than you let on.',
    communication: 'Life Path 8 makes you a commanding, authoritative communicator who expects to be heard.',
    purpose: 'Your Life Path 8 means you\'re here to master the material world and use your power to uplift others.',
  },
  9: {
    personality: 'Your Life Path 9 adds wisdom and compassion — you are the old soul who feels the world\'s pain.',
    love: 'Life Path 9 makes you a romantic idealist who gives too much and receives too little.',
    career: 'With Life Path 9, you are drawn to healing, teaching, or humanitarian work — service is your calling.',
    money: 'Life Path 9 means money is just a tool for you — you give it away faster than you should.',
    emotional: 'With Life Path 9, your emotions are tied to the world\'s suffering — you feel the pain of strangers.',
    communication: 'Life Path 9 makes you an inspiring, philosophical communicator who sees the big picture.',
    purpose: 'Your Life Path 9 means you\'re here to serve — to use your wisdom and compassion to heal the world.',
  },
  11: {
    personality: 'Your Life Path 11 adds intuition and sensitivity at a master level — you feel things others can\'t explain.',
    love: 'Life Path 11 makes you crave soul-level connection — surface relationships feel meaningless to you.',
    career: 'With Life Path 11, you are built for spiritual or creative leadership — you see what others can\'t yet.',
    money: 'Life Path 11 means money flows when you follow your intuition, not when you chase it logically.',
    emotional: 'With Life Path 11, your emotions are electric — you feel the energy of rooms and people instantly.',
    communication: 'Life Path 11 makes you an inspired communicator — your words carry a vibration that moves people.',
    purpose: 'Your Life Path 11 means you\'re here to illuminate — to channel insight that awakens others.',
  },
  22: {
    personality: 'Your Life Path 22 adds master builder energy — you can turn the biggest visions into reality.',
    love: 'Life Path 22 makes you a powerful partner who builds empires but can forget to build intimacy.',
    career: 'With Life Path 22, you are destined to create something massive — a business, a movement, a legacy.',
    money: 'Life Path 22 means you have the potential for extraordinary wealth, but the pressure can crush you.',
    emotional: 'With Life Path 22, you carry the weight of your ambitions emotionally — stress is your constant companion.',
    communication: 'Life Path 22 makes you a visionary communicator who can rally people around impossible goals.',
    purpose: 'Your Life Path 22 means you\'re here to build something that changes the world — no pressure.',
  },
  33: {
    personality: 'Your Life Path 33 adds master healer energy — you are wired to nurture at the highest level.',
    love: 'Life Path 33 makes you the most compassionate partner possible, but you sacrifice yourself endlessly.',
    career: 'With Life Path 33, you are built for healing work — therapy, medicine, teaching, or spiritual leadership.',
    money: 'Life Path 33 means money is secondary to mission — you give until it hurts and then give more.',
    emotional: 'With Life Path 33, your emotions are connected to everyone — you carry the world\'s pain as your own.',
    communication: 'Life Path 33 makes you a healer through words — people feel better just talking to you.',
    purpose: 'Your Life Path 33 means you\'re here to heal — to be the compassionate force the world desperately needs.',
  },
};
// ─── Generate Personality Cards ─────────────────────────────────────────────
function getSignFromPosition(positions: Record<string, { sign: string }>, planet: string, fallback: string): string {
  const pos = positions[planet];
  if (pos?.sign) return pos.sign;
  return fallback;
}
export function generatePersonalityCards(
  astrologyData: AstrologyInfo | null,
  numerologyData: NumerologyInfo | null,
  traitScores: TraitScore[],
): PersonalityCard[] {
  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';
  const positions = astrologyData?.planetaryPositions || {};
  const venusSign = getSignFromPosition(positions, 'Venus', sunSign);
  const marsSign = getSignFromPosition(positions, 'Mars', sunSign);
  const mercurySign = getSignFromPosition(positions, 'Mercury', sunSign);
  const saturnSign = getSignFromPosition(positions, 'Saturn', sunSign);
  const lifePath = numerologyData?.lifePathNumber || 1;
  const soulUrge = numerologyData?.soulUrgeNumber || 1;
  const destiny = numerologyData?.destinyNumber || 1;
  // Top 2 trait names for personality enrichment
  const sortedTraits = [...traitScores].sort((a, b) => b.score - a.score);
  const topTraitName = sortedTraits[0]?.label || sortedTraits[0]?.name || 'Resilience';
  const secondTraitName = sortedTraits[1]?.label || sortedTraits[1]?.name || 'Empathy';
  // Numerology modifiers
  const lpModifier = LIFE_PATH_MODIFIER[lifePath] || LIFE_PATH_MODIFIER[1];
  // Build personality content combining sun + ascendant + traits + numerology
  const personalityContent = PERSONALITY[sunSign]
    ? `${PERSONALITY[sunSign].summary} With ${ascendant} rising, you come across as ${getAscendantVibe(ascendant)}. ${lpModifier.personality} Your strongest traits — ${topTraitName} and ${secondTraitName} — show up in everything you do.`
    : `You are a complex blend of ${sunSign} energy and ${ascendant} presence. ${lpModifier.personality} Your top traits of ${topTraitName} and ${secondTraitName} define how you move through the world.`;
  // Love style: Venus sign + Moon sign + numerology
  const loveContent = LOVE_STYLE[venusSign]
    ? `${LOVE_STYLE[venusSign].summary} Your Moon in ${moonSign} means you need emotional ${getMoonEmotionalNeed(moonSign)} to feel truly connected. ${lpModifier.love}`
    : `You approach love through the lens of ${venusSign}, seeking deep emotional connection. Your Moon in ${moonSign} means you need ${getMoonEmotionalNeed(moonSign)}. ${lpModifier.love}`;
  // Career: Mars sign + Saturn + 10th house relevance (use sun sign for base) + numerology
  const careerContent = CAREER_PATH[sunSign]
    ? `${CAREER_PATH[sunSign].summary} Your Mars in ${marsSign} gives you ${getMarsCareerDrive(marsSign)} at work. Saturn in ${saturnSign} means your career may ${getSaturnCareerDelay(saturnSign)}. ${lpModifier.career}`
    : `You are driven in your career by ${marsSign} energy. Saturn in ${saturnSign} means you\'ll face career lessons around patience. ${lpModifier.career}`;
  // Money: 2nd house relevance (use sun sign) + Jupiter + Life Path
  const moneyContent = MONEY_PATTERN[sunSign]
    ? `${MONEY_PATTERN[sunSign].summary} ${lpModifier.money}`
    : `Your relationship with money reflects your ${sunSign} nature. ${lpModifier.money}`;
  // Emotional: Moon sign + 4th house relevance + Soul Urge
  const emotionalContent = EMOTIONAL_NATURE[moonSign]
    ? `${EMOTIONAL_NATURE[moonSign].summary} With Soul Urge number ${soulUrge}, your deepest emotional need is ${getSoulUrgeNeed(soulUrge)}. ${lpModifier.emotional}`
    : `You process emotions through your ${moonSign} nature. Your Soul Urge number ${soulUrge} reveals your deepest emotional needs. ${lpModifier.emotional}`;
  // Communication: Mercury sign + Destiny number
  const communicationContent = COMMUNICATION_STYLE[mercurySign]
    ? `${COMMUNICATION_STYLE[mercurySign].summary} With Destiny number ${destiny}, you are meant to ${getDestinyCommunication(destiny)}. ${lpModifier.communication}`
    : `Your communication style is shaped by ${mercurySign}. With Destiny number ${destiny}, your words carry purpose. ${lpModifier.communication}`;
  // Life Purpose: 9th house relevance + Rahu/North Node + Life Path
  const rahuSign = getSignFromPosition(positions, 'Rahu', 'Aquarius');
  const purposeContent = LIFE_PURPOSE[rahuSign]
    ? `${LIFE_PURPOSE[rahuSign].summary} ${lpModifier.purpose}`
    : `Your life purpose is shaped by ${rahuSign} energy calling you toward growth. ${lpModifier.purpose}`;
  return [
    {
      id: 'personality',
      title: 'Your Personality',
      icon: User,
      content: personalityContent,
      strength: PERSONALITY[sunSign]?.strength || 'You have a unique combination of traits that makes you unforgettable.',
      challenge: PERSONALITY[sunSign]?.challenge || 'You struggle to see yourself as clearly as others see you.',
      accentColor: 'border-l-amber-500',
      accentBg: 'from-amber-50/50 to-transparent dark:from-amber-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'love',
      title: 'Your Love Style',
      icon: Heart,
      content: loveContent,
      strength: LOVE_STYLE[venusSign]?.strength || 'You have an extraordinary capacity for love when you let yourself be vulnerable.',
      challenge: LOVE_STYLE[venusSign]?.challenge || 'Your fear of vulnerability keeps the right people at a distance.',
      accentColor: 'border-l-rose-500',
      accentBg: 'from-rose-50/50 to-transparent dark:from-rose-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'career',
      title: 'Your Career Path',
      icon: Briefcase,
      content: careerContent,
      strength: CAREER_PATH[sunSign]?.strength || 'Your unique approach to work gives you an edge others can\'t replicate.',
      challenge: CAREER_PATH[sunSign]?.challenge || 'You sabotage your own success by avoiding the parts of work you dislike.',
      accentColor: 'border-l-emerald-500',
      accentBg: 'from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'money',
      title: 'Your Money Pattern',
      icon: Wallet,
      content: moneyContent,
      strength: MONEY_PATTERN[sunSign]?.strength || 'You have a natural instinct for financial opportunities.',
      challenge: MONEY_PATTERN[sunSign]?.challenge || 'Your relationship with money is more emotional than practical.',
      accentColor: 'border-l-yellow-500',
      accentBg: 'from-yellow-50/50 to-transparent dark:from-yellow-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      id: 'emotional',
      title: 'Your Emotional Nature',
      icon: Droplets,
      content: emotionalContent,
      strength: EMOTIONAL_NATURE[moonSign]?.strength || 'Your emotional depth is a rare gift that most people never develop.',
      challenge: EMOTIONAL_NATURE[moonSign]?.challenge || 'You avoid sitting with uncomfortable emotions until they explode.',
      accentColor: 'border-l-teal-500',
      accentBg: 'from-teal-50/50 to-transparent dark:from-teal-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      id: 'communication',
      title: 'Your Communication Style',
      icon: MessageSquare,
      content: communicationContent,
      strength: COMMUNICATION_STYLE[mercurySign]?.strength || 'Your communication has a unique quality that makes people remember what you say.',
      challenge: COMMUNICATION_STYLE[mercurySign]?.challenge || 'People often misunderstand your intentions because of how you express yourself.',
      accentColor: 'border-l-violet-500',
      accentBg: 'from-violet-50/50 to-transparent dark:from-violet-900/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      id: 'purpose',
      title: 'Your Life Purpose',
      icon: Compass,
      content: purposeContent,
      strength: LIFE_PURPOSE[rahuSign]?.strength || 'Your soul carries a gift that the world needs, even if you haven\'t discovered it yet.',
      challenge: LIFE_PURPOSE[rahuSign]?.challenge || 'You keep avoiding the very lesson that would set you free.',
      accentColor: 'border-l-sage',
      accentBg: 'from-sage-muted/30 to-transparent dark:from-sage/10 dark:to-transparent',
      strengthBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      challengeBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      iconBg: 'bg-sage-muted/50 dark:bg-sage/20',
      iconColor: 'text-sage-dark dark:text-sage',
    },
  ];
}
// ─── Helper functions for contextual content ────────────────────────────────
function getAscendantVibe(sign: string): string {
  const vibes: Record<string, string> = {
    Aries: 'bold and energized, even when you\'re tired',
    Taurus: 'calm and grounded, even when you\'re anxious inside',
    Gemini: 'curious and talkative, even when you\'re hurting',
    Cancer: 'warm and protective, even when you need protection yourself',
    Leo: 'confident and radiant, even when you\'re doubting yourself',
    Virgo: 'put-together and helpful, even when your own life is messy',
    Libra: 'charming and agreeable, even when you\'re screaming inside',
    Scorpio: 'intense and magnetic, even when you\'re trying to blend in',
    Sagittarius: 'adventurous and optimistic, even when you\'re lost',
    Capricorn: 'serious and competent, even when you\'re terrified',
    Aquarius: 'unique and detached, even when you\'re desperate to belong',
    Pisces: 'dreamy and empathetic, even when you\'re overwhelmed',
  };
  return vibes[sign] || 'someone who has it more together than you feel';
}
function getMoonEmotionalNeed(sign: string): string {
  const needs: Record<string, string> = {
    Aries: 'independence and excitement',
    Taurus: 'stability and physical comfort',
    Gemini: 'mental stimulation and conversation',
    Cancer: 'emotional safety and family closeness',
    Leo: 'appreciation and genuine admiration',
    Virgo: 'practical support and useful advice',
    Libra: 'harmony and partnership',
    Scorpio: 'deep intimacy and total honesty',
    Sagittarius: 'freedom and philosophical connection',
    Capricorn: 'respect and tangible commitment',
    Aquarius: 'intellectual friendship and space',
    Pisces: 'spiritual connection and unconditional love',
  };
  return needs[sign] || 'deep emotional connection';
}
function getMarsCareerDrive(sign: string): string {
  const drives: Record<string, string> = {
    Aries: 'a relentless, pioneering drive',
    Taurus: 'slow, steady, unstoppable persistence',
    Gemini: 'quick thinking and versatile energy',
    Cancer: 'intuitive, protective dedication',
    Leo: 'dramatic, confident ambition',
    Virgo: 'precise, detail-oriented focus',
    Libra: 'diplomatic, collaborative effort',
    Scorpio: 'intense, strategic determination',
    Sagittarius: 'expansive, adventurous energy',
    Capricorn: 'disciplined, strategic ambition',
    Aquarius: 'innovative, unconventional drive',
    Pisces: 'creative, intuitive motivation',
  };
  return drives[sign] || 'strong, focused energy';
}
function getSaturnCareerDelay(sign: string): string {
  const delays: Record<string, string> = {
    Aries: 'take time to take off — patience is your career lesson',
    Taurus: 'require you to step outside your comfort zone to grow',
    Gemini: 'feel restrictive until you commit to one direction',
    Cancer: 'challenge you to toughen up and separate feelings from business',
    Leo: 'humble you before they elevate you',
    Virgo: 'demand that you stop perfecting and start shipping',
    Libra: 'test your ability to make hard decisions alone',
    Scorpio: 'transform your relationship with power and control',
    Sagittarius: 'require you to stick with something long enough to master it',
    Capricorn: 'come with heavy responsibility that teaches you to delegate',
    Aquarius: 'force you to work within systems before you can change them',
    Pisces: 'demand that you get practical before you can pursue your dreams',
  };
  return delays[sign] || 'require patience and persistence to overcome';
}
function getSoulUrgeNeed(num: number): string {
  const needs: Record<number, string> = {
    1: 'to lead and create on your own terms',
    2: 'to be in loving partnership and harmony',
    3: 'to express yourself creatively and joyfully',
    4: 'to build something solid and lasting',
    5: 'to experience freedom and change',
    6: 'to nurture and be needed by others',
    7: 'to understand the deeper meaning of everything',
    8: 'to achieve material mastery and abundance',
    9: 'to serve humanity and ease suffering',
    11: 'to channel higher wisdom and inspire others',
    22: 'to build something that transforms the world',
    33: 'to heal and uplift everyone you encounter',
  };
  return needs[num] || 'to find your true purpose and live it fully';
}
function getDestinyCommunication(num: number): string {
  const destinies: Record<number, string> = {
    1: 'use your voice to lead and innovate',
    2: 'bring people together through diplomacy',
    3: 'inspire through creative expression',
    4: 'build systems and structures that help others',
    5: 'challenge the status quo and inspire change',
    6: 'nurture and guide others with your words',
    7: 'seek and share deep truths',
    8: 'command authority and create impact at scale',
    9: 'share wisdom that elevates human consciousness',
    11: 'channel insights that awaken others',
    22: 'communicate visions that mobilize people',
    33: 'heal through words and compassionate teaching',
  };
  return destinies[num] || 'communicate with purpose and impact';
}
// ─── Animation variants ─────────────────────────────────────────────────────
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
// ─── PersonalityCards Component ─────────────────────────────────────────────
interface PersonalityCardsProps {
  astrologyData: AstrologyInfo | null;
  numerologyData: NumerologyInfo | null;
  traitScores: TraitScore[];
}
export default function PersonalityCards({ astrologyData, numerologyData, traitScores }: PersonalityCardsProps) {
  const cards = generatePersonalityCards(astrologyData, numerologyData, traitScores);
  // First 3 cards expanded by default
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    cards.forEach((card, i) => {
      initial[card.id] = i < 3;
    });
    return initial;
  });
  const [allExpanded, setAllExpanded] = useState(false);
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    const newExpanded: Record<string, boolean> = {};
    cards.forEach((card) => {
      newExpanded[card.id] = newState;
    });
    setExpandedCards(newExpanded);
  };
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="font-serif text-lg font-bold text-brown-900 dark:text-brown-600"
          >
            Your Life, Card by Card
          </h3>
          <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5 italic">
            Brutally honest. Nothing to hide.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAll}
          className="h-7 text-[11px] text-brown-400 dark:text-brown-500 hover:text-brown-700 dark:hover:text-brown-200 gap-1 px-2"
        >
          {allExpanded ? (
            <>
              <ChevronUp className="size-3" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronsUpDown className="size-3" />
              Expand All
            </>
          )}
        </Button>
      </div>
      {/* Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          const isExpanded = expandedCards[card.id] ?? false;
          return (
            <motion.div key={card.id} variants={staggerItem}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCard(card.id)}
              >
                <Card
                  className={`border-0 shadow-md overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-l-4 ${card.accentColor} dark:border-l-4`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accentBg} pointer-events-none`} />
                  <div className="relative">
                    {/* Card Header - Always visible */}
                    <CollapsibleTrigger asChild>
                      <button className="w-full text-left p-4 pb-0 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                            <Icon className={`size-4.5 ${card.iconColor}`} />
                          </div>
                          <h4
                            className="font-serif text-sm font-bold text-brown-900 dark:text-brown-600"
                          >
                            {card.title}
                          </h4>
                        </div>
                        <ChevronDown
                          className={`size-4 text-brown-300 dark:text-brown-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </CollapsibleTrigger>
                    {/* Collapsible Content */}
                    <CollapsibleContent>
                      <div className="px-4 pt-3 pb-4">
                        {/* Main content */}
                        <p className="text-sm text-brown-700 dark:text-brown-500 leading-relaxed">
                          {card.content}
                        </p>
                        {/* Strength & Challenge badges */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <div className={`flex items-start gap-2 rounded-lg px-3 py-2 flex-1 ${card.strengthBadge}`}>
                            <span className="text-xs font-semibold shrink-0 mt-0.5">Strength</span>
                            <span className="text-xs leading-relaxed">{card.strength}</span>
                          </div>
                          <div className={`flex items-start gap-2 rounded-lg px-3 py-2 flex-1 ${card.challengeBadge}`}>
                            <span className="text-xs font-semibold shrink-0 mt-0.5">Challenge</span>
                            <span className="text-xs leading-relaxed">{card.challenge}</span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                    {/* Collapsed preview - only show when collapsed */}
                    {!isExpanded && (
                      <div className="px-4 pb-3 pt-1">
                        <p className="text-xs text-brown-400 dark:text-brown-500 line-clamp-2 leading-relaxed">
                          {card.content}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Collapsible>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
