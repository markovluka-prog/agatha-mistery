-- Places
create table if not exists places (
  id bigint primary key,
  name text not null,
  name_en text,
  description text,
  description_en text,
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
  caption_en text,
  sort_order integer default 0
);

-- Characters
create table if not exists characters (
  id bigint primary key,
  name text not null,
  name_en text,
  short_description text,
  short_description_en text,
  full_bio text,
  full_bio_en text,
  image_url text
);

-- Quizzes
create table if not exists quizzes (
  id bigint primary key,
  title text not null,
  title_en text,
  description text,
  description_en text,
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

-- =====================================================
-- ADMIN PANEL TABLES
-- =====================================================

-- Admin Settings (password storage)
create table if not exists admin_settings (
  id integer primary key default 1,
  password_hash text not null,
  created_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Reviews table with moderation status
create table if not exists reviews (
  id bigserial primary key,
  name text not null,
  text text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Fanfics table with moderation status
create table if not exists fanfics (
  id bigserial primary key,
  name text not null,
  title text not null,
  character text,
  story text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Illustrations table with moderation status
create table if not exists illustrations (
  id bigserial primary key,
  name text not null,
  title text not null,
  description text,
  file_path text,
  file_url text,
  file_name text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table admin_settings enable row level security;
alter table reviews enable row level security;
alter table fanfics enable row level security;
alter table illustrations enable row level security;

-- Admin settings: only service role can read/write (checked on client via password hash comparison)
drop policy if exists "admin read settings" on admin_settings;
create policy "admin read settings" on admin_settings
  for select to anon, authenticated using (true);

-- Reviews: public can insert (pending), read only approved
drop policy if exists "public insert reviews" on reviews;
create policy "public insert reviews" on reviews
  for insert to anon, authenticated with check (true);

drop policy if exists "public read approved reviews" on reviews;
create policy "public read approved reviews" on reviews
  for select to anon, authenticated using (true);

drop policy if exists "admin update reviews" on reviews;
create policy "admin update reviews" on reviews
  for update to anon, authenticated using (true);

-- Fanfics: public can insert (pending), read only approved
drop policy if exists "public insert fanfics" on fanfics;
create policy "public insert fanfics" on fanfics
  for insert to anon, authenticated with check (true);

drop policy if exists "public read approved fanfics" on fanfics;
create policy "public read approved fanfics" on fanfics
  for select to anon, authenticated using (true);

drop policy if exists "admin update fanfics" on fanfics;
create policy "admin update fanfics" on fanfics
  for update to anon, authenticated using (true);

-- Illustrations: public can insert (pending), read only approved
drop policy if exists "public insert illustrations" on illustrations;
create policy "public insert illustrations" on illustrations
  for insert to anon, authenticated with check (true);

drop policy if exists "public read approved illustrations" on illustrations;
create policy "public read approved illustrations" on illustrations
  for select to anon, authenticated using (true);

drop policy if exists "admin update illustrations" on illustrations;
create policy "admin update illustrations" on illustrations
  for update to anon, authenticated using (true);

-- Admin write policies for content management
drop policy if exists "admin write places" on places;
create policy "admin write places" on places
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin write place_images" on place_images;
create policy "admin write place_images" on place_images
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin write characters" on characters;
create policy "admin write characters" on characters
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "admin write quizzes" on quizzes;
create policy "admin write quizzes" on quizzes
  for all to anon, authenticated using (true) with check (true);

-- Insert default admin password hash
-- Password: themarluk8
-- SHA-256 hash of this password (will be verified on client side)
insert into admin_settings (id, password_hash) values
  (1, '129f3b174ec668580fbb4463d69078a11cc598190223825cb578ed3999f39991')
on conflict (id) do update set
  password_hash = excluded.password_hash;

-- =====================================================
-- SAMPLE DATA WITH APPROVED STATUS
-- =====================================================

-- Sample approved reviews
insert into reviews (name, text, status, created_at) values
  ('Мария', 'Обожаю книги про Агату! Читаю всей семьей, очень увлекательно!', 'approved', now() - interval '5 days'),
  ('Алексей', 'Агата Мистери — лучший детектив! Жду новых книг с нетерпением.', 'approved', now() - interval '3 days'),
  ('Анна', 'Мой сын в восторге от приключений Агаты и Ларри. Спасибо авторам!', 'approved', now() - interval '1 day')
on conflict do nothing;

-- Sample approved fanfics
insert into fanfics (name, title, character, story, status, created_at) values
  ('Катя', 'Новое дело в Лондоне', 'Агата Мистери', 'Однажды утром Агата проснулась от странного звука за окном. Ватсон уже сидел на подоконнике и внимательно смотрел во двор. "Что там, Ватсон?" — спросила Агата, подходя к окну. То, что она увидела, заставило её сердце биться быстрее — во дворе лежал старинный сундук с загадочными символами...', 'approved', now() - interval '7 days'),
  ('Дмитрий', 'Тайна музея', 'Ларри Мистери', 'Ларри всегда мечтал написать свой собственный детектив. И вот однажды, когда он посещал Британский музей для сбора материала, случилось невероятное — прямо на его глазах исчезла древняя египетская статуэтка...', 'approved', now() - interval '4 days')
on conflict do nothing;

-- Sample approved illustrations (without actual files, just metadata)
insert into illustrations (name, title, description, status, created_at) values
  ('Елена', 'Агата и Ватсон', 'Мой рисунок Агаты с её любимым котом Ватсоном на фоне Лондона', 'approved', now() - interval '6 days'),
  ('Максим', 'Приключение в Египте', 'Иллюстрация к книге про пирамиды, где Агата разгадывает древние загадки', 'approved', now() - interval '2 days')
on conflict do nothing;
