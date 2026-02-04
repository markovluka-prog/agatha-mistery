-- Places
create table if not exists places (
  id bigint primary key,
  name text not null,
  description text,
  lat numeric,
  lng numeric,
  image_url text
);

-- Place Images (multiple images per place)
create table if not exists place_images (
  id bigserial primary key,
  place_id bigint not null references places(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer default 0
);

-- Characters
create table if not exists characters (
  id bigint primary key,
  name text not null,
  short_description text,
  full_bio text,
  image_url text
);

-- Quizzes
create table if not exists quizzes (
  id bigint primary key,
  title text not null,
  description text,
  questions_count integer,
  questions jsonb
);

alter table places enable row level security;
alter table place_images enable row level security;
alter table characters enable row level security;
alter table quizzes enable row level security;

drop policy if exists "public read places" on places;
create policy "public read places" on places
  for select to anon, authenticated using (true);

drop policy if exists "public read place_images" on place_images;
create policy "public read place_images" on place_images
  for select to anon, authenticated using (true);

drop policy if exists "public read characters" on characters;
create policy "public read characters" on characters
  for select to anon, authenticated using (true);

drop policy if exists "public read quizzes" on quizzes;
create policy "public read quizzes" on quizzes
  for select to anon, authenticated using (true);

insert into places (id, name, description, lat, lng, image_url) values
  (1, 'Лондон, Англия', 'Родной город Агаты Мистери. Здесь находится дом семьи Мистери и начинаются многие приключения.', 51.5074, -0.1278, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london.svg'),
  (2, 'Париж, Франция', 'Город любви и загадок, где Агата и Ларри раскрывали тайну исчезнувшей картины в Лувре.', 48.8566, 2.3522, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris.svg'),
  (3, 'Египет, Каир', 'Земля пирамид и фараонов. Агата исследовала древние гробницы и разгадала загадку проклятия.', 30.0444, 31.2357, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/cairo.svg'),
  (4, 'Венеция, Италия', 'Романтический город на воде, где происходила история с похищенной маской на карнавале.', 45.4408, 12.3155, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/venice.svg'),
  (5, 'Токио, Япония', 'Современный мегаполис, где Агата расследовала пропажу древнего самурайского меча.', 35.6762, 139.6503, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/tokyo.svg')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  lat = excluded.lat,
  lng = excluded.lng,
  image_url = excluded.image_url;

-- Place Images (multiple images per place)
delete from place_images;
insert into place_images (place_id, image_url, caption, sort_order) values
  (1, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london.svg', 'Биг-Бен', 1),
  (1, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london-2.svg', 'Тауэрский мост', 2),
  (2, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris.svg', 'Эйфелева башня', 1),
  (2, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris-2.svg', 'Лувр', 2),
  (3, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/cairo.svg', 'Пирамиды Гизы', 1),
  (4, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/venice.svg', 'Гранд-канал', 1),
  (5, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/tokyo.svg', 'Токийская башня', 1);

insert into characters (id, name, short_description, full_bio, image_url) values
  (1, 'Агата Мистери', 'Двенадцатилетняя гениальная сыщица с фотографической памятью.', 'Агата Мистери — двенадцатилетняя девочка с невероятными детективными способностями. Обладает фотографической памятью и острым умом. Мечтает стать лучшим детективом в мире. Всегда берет с собой верного кота Ватсона и своего двоюродного брата Ларри.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/agatha.svg'),
  (2, 'Ларри Мистери', 'Двоюродный брат Агаты, начинающий писатель и её верный помощник.', 'Ларри — четырнадцатилетний двоюродный брат Агаты. Мечтает стать знаменитым писателем детективов. Всегда сопровождает Агату в её расследованиях, записывая все приключения. Иногда попадает в неловкие ситуации, но всегда готов помочь.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/larry.svg'),
  (3, 'Ватсон (кот)', 'Сибирский кот Агаты, её верный спутник во всех приключениях.', 'Ватсон — пушистый сибирский кот с голубыми глазами. Удивительно умён для кота. Часто помогает Агате находить улики. Обожает лакомства и комфорт, но никогда не бросит свою хозяйку в беде.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/watson.svg'),
  (4, 'Мистер Кент', 'Дворецкий семьи Мистери, всегда готов помочь детям.', 'Мистер Кент — верный дворецкий семьи Мистери. Безупречно вежлив и организован. Тайно гордится детективными успехами Агаты и всегда готов поддержать юных сыщиков полезным советом или чашкой горячего чая.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/kent.svg'),
  (5, 'Чандлер Мистери', 'Отец Агаты, владелец детективной школы Eye International.', 'Чандлер Мистери — отец Агаты и владелец престижной детективной школы Eye International. Именно он привил дочери любовь к расследованиям. Поддерживает её стремление стать великим детективом.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/chandler.svg')
on conflict (id) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  full_bio = excluded.full_bio,
  image_url = excluded.image_url;

insert into quizzes (id, title, description, questions_count, questions) values
  (1, 'Насколько хорошо ты знаешь Агату?', 'Проверь свои знания о главной героине серии книг!', 5,
    '[
      {"id":1,"text":"Как должна выглядеть ваша Аватарка?","type":"image","options":[{"id":"a","text":"Агата","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/agatha.svg","isCorrect":false},{"id":"b","text":"Ларри","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/larry.svg","isCorrect":false}]},
      {"id":2,"text":"Какой особенностью обладает Агата?","type":"text","options":[{"id":"a","text":"Фотографическая память","isCorrect":true},{"id":"b","text":"Телепатия","isCorrect":false},{"id":"c","text":"Сверхсила","isCorrect":false},{"id":"d","text":"Невидимость","isCorrect":false}]},
      {"id":3,"text":"Как зовут кота Агаты?","type":"text","options":[{"id":"a","text":"Шерлок","isCorrect":false},{"id":"b","text":"Ватсон","isCorrect":true},{"id":"c","text":"Холмс","isCorrect":false},{"id":"d","text":"Пуаро","isCorrect":false}]},
      {"id":4,"text":"Кем работает отец Агаты?","type":"text","options":[{"id":"a","text":"Полицейский","isCorrect":false},{"id":"b","text":"Владелец детективной школы","isCorrect":true},{"id":"c","text":"Писатель","isCorrect":false},{"id":"d","text":"Учитель","isCorrect":false}]},
      {"id":5,"text":"Кем приходится Ларри Агате?","type":"text","options":[{"id":"a","text":"Брат","isCorrect":false},{"id":"b","text":"Двоюродный брат","isCorrect":true},{"id":"c","text":"Друг","isCorrect":false},{"id":"d","text":"Одноклассник","isCorrect":false}]}
    ]'::jsonb
  ),
  (2, 'Приключения по всему миру', 'Помнишь ли ты все места, где побывала Агата?', 4,
    '[
      {"id":1,"text":"В каком городе находится дом семьи Мистери?","type":"text","options":[{"id":"a","text":"Париж","isCorrect":false},{"id":"b","text":"Лондон","isCorrect":true},{"id":"c","text":"Нью-Йорк","isCorrect":false},{"id":"d","text":"Рим","isCorrect":false}]},
      {"id":2,"text":"Где Агата расследовала тайну исчезнувшей картины?","type":"text","options":[{"id":"a","text":"В Лувре, Париж","isCorrect":true},{"id":"b","text":"В Эрмитаже, Санкт-Петербург","isCorrect":false},{"id":"c","text":"В Британском музее, Лондон","isCorrect":false},{"id":"d","text":"В Прадо, Мадрид","isCorrect":false}]},
      {"id":3,"text":"В какой стране Агата разгадала проклятие фараона?","type":"text","options":[{"id":"a","text":"Греция","isCorrect":false},{"id":"b","text":"Египет","isCorrect":true},{"id":"c","text":"Мексика","isCorrect":false},{"id":"d","text":"Перу","isCorrect":false}]},
      {"id":4,"text":"Где произошла история с похищенной маской на карнавале?","type":"text","options":[{"id":"a","text":"Рио-де-Жанейро","isCorrect":false},{"id":"b","text":"Венеция","isCorrect":true},{"id":"c","text":"Новый Орлеан","isCorrect":false},{"id":"d","text":"Барселона","isCorrect":false}]}
    ]'::jsonb
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  questions_count = excluded.questions_count,
  questions = excluded.questions;
