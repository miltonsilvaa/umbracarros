# WebCarros

Sistema de classificados e e-commerce automotivo: cadastro de anúncios de veículos com
autenticação, upload de imagens e busca em tempo real.

## Stack

- React (Vite) + TypeScript
- Tailwind CSS v4
- React Router DOM v7
- React Hook Form + Zod
- Firebase (Auth, Firestore, Storage)
- React Icons

## Configuração

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative:
   - **Authentication** → provedor de E-mail/Senha
   - **Firestore Database**
   - **Storage**
2. Copie `.env.example` para `.env` e preencha com as credenciais do seu app Firebase (Project
   settings → General → Your apps → SDK setup and configuration):

   ```
   VITE_API_KEY=
   VITE_AUTH_DOMAIN=
   VITE_PROJECT_ID=
   VITE_STORAGE_BUCKET=
   VITE_MESSAGING_SENDER_ID=
   VITE_APP_ID=
   ```

3. Instale as dependências e rode o projeto:

   ```bash
   npm install
   npm run dev
   ```

## Estrutura de dados (Firestore)

Coleção `cars`:

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome completo do anúncio |
| `brand` | string | Marca |
| `model` | string | Modelo |
| `year` | string | Ano modelo/fabricação |
| `km` | string | Quilometragem |
| `price` | number | Preço |
| `city` | string | Cidade |
| `whatsapp` | string | DDD + número, sem símbolos |
| `description` | string | Descrição completa |
| `created` | timestamp | Data de criação (`serverTimestamp`) |
| `ownerId` | string | UID do usuário (Firebase Auth) |
| `ownerName` | string | Nome do anunciante |
| `ownerEmail` | string | E-mail do anunciante |
| `images` | array\<{ name, url }\> | Imagens no Storage, em `images/{ownerId}/{name}` |

## Rotas

- `/` — grid de carros com busca em tempo real por nome/marca/modelo. A busca é **client-side**:
  filtra apenas os carros já carregados na página atual (ver comentário em
  `src/pages/home/index.tsx`), não é uma busca global no catálogo inteiro. Veículos fora da
  paginação carregada só aparecem depois de clicar em "Carregar mais".
- `/car/:id` — detalhes do veículo, carrossel de imagens, CTA para WhatsApp
- `/login`, `/register` — autenticação
- `/dashboard` — anúncios do usuário logado, com exclusão (rota privada)
- `/dashboard/new` — cadastro de novo anúncio com upload drag-and-drop (rota privada)

## Segurança

- As variáveis `VITE_API_KEY`, `VITE_AUTH_DOMAIN` etc. em `.env` vão para o bundle do cliente
  (ficam visíveis em qualquer inspeção do JS publicado) — isso é esperado e **não é um segredo
  vazado**: a API key do Firebase só identifica o projeto, ela não autoriza nada por si só. Quem
  de fato controla o que um cliente pode ler/escrever são as regras em **`firestore.rules`** e
  **`storage.rules`**, que precisam estar publicadas no projeto Firebase (`firebase deploy
  --only firestore:rules,storage:rules`, com o Firebase CLI configurado) antes de ir para
  produção.
- Resumo das regras (ver os arquivos pra leitura completa com comentários):
  - `cars`: leitura pública; criação exige login e `ownerId` igual ao uid autenticado; edição e
    exclusão só pelo dono (`ownerId == auth.uid`).
  - `images/{uid}/{fileName}` (Storage): leitura pública; upload só do próprio uid, limitado a
    `image/*` e 5MB; exclusão só do próprio uid.

### Checklist de verificação manual

Depois de publicar as regras, validar manualmente (não há testes automatizados destas regras):

- [ ] Registrar o **usuário A**, cadastrar um anúncio, confirmar que ele aparece na Home e em
      `/dashboard`.
- [ ] Registrar o **usuário B** (outra conta/aba anônima), confirmar que ele vê o anúncio do
      usuário A na Home, mas **não** vê o botão de excluir dele em `/dashboard` (porque nem
      aparece — `/dashboard` só lista os anúncios do próprio `ownerId`).
- [ ] Abrir o site **sem estar logado** (janela anônima) e confirmar que a Home e `/car/:id`
      carregam normalmente (leitura pública), mas `/dashboard` e `/dashboard/new` redirecionam
      para `/login`.
- [ ] Com o usuário B logado, tentar excluir/editar diretamente pelo console do Firebase (ou via
      chamada manual à SDK) um documento `cars` cujo `ownerId` é do usuário A — a regra deve
      negar (`permission-denied`).
- [ ] Tentar subir um arquivo não-imagem (ex.: `.pdf`) ou maior que 5MB na pasta
      `images/{uid}/` — o Storage deve rejeitar o upload.
- [ ] Tentar escrever na pasta `images/{outroUid}/` logado como um uid diferente — deve ser
      negado.
