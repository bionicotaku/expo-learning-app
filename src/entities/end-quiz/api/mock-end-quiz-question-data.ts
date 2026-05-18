import type { EndQuizItem, EndQuizQuestionSource } from '../model/types';

type MockQuestionSourceScope = 'video_unit' | 'unit';

type MockEndQuizQuestionPayload = {
  question: string;
  context_text: string | null;
  options: readonly {
    id: string;
    text: string;
  }[];
  explanation: string | null;
};

type MockEndQuizQuestion = {
  scope_type: MockQuestionSourceScope;
  question_type: EndQuizItem['question_type'];
  coarse_unit_id: number;
  target_text: string;
  context_sentence_index: number | null;
  context_span_index: number | null;
  context_start_ms: number | null;
  context_end_ms: number | null;
  content_payload: MockEndQuizQuestionPayload;
};

function mapSource(scopeType: MockQuestionSourceScope): EndQuizQuestionSource {
  return scopeType === 'video_unit' ? 'video_context' : 'unit_generic';
}

function createQuestionId(clipNumber: number, coarseUnitId: number) {
  return `00000000-0000-4000-8000-${String(clipNumber).padStart(3, '0')}${String(coarseUnitId).padStart(9, '0')}`;
}

function createEndQuizItem(
  clipNumber: number,
  question: MockEndQuizQuestion
): EndQuizItem {
  return {
    coarse_unit_id: question.coarse_unit_id,
    question_id: createQuestionId(clipNumber, question.coarse_unit_id),
    source: mapSource(question.scope_type),
    question_type: question.question_type,
    target_text: question.target_text,
    question: question.content_payload.question,
    context_text: question.content_payload.context_text,
    options: question.content_payload.options.map((option) => ({
      option_id: option.id,
      text: option.text,
    })),
    explanation: question.content_payload.explanation,
    context_sentence_index: question.context_sentence_index,
    context_span_index: question.context_span_index,
    context_start_ms: question.context_start_ms,
    context_end_ms: question.context_end_ms,
  };
}

