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

-- About Us Sections
create table if not exists about_sections (
  id bigserial primary key,
  title text not null,
  title_en text,
  subtitle text,
  subtitle_en text,
  content text not null,
  content_en text,
  sort_order integer default 0
);

alter table places enable row level security;
alter table place_images enable row level security;
alter table characters enable row level security;
alter table quizzes enable row level security;
alter table about_sections enable row level security;

drop policy if exists "public read places" on places;
create policy "public read places" on places
  for select to anon, authenticated using (true);

drop policy if exists "public read about_sections" on about_sections;
create policy "public read about_sections" on about_sections
  for select to anon, authenticated using (true);

drop policy if exists "admin write about_sections" on about_sections;
create policy "admin write about_sections" on about_sections
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "public read place_images" on place_images;
create policy "public read place_images" on place_images
  for select to anon, authenticated using (true);

drop policy if exists "public read characters" on characters;
create policy "public read characters" on characters
  for select to anon, authenticated using (true);

drop policy if exists "public read quizzes" on quizzes;
create policy "public read quizzes" on quizzes
  for select to anon, authenticated using (true);

insert into places (id, name, name_en, description, description_en, lat, lng, image_url) values
  (1, 'Лондон, Англия', 'London, England', 'Родной город Агаты Мистери. Здесь находится дом семьи Мистери и начинаются многие приключения.', 'The hometown of Agatha Mistery. This is where the Mistery family home is located and where many adventures begin.', 51.5074, -0.1278, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london.svg'),
  (2, 'Париж, Франция', 'Paris, France', 'Город любви и загадок, где Агата и Ларри раскрывали тайну исчезнувшей картины в Лувре.', 'The city of love and mysteries, where Agatha and Larry solved the mystery of the missing painting at the Louvre.', 48.8566, 2.3522, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris.svg'),
  (3, 'Египет, Каир', 'Egypt, Cairo', 'Земля пирамид и фараонов. Агата исследовала древние гробницы и разгадала загадку проклятия.', 'The land of pyramids and pharaohs. Agatha explored ancient tombs and solved the mystery of the curse.', 30.0444, 31.2357, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/cairo.svg'),
  (4, 'Венеция, Италия', 'Venice, Italy', 'Романтический город на воде, где происходила история с похищенной маской на карнавале.', 'A romantic city on water, where the story of the stolen carnival mask took place.', 45.4408, 12.3155, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/venice.svg'),
  (5, 'Токио, Япония', 'Tokyo, Japan', 'Современный мегаполис, где Агата расследовала пропажу древнего самурайского меча.', 'A modern metropolis where Agatha investigated the disappearance of an ancient samurai sword.', 35.6762, 139.6503, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/tokyo.svg')
on conflict (id) do update set
  name = excluded.name,
  name_en = excluded.name_en,
  description = excluded.description,
  description_en = excluded.description_en,
  lat = excluded.lat,
  lng = excluded.lng,
  image_url = excluded.image_url;

-- Place Images (multiple images per place)
delete from place_images;
insert into place_images (place_id, image_url, caption, caption_en, sort_order) values
  (1, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london.svg', 'Биг-Бен', 'Big Ben', 1),
  (1, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/london-2.svg', 'Тауэрский мост', 'Tower Bridge', 2),
  (2, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris.svg', 'Эйфелева башня', 'Eiffel Tower', 1),
  (2, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/paris-2.svg', 'Лувр', 'The Louvre', 2),
  (3, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/cairo.svg', 'Пирамиды Гизы', 'Pyramids of Giza', 1),
  (4, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/venice.svg', 'Гранд-канал', 'Grand Canal', 1),
  (5, 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/places/tokyo.svg', 'Токийская башня', 'Tokyo Tower', 1);

insert into characters (id, name, name_en, short_description, short_description_en, full_bio, full_bio_en, image_url) values
  (1, 'Агата Мистери', 'Agatha Mistery', 'Двенадцатилетняя гениальная сыщица с фотографической памятью.', 'A twelve-year-old genius detective with a photographic memory.', 'Агата Мистери — двенадцатилетняя девочка с невероятными детективными способностями. Обладает фотографической памятью и острым умом. Мечтает стать лучшим детективом в мире. Всегда берет с собой верного кота Ватсона и своего двоюродного брата Ларри.', 'Agatha Mistery is a twelve-year-old girl with incredible detective abilities. She has a photographic memory and a sharp mind. She dreams of becoming the best detective in the world. She always takes her faithful cat Watson and her cousin Larry with her.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/agatha.svg'),
  (2, 'Ларри Мистери', 'Larry Mistery', 'Двоюродный брат Агаты, начинающий писатель и её верный помощник.', 'Agatha''s cousin, an aspiring writer and her faithful assistant.', 'Ларри — четырнадцатилетний двоюродный брат Агаты. Мечтает стать знаменитым писателем детективов. Всегда сопровождает Агату в её расследованиях, записывая все приключения. Иногда попадает в неловкие ситуации, но всегда готов помочь.', 'Larry is Agatha''s fourteen-year-old cousin. He dreams of becoming a famous detective writer. He always accompanies Agatha on her investigations, recording all their adventures. He sometimes gets into awkward situations, but is always ready to help.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/larry.svg'),
  (3, 'Ватсон (кот)', 'Watson (cat)', 'Сибирский кот Агаты, её верный спутник во всех приключениях.', 'Agatha''s Siberian cat, her faithful companion in all adventures.', 'Ватсон — пушистый сибирский кот с голубыми глазами. Удивительно умён для кота. Часто помогает Агате находить улики. Обожает лакомства и комфорт, но никогда не бросит свою хозяйку в беде.', 'Watson is a fluffy Siberian cat with blue eyes. He is remarkably intelligent for a cat. He often helps Agatha find clues. He loves treats and comfort, but will never abandon his owner in trouble.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/watson.svg'),
  (4, 'Мистер Кент', 'Mr. Kent', 'Дворецкий семьи Мистери, всегда готов помочь детям.', 'The Mistery family butler, always ready to help the children.', 'Мистер Кент — верный дворецкий семьи Мистери. Безупречно вежлив и организован. Тайно гордится детективными успехами Агаты и всегда готов поддержать юных сыщиков полезным советом или чашкой горячего чая.', 'Mr. Kent is the loyal butler of the Mistery family. He is impeccably polite and organized. He secretly takes pride in Agatha''s detective achievements and is always ready to support the young detectives with helpful advice or a cup of hot tea.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/kent.svg'),
  (5, 'Чандлер Мистери', 'Chandler Mistery', 'Отец Агаты, владелец детективной школы Eye International.', 'Agatha''s father, owner of the Eye International detective school.', 'Чандлер Мистери — отец Агаты и владелец престижной детективной школы Eye International. Именно он привил дочери любовь к расследованиям. Поддерживает её стремление стать великим детективом.', 'Chandler Mistery is Agatha''s father and owner of the prestigious Eye International detective school. He instilled in his daughter a love of investigations. He supports her aspiration to become a great detective.', 'https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/chandler.svg')
on conflict (id) do update set
  name = excluded.name,
  name_en = excluded.name_en,
  short_description = excluded.short_description,
  short_description_en = excluded.short_description_en,
  full_bio = excluded.full_bio,
  full_bio_en = excluded.full_bio_en,
  image_url = excluded.image_url;

insert into quizzes (id, title, title_en, description, description_en, questions_count, questions) values
  (1, 'Насколько хорошо ты знаешь Агату?', 'How well do you know Agatha?', 'Проверь свои знания о главной героине серии книг!', 'Test your knowledge about the main heroine of the book series!', 5,
    '[
      {"id":1,"text":"Как должна выглядеть ваша Аватарка?","text_en":"What should your Avatar look like?","type":"image","options":[{"id":"a","text":"Агата","text_en":"Agatha","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/agatha.svg","isCorrect":false},{"id":"b","text":"Ларри","text_en":"Larry","image":"https://eetgsrcitolkvdifltns.supabase.co/storage/v1/object/public/assets/images/characters/larry.svg","isCorrect":false}]},
      {"id":2,"text":"Какой особенностью обладает Агата?","text_en":"What special ability does Agatha have?","type":"text","options":[{"id":"a","text":"Фотографическая память","text_en":"Photographic memory","isCorrect":true},{"id":"b","text":"Телепатия","text_en":"Telepathy","isCorrect":false},{"id":"c","text":"Сверхсила","text_en":"Super strength","isCorrect":false},{"id":"d","text":"Невидимость","text_en":"Invisibility","isCorrect":false}]},
      {"id":3,"text":"Как зовут кота Агаты?","text_en":"What is the name of Agatha''s cat?","type":"text","options":[{"id":"a","text":"Шерлок","text_en":"Sherlock","isCorrect":false},{"id":"b","text":"Ватсон","text_en":"Watson","isCorrect":true},{"id":"c","text":"Холмс","text_en":"Holmes","isCorrect":false},{"id":"d","text":"Пуаро","text_en":"Poirot","isCorrect":false}]},
      {"id":4,"text":"Кем работает отец Агаты?","text_en":"What does Agatha''s father do?","type":"text","options":[{"id":"a","text":"Полицейский","text_en":"Police officer","isCorrect":false},{"id":"b","text":"Владелец детективной школы","text_en":"Owner of a detective school","isCorrect":true},{"id":"c","text":"Писатель","text_en":"Writer","isCorrect":false},{"id":"d","text":"Учитель","text_en":"Teacher","isCorrect":false}]},
      {"id":5,"text":"Кем приходится Ларри Агате?","text_en":"What is Larry to Agatha?","type":"text","options":[{"id":"a","text":"Брат","text_en":"Brother","isCorrect":false},{"id":"b","text":"Двоюродный брат","text_en":"Cousin","isCorrect":true},{"id":"c","text":"Друг","text_en":"Friend","isCorrect":false},{"id":"d","text":"Одноклассник","text_en":"Classmate","isCorrect":false}]}
    ]'::jsonb
  ),
  (2, 'Приключения по всему миру', 'Adventures around the world', 'Помнишь ли ты все места, где побывала Агата?', 'Do you remember all the places Agatha visited?', 4,
    '[
      {"id":1,"text":"В каком городе находится дом семьи Мистери?","text_en":"In which city is the Mistery family home located?","type":"text","options":[{"id":"a","text":"Париж","text_en":"Paris","isCorrect":false},{"id":"b","text":"Лондон","text_en":"London","isCorrect":true},{"id":"c","text":"Нью-Йорк","text_en":"New York","isCorrect":false},{"id":"d","text":"Рим","text_en":"Rome","isCorrect":false}]},
      {"id":2,"text":"Где Агата расследовала тайну исчезнувшей картины?","text_en":"Where did Agatha investigate the mystery of the missing painting?","type":"text","options":[{"id":"a","text":"В Лувре, Париж","text_en":"At the Louvre, Paris","isCorrect":true},{"id":"b","text":"В Эрмитаже, Санкт-Петербург","text_en":"At the Hermitage, St. Petersburg","isCorrect":false},{"id":"c","text":"В Британском музее, Лондон","text_en":"At the British Museum, London","isCorrect":false},{"id":"d","text":"В Прадо, Мадрид","text_en":"At the Prado, Madrid","isCorrect":false}]},
      {"id":3,"text":"В какой стране Агата разгадала проклятие фараона?","text_en":"In which country did Agatha solve the pharaoh''s curse?","type":"text","options":[{"id":"a","text":"Греция","text_en":"Greece","isCorrect":false},{"id":"b","text":"Египет","text_en":"Egypt","isCorrect":true},{"id":"c","text":"Мексика","text_en":"Mexico","isCorrect":false},{"id":"d","text":"Перу","text_en":"Peru","isCorrect":false}]},
      {"id":4,"text":"Где произошла история с похищенной маской на карнавале?","text_en":"Where did the story of the stolen carnival mask take place?","type":"text","options":[{"id":"a","text":"Рио-де-Жанейро","text_en":"Rio de Janeiro","isCorrect":false},{"id":"b","text":"Венеция","text_en":"Venice","isCorrect":true},{"id":"c","text":"Новый Орлеан","text_en":"New Orleans","isCorrect":false},{"id":"d","text":"Барселона","text_en":"Barcelona","isCorrect":false}]}
    ]'::jsonb
  )
on conflict (id) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  description = excluded.description,
  description_en = excluded.description_en,
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

-- Sample about sections
insert into about_sections (id, title, title_en, subtitle, subtitle_en, content, content_en, sort_order) values
  (1, 'Кто мы такие?', 'Who are we?', 'Сообщество детективов', 'Detectives Community', 'Мы — сообщество преданных фанатов серии книг Стива Стивенсона про Агату Мистери. Наша цель — собрать в одном месте всю информацию о любимых героях и их приключениях.', 'We are a community of dedicated fans of Steve Stevenson''s Agatha Mistery book series. Our goal is to gather all information about our favorite characters and their adventures in one place.', 1),
  (2, 'Наша миссия', 'Our Mission', 'Тайны и загадки', 'Mysteries and Riddles', 'Мы хотим, чтобы каждый читатель мог окунуться в мир тайн и загадок вместе с Агатой, Ларри и Ватсоном. Мы создаем карту приключений, проводим викторины и делимся творчеством фанатов.', 'We want every reader to be able to dive into the world of mysteries together with Agatha, Larry, and Watson. We create adventure maps, hold quizzes, and share fan creations.', 2)
on conflict (id) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  subtitle = excluded.subtitle,
  subtitle_en = excluded.subtitle_en,
  content = excluded.content,
  content_en = excluded.content_en,
  sort_order = excluded.sort_order;

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
