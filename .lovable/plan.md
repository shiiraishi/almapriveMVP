Módulo "Perfis" no painel administrativo — permite cadastrar, listar e editar anunciantes sem abrir o editor do Supabase. Usa apenas as tabelas existentes (`profiles`, `subscriptions`, `payments`) e roda através de server functions autenticadas por sessão de admin.

## Escolhas padrão (respondendo às perguntas puladas)

- **Escopo:** MVP enxuto primeiro. Upload simples para o Storage (sem crop 1:1 com zoom/arrastar e sem drag-and-drop). Reordenar galeria via botões ↑/↓ e remover. Crop/drag ficam para uma segunda entrega.
- **Bucket:** criar bucket público `profile-images` para fotos (perfil, capa, galeria). Vídeos continuam no bucket `videos` existente.
- **Campo "plan":** não incluir no formulário de perfil. Plano/assinatura continuam sendo geridos no módulo financeiro existente. A tela de perfil apenas **exibe** plano/status/vencimento e **último pagamento**, com botões que levam para o módulo financeiro (`/admin/perfil/$id`, que já existe).

## Estrutura de navegação

- Novo item no header do `/admin` (`src/routes/admin.tsx`): **Perfis** → link para `/admin/perfis`.
- Rotas novas:
  - `/admin/perfis` — lista todos os perfis (tela "Todos os Perfis")
  - `/admin/perfis/novo` — formulário de criação
  - `/admin/perfis/$id/editar` — formulário de edição
- O menu "abrir Perfis → Todos / Novo / Editar" é feito com um pequeno submenu/dropdown no header (Editar leva para a lista, já que "editar qual?" depende da seleção).

## Tela "Todos os Perfis" (`/admin/perfis`)

Tabela responsiva com: miniatura de `main_image`, `name`, `location`, plano atual (via `subscriptions`), status da assinatura, `is_verified`, `is_pioneer`, `is_online`, `created_at`.

Ações por linha: **Editar** (→ `/admin/perfis/$id/editar`), **Visualizar** (→ `/perfil/$id` em nova aba), **Desativar** (toggle `is_suspended`), **Excluir** (confirmação + `DELETE` em `profiles`, cascata já existente em `subscriptions`/`payments` via FKs — se não houver, uso `supabaseAdmin` para apagar dependentes primeiro).

Busca por nome (input) e filtros: plano, status, cidade (`location`), verificado, pioneira. Filtros aplicados no server function.

## Tela "Novo Perfil" / "Editar Perfil"

Formulário único reutilizável cobrindo os campos existentes na tabela `profiles`:

`name, age, location, bio, services[], services_not_offered[], price_display, whatsapp_number, service_location[], payment_methods[], availability, height_cm, weight_kg, dress_size, eye_color, hair_color, has_silicone, has_tattoo, has_piercing, priority_level, manual_position, is_verified, is_pioneer, is_online, main_image, cover_image, gallery_images[], gallery_videos[], video_url`.

Arrays (`services`, `payment_methods`, etc.) editados como tags/chips com input. Booleanos como switches. Números com `type="number"`.

### Uploads (MVP enxuto)

- Componente `<StorageImageUpload>` — input `<input type="file" accept="image/*">`. Ao selecionar, faz upload direto para `profile-images/<profile_id>/<timestamp>-<random>.<ext>` via `supabase.storage` (client browser, com sessão admin não necessária pois o bucket é público para leitura; escrita usa server function que retorna URL assinada de upload OU faz o upload server-side via `supabaseAdmin`). Escolho **upload server-side**: o cliente envia o arquivo como `FormData` para uma server function `uploadProfileAsset` (`assertAdmin` + `supabaseAdmin.storage.from(...).upload`), que retorna a URL pública. Isso mantém a regra "nenhum endpoint público" e evita expor policies do Storage.
- `main_image` e `cover_image`: um único slot cada, com preview e botão "Remover/Trocar". Sem crop nesta entrega — a imagem é salva como enviada; a UI atual do site já lida com object-fit.
- `gallery_images`: múltiplos arquivos, mostra miniaturas, permite remover e reordenar com botões ↑/↓.
- `gallery_videos`: upload para o bucket `videos` já existente, mesma mecânica de lista.
- `video_url`: campo texto livre (para vídeos externos, se usados).

### Painel lateral no "Editar Perfil"

Bloco somente-leitura com:
- **Assinatura:** plano atual, status, próximo vencimento, botão "Abrir Assinatura" → `/admin/perfil/$id` (tela existente).
- **Pagamento:** último pagamento (valor/data/status), botão "Ver Financeiro" → `/admin/perfil/$id`.

## Backend (server functions)

Novo arquivo `src/lib/profiles-admin.functions.ts`, todas com `assertAdmin()`:

- `listAdminProfiles({ q?, plan?, status?, city?, verified?, pioneer? })` — join com `subscriptions` para plano/status atuais.
- `getAdminProfile({ id })` — perfil + assinatura ativa + último pagamento.
- `createAdminProfile(payload)` — insert em `profiles` com validação Zod.
- `updateAdminProfile({ id, patch })` — update parcial.
- `deleteAdminProfile({ id })` — apaga dependentes e o perfil.
- `toggleProfileSuspended({ id, is_suspended })`.
- `uploadProfileAsset({ file, kind: 'image'|'video', profileId? })` — `FormData` input, retorna `{ url, path }`.
- `deleteProfileAsset({ path, bucket })`.

Validação com Zod. Erros voltam como `throw new Error(...)`.

## Banco / Storage

- **Nenhuma nova tabela.** Nenhuma alteração de schema em `profiles`.
- **Nova migration mínima:** garantir cascade de `subscriptions.profile_id` e `payments.profile_id` para permitir excluir perfis (só adiciono se as FKs atuais não tiverem `ON DELETE CASCADE` — verifico antes; se já tiverem, pulo a migration).
- **Storage:** criar bucket público `profile-images` via `supabase--storage_create_bucket`. Sem policies extras necessárias (uploads passam por server function com service role).

## Segurança

- Todas as rotas ficam sob `/admin/*`, já protegidas pelo `beforeLoad` de `src/routes/admin.tsx` (`checkAdminAuth`).
- Server functions chamam `assertAdmin()` antes de qualquer operação.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deixa o servidor; uploads são intermediados por server function.
- Nenhum endpoint público novo.

## Fora de escopo (não altero)

Dashboard, pagamentos, assinaturas, cobranças, parcerias, denúncias, site público, autenticação de modelos.

## Entregáveis (arquivos a criar/editar)

- Criar: `src/lib/profiles-admin.functions.ts`, `src/routes/admin.perfis.index.tsx`, `src/routes/admin.perfis.novo.tsx`, `src/routes/admin.perfis.$id.editar.tsx`, `src/components/admin/ProfileForm.tsx`, `src/components/admin/StorageImageUpload.tsx`, `src/components/admin/StorageVideoUpload.tsx`, `src/components/admin/TagInput.tsx`.
- Editar: `src/routes/admin.tsx` (adicionar link "Perfis" no header).
- Storage: novo bucket `profile-images` (público).
- Migration: só se necessário para cascade de deleção.

## Depois (não nesta entrega)

Crop 1:1 com zoom/arrastar na foto de perfil, ajuste de enquadramento na capa e drag-and-drop na galeria — adicionamos em uma segunda iteração usando `react-easy-crop` + `@dnd-kit/*` se você aprovar.
