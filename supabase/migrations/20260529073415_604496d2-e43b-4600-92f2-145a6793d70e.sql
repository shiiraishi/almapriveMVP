
UPDATE public.profiles
SET
  bio = 'Carinhosa, discreta e adoro uma boa conversa antes de tudo. Recebo em ambiente próprio, climatizado e extremamente reservado em uma das regiões mais elegantes de Goiânia.

Sou apaixonada por viagens, gastronomia, vinhos e bons encontros — sempre com tempo de qualidade, sem pressa e com presença real.

Atendimento exclusivo, com hora marcada, foco em conexão verdadeira e respeito mútuo. Todas as minhas fotos e vídeos são reais e atualizados.',
  cover_image = 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1600&q=80',
  main_image = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=900&q=80',
    'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80',
    'https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=900&q=80',
    'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=900&q=80',
    'https://images.unsplash.com/photo-1542596594-649edbc13630?w=900&q=80',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900&q=80',
    'https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=900&q=80',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80'
  ],
  services = ARRAY[
    'Jantares',
    'Massagem tântrica',
    'Eventos sociais',
    'Acompanhante de viagens',
    'Encontros íntimos',
    'Pernoite',
    'Despedida de solteiro'
  ],
  services_not_offered = ARRAY[
    'Práticas pesadas',
    'Fotos sem consentimento',
    'Cancelamentos de última hora'
  ],
  availability = 'Segunda a sábado: 10h às 23h
Domingos: sob agenda
Pernoite mediante reserva antecipada',
  service_location = ARRAY[
    'Local próprio',
    'Hotéis e motéis',
    'Atendimento a domicílio',
    'Festas e eventos'
  ],
  payment_methods = ARRAY[
    'PIX',
    'Dinheiro',
    'Cartão de crédito',
    'Cartão de débito'
  ],
  is_online = true,
  is_verified = true,
  priority_level = 3,
  video_360_url = video_url,
  height_cm = 168,
  weight_kg = 58,
  dress_size = '38',
  eye_color = 'Castanhos',
  hair_color = 'Morena',
  has_silicone = true,
  has_tattoo = false,
  has_piercing = true
WHERE name = 'Isabela Martins';