const mockSourceQuestionsByClipNumber: Record<number, readonly MockEndQuizQuestion[]> = {
  1: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 138446,
      target_text: 'sacred',
      context_sentence_index: 14,
      context_span_index: 17,
      context_start_ms: 17621,
      context_end_ms: 30899,
      content_payload: {
        question: "说话人说的 'sacred' 在这里最接近哪个意思？",
        context_text:
          'The most sacred thing I do is care and provide for my workers, my family.',
        options: [
          { id: 'correct', text: '最重要、不可轻视的' },
          { id: 'wrong_1', text: '赚大钱的、有利可图的' },
          { id: 'wrong_2', text: '轻松愉快的、不费力的' },
          { id: 'wrong_3', text: '公开的、大家都知道的' },
        ],
        explanation:
          "sacred 本义为'神圣的'，但这里用作比喻，表示说话人认为照顾员工和家庭是他生命中最重要、最不可轻视的事情。",
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 37192,
      target_text: 'acupuncture',
      context_sentence_index: 27,
      context_span_index: 7,
      context_start_ms: 69032,
      context_end_ms: 75044,
      content_payload: {
        question: '根据上下文，这里的 acupuncture 最接近以下哪个意思？',
        context_text:
          'I am going to go with the one with the acupuncture, therapeutic massage, you know, the works.',
        options: [
          { id: 'correct', text: '针灸（用细针刺入穴位的治疗方法）' },
          { id: 'wrong_1', text: '外科手术' },
          { id: 'wrong_2', text: '药物治疗' },
          { id: 'wrong_3', text: '心理咨询' },
        ],
        explanation:
          'acupuncture 指的是中医针灸疗法，说话人把它和治疗性按摩并列，作为健康计划中的福利项目。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_cloze_choice',
      coarse_unit_id: 109520,
      target_text: 'massage',
      context_sentence_index: 27,
      context_span_index: 9,
      context_start_ms: 69032,
      context_end_ms: 75044,
      content_payload: {
        question: '请根据上下文选择正确的词填入横线。',
        context_text:
          'I am going to go with the one with the acupuncture, therapeutic ____, you know, the works.',
        options: [
          { id: 'correct', text: 'massage' },
          { id: 'wrong_1', text: 'injection' },
          { id: 'wrong_2', text: 'surgery' },
          { id: 'wrong_3', text: 'diagnosis' },
        ],
        explanation:
          "therapeutic massage 是常见的搭配，意为'治疗按摩'。说话人在列举健康保险计划中包含的项目，按摩与针灸同属理疗类福利。",
      },
    },
  ],
  2: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 101652,
      target_text: 'job',
      context_sentence_index: 47,
      context_span_index: 5,
      context_start_ms: 121996,
      context_end_ms: 123602,
      content_payload: {
        question:
          'Jim 说「Right now, this is just a job.」这里的 job 与下文的 career 形成对比，最接近以下哪个意思？',
        context_text:
          'Right now, this is just a job. If I advance any higher in this company, then this would be my career.',
        options: [
          { id: 'correct', text: '一份普通工作（仅为谋生）' },
          { id: 'wrong_1', text: '终身从事的职业' },
          { id: 'wrong_2', text: '业余爱好' },
          { id: 'wrong_3', text: '一次性的任务' },
        ],
        explanation:
          'Jim 把当前的职位仅仅看作一份谋生的普通工作（job），而不是值得投入一生的职业（career），通过对比强调他不想在这里长久发展。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 75647,
      target_text: 'ever',
      context_sentence_index: 19,
      context_span_index: 5,
      context_start_ms: 52758,
      context_end_ms: 54392,
      content_payload: {
        question: '在这句话中，"ever" 最接近以下哪个意思？',
        context_text: 'Oh, yeah, when have you ever done that?',
        options: [
          { id: 'correct', text: '曾经' },
          { id: 'wrong_1', text: '总是' },
          { id: 'wrong_2', text: '从不' },
          { id: 'wrong_3', text: '已经' },
        ],
        explanation:
          '"ever" 在疑问句中用来询问是否「曾经」发生过某事。这句话是一个反问，说话人其实是在质疑对方从来没做过那件事。',
      },
    },
  ],
  3: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 102119,
      target_text: 'Just',
      context_sentence_index: 29,
      context_span_index: 0,
      context_start_ms: 81643,
      context_end_ms: 84326,
      content_payload: {
        question: '这里的 Just 最接近什么意思？',
        context_text: "Just don't let anybody in my office under any conditions today.",
        options: [
          { id: 'correct', text: '就/只管（用于祈使句加强语气）' },
          { id: 'wrong_1', text: '刚刚（表示不久之前）' },
          { id: 'wrong_2', text: '公正的/正义的' },
          { id: 'wrong_3', text: '仅仅/只不过' },
        ],
        explanation:
          '在祈使句中，Just 用于加强说话人的语气，表示「只管这样做」或「就这样做」，而非表示时间、公平或限制。',
      },
    },
  ],
  4: [
    {
      scope_type: 'video_unit',
      question_type: 'context_cloze_choice',
      coarse_unit_id: 115842,
      target_text: 'news',
      context_sentence_index: 29,
      context_span_index: 5,
      context_start_ms: 46816,
      context_end_ms: 49851,
      content_payload: {
        question: '请根据上下文选择最合适的词填入空白处。',
        context_text: "Plus, there's some other good ____.",
        options: [
          { id: 'correct', text: 'news' },
          { id: 'wrong_1', text: 'ideas' },
          { id: 'wrong_2', text: 'plans' },
          { id: 'wrong_3', text: 'deals' },
        ],
        explanation:
          "news 意为消息，'good news' 是好消息，Michael 在宣布惊喜之前先告诉员工还有其他好消息，用来安抚他们的情绪。",
      },
    },
  ],
  5: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 102680,
      target_text: 'kind of',
      context_sentence_index: 3,
      context_span_index: 24,
      context_start_ms: 11189,
      context_end_ms: 22348,
      content_payload: {
        question: '在这句话中，「kind of」最接近什么意思？',
        context_text:
          'they give you a big pile of chips and your food, everything just kind of all-inclusive free kind of weekend.',
        options: [
          { id: 'correct', text: '有点儿，差不多' },
          { id: 'wrong_1', text: '种类，类别' },
          { id: 'wrong_2', text: '善良的，好心的' },
          { id: 'wrong_3', text: '完全地，彻底地' },
        ],
        explanation:
          '「kind of」在这里是口语中的模糊限制语，表示「有点儿、差不多」，用来弱化语气，让「全包式免费周末」这个说法不那么绝对。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 35923,
      target_text: 'a little bit',
      context_sentence_index: 18,
      context_span_index: 7,
      context_start_ms: 73672,
      context_end_ms: 83831,
      content_payload: {
        question: '在这句话中，「a little bit of」最接近什么意思？',
        context_text: 'trying to give the troops around here a little bit of a boost',
        options: [
          { id: 'correct', text: '一点点，少量的' },
          { id: 'wrong_1', text: '大量的，充足的' },
          { id: 'wrong_2', text: '突然的，意外的' },
          { id: 'wrong_3', text: '永久的，长期的' },
        ],
        explanation:
          '「a little bit of」是固定短语，表示「一点点、少量」，这里指说话者想给员工们「一点点」激励和提振。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 160022,
      target_text: 'troops',
      context_sentence_index: 18,
      context_span_index: 4,
      context_start_ms: 73672,
      context_end_ms: 83831,
      content_payload: {
        question: '这里的 "troops" 最接近什么意思？',
        context_text:
          "trying to give the troops around here a little bit of a boost, and I was thinking that maybe we could take 'em down to take a spin on your big ride.",
        options: [
          { id: 'correct', text: '员工、下属' },
          { id: 'wrong_1', text: '真正的士兵' },
          { id: 'wrong_2', text: '孩子、儿童' },
          { id: 'wrong_3', text: '陌生人' },
        ],
        explanation:
          '"troops" 原意是"军队"，但说话者在这里用它来比喻自己的员工，是一种幽默、亲切的说法。',
      },
    },
  ],
  6: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 136560,
      target_text: 'ridiculous',
      context_sentence_index: 5,
      context_span_index: 28,
      context_start_ms: 19002,
      context_end_ms: 30609,
      content_payload: {
        question: '这里的 "ridiculous" 最接近以下哪个中文意思？',
        context_text: 'someone in this office is coming up with all this ridiculous stuff.',
        options: [
          { id: 'correct', text: '荒谬的/可笑的' },
          { id: 'wrong_1', text: '昂贵的' },
          { id: 'wrong_2', text: '危险的' },
          { id: 'wrong_3', text: '复杂的' },
        ],
        explanation:
          'ridiculous 意为「荒谬的、可笑的」，说话者用它来表达对办公室里有人编造荒唐事情（如「巧克力豆病」）的不满和讽刺。',
      },
    },
  ],
  7: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 129008,
      target_text: 'pretty',
      context_sentence_index: 19,
      context_span_index: 5,
      context_start_ms: 35959,
      context_end_ms: 37955,
      content_payload: {
        question:
          '在 "Because we\'ve been having a pretty horrible day." 这句话中，"pretty" 最接近以下哪个意思？',
        context_text: "Because we've been having a pretty horrible day.",
        options: [
          { id: 'correct', text: '相当，颇' },
          { id: 'wrong_1', text: '漂亮的，可爱的' },
          { id: 'wrong_2', text: '几乎，差不多' },
          { id: 'wrong_3', text: '稍微，有一点' },
        ],
        explanation:
          'pretty 在这里是程度副词，相当于 quite，表示"相当"。"a pretty horrible day" 意思是"相当糟糕的一天"，用来强调程度。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 164284,
      target_text: 'uterus',
      context_sentence_index: 40,
      context_span_index: 1,
      context_start_ms: 108668,
      context_end_ms: 110932,
      content_payload: {
        question: '在「A uterus is different from a vagina.」中，「uterus」指的是什么？',
        context_text: 'A uterus is different from a vagina.',
        options: [
          { id: 'correct', text: '子宫，孕育胎儿的女性器官' },
          { id: 'wrong_1', text: '阴道' },
          { id: 'wrong_2', text: '卵巢' },
          { id: 'wrong_3', text: '膀胱' },
        ],
        explanation:
          'uterus 指的是子宫，是女性生殖系统中负责孕育胎儿的中空肌性器官，与 vagina（阴道）在解剖结构和功能上都不同。',
      },
    },
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 88656,
      target_text: 'got',
      context_sentence_index: 28,
      context_span_index: 1,
      context_start_ms: 70148,
      context_end_ms: 72940,
      content_payload: {
        question: 'Michael 说「I got no help from corporate」，这里的 got 最接近什么意思？',
        context_text: 'I got no help from corporate, so that leaves me with no options.',
        options: [
          { id: 'correct', text: '得到' },
          { id: 'wrong_1', text: '理解' },
          { id: 'wrong_2', text: '离开' },
          { id: 'wrong_3', text: '购买' },
        ],
        explanation:
          'got 是 get 的过去式，在这里与 no 连用表示「没有得到任何帮助」，最接近「得到」的意思。',
      },
    },
  ],
  8: [
    {
      scope_type: 'video_unit',
      question_type: 'context_meaning_choice',
      coarse_unit_id: 157409,
      target_text: 'time',
      context_sentence_index: 14,
      context_span_index: 1,
      context_start_ms: 26432,
      context_end_ms: 27074,
      content_payload: {
        question: '这里的 time 最接近什么意思？',
        context_text: 'What time is it?',
        options: [
          { id: 'correct', text: '时刻、几点钟' },
          { id: 'wrong_1', text: '日期、日子' },
          { id: 'wrong_2', text: '时长、期间' },
          { id: 'wrong_3', text: '次数、频率' },
        ],
        explanation:
          'What time is it? 是固定询问时间的表达，time 在这里指具体的「钟点时刻」，询问现在是几点。',
      },
    },
  ],
};

export const mockEndQuizQuestionsByClipNumber: Record<number, readonly EndQuizItem[]> =
  Object.fromEntries(
    Object.entries(mockSourceQuestionsByClipNumber).map(
      ([clipNumber, questions]) => [
        Number(clipNumber),
        questions.map((question) =>
          createEndQuizItem(Number(clipNumber), question)
        ),
      ]
    )
  );
