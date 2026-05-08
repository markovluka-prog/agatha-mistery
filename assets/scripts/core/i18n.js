const I18n = (() => {
    const STORAGE_KEY = 'agatha_lang';
    const DEFAULT_LANG = 'ru';

    const translations = {
        ru: {
            // Navigation
            'nav.home': 'Главная',
            'nav.map': 'Карта мира',
            'nav.quizzes': 'Викторины',
            'nav.characters': 'Персонажи',
            'nav.books': 'Книги',
            'nav.about': 'О нас',
            'nav.lang': 'EN',

            // Hero
            'hero.title': 'Добро пожаловать в мир Агаты Мистери!',
            'hero.text': 'Погрузись в захватывающий мир тайн и приключений вместе с Агатой Мистери. У нас ты найдёшь уникальные карты с местами действия историй, интересные викторины, а также подробные биографии персонажей. Проверь свою память и знания о книгах, участвуй в увлекательных играх и делись своими впечатлениями. Создавай иллюстрации и пиши фанфики — у нас есть всё для настоящих фанатов.',
            'hero.btn.map': 'Исследовать карту',
            'hero.btn.quiz': 'Пройти викторину',
            'form.honeypot': 'Не заполняйте это поле',
            'home.start.title': 'С чего начать',
            'home.start.characters.title': 'Познакомься с героями',
            'home.start.characters.text': 'Быстро разберись, кто есть кто в мире Агаты: семья, союзники, питомцы и эксперты из разных стран.',
            'home.start.characters.btn': 'Открыть персонажей',
            'home.start.quizzes.title': 'Проверь знания',
            'home.start.quizzes.text': 'Выбери тему и сложность, собери случайный набор вопросов и узнай правильные ответы после квиза.',
            'home.start.quizzes.btn': 'Открыть викторины',
            'home.start.map.title': 'Исследуй мир книг',
            'home.start.map.text': 'Открой карту путешествий, найди места из книг и посмотри, как приключения разбросаны по всему миру.',
            'home.start.map.btn': 'Открыть карту',
            'home.showcase.title': 'Лучшее на сайте',
            'home.showcase.subtitle': 'Живые превью помогают быстрее войти в фандом и увидеть, что сайт уже умеет.',
            'home.showcase.characters.title': 'Персонажи',
            'home.showcase.characters.link': 'Все герои',
            'home.showcase.quizzes.title': 'Викторины',
            'home.showcase.quizzes.link': 'Все квизы',
            'home.showcase.places.title': 'Локации',
            'home.showcase.places.link': 'Вся карта',
            'home.workshop.title': 'Творческая мастерская фанатов',
            'home.workshop.text': 'Популярные фан-сайты удерживают людей не только чтением, но и участием. Здесь можно отправить фанфик, иллюстрацию и со временем собрать настоящее сообщество вокруг серии.',
            'home.workshop.illustration': 'Отправить иллюстрацию',
            'home.workshop.fanfic': 'Отправить фанфик',

            // Reviews
            'reviews.title': 'Отзывы фанатов',
            'reviews.form.title': 'Оставить отзыв',
            'reviews.form.name': 'Ваше имя:',
            'reviews.form.name.placeholder': 'Введите ваше имя',
            'reviews.form.text': 'Ваш отзыв:',
            'reviews.form.text.placeholder': 'Поделитесь своими впечатлениями о книгах...',
            'reviews.form.submit': 'Отправить',
            'reviews.empty': 'Пока нет отзывов. Станьте первым!',
            'reviews.loading': 'Загрузка отзывов...',
            'reviews.error': 'Не удалось загрузить отзывы',
            'reviews.success': 'Спасибо за отзыв!',
            'reviews.rejected': 'Отзыв не прошёл проверку.',

            // Map page
            'map.title': 'Карта приключений',
            'map.subtitle': 'От Лондона до Токио — здесь собраны главные места, где Агата раскрывала загадки.',
            'map.sidebar.title': 'Локации',
            'map.note': 'Нажми на карточку локации, чтобы приблизить карту.',
            'map.loading': 'Загрузка локаций...',
            'map.error': 'Не удалось загрузить локации',
            'map.coords': 'Координаты',

            // Characters page
            'characters.title': 'Персонажи',
            'characters.subtitle': 'Познакомься с главными героями серии книг про Агату Мистери.',
            'characters.loading': 'Загрузка персонажей...',
            'characters.error': 'Не удалось загрузить персонажей',
            'characters.btn.details': 'Подробнее',
            'characters.btn.back': 'Назад к персонажам',
            'characters.notfound': 'Персонаж не найден.',

            // Quizzes page
            'quizzes.title': 'Викторины',
            'quizzes.subtitle': 'Проверь свои знания о мире Агаты Мистери!',
            'quizzes.detail.title': 'Викторина',
            'quizzes.detail.subtitle': 'Ответь на вопросы и узнай свой результат.',
            'quizzes.loading': 'Загрузка викторин...',
            'quizzes.error': 'Не удалось загрузить викторины',
            'quizzes.questions': 'Вопросов',
            'quizzes.btn.start': 'Начать',
            'quizzes.btn.check': 'Проверить ответы',
            'quizzes.question': 'Вопрос',
            'quizzes.answer.all': 'Ответьте на все вопросы, чтобы узнать результат.',
            'quizzes.result': 'Ваш результат: {correct} из {total} ({percent}%).',
            'quizzes.correct.title': 'Правильные ответы',
            'quizzes.notfound': 'Викторина не найдена.',
            'quizzes.of': 'из',
            'quizzes.input.placeholder': 'Введите ваш ответ...',
            'quizzes.questions.lower': 'вопросов',
            'quizzes.random10': '10 случайных вопросов',
            'quizzes.empty': 'Пока викторин нет.',
            'quizzes.btn.back': 'Назад к темам',
            'quizzes.builder.title': 'Выбери сложность',
            'quizzes.builder.subtitle': 'Тема уже выбрана. Теперь выбери сложность и начни викторину.',
            'quizzes.builder.difficulty': 'Сложность',
            'quizzes.builder.generate': 'Начать викторину',
            'quizzes.builder.available': 'Вопросов на этой сложности',
            'quizzes.builder.empty': 'Для такой сложности пока нет вопросов.',
            'quizzes.builder.ready': 'Нажми «Начать викторину», и мы соберём для тебя 10 случайных вопросов по этой теме.',
            'quizzes.completed.locked': 'Этот квиз уже завершён после финального сабмита и больше не редактируется.',
            'quizzes.difficulty.easy': 'Лёгкая',
            'quizzes.difficulty.medium': 'Средняя',
            'quizzes.difficulty.hard': 'Сложная',
            'quizzes.mode.mixed': 'Смешанные',
            'quizzes.mode.single': 'Один ответ',
            'quizzes.mode.multiple': 'Несколько ответов',
            'quizzes.mode.image': 'С картинками',
            'quizzes.mode.input': 'Текстовый ответ',

            // Forms
            'form.fanfic.title': 'Написать фанфик',
            'form.fanfic.subtitle': 'Поделись своей историей о приключениях Агаты!',
            'form.fanfic.name': 'Ваше имя:',
            'form.fanfic.story.title': 'Название истории:',
            'form.fanfic.character': 'Главный персонаж:',
            'form.fanfic.story': 'Ваша история:',
            'form.fanfic.select_character': 'Выберите персонажа',
            'form.fanfic.submit': 'Отправить историю',

            'form.illustration.title': 'Загрузить иллюстрацию',
            'form.illustration.subtitle': 'Покажи свой талант художника!',
            'form.illustration.name': 'Ваше имя:',
            'form.illustration.art.title': 'Название работы:',
            'form.illustration.description': 'Описание:',
            'form.illustration.file': 'Файл изображения:',
            'form.illustration.subject': 'Персонаж или место:',
            'form.illustration.select_subject': 'Выберите, кто или что на изображении',
            'form.illustration.subject_label': 'Тема:',
            'form.illustration.submit': 'Загрузить',

            'form.success': 'Спасибо! Ваша работа отправлена в архив фанатов.',
            'form.success.pending': 'Спасибо! Работа отправлена на проверку — скоро появится на сайте.',
            'reviews.success.pending': 'Спасибо за отзыв! Он появится после проверки.',
            'form.loading': 'Загрузка...',
            'form.error': 'Не удалось отправить данные.',
            'form.error.supabase': 'Не удалось отправить данные в Supabase.',
            'form.error.local': 'Сохранено локально. Подключите Supabase, чтобы хранить в интернете.',
            'form.validation': 'Заполните обязательные поля.',

            // Illustrations
            'illustrations.title': 'Иллюстрации фанатов',
            'illustrations.subtitle': 'Делитесь своими иллюстрациями локаций из приключений Агаты!',
            'illustrations.btn.submit': 'Отправить иллюстрацию',
            'illustrations.empty': 'Пока нет иллюстраций. Будь первым!',
            'illustrations.loading': 'Загрузка иллюстраций...',
            'illustrations.error': 'Не удалось загрузить иллюстрации',

            // Fanfics
            'fanfics.title': 'Фанфики',
            'fanfics.btn.submit': 'Отправить фанфик',
            'fanfics.empty': 'Пока нет фанфиков. Будь первым!',
            'fanfics.loading': 'Загрузка фанфиков...',
            'fanfics.error': 'Не удалось загрузить фанфики',
            'fanfics.author': 'Автор',
            'fanfics.character': 'Персонаж',

            // About Us
            'about.title': 'О нас',
            'about.subtitle': 'Узнайте больше о нашем сообществе и миссии.',
            'about.loading': 'Загрузка истории...',
            'about.error': 'Не удалось загрузить информацию.',
            'about.empty': 'История еще не написана. Расскажите о себе!',
            'characters.detail.title': 'Досье персонажа',
            'characters.detail.subtitle': 'Подробная информация о героях серии.',

            // Books page
            'books.title': 'Все книги Агаты Мистери по порядку',
            'books.header': 'Все книги по порядку',
            'books.subtitle': 'Полный список серии — от первой до последней',
            'books.intro.p1': 'Агата Мистери — двенадцатилетняя сыщица из старинного рода Мистери — обладает феноменальной памятью и острым чутьём на преступления. Вместе с кузеном Ларри, студентом детективной школы, и верным котом Ватсоном она объездила весь мир — от Бермудских островов до Токио. В каждой книге — новая страна, новая тайна и новый шанс доказать, что возраст не помеха для настоящего детектива.',
            'books.intro.p2': 'Серию написал итальянский автор под псевдонимом Стив Стивенсон. Книги выходят с 2006 года и переведены на десятки языков.',
            'books.tip.title': 'С чего начать новичку?',
            'books.tip.text': 'Начни с первой книги — «Загадка Фараона». Она знакомит со всеми главными персонажами и отлично вводит в атмосферу серии. Если хочешь попробовать с середины — книги 6 и 17 отлично читаются самостоятельно.',
            'books.facts.title': 'Интересные факты о серии',
            'books.fact1': 'Мистер Кент — дворецкий с неожиданным прошлым: в молодости он был профессиональным боксёром. Его огромные руки теперь заваривают чай с той же точностью, с какой когда-то наносили удары.',
            'books.fact2': 'Ватсон — не просто кот. На Бали его похитили ради сардин, а в другой книге он серенадами ухаживал за кошкой по имени Мэри. Сибирский кот с голубыми глазами умудряется попадать в приключения чаще, чем любой детектив.',
            'books.fact3': 'Агент Улисс семь лет не сходит на берег — таково предсказание шамана. Он живёт на катамаране «Принцесса Мистери», а его попугай Чандлер ворует всё, до чего дотягивается.',
            'books.fact4': 'За 30 книг Агата и Ларри побывали на 5 континентах. На карте сайта отмечены 46 реальных локаций из 19 книг — от Бермудского треугольника до утёсов Моэр в Ирландии.',
            'books.fact5': 'Агент Билл — орнитолог, который держит ферму у Оксфорда и обучил сокола по имени Марло — в честь Кристофера Марло, английского поэта эпохи Шекспира. Агенты «Ока Интернэшнл» — люди с очень необычными хобби.',
            'books.cta.title': 'Погрузись в мир Агаты глубже',
            'books.cta.text': 'На сайте есть интерактивная карта с реальными локациями из книг и викторины на 940 вопросов — проверь, насколько хорошо ты знаешь серию!',
            'books.cta.btn.map': 'Открыть карту локаций',
            'books.cta.btn.quiz': 'Пройти викторину',

            // Books titles, locations, descriptions
            'book.1.title': 'Загадка Фараона',
            'book.1.location': 'Египет, Долина царей, Каир',
            'book.1.description': 'В Долине царей группа археологов готовится объявить миру о находке гробницы таинственного фараона — но бесценная табличка с указаниями внезапно похищена. Агата и Ларри оказываются в самом сердце Каира: разгадывают улики и расшифровывают иероглифы.',
            'book.2.title': 'Бенгальская жемчужина',
            'book.2.location': 'Индия, Калькутта',
            'book.2.description': 'Из храма Богини Кали в деревне Чотока похищена легендарная жемчужина, а хранитель храма бесследно исчез. Агата и Ларри отправляются в Индию — в город специй, шума и многовековых тайн.',
            'book.3.title': 'Меч короля Шотландии',
            'book.3.location': 'Великобритания, Шотландия, замок Данноттар',
            'book.3.description': 'В старинном замке Данноттар впервые показывают широкой публике меч Роберта Брюса, легендарного короля Шотландии. Во время церемонии все присутствующие неожиданно засыпают — а проснувшись, обнаруживают, что реликвия исчезла. Агата спускается в подземелья замка.',
            'book.4.title': 'Кража на Ниагарском водопаде',
            'book.4.location': 'Канада/США, Ниагарский водопад',
            'book.4.description': 'В роскошном отеле с видом на Ниагарский водопад дерзкий вор ограбил сейф знаменитой певицы и скрылся с бесценными драгоценностями. Следы теряются на фоне грохочущей воды — но не для Агаты.',
            'book.5.title': 'Убийство на Эйфелевой башне',
            'book.5.location': 'Франция, Париж',
            'book.5.description': 'Русский дипломат отравлен прямо в ресторане на вершине Эйфелевой башни. Ларри случайно выводит из игры единственного агента на месте — и теперь расследование целиком ложится на плечи Агаты. К счастью, она как раз оказалась в Париже.',
            'book.6.title': 'Сокровище Бермудских островов',
            'book.6.location': 'Атлантический океан, Бермудский треугольник',
            'book.6.description': 'Корабли исчезают в Бермудском треугольнике уже сотни лет — и вот Агата и Ларри сами оказываются посреди этой загадочной зоны. Карта исчезновений, старинные легенды и кто-то, кто очень не хочет, чтобы тайна раскрылась.',
            'book.7.title': 'Корона дожа',
            'book.7.location': 'Италия, Венеция',
            'book.7.description': 'Старинная корона венецианских правителей похищена, а погоня за вором разворачивается прямо на воде — по каналам и гондолам города, где машин не существует. Гранд-канал становится главной ареной самой водной погони в истории серии.',
            'book.8.title': 'Погоня за белой жирафой',
            'book.8.location': 'Кения, Момбаса',
            'book.8.description': 'В африканском порту Момбасы чувствуется запах соли, специй и опасности. Корабль вот-вот отплывёт, а вместе с ним — и улики, которые Агата должна успеть поймать раньше. Сухопутная погоня превращается в морскую.',
            'book.9.title': 'Переполох в Голливуде',
            'book.9.location': 'США, Лос-Анджелес, Голливуд',
            'book.9.description': 'На съёмочной площадке продюсера Роберта Моррисона одно за другим происходят странные происшествия, а актёрам начинают приходить письма с угрозами. Агата и Ларри должны выяснить, кто хочет остановить съёмки любой ценой.',
            'book.10.title': 'Опасный круиз',
            'book.10.location': 'Норвегия, Тронхейм, Берген, фьорды',
            'book.10.description': 'Круизный лайнер среди норвежских фьордов — казалось бы, идеальный отдых. Но уже на третий день на борту происходит нечто, что не вписывается ни в одно туристическое расписание. Агента Сэмюэля, который живёт здесь с семьёй, тоже втягивают в расследование.',
            'book.11.title': 'Похищение в Ватикане',
            'book.11.location': 'Италия, Рим, Ватикан',
            'book.11.description': 'Из стен самого маленького государства в мире исчезает нечто бесценное. Агата прилетает через аэропорт Фьюмичино, проходит по Виа Национале и понимает: дело касается всего католического мира. Ватикан не любит, когда его секреты раскрывают чужаки.',
            'book.12.title': 'Таинственная роза Альгамбры',
            'book.12.location': 'Испания, Гранада',
            'book.12.description': 'Дворец Альгамбра хранит тайны мавританских правителей — и кто-то решил воспользоваться этим. В лабиринте залов и садов Гранады Агата ищет похищенную реликвию, а её фотографическая память работает на пределе.',
            'book.13.title': 'Охота за призраком',
            'book.13.location': 'Россия, Транссибирская магистраль',
            'book.13.description': 'На борту роскошного экспресса «Золотой орёл» пересекает всю Россию — и именно здесь нужно предотвратить дерзкое ограбление состоятельного пассажира. Гениальный вор Строгов — мастер перевоплощений — уже бросил вызов агентству.',
            'book.14.title': 'Сыщик против сыщика',
            'book.14.location': 'США, Нью-Йорк, Манхэттен',
            'book.14.description': 'В Нью-Йорке проходит конгресс детективов со всего мира — и именно здесь происходит преступление, которое никто не предвидел. Агата прилетает через аэропорт Кеннеди и с первых минут понимает: соперники-детективы могут оказаться опаснее преступников.',
            'book.15.title': 'Секрет графа Дракулы',
            'book.15.location': 'Румыния, Клуж-Напока · Великобритания, Лондон',
            'book.15.description': 'Легенда о Дракуле уводит Агату в Румынию — туманные замки, карпатские перевалы и местные, которые слишком хорошо знают, о чём молчать. А Ларри тем временем назначает романтическую встречу у Лондонского колеса обозрения.',
            'book.16.title': 'Разыскивается ковёр-самолёт',
            'book.16.location': 'Узбекистан, Самарканд',
            'book.16.description': 'Из Лондона — в древний Самарканд, один из красивейших городов Центральной Азии. Там пропал старинный ковёр с зашифрованной картой — и теперь Агате нужно разобрать чужой язык, чужую культуру и чужие хитрости.',
            'book.17.title': 'Пожар в джунглях',
            'book.17.location': 'Бразилия, Рио-де-Жанейро, Манаус, Амазония',
            'book.17.description': 'Пляж Ипанема, жара, карнавальные ритмы — и посреди всего этого кто-то поджигает джунгли. Агата встречается с агентом Уолтером прямо у океана, а потом путь ведёт вглубь Амазонии, где законы совсем другие.',
            'book.18.title': 'Путешествие на край земли',
            'book.18.location': 'Португалия, Лиссабон',
            'book.18.description': 'Десять лет назад из запертого сейфа исчезла секретная формула мастерства. В годовщину смерти мастера один из его учеников получает таинственное письмо — и обращается в «Oko International». Агата, Ларри и мистер Кент отправляются в Лиссабон — город португальской гитары и давних тайн.',
            'book.19.title': 'По следам алмаза',
            'book.19.location': 'Нидерланды, Амстердам',
            'book.19.description': 'Погоня на велосипедах по набережным Херенграхт, встреча у Магере-Брюг — знаменитого «тощего» моста — и план грабителя, который рассыпается на глазах у Агаты. Амстердам идеален для велосипедной погони.',
            'book.20.title': 'Тайна нефритового дракона',
            'book.20.location': 'Китай, Пекин',
            'book.20.description': 'Из Пекинского музея искусств похищена статуэтка нефритового дракона. Ларри вылетает расследовать дело в одиночку — но вскоре Агата получает тревожное сообщение: Ларри сам похищен. Теперь ей нужно найти и статуэтку, и брата.',
            'book.21.title': 'Преступление на десерт',
            'book.21.location': 'США, Новый Орлеан',
            'book.21.description': 'Новый Орлеан — город джаза, вуду и лучших десертов в Америке. Именно сюда сходятся все нити дела о пропавшей рукописи. Агата распутывает след в атмосфере карнавального города, где всё не то, чем кажется.',
            'book.22.title': 'Миллион за птицу додо',
            'book.22.location': 'Великобритания, Оксфорд',
            'book.22.description': 'Студент Оксфорда похищен — и выкуп назначен в лесу Уитем-Вудс. Агент Билл, орнитолог с фермой неподалёку, и его сокол Марло помогают отследить след. А птица додо тут причём? Узнаешь в конце.',
            'book.23.title': 'Шифр контрабандистов',
            'book.23.location': 'Германия, Берлин',
            'book.23.description': 'Из лондонской штаб-квартиры «Ока Интернэшнл» — прямо в Берлин. Зашифрованное послание, пропавший дядя Гельмут и город, который умеет хранить секреты. Агент-дешифровщик Алджернон здесь как нельзя кстати.',
            'book.24.title': 'Месть на горе Фудзи',
            'book.24.location': 'Япония, Токио · Гора Фудзи',
            'book.24.description': 'Из Токио — к подножию священной горы Фудзи. Расследование разворачивается на фоне японских традиций, которые Агата уважает, но нарушает — потому что иначе нельзя. Цель преступника — сама гора.',
            'book.25.title': 'Непредвиденный казус в Барселоне',
            'book.25.location': 'Испания, Барселона',
            'book.25.description': 'На площади Каталонии, у фонтана Каналетес на Рамбле — агент передаёт посылку. Но что-то идёт не так, и Агате приходится импровизировать в самом живом городе Испании. Барселона не позволяет скучать.',
            'book.26.title': 'Сокровища королевы пиратов',
            'book.26.location': 'Индонезия, Бали',
            'book.26.description': 'Остров Бали — рис, храмы, океан и… пиратское сокровище, которое ищут сразу несколько групп. На Бали Ватсон попадает в переделку из-за сардин, а Агата распутывает дело на фоне яванских закатов.',
            'book.27.title': 'Загадочное происшествие на Венском балу',
            'book.27.location': 'Австрия, Вена',
            'book.27.description': 'Из танцевальной школы Лондона — в роскошный Венский бал. Среди вальсов, фраков и бальных платьев разворачивается главный конфликт книги. Агента в бальном платье узнать непросто — но улики она видит всегда.',
            'book.28.title': 'Загадка ледяного викинга',
            'book.28.location': 'Гренландия',
            'book.28.description': 'В гренландском леднике обнаружено тело древнего скандинавского воина в полном боевом облачении. Прежде чем учёные успели изучить находку, викинг вместе с глыбой льда бесследно исчез из лаборатории.',
            'book.29.title': 'Модные интриги в Милане',
            'book.29.location': 'Италия, Милан',
            'book.29.description': 'Неделя высокой моды в Милане — блеск, камеры, дизайнеры. И кто-то, кто использует всю эту суету как прикрытие. Агата ищет улики у Королевского дворца и на площади Пьяцца Гае Ауленти, пока вокруг кипит показ.',
            'book.30.title': 'Пропавшее кольцо',
            'book.30.location': 'Ирландия, Дублин · Графство Голуэй',
            'book.30.description': 'От собора Святого Патрика в Дублине — до приморской деревни Россавил и утёсов Моэр, где заканчивается земля и начинается Атлантика. Именно здесь, на «Ведьминой голове», расследование превращается в прямое столкновение.',

            // Book labels
            'book.characters.label': 'Персонажи:',
            'book.source.label': 'Локации: карта сайта',

            // Book hooks and characters (Russian only - shown as placeholders)
            'book.1.hook': 'Первое дело — и сразу в самое пекло. Готов искать улики вместе с Агатой?',
            'book.2.hook': 'Древние тайны хранят свои секреты тысячелетиями. Пора их раскрыть.',
            'book.3.hook': 'Шотландские замки хранят не только историю. Иногда — и живые тайны.',
            'book.4.hook': 'Водопад заглушает шаги. Но улики всё равно остаются.',
            'book.5.hook': 'Париж красив. Но за этой красотой скрывается смерть.',
            'book.6.hook': 'Треугольник хранит свои тайны. Агата намерена их забрать.',
            'book.7.hook': 'По каналам Венеции на гондоле — это не романтика, это погоня!',
            'book.8.hook': 'Африка огромна. Но улики всегда оставляют след.',
            'book.9.hook': 'В Голливуде всё — игра. Но это преступление — самое настоящее.',
            'book.10.hook': 'Фьорды красивы. И очень хорошо скрывают тайны.',

            // Workshop
            'workshop.title': 'Творческая мастерская',
            'workshop.subtitle': 'Создай иллюстрацию или напиши фанфик, чтобы поделиться своим видением мира Агаты Мистери.',

            // Common
            'loading': 'Загрузка...',
            'error.retry': 'Попробовать снова',
            'error.no_supabase': 'Supabase не настроен',
            'error.load_data': 'Не удалось загрузить данные',
            'error.map_load': 'Карта не загрузилась. Проверьте подключение к интернету.',
            'error.char_not_found': 'Персонаж не найден.',
            'error.quiz_not_found': 'Викторина не найдена.',
            'error.review_check': 'Отзыв не прошёл проверку.',
            'error.review_fields': 'Заполните имя и текст отзыва.',
            'error.review_generic': 'Не удалось отправить отзыв. Попробуйте позже.',
            'noimage': 'Нет изображения',
            'footer': '© 2024 Фанаты Агаты Мистери. Фан-сайт по книгам Стива Стивенсона.',
            'site.title': 'Агата Мистери',
            'supabase.connect': 'Подключите Supabase для просмотра.',
            'gallery.prev': 'Предыдущее',
            'gallery.next': 'Следующее',
            'carousel.prev': 'Назад',
            'carousel.next': 'Вперёд',
            'map.close': 'Закрыть',
            'map.filters.label': 'Фильтр по книгам',
            'review.local': '(Сохранено локально)',
            'review.score': 'Оценка: {score}/10.',
            'search.no_results': 'Ничего не найдено',
            'form.sent.banner': 'ОТПРАВЛЕНО',

            // Character Names
            'char.agatha': 'Агата Мистери',
            'char.larry': 'Ларри Мистери',
            'char.watson': 'Ватсон (кот)',
            'char.kent': 'Мистер Кент',
            'char.chandler': 'Чандлер Мистери',

            // Placeholders
            'form.placeholder.art_title': 'Например: Тайна в Лондоне',
            'form.placeholder.description': 'Что вдохновило тебя?',
            'form.placeholder.fanfic_title': 'Название истории',
            'form.placeholder.fanfic_text': 'Напишите короткий сюжет или начало истории',
            'search.illustrations.placeholder': 'Найти по названию, автору или описанию...',
            'search.fanfics.placeholder': 'Найти по названию, автору или персонажу...',

            // Meta & Aria
            'meta.description.home': 'Добро пожаловать на фан-сайт Агаты Мистери. Здесь вы найдете карту приключений, викторины и информацию о персонажах.',
            'meta.description.map': 'Карта приключений Агаты Мистери по всему миру.',
            'meta.description.quiz': 'Викторины по книгам Агаты Мистери.',
            'meta.description.quiz-detail': 'Детали викторины по книгам Агаты Мистери.',
            'meta.description.characters': 'Персонажи серии книг про Агату Мистери.',
            'meta.description.character-detail': 'Подробности о персонажах Агаты Мистери.',
            'meta.description.fanfiction-form': 'Форма отправки фанфиков по Агате Мистери.',
            'meta.description.illustration-form': 'Форма отправки иллюстраций по книгам Агаты Мистери.',
            'meta.description.about': 'О фанатском сообществе Агаты Мистери и нашей миссии.',
            'nav.menu.label': 'Меню'
        },

        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.map': 'World Map',
            'nav.quizzes': 'Quizzes',
            'nav.characters': 'Characters',
            'nav.books': 'Books',
            'nav.about': 'About Us',
            'nav.lang': 'RU',

            // Hero
            'hero.title': 'Welcome to the World of Agatha Mystery!',
            'hero.text': 'Dive into the thrilling world of mysteries and adventures with Agatha Mystery. Here you\'ll find unique maps of story locations, exciting quizzes, and detailed character biographies. Test your memory and knowledge of the books, participate in engaging games, and share your impressions. Create illustrations and write fanfiction — we have everything for true fans.',
            'hero.btn.map': 'Explore Map',
            'hero.btn.quiz': 'Take a Quiz',
            'form.honeypot': 'Do not fill in this field',
            'home.start.title': 'Where to start',
            'home.start.characters.title': 'Meet the heroes',
            'home.start.characters.text': 'Quickly understand who is who in Agatha’s world: family, allies, pets, and experts from different countries.',
            'home.start.characters.btn': 'Open Characters',
            'home.start.quizzes.title': 'Test your knowledge',
            'home.start.quizzes.text': 'Choose a topic and difficulty, get a random set of questions, and see the correct answers after the quiz.',
            'home.start.quizzes.btn': 'Open Quizzes',
            'home.start.map.title': 'Explore the world of the books',
            'home.start.map.text': 'Open the travel map, find places from the books, and see how the adventures are spread around the world.',
            'home.start.map.btn': 'Open Map',
            'home.showcase.title': 'Best of the site',
            'home.showcase.subtitle': 'Live previews help you enter the fandom faster and see what the site already offers.',
            'home.showcase.characters.title': 'Characters',
            'home.showcase.characters.link': 'All heroes',
            'home.showcase.quizzes.title': 'Quizzes',
            'home.showcase.quizzes.link': 'All quizzes',
            'home.showcase.places.title': 'Locations',
            'home.showcase.places.link': 'Full map',
            'home.workshop.title': 'Fan Creative Workshop',
            'home.workshop.text': 'Popular fan sites keep people engaged not only through reading, but also through participation. Here you can submit fanfiction, illustrations, and gradually build a real community around the series.',
            'home.workshop.illustration': 'Submit Illustration',
            'home.workshop.fanfic': 'Submit Fanfic',

            // Reviews
            'reviews.title': 'Fan Reviews',
            'reviews.form.title': 'Leave a Review',
            'reviews.form.name': 'Your name:',
            'reviews.form.name.placeholder': 'Enter your name',
            'reviews.form.text': 'Your review:',
            'reviews.form.text.placeholder': 'Share your impressions about the books...',
            'reviews.form.submit': 'Submit',
            'reviews.empty': 'No reviews yet. Be the first!',
            'reviews.loading': 'Loading reviews...',
            'reviews.error': 'Failed to load reviews',
            'reviews.success': 'Thank you for your review!',
            'reviews.rejected': 'Review did not pass moderation.',

            // Map page
            'map.title': 'Adventure Map',
            'map.subtitle': 'From London to Tokyo — all the places where Agatha solved mysteries.',
            'map.sidebar.title': 'Locations',
            'map.note': 'Click on a location card to zoom the map.',
            'map.loading': 'Loading locations...',
            'map.error': 'Failed to load locations',
            'map.coords': 'Coordinates',

            // Characters page
            'characters.title': 'Characters',
            'characters.subtitle': 'Meet the main heroes of the Agatha Mystery book series.',
            'characters.loading': 'Loading characters...',
            'characters.error': 'Failed to load characters',
            'characters.btn.details': 'Learn More',
            'characters.btn.back': 'Back to Characters',
            'characters.notfound': 'Character not found.',

            // Quizzes page
            'quizzes.title': 'Quizzes',
            'quizzes.subtitle': 'Test your knowledge of the Agatha Mystery world!',
            'quizzes.detail.title': 'Quiz',
            'quizzes.detail.subtitle': 'Answer the questions and see your result.',
            'quizzes.loading': 'Loading quizzes...',
            'quizzes.error': 'Failed to load quizzes',
            'quizzes.questions': 'Questions',
            'quizzes.btn.start': 'Start',
            'quizzes.btn.check': 'Check Answers',
            'quizzes.question': 'Question',
            'quizzes.answer.all': 'Answer all questions to see your result.',
            'quizzes.result': 'Your result: {correct} out of {total} ({percent}%).',
            'quizzes.correct.title': 'Correct answers',
            'quizzes.notfound': 'Quiz not found.',
            'quizzes.of': 'of',
            'quizzes.input.placeholder': 'Enter your answer...',
            'quizzes.questions.lower': 'questions',
            'quizzes.random10': '10 random questions',
            'quizzes.empty': 'No quizzes yet.',
            'quizzes.btn.back': 'Back to topics',
            'quizzes.builder.title': 'Choose difficulty',
            'quizzes.builder.subtitle': 'The theme is already chosen. Now pick a difficulty and start the quiz.',
            'quizzes.builder.difficulty': 'Difficulty',
            'quizzes.builder.generate': 'Start quiz',
            'quizzes.builder.available': 'Questions at this difficulty',
            'quizzes.builder.empty': 'No questions for this difficulty yet.',
            'quizzes.builder.ready': 'Press “Start quiz” and we will pick 10 random questions for this theme.',
            'quizzes.completed.locked': 'This quiz has already been finished after the final submission and can no longer be edited.',
            'quizzes.difficulty.easy': 'Easy',
            'quizzes.difficulty.medium': 'Medium',
            'quizzes.difficulty.hard': 'Hard',
            'quizzes.mode.mixed': 'Mixed',
            'quizzes.mode.single': 'One answer',
            'quizzes.mode.multiple': 'Multiple answers',
            'quizzes.mode.image': 'With pictures',
            'quizzes.mode.input': 'Text answer',

            // Forms
            'form.fanfic.title': 'Write a Fanfic',
            'form.fanfic.subtitle': 'Share your story about Agatha\'s adventures!',
            'form.fanfic.name': 'Your name:',
            'form.fanfic.story.title': 'Story title:',
            'form.fanfic.character': 'Main character:',
            'form.fanfic.story': 'Your story:',
            'form.fanfic.select_character': 'Select a character',
            'form.fanfic.submit': 'Submit Story',

            'form.illustration.title': 'Upload Illustration',
            'form.illustration.subtitle': 'Show your artistic talent!',
            'form.illustration.name': 'Your name:',
            'form.illustration.art.title': 'Artwork title:',
            'form.illustration.description': 'Description:',
            'form.illustration.file': 'Image file:',
            'form.illustration.subject': 'Character or location:',
            'form.illustration.select_subject': 'Choose who or what is shown in the image',
            'form.illustration.subject_label': 'Subject:',
            'form.illustration.submit': 'Upload',

            'form.success': 'Thank you! Your work has been submitted to the fan archive.',
            'form.success.pending': 'Thank you! Your work has been sent for review — it will appear soon.',
            'reviews.success.pending': 'Thank you for your review! It will appear after moderation.',
            'form.loading': 'Loading...',
            'form.error': 'Failed to submit data.',
            'form.error.supabase': 'Failed to submit data to Supabase.',
            'form.error.local': 'Saved locally. Connect Supabase to store on the internet.',
            'form.validation': 'Please fill in required fields.',

            // Illustrations
            'illustrations.title': 'Fan Illustrations',
            'illustrations.subtitle': 'Share your illustrations of locations from Agatha\'s adventures!',
            'illustrations.btn.submit': 'Submit Illustration',
            'illustrations.empty': 'No illustrations yet. Be the first!',
            'illustrations.loading': 'Loading illustrations...',
            'illustrations.error': 'Failed to load illustrations',

            // Fanfics
            'fanfics.title': 'Fanfics',
            'fanfics.btn.submit': 'Submit Fanfic',
            'fanfics.empty': 'No fanfics yet. Be the first!',
            'fanfics.loading': 'Loading fanfics...',
            'fanfics.error': 'Failed to load fanfics',
            'fanfics.author': 'Author',
            'fanfics.character': 'Character',

            // About Us
            'about.title': 'About Us',
            'about.subtitle': 'Learn more about our community and mission.',
            'about.loading': 'Loading history...',
            'about.error': 'Failed to load information.',
            'about.empty': 'History hasn\'t been written yet. Tell us about yourself!',
            'characters.detail.title': 'Character File',
            'characters.detail.subtitle': 'Detailed information about the heroes of the series.',

            // Books page
            'books.title': 'All Agatha Mystery Books in Order',
            'books.header': 'All books in order',
            'books.subtitle': 'Complete series list — from first to last',
            'books.intro.p1': 'Agatha Mystery — a twelve-year-old detective from the ancient Mystery family — has a phenomenal memory and a sharp nose for crime. Together with her cousin Larry, a detective school student, and her faithful cat Watson, she has traveled around the world — from the Bermuda Islands to Tokyo. In each book — a new country, a new mystery, and a new chance to prove that age is no barrier to a true detective.',
            'books.intro.p2': 'The series was written by an Italian author under the pseudonym Steve Stevenson. Books have been coming out since 2006 and are translated into dozens of languages.',
            'books.tip.title': 'Where to start for beginners?',
            'books.tip.text': 'Start with the first book — "The Pharaoh\'s Riddle". It introduces you to all the main characters and sets the perfect tone for the series. If you want to try from the middle — books 6 and 17 read well on their own.',
            'books.facts.title': 'Interesting facts about the series',
            'books.fact1': 'Mr. Kent — a butler with an unexpected past: in his youth he was a professional boxer. His huge hands now brew tea with the same precision as they once delivered blows.',
            'books.fact2': 'Watson is not just a cat. In Bali he was kidnapped for sardines, and in another book he courted a cat named Mary with serenades. A Siberian cat with blue eyes manages to get into adventures more often than any detective.',
            'books.fact3': 'Agent Ulysses hasn\'t set foot on land for seven years — such is the shaman\'s prediction. He lives on the catamaran "Princess Mystery", and his parrot Chandler steals everything he can reach.',
            'books.fact4': 'In 30 books, Agatha and Larry visited 5 continents. The site map marks 46 real locations from 19 books — from the Bermuda Triangle to the Moher cliffs in Ireland.',
            'books.fact5': 'Agent Bill is an ornithologist who runs a farm near Oxford and trained a falcon named Marlowe — after Christopher Marlowe, an English poet of Shakespeare\'s era. Agents of "Eye International" are people with very unusual hobbies.',
            'books.cta.title': 'Dive deeper into Agatha\'s world',
            'books.cta.text': 'The site features an interactive map with real locations from the books and quizzes with 940 questions — test how well you know the series!',
            'books.cta.btn.map': 'Open location map',
            'books.cta.btn.quiz': 'Take a quiz',

            // Books titles, locations, descriptions
            'book.1.title': 'The Pharaoh\'s Riddle',
            'book.1.location': 'Egypt, Valley of Kings, Cairo',
            'book.1.description': 'In the Valley of Kings, a group of archaeologists prepare to announce their discovery of a mysterious pharaoh\'s tomb — but a priceless tablet with directions suddenly goes missing. Agatha and Larry find themselves in the heart of Cairo, deciphering clues and decoding hieroglyphics.',
            'book.2.title': 'The Bengali Pearl',
            'book.2.location': 'India, Calcutta',
            'book.2.description': 'A legendary pearl is stolen from the Temple of the Goddess Kali in the Indian village of Chotoka, and the temple keeper vanishes without a trace. Agatha and Larry head to India — a city of spices, noise, and ancient secrets.',
            'book.3.title': 'The Scottish King\'s Sword',
            'book.3.location': 'Great Britain, Scotland, Dunnottar Castle',
            'book.3.description': 'At the ancient Dunnottar Castle, Robert the Bruce\'s legendary sword is displayed to the public for the first time. During the ceremony, everyone mysteriously falls asleep — and upon waking, the relic has disappeared. Agatha descends into the castle dungeons.',
            'book.4.title': 'The Niagara Falls Theft',
            'book.4.location': 'Canada/USA, Niagara Falls',
            'book.4.description': 'At a luxurious hotel overlooking Niagara Falls, a daring thief robs a famous singer\'s safe and escapes with priceless jewels. Clues vanish against the roaring waters — but not for Agatha.',
            'book.5.title': 'Murder at the Eiffel Tower',
            'book.5.location': 'France, Paris',
            'book.5.description': 'A Russian diplomat is poisoned right in a restaurant at the top of the Eiffel Tower. Larry accidentally takes out the only agent on site — now the entire investigation falls on Agatha\'s shoulders. Fortunately, she happens to be in Paris.',
            'book.6.title': 'The Bermuda Islands Treasure',
            'book.6.location': 'Atlantic Ocean, Bermuda Triangle',
            'book.6.description': 'Ships have been disappearing in the Bermuda Triangle for centuries — and now Agatha and Larry find themselves in this mysterious zone. Maps of disappearances, ancient legends, and someone who doesn\'t want the secret revealed.',
            'book.7.title': 'The Doge\'s Crown',
            'book.7.location': 'Italy, Venice',
            'book.7.description': 'An ancient crown of Venetian rulers is stolen, and the chase unfolds across water — through canals and gondolas in a city without cars. The Grand Canal becomes the setting for the most daring water chase in the series.',
            'book.8.title': 'The Hunt for the White Giraffe',
            'book.8.location': 'Kenya, Mombasa',
            'book.8.description': 'In the African port of Mombasa, the air smells of salt, spices, and danger. A ship is about to depart with evidence that Agatha must catch first. A land-based pursuit turns into a sea chase.',
            'book.9.title': 'Hollywood Uproar',
            'book.9.location': 'USA, Los Angeles, Hollywood',
            'book.9.description': 'On producer Robert Morrison\'s film set, strange incidents occur one after another, and actors receive threatening letters. Agatha and Larry must find out who wants to stop production at any cost.',
            'book.10.title': 'Dangerous Cruise',
            'book.10.location': 'Norway, Trondheim, Bergen, Fjords',
            'book.10.description': 'A cruise ship among Norwegian fjords — seemingly the perfect vacation. But on the third day, something happens that doesn\'t fit any tourist schedule. Agent Samuel, who lives here with his family, gets drawn into the investigation.',
            'book.11.title': 'The Abduction at the Vatican',
            'book.11.location': 'Italy, Rome, Vatican',
            'book.11.description': 'Something precious disappears from the walls of the world\'s smallest state. Agatha arrives via Fiumicino airport and realizes the matter concerns the entire Catholic world. The Vatican doesn\'t like it when outsiders reveal its secrets.',
            'book.12.title': 'The Mysterious Rose of the Alhambra',
            'book.12.location': 'Spain, Granada',
            'book.12.description': 'The Alhambra Palace holds the secrets of Moorish rulers — and someone decided to use this. In the maze of halls and gardens of Granada, Agatha searches for a stolen relic while her photographic memory works to its limits.',
            'book.13.title': 'The Hunt for the Phantom',
            'book.13.location': 'Russia, Trans-Siberian Railway',
            'book.13.description': 'Aboard the luxurious Golden Eagle express crossing all of Russia, Agatha and Larry must prevent a daring robbery of a wealthy passenger. Brilliant thief Strogov — a master of disguise — has openly challenged the agency.',
            'book.14.title': 'Detective Against Detective',
            'book.14.location': 'USA, New York, Manhattan',
            'book.14.description': 'A congress of detectives from around the world is held in New York — and a crime nobody predicted occurs here. Agatha arrives via Kennedy Airport and quickly understands: rival detectives may be more dangerous than criminals.',
            'book.15.title': 'The Secret of Count Dracula',
            'book.15.location': 'Romania, Cluj-Napoca · Great Britain, London',
            'book.15.description': 'The Dracula legend leads Agatha to Romania — misty castles, Carpathian passes, and locals who know well what to keep silent about. Meanwhile, Larry arranges a romantic meeting at the London Eye.',
            'book.16.title': 'Wanted: Flying Carpet',
            'book.16.location': 'Uzbekistan, Samarkand',
            'book.16.description': 'From London to ancient Samarkand, one of Central Asia\'s most beautiful cities. A stolen ancient carpet with a hidden map disappears — and now Agatha must understand a foreign language, culture, and cunning.',
            'book.17.title': 'Fire in the Jungle',
            'book.17.location': 'Brazil, Rio de Janeiro, Manaus, Amazon',
            'book.17.description': 'Ipanema Beach, heat, carnival rhythms — and someone sets the jungle on fire. Agatha meets Agent Walter right at the ocean, then travels deep into the Amazon where rules are completely different.',
            'book.18.title': 'Journey to the Edge of the World',
            'book.18.location': 'Portugal, Lisbon',
            'book.18.description': 'Ten years ago, a secret formula vanished from a locked safe. On the anniversary of the master\'s death, one of his students receives a mysterious letter — and contacts Eye International. Agatha, Larry, and Mr. Kent travel to Lisbon — a city of Portuguese guitars and ancient secrets.',
            'book.19.title': 'Following the Diamond',
            'book.19.location': 'Netherlands, Amsterdam',
            'book.19.description': 'A bicycle chase along the Herengracht canals, a meeting at the Magere Brug — the famous "thin bridge" — and a criminal\'s plan that falls apart before Agatha\'s eyes. Amsterdam is perfect for a bike chase.',
            'book.20.title': 'The Mystery of the Jade Dragon',
            'book.20.location': 'China, Beijing',
            'book.20.description': 'A jade dragon statue is stolen from the Beijing Museum of Arts. Larry flies to Beijing alone to investigate — but soon Agatha receives alarming news: Larry himself has been kidnapped. Now she must find both the statue and her brother.',
            'book.21.title': 'Crime for Dessert',
            'book.21.location': 'USA, New Orleans',
            'book.21.description': 'New Orleans — a city of jazz, voodoo, and America\'s best desserts. All threads of a missing manuscript mystery lead here. Agatha unravels the trail in the atmosphere of a carnival city where everything is not what it seems.',
            'book.22.title': 'A Million for the Dodo Bird',
            'book.22.location': 'Great Britain, Oxford',
            'book.22.description': 'An Oxford student is kidnapped — and ransom is demanded in Witham Woods. Agent Bill, an ornithologist with a nearby farm, and his falcon Marlowe help track the trail. But what does the dodo bird have to do with it? You\'ll find out at the end.',
            'book.23.title': 'The Smugglers\' Code',
            'book.23.location': 'Germany, Berlin',
            'book.23.description': 'From the Eye International headquarters in London — straight to Berlin. An encrypted message, a missing Uncle Helmut, and a city that knows how to keep secrets. Codebreaker Agent Algernon is exactly what\'s needed.',
            'book.24.title': 'Revenge on Mount Fuji',
            'book.24.location': 'Japan, Tokyo · Mount Fuji',
            'book.24.description': 'From Tokyo to the sacred Mount Fuji. The investigation unfolds against the backdrop of Japanese traditions that Agatha respects but breaks — because there\'s no other way. The criminal\'s target is the mountain itself.',
            'book.25.title': 'An Unexpected Situation in Barcelona',
            'book.25.location': 'Spain, Barcelona',
            'book.25.description': 'On Catalonia Square, at the Canet fountain on the Rambla — an agent passes a package. But something goes wrong, and Agatha must improvise in the liveliest city of Spain. Barcelona doesn\'t allow boredom.',
            'book.26.title': 'The Pirate Queen\'s Treasures',
            'book.26.location': 'Indonesia, Bali',
            'book.26.description': 'Bali Island — rice fields, temples, ocean… and a pirate treasure sought by several groups. In Bali, Watson gets into trouble over sardines, while Agatha unravels the mystery against the backdrop of Javanese sunsets.',
            'book.27.title': 'A Mysterious Incident at the Vienna Ball',
            'book.27.location': 'Austria, Vienna',
            'book.27.description': 'From a London dance school to an opulent Vienna ball. Among waltzes, frock coats, and ball gowns, the main conflict of the book unfolds. A detective in a ball gown is hard to recognize — but Agatha always sees the clues.',
            'book.28.title': 'The Riddle of the Ice Viking',
            'book.28.location': 'Greenland',
            'book.28.description': 'The body of an ancient Scandinavian warrior in full battle gear is discovered in a Greenland glacier. Before scientists can examine the find, the Viking vanishes with a chunk of ice from the laboratory.',
            'book.29.title': 'Fashion Intrigues in Milan',
            'book.29.location': 'Italy, Milan',
            'book.29.description': 'Fashion Week in Milan — glitter, cameras, designers. And someone using all this glamour as cover. Agatha searches for clues at the Royal Palace and Piazza Gae Aulenti while the shows continue around her.',
            'book.30.title': 'The Missing Ring',
            'book.30.location': 'Ireland, Dublin · County Galway',
            'book.30.description': 'From Saint Patrick\'s Cathedral in Dublin to the coastal village of Rossaveal and the Moher cliffs, where land ends and the Atlantic begins. Here, at the "Witch\'s Head", the investigation becomes a direct confrontation.',

            // Book labels
            'book.characters.label': 'Characters:',
            'book.source.label': 'Locations: site map',

            // Book hooks (English translations)
            'book.1.hook': 'First case — and straight into the fire. Ready to search for clues with Agatha?',
            'book.2.hook': 'Ancient secrets have kept their mysteries for millennia. Time to reveal them.',
            'book.3.hook': 'Scottish castles hold not just history. Sometimes — living mysteries.',
            'book.4.hook': 'The waterfall drowns out footsteps. But clues always leave a trace.',
            'book.5.hook': 'Paris is beautiful. But behind that beauty lies death.',
            'book.6.hook': 'The triangle keeps its secrets. Agatha intends to claim them.',
            'book.7.hook': 'Through Venice\'s canals on a gondola — that\'s not romance, that\'s a chase!',
            'book.8.hook': 'Africa is vast. But clues always leave a trail.',
            'book.9.hook': 'In Hollywood, everything is an act. But this crime is very real.',
            'book.10.hook': 'Fjords are beautiful. And they hide secrets very well.',

            // Workshop
            'workshop.title': 'Creative Workshop',
            'workshop.subtitle': 'Create an illustration or write a fanfic to share your vision of Agatha Mistery\'s world.',

            // Common
            'loading': 'Loading...',
            'error.retry': 'Try Again',
            'error.no_supabase': 'Supabase not configured',
            'error.load_data': 'Failed to load data',
            'error.map_load': 'Map failed to load. Check your internet connection.',
            'error.char_not_found': 'Character not found.',
            'error.quiz_not_found': 'Quiz not found.',
            'error.review_check': 'Review did not pass moderation.',
            'error.review_fields': 'Fill in your name and review text.',
            'error.review_generic': 'Failed to submit review. Try later.',
            'noimage': 'No image',
            'footer': '© 2024 Agatha Mystery Fans. Fan site for Steve Stevenson\'s books.',
            'site.title': 'Agatha Mystery',
            'supabase.connect': 'Connect Supabase to view.',
            'gallery.prev': 'Previous',
            'gallery.next': 'Next',
            'carousel.prev': 'Previous',
            'carousel.next': 'Next',
            'map.close': 'Close',
            'map.filters.label': 'Filter by books',
            'review.local': '(Saved locally)',
            'review.score': 'Score: {score}/10.',
            'search.no_results': 'Nothing found',
            'form.sent.banner': 'SUBMITTED',

            // Character Names
            'char.agatha': 'Agatha Mystery',
            'char.larry': 'Larry Mystery',
            'char.watson': 'Watson (cat)',
            'char.kent': 'Mr. Kent',
            'char.chandler': 'Chandler Mystery',

            // Placeholders
            'form.placeholder.art_title': 'Example: Mystery in London',
            'form.placeholder.description': 'What inspired you?',
            'form.placeholder.fanfic_title': 'Story title',
            'form.placeholder.fanfic_text': 'Write a short plot or the beginning of the story',
            'search.illustrations.placeholder': 'Search by title, author, or description...',
            'search.fanfics.placeholder': 'Search by title, author, or character...',

            // Meta & Aria
            'meta.description.home': 'Welcome to the Agatha Mystery fan site. Here you will find an adventure map, quizzes, and character information.',
            'meta.description.map': 'Map of Agatha Mystery adventures around the world.',
            'meta.description.quiz': 'Quizzes based on the Agatha Mystery books.',
            'meta.description.quiz-detail': 'Quiz details for Agatha Mystery books.',
            'meta.description.characters': 'Characters from the Agatha Mystery book series.',
            'meta.description.character-detail': 'Details about Agatha Mystery characters.',
            'meta.description.fanfiction-form': 'Fanfic submission form for Agatha Mystery.',
            'meta.description.illustration-form': 'Illustration submission form for Agatha Mystery books.',
            'meta.description.about': 'About the Agatha Mystery fan community and our mission.',
            'nav.menu.label': 'Menu'
        }
    };

    let currentLang = DEFAULT_LANG;
    let remoteTranslations = null;

    /**
     * Загрузить переводы из Supabase
     */
    const loadFromSupabase = async () => {
        try {
            const config = window.SUPABASE_CONFIG || {};
            if (!config.url || !config.anonKey) return false;

            const response = await fetch(`${config.url}/rest/v1/translations?select=key,ru,en`, {
                headers: {
                    'apikey': config.anonKey,
                    'Authorization': `Bearer ${config.anonKey}`
                }
            });

            if (!response.ok) return false;

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return false;

            remoteTranslations = { ru: {}, en: {} };
            data.forEach(row => {
                if (row.key) {
                    remoteTranslations.ru[row.key] = row.ru;
                    remoteTranslations.en[row.key] = row.en;
                }
            });

            console.log('I18n: Загружено', data.length, 'переводов из Supabase');
            return true;
        } catch (error) {
            console.warn('I18n: Не удалось загрузить переводы из Supabase:', error.message);
            return false;
        }
    };

    const init = async () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && translations[saved]) {
            currentLang = saved;
        }
        document.documentElement.lang = currentLang;

        // Переводим страницу сразу тем, что есть в локальных переводах
        translatePage();

        const langBtn = document.querySelector('[data-lang-toggle]');
        if (langBtn && !langBtn.dataset.boundToggle) {
            langBtn.addEventListener('click', (event) => {
                event.preventDefault();
                toggle();
            });
            langBtn.dataset.boundToggle = '1';
        }

        // Пробуем загрузить переводы из Supabase
        await loadFromSupabase();

        // Переводим ещё раз, если приехали удалённые переводы
        translatePage();

        return currentLang;
    };

    const getLang = () => currentLang;

    const setLang = (lang) => {
        if (!translations[lang]) return false;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        return true;
    };

    const t = (key, params = {}) => {
        // Сначала ищем в remote переводах (из Supabase)
        let text = remoteTranslations?.[currentLang]?.[key]
            || remoteTranslations?.[DEFAULT_LANG]?.[key]
            || translations[currentLang]?.[key]
            || translations[DEFAULT_LANG]?.[key]
            || key;

        Object.keys(params).forEach((param) => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    };

    const translatePage = () => {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.dataset.i18n;
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.dataset.i18nTitle;
            document.title = t(key) + ' | ' + t('site.title');
        });

        // Translate meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
            const descKey = `meta.description.${pageName}`;
            const translatedDesc = t(descKey);
            if (translatedDesc !== descKey) {
                metaDesc.setAttribute('content', translatedDesc);
            }
        }

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.dataset.i18nAriaLabel;
            el.setAttribute('aria-label', t(key));
        });

        const langBtn = document.querySelector('[data-lang-toggle]');
        if (langBtn) {
            langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
        }
    };

    const toggle = () => {
        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        setLang(newLang);
        translatePage();
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: newLang } }));
    };

    return {
        init,
        getLang,
        setLang,
        t,
        translatePage,
        toggle
    };
})();
