
insert into public.profiles
  (name, age, location, bio, services, price_display, price_value, main_image, gallery_images, whatsapp_number, priority_level, is_verified)
values
  ('Isabela Martins', 24, 'Setor Bueno, Goiânia',
   'Carinhosa, discreta e adoro uma boa conversa antes de tudo. Ambiente próprio e climatizado.',
   array['Jantar','Massagem','Eventos'],
   'R$ 500/h', 500,
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
     'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
     'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80'
   ],
   '5562999110011', 3, true),

  ('Camila Rocha', 27, 'Setor Marista, Goiânia',
   'Sofisticada, atenciosa e seletiva. Atendo com hora marcada em local discreto.',
   array['Jantar','Eventos','Viagens'],
   'R$ 600/h', 600,
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
     'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
     'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80'
   ],
   '5562999220022', 3, true),

  ('Letícia Andrade', 23, 'Jardim Goiás, Goiânia',
   'Doce, espontânea e adoro sair para jantar. Local próprio com fácil acesso.',
   array['Jantar','Massagem'],
   'R$ 400/h', 400,
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&q=80',
     'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=800&q=80',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
   ],
   '5562999330033', 2, true),

  ('Bianca Oliveira', 26, 'Setor Oeste, Goiânia',
   'Elegante e divertida. Encontros sem pressa, com muito carinho e respeito.',
   array['Eventos','Viagens','Jantar'],
   'R$ 450/h', 450,
   'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=800&q=80',
     'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=800&q=80',
     'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80'
   ],
   '5562999440044', 2, false),

  ('Mariana Souza', 22, 'Setor Bueno, Goiânia',
   'Jovem, comunicativa e cheia de energia. Adoro conhecer pessoas novas.',
   array['Massagem','Jantar'],
   'R$ 350/h', 350,
   'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=800&q=80',
     'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
     'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=800&q=80'
   ],
   '5562999550055', 2, true),

  ('Rafaela Lima', 29, 'Setor Marista, Goiânia',
   'Madura, calma e muito atenciosa. Para quem busca tempo de qualidade.',
   array['Jantar','Massagem'],
   'R$ 300/h', 300,
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80',
     'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=800&q=80',
     'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80'
   ],
   '5562999660066', 1, false),

  ('Júlia Pereira', 21, 'Jardim Goiás, Goiânia',
   'Tímida no começo, divertida depois. Atendimento com hora marcada.',
   array['Massagem'],
   'R$ 280/h', 280,
   'https://images.unsplash.com/photo-1523307730650-594bc63f9d67?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800&q=80',
     'https://images.unsplash.com/photo-1488207984690-bb5e74a6c8b3?w=800&q=80',
     'https://images.unsplash.com/photo-1502767089025-6572583495b0?w=800&q=80'
   ],
   '5562999770077', 1, false),

  ('Aline Cardoso', 25, 'Setor Oeste, Goiânia',
   'Simpática, espontânea e adoro bons drinks. Local próprio e discreto.',
   array['Jantar','Eventos'],
   'R$ 320/h', 320,
   'https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=800&q=80',
   array[
     'https://images.unsplash.com/photo-1495216875107-c6c043eb703f?w=800&q=80',
     'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?w=800&q=80',
     'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80'
   ],
   '5562999880088', 1, true);
