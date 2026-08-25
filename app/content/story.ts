export type FloatingPhrase = {
  english: string;
  arabic: string;
  x: number;
  y: number;
};

export type ChapterContent = {
  id: string;
  eyebrow: string;
  english: string[];
  arabic: string[];
  align: 'left' | 'center' | 'right';
  floating?: FloatingPhrase[];
  final?: boolean;
};

export type BirthdayStoryContent = {
  nameLatin: string;
  nameArabic: string;
  optionalDate?: string;
  openingInvitation: { english: string; arabic: string };
  chapters: ChapterContent[];
  finalHeading: { english: string; arabic: string };
  finalMessage: { english: string; arabic: string };
  audioLabels: { play: string; pause: string };
};

export const birthdayStory: BirthdayStoryContent = {
  nameLatin: 'Raghad',
  nameArabic: 'رغد',
  openingInvitation: {
    english: 'I made a little sky for you.',
    arabic: 'صنعتُ لكِ سماءً صغيرة.',
  },
  chapters: [
    {
      id: 'last-light',
      eyebrow: '01 · Last light',
      english: ['Raghad', 'I made a little sky for you.'],
      arabic: ['رغد', 'صنعتُ لكِ سماءً صغيرة.'],
      align: 'center',
    },
    {
      id: 'first-stars',
      eyebrow: '02 · The first stars',
      english: ['It always starts quietly.', 'One small light. One word. One conversation.'],
      arabic: ['دائمًا ما تبدأ الأشياء الجميلة بهدوء.', 'ضوءٌ صغير. كلمة. حديثٌ واحد.'],
      align: 'left',
    },
    {
      id: 'sky-wakes',
      eyebrow: '03 · The sky wakes',
      english: ['Somewhere between ordinary days…', 'you stopped feeling ordinary to me.'],
      arabic: ['في مكانٍ ما بين الأيام العادية…', 'لم تعودي عاديةً في عيني.'],
      align: 'right',
    },
    {
      id: 'constellations',
      eyebrow: '04 · What the stars remember',
      english: ['Some people leave memories.', 'You left a whole constellation.'],
      arabic: ['بعض الناس يتركون ذكريات.', 'وأنتِ تركتِ كوكبةً كاملة.'],
      align: 'center',
    },
    {
      id: 'moonrise',
      eyebrow: '05 · Moonrise',
      english: ['And then there were the nights.', 'The long ones. The random ones. The ones that mattered.'],
      arabic: ['ثم جاءت الليالي.', 'الطويلة، والعفوية، وتلك التي كان لها معنى.'],
      align: 'left',
    },
    {
      id: 'words-in-the-sky',
      eyebrow: '06 · Words in the sky',
      english: ['The sky kept the little things.', 'A laugh. A pause. A familiar hello.'],
      arabic: ['احتفظت السماء بالتفاصيل الصغيرة.', 'ضحكة. لحظة صمت. وتحية مألوفة.'],
      align: 'right',
      floating: [
        { english: 'still here', arabic: 'ما زالت هنا', x: 15, y: 24 },
        { english: 'a quiet glow', arabic: 'وهجٌ هادئ', x: 73, y: 67 },
        { english: 'remember this', arabic: 'تذكّري هذا', x: 68, y: 19 },
      ],
    },
    {
      id: 'the-owl',
      eyebrow: '07 · A messenger',
      english: ['For a moment, even the night held its breath.', 'Then something beautiful found its wings.'],
      arabic: ['للحظة، حبس الليل أنفاسه.', 'ثم وجد شيءٌ جميل جناحيه.'],
      align: 'left',
    },
    {
      id: 'midnight',
      eyebrow: '08 · The heart of night',
      english: ['Not every important thing arrives loudly.', 'Some simply stay—and make the dark feel warm.'],
      arabic: ['ليست كل الأشياء المهمة تأتي بصخب.', 'بعضها يبقى ببساطة… ويجعل العتمة دافئة.'],
      align: 'center',
    },
    {
      id: 'turning',
      eyebrow: '09 · The turning',
      english: ['The sky changes slowly.', 'So slowly you barely notice—until everything looks different.'],
      arabic: ['تتغير السماء ببطء.', 'ببطءٍ لا نكاد نلحظه… حتى يبدو كل شيء مختلفًا.'],
      align: 'right',
    },
    {
      id: 'last-stars',
      eyebrow: '10 · The last stars',
      english: ['Most lights faded with the night.', 'One stayed a little longer.'],
      arabic: ['تلاشت معظم الأضواء مع الليل.', 'وبقي ضوءٌ واحد قليلًا أطول.'],
      align: 'left',
    },
    {
      id: 'sunrise',
      eyebrow: '11 · Morning',
      english: ['Morning came.', 'Not because the night was not beautiful—but because there is beauty in what comes next.'],
      arabic: ['وجاء الصباح.', 'ليس لأن الليل لم يكن جميلًا… بل لأن فيما يأتي جمالًا أيضًا.'],
      align: 'center',
    },
    {
      id: 'birthday',
      eyebrow: '12 · For you',
      english: [],
      arabic: [],
      align: 'center',
      final: true,
    },
  ],
  finalHeading: {
    english: 'Happy Birthday, Raghad',
    arabic: 'عيد ميلاد سعيد يا رغد',
  },
  finalMessage: {
    english: 'May this new year of your life feel open and luminous—full of gentle surprises, brave beginnings, and people who see the rare light you carry. You deserve mornings that feel hopeful, nights that feel safe, and a thousand reasons to smile in between.',
    arabic: 'أتمنى أن تكون سنتك الجديدة رحبةً ومضيئة، مليئة بالمفاجآت الجميلة والبدايات الشجاعة وبأشخاص يرون النور النادر الذي تحملينه. تستحقين صباحاتٍ تبعث الأمل، وليالي تمنح الأمان، وألف سبب للابتسام بينهما.',
  },
  audioLabels: {
    play: 'Play the sky · شغّلي صوت السماء',
    pause: 'Quiet the sky · أوقفي صوت السماء',
  },
};
