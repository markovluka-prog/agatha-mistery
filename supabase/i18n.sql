-- Таблица переводов
CREATE TABLE IF NOT EXISTS translations (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  ru TEXT NOT NULL,
  en TEXT NOT NULL
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read translations" ON translations
  FOR SELECT TO anon, authenticated USING (true);

-- UI переводы
INSERT INTO translations (key, ru, en) VALUES
  -- Навигация
  ('nav.home', 'Главная', 'Home'),
  ('nav.map', 'Карта мира', 'World Map'),
  ('nav.quiz', 'Викторины', 'Quizzes'),
  ('nav.characters', 'Персонажи', 'Characters'),
  
  -- Главная страница
  ('hero.title', 'Добро пожаловать в мир Агаты Мистери!', 'Welcome to the world of Agatha Mistery!'),
  ('hero.text', 'Погрузись в захватывающий мир тайн и приключений вместе с Агатой Мистери. У нас ты найдёшь уникальные карты с местами действия историй, интересные викторины, а также подробные биографии персонажей.', 'Dive into the exciting world of mysteries and adventures with Agatha Mistery. Here you will find unique maps with story locations, interesting quizzes, and detailed character biographies.'),
  ('hero.btn.map', 'Исследовать карту', 'Explore the Map'),
  ('hero.btn.quiz', 'Пройти викторину', 'Take a Quiz'),
  
  -- Секции
  ('section.reviews', 'Отзывы фанатов', 'Fan Reviews'),
  ('section.illustrations', 'Иллюстрации фанатов', 'Fan Illustrations'),
  ('section.fanfics', 'Фанфики', 'Fanfics'),
  ('section.locations', 'Локации', 'Locations'),
  ('section.characters', 'Персонажи', 'Characters'),
  ('section.quizzes', 'Викторины', 'Quizzes'),
  ('section.workshop', 'Творческая мастерская', 'Creative Workshop'),
  
  -- Карта
  ('map.title', 'Карта приключений', 'Adventure Map'),
  ('map.subtitle', 'От Лондона до Токио — здесь собраны главные места, где Агата раскрывала загадки.', 'From London to Tokyo — here are the main places where Agatha solved mysteries.'),
  ('map.note', 'Нажми на карточку локации, чтобы приблизить карту.', 'Click on a location card to zoom the map.'),
  ('map.coordinates', 'Координаты', 'Coordinates'),
  
  -- Персонажи
  ('characters.title', 'Персонажи', 'Characters'),
  ('characters.subtitle', 'Познакомься с героями, которые помогают Агате раскрывать самые сложные тайны.', 'Meet the heroes who help Agatha solve the most complex mysteries.'),
  ('characters.more', 'Подробнее', 'Read More'),
  ('characters.back', 'Назад к персонажам', 'Back to Characters'),
  
  -- Викторины
  ('quiz.title', 'Викторины', 'Quizzes'),
  ('quiz.subtitle', 'Проверь свои знания о мире Агаты Мистери!', 'Test your knowledge about the world of Agatha Mistery!'),
  ('quiz.start', 'Начать', 'Start'),
  ('quiz.check', 'Проверить ответы', 'Check Answers'),
  ('quiz.question', 'Вопрос', 'Question'),
  ('quiz.questions', 'Вопросов', 'Questions'),
  ('quiz.result', 'Ваш результат', 'Your Result'),
  ('quiz.answerAll', 'Ответьте на все вопросы, чтобы узнать результат.', 'Answer all questions to see your result.'),
  
  -- Формы
  ('form.name', 'Ваше имя', 'Your Name'),
  ('form.review', 'Ваш отзыв', 'Your Review'),
  ('form.submit', 'Отправить', 'Submit'),
  ('form.title', 'Название', 'Title'),
  ('form.description', 'Описание', 'Description'),
  ('form.character', 'Персонаж', 'Character'),
  ('form.story', 'Ваша история', 'Your Story'),
  ('form.file', 'Файл изображения', 'Image File'),
  ('form.leaveReview', 'Оставить отзыв', 'Leave a Review'),
  
  -- Кнопки
  ('btn.sendIllustration', 'Отправить иллюстрацию', 'Submit Illustration'),
  ('btn.sendFanfic', 'Отправить фанфик', 'Submit Fanfic'),
  ('btn.retry', 'Попробовать снова', 'Try Again'),
  
  -- Сообщения
  ('msg.loading', 'Загрузка...', 'Loading...'),
  ('msg.loadingLocations', 'Загрузка локаций...', 'Loading locations...'),
  ('msg.loadingCharacters', 'Загрузка персонажей...', 'Loading characters...'),
  ('msg.loadingQuizzes', 'Загрузка викторин...', 'Loading quizzes...'),
  ('msg.loadingFanfics', 'Загрузка фанфиков...', 'Loading fanfics...'),
  ('msg.loadingIllustrations', 'Загрузка иллюстраций...', 'Loading illustrations...'),
  ('msg.noImage', 'Нет изображения', 'No Image'),
  ('msg.noFanfics', 'Пока нет фанфиков. Будь первым!', 'No fanfics yet. Be the first!'),
  ('msg.noIllustrations', 'Пока нет иллюстраций. Будь первым!', 'No illustrations yet. Be the first!'),
  ('msg.notFound', 'Не найдено', 'Not Found'),
  ('msg.error', 'Произошла ошибка', 'An error occurred'),
  ('msg.success', 'Спасибо! Ваша работа отправлена.', 'Thank you! Your work has been submitted.'),
  ('msg.connectSupabase', 'Подключите Supabase для просмотра.', 'Connect Supabase to view.'),
  
  -- Футер
  ('footer.copyright', '© 2024 Фанаты Агаты Мистери. Фан-сайт по книгам Стива Стивенсона.', '© 2024 Agatha Mistery Fans. Fan site for Steve Stevenson books.'),
  
  -- Дополнительные ключи для main.js
  ('loading', 'Загрузка...', 'Loading...'),
  ('error.retry', 'Попробовать снова', 'Try Again'),
  ('noimage', 'Нет изображения', 'No Image'),
  ('map.loading', 'Загрузка локаций...', 'Loading locations...'),
  ('map.coords', 'Координаты', 'Coordinates'),
  ('map.error', 'Не удалось загрузить локации', 'Failed to load locations'),
  ('map.sidebar.title', 'Локации', 'Locations'),
  ('characters.loading', 'Загрузка персонажей...', 'Loading characters...'),
  ('characters.btn.details', 'Подробнее', 'Read More'),
  ('characters.error', 'Не удалось загрузить персонажей', 'Failed to load characters'),
  ('quizzes.loading', 'Загрузка викторин...', 'Loading quizzes...'),
  ('quizzes.questions', 'Вопросов', 'Questions'),
  ('quizzes.btn.start', 'Начать', 'Start'),
  ('quizzes.error', 'Не удалось загрузить викторины', 'Failed to load quizzes'),
  ('fanfics.loading', 'Загрузка фанфиков...', 'Loading fanfics...'),
  ('fanfics.empty', 'Пока нет фанфиков. Будь первым!', 'No fanfics yet. Be the first!'),
  ('fanfics.error', 'Не удалось загрузить фанфики', 'Failed to load fanfics'),
  ('illustrations.loading', 'Загрузка иллюстраций...', 'Loading illustrations...'),
  ('illustrations.empty', 'Пока нет иллюстраций. Будь первым!', 'No illustrations yet. Be the first!'),
  ('illustrations.error', 'Не удалось загрузить иллюстрации', 'Failed to load illustrations')
ON CONFLICT (key) DO UPDATE SET ru = EXCLUDED.ru, en = EXCLUDED.en;

-- Добавляем английские версии для places
ALTER TABLE places ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS description_en TEXT;

UPDATE places SET 
  name_en = 'London, England',
  description_en = 'Agatha Mistery''s hometown. The Mistery family home is here and many adventures begin.'
WHERE id = 1;

UPDATE places SET 
  name_en = 'Paris, France',
  description_en = 'The city of love and mysteries, where Agatha and Larry solved the mystery of the missing painting at the Louvre.'
WHERE id = 2;

UPDATE places SET 
  name_en = 'Cairo, Egypt',
  description_en = 'Land of pyramids and pharaohs. Agatha explored ancient tombs and solved the curse mystery.'
WHERE id = 3;

UPDATE places SET 
  name_en = 'Venice, Italy',
  description_en = 'A romantic city on the water, where the story of the stolen carnival mask took place.'
WHERE id = 4;

UPDATE places SET 
  name_en = 'Tokyo, Japan',
  description_en = 'A modern metropolis where Agatha investigated the disappearance of an ancient samurai sword.'
WHERE id = 5;

-- Добавляем английские версии для characters
ALTER TABLE characters ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS short_description_en TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS full_bio_en TEXT;

UPDATE characters SET
  name_en = 'Agatha Mistery',
  short_description_en = 'A twelve-year-old genius detective with photographic memory.',
  full_bio_en = 'Agatha Mistery is a twelve-year-old girl with incredible detective abilities. She has a photographic memory and sharp mind. She dreams of becoming the best detective in the world. She always takes her faithful cat Watson and her cousin Larry with her.'
WHERE id = 1;

UPDATE characters SET
  name_en = 'Larry Mistery',
  short_description_en = 'Agatha''s cousin, an aspiring writer and her faithful helper.',
  full_bio_en = 'Larry is Agatha''s fourteen-year-old cousin. He dreams of becoming a famous detective novelist. He always accompanies Agatha in her investigations, recording all adventures. Sometimes he gets into awkward situations, but is always ready to help.'
WHERE id = 2;

UPDATE characters SET
  name_en = 'Watson (the cat)',
  short_description_en = 'Agatha''s Siberian cat, her faithful companion in all adventures.',
  full_bio_en = 'Watson is a fluffy Siberian cat with blue eyes. Remarkably smart for a cat. He often helps Agatha find clues. He loves treats and comfort, but never abandons his owner in trouble.'
WHERE id = 3;

UPDATE characters SET
  name_en = 'Mr. Kent',
  short_description_en = 'The Mistery family butler, always ready to help the children.',
  full_bio_en = 'Mr. Kent is the faithful butler of the Mistery family. Impeccably polite and organized. Secretly proud of Agatha''s detective successes and always ready to support young detectives with helpful advice or a cup of hot tea.'
WHERE id = 4;

UPDATE characters SET
  name_en = 'Chandler Mistery',
  short_description_en = 'Agatha''s father, owner of the Eye International detective school.',
  full_bio_en = 'Chandler Mistery is Agatha''s father and owner of the prestigious Eye International detective school. He instilled in his daughter the love of investigations. He supports her aspiration to become a great detective.'
WHERE id = 5;

-- Добавляем английские версии для quizzes
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS questions_en JSONB;

UPDATE quizzes SET
  title_en = 'How Well Do You Know Agatha?',
  description_en = 'Test your knowledge about the main character of the book series!',
  questions_en = '[
    {"id":1,"text":"What should your Avatar look like?","type":"image","options":[{"id":"a","text":"Agatha","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/agatha.svg","isCorrect":false},{"id":"b","text":"Larry","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/larry.svg","isCorrect":false}]},
    {"id":2,"text":"What special ability does Agatha have?","type":"text","options":[{"id":"a","text":"Photographic memory","isCorrect":true},{"id":"b","text":"Telepathy","isCorrect":false},{"id":"c","text":"Super strength","isCorrect":false},{"id":"d","text":"Invisibility","isCorrect":false}]},
    {"id":3,"text":"What is Agatha''s cat''s name?","type":"text","options":[{"id":"a","text":"Sherlock","isCorrect":false},{"id":"b","text":"Watson","isCorrect":true},{"id":"c","text":"Holmes","isCorrect":false},{"id":"d","text":"Poirot","isCorrect":false}]},
    {"id":4,"text":"What does Agatha''s father do?","type":"text","options":[{"id":"a","text":"Policeman","isCorrect":false},{"id":"b","text":"Detective school owner","isCorrect":true},{"id":"c","text":"Writer","isCorrect":false},{"id":"d","text":"Teacher","isCorrect":false}]},
    {"id":5,"text":"How is Larry related to Agatha?","type":"text","options":[{"id":"a","text":"Brother","isCorrect":false},{"id":"b","text":"Cousin","isCorrect":true},{"id":"c","text":"Friend","isCorrect":false},{"id":"d","text":"Classmate","isCorrect":false}]}
  ]'::jsonb
