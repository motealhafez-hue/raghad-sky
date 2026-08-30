export type StoryBlock = {
  lines: string[];
  gapBefore?: boolean;
  tone?: 'lead' | 'body' | 'verse';
};

export type FloatingPhrase = {
  text: string;
  x: number;
  y: number;
};

export type ChapterContent = {
  id: string;
  eyebrow: string;
  blocks: StoryBlock[];
  align: 'left' | 'center' | 'right';
  floating?: FloatingPhrase[];
  length?: 'standard' | 'long' | 'extra-long';
  final?: boolean;
};

export type BirthdayStoryContent = {
  name: string;
  openingLines: string[];
  scrollCue: string;
  chapters: ChapterContent[];
  finalIntro: string;
  finalHeading: string;
  finalParagraphs: string[][];
  audioLabels: { play: string; pause: string };
};

export const birthdayStory: BirthdayStoryContent = {
  name: 'Raghad',
  openingLines: [
    'I could have made you a birthday card.',
    'But somehow, a little sky felt more like you.',
  ],
  scrollCue: 'There is more up there',
  chapters: [
    {
      id: 'named-sky',
      eyebrow: '01 · A sky with your name',
      blocks: [],
      align: 'center',
    },
    {
      id: 'quiet-beginnings',
      eyebrow: '02 · Quiet beginnings',
      blocks: [{
        lines: [
          'The strange thing about important moments is that they rarely announce themselves.',
          'Sometimes they begin with an ordinary day—and a person you do not yet know you will remember.',
        ],
        tone: 'lead',
      }],
      align: 'left',
      length: 'long',
    },
    {
      id: 'the-exception',
      eyebrow: '03 · The exception',
      blocks: [{
        lines: [
          'Then, quietly, ordinary stopped being the right word.',
          'Some people do not change the rules.',
          'They simply become the exception you never planned for.',
        ],
        tone: 'lead',
      }],
      align: 'right',
      length: 'long',
    },
    {
      id: 'sky-remembers',
      eyebrow: '04 · What the sky remembers',
      blocks: [
        {
          lines: [
            'The sky remembers details.',
            'A favorite color. A familiar moon. An owl in the quiet. A place you have never stopped loving.',
          ],
          tone: 'lead',
        },
        {
          lines: [
            'Small things, perhaps.',
            'But somehow, they became part of the way I remember you.',
          ],
          gapBefore: true,
        },
      ],
      align: 'center',
      length: 'extra-long',
    },
    {
      id: 'through-my-eyes',
      eyebrow: '05 · Through my eyes',
      blocks: [
        {
          lines: [
            'You once told me something I never forgot:',
            '“I like who I am through your eyes.”',
          ],
          tone: 'lead',
        },
        {
          lines: [
            'I hope you know this—',
            'my eyes never invented the beautiful things they saw in you.',
          ],
          gapBefore: true,
        },
      ],
      align: 'left',
      length: 'extra-long',
    },
    {
      id: 'words-you-kept',
      eyebrow: '06 · The words you kept',
      blocks: [
        {
          lines: [
            'Some words are read and forgotten.',
            'Some deserve a little star beside them.',
          ],
          tone: 'lead',
        },
        {
          lines: [
            'And when there was no star…',
            'you kept a few anyway.',
          ],
          gapBefore: true,
        },
      ],
      align: 'right',
      length: 'long',
      floating: [
        { text: 'worth keeping', x: 15, y: 24 },
        { text: 'still remembered', x: 73, y: 67 },
        { text: 'a quiet light', x: 68, y: 19 },
      ],
    },
    {
      id: 'the-owl',
      eyebrow: '07 · A messenger',
      blocks: [
        {
          lines: ['Somewhere in the quiet of the night, a small messenger took flight.'],
          tone: 'lead',
        },
        {
          lines: [
            'Carrying no grand words.',
            'Only a little piece of this sky, meant to find its way to you.',
          ],
          gapBefore: true,
        },
      ],
      align: 'left',
      length: 'long',
    },
    {
      id: 'to-strive',
      eyebrow: '08 · To strive',
      blocks: [
        {
          lines: [
            'Some words become more than words.',
            'They become a way of walking through life.',
          ],
          tone: 'lead',
        },
        {
          lines: ['﴿ وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ۝ وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ ﴾'],
          gapBefore: true,
          tone: 'verse',
        },
      ],
      align: 'center',
      length: 'extra-long',
    },
    {
      id: 'what-changes-us',
      eyebrow: '09 · What changes us',
      blocks: [
        {
          lines: [
            'Some people enter our lives and confirm what we already believed.',
            'Others make us look again.',
          ],
          tone: 'lead',
        },
        { lines: ['Perhaps the rarest ones do a little of both.'], gapBefore: true },
      ],
      align: 'right',
      length: 'long',
    },
    {
      id: 'a-little-longer',
      eyebrow: '10 · A little longer',
      blocks: [
        {
          lines: [
            'Not every beautiful thing has to arrive all at once.',
            'Some things are worth the distance, the patience, and the time.',
          ],
          tone: 'lead',
        },
        { lines: ['The sky knows how to wait.'], gapBefore: true },
      ],
      align: 'left',
      length: 'long',
    },
    {
      id: 'morning',
      eyebrow: '11 · Morning',
      blocks: [
        { lines: ['And then morning comes.'], tone: 'lead' },
        {
          lines: [
            'I hope this year gives back to you some of the care you so naturally give to everyone else.',
            'Rest when you are tired. Laugh from your heart. Chase what matters to you.',
            'And every once in a while, choose yourself too.',
          ],
          gapBefore: true,
        },
      ],
      align: 'center',
      length: 'extra-long',
    },
    {
      id: 'for-raghad',
      eyebrow: '12 · For Raghad',
      blocks: [],
      align: 'center',
      length: 'extra-long',
      final: true,
    },
  ],
  finalIntro: 'For every beautiful morning ahead',
  finalHeading: 'Happy Birthday, Raghad',
  finalParagraphs: [
    ['I hope this year brings you closer to every life you have quietly imagined for yourself.'],
    ['May you keep the principles that made you who you are, recognize the exceptions worth making room for, and never lose the part of you that believes in striving—even when the road is long.'],
    ['I hope you find peace in what you choose, courage in what you pursue, and people beside you who make you feel safe, understood, respected, and completely yourself.'],
    ['And whenever you forget the light you carry, I hope life finds a gentle way to remind you.'],
    ['Happy Birthday, Raghad.', 'May every morning ahead be kinder than the one before it.'],
  ],
  audioLabels: {
    play: 'Play the sky',
    pause: 'Quiet the sky',
  },
};