WHERE id = 1;

UPDATE quizzes SET
  title_en = 'Adventures Around the World',
  description_en = 'Do you remember all the places Agatha visited?',
  questions_en = '[
    {"id":1,"text":"In which city is the Mistery family home?","type":"text","options":[{"id":"a","text":"Paris","isCorrect":false},{"id":"b","text":"London","isCorrect":true},{"id":"c","text":"New York","isCorrect":false},{"id":"d","text":"Rome","isCorrect":false}]},
    {"id":2,"text":"Where did Agatha investigate the mystery of the missing painting?","type":"text","options":[{"id":"a","text":"At the Louvre, Paris","isCorrect":true},{"id":"b","text":"At the Hermitage, St. Petersburg","isCorrect":false},{"id":"c","text":"At the British Museum, London","isCorrect":false},{"id":"d","text":"At the Prado, Madrid","isCorrect":false}]},
    {"id":3,"text":"In which country did Agatha solve the pharaoh''s curse?","type":"text","options":[{"id":"a","text":"Greece","isCorrect":false},{"id":"b","text":"Egypt","isCorrect":true},{"id":"c","text":"Mexico","isCorrect":false},{"id":"d","text":"Peru","isCorrect":false}]},
    {"id":4,"text":"Where did the stolen carnival mask story take place?","type":"text","options":[{"id":"a","text":"Rio de Janeiro","isCorrect":false},{"id":"b","text":"Venice","isCorrect":true},{"id":"c","text":"New Orleans","isCorrect":false},{"id":"d","text":"Barcelona","isCorrect":false}]}
  ]'::jsonb
WHERE id = 2;
