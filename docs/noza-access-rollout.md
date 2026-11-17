# NOZA — ativação segura de planos

## Pré-requisitos antes de ativar em produção
1. Identificar o projeto Supabase original pela URL configurada na Vercel. A organização Supabase recém-criada e vazia não é o banco de produção.
2. Aplicar a migration `supabase/migrations/20261117_noza_entitlements.sql` no banco original.
3. Localizar o UUID de auth.users correspondente à conta Evox Centro, validar a titularidade e conceder `role='admin'` somente a esse UUID. Não usar o e-mail como segredo ou autorização.
4. Migrar assinaturas pagas existentes somente após validar seu status no Mercado Pago. Usuários antigos sem plano não devem ganhar trial novo automaticamente.
5. Ajustar o webhook de pagamento para atualizar a tabela de entitlements; nunca liberar pagamento por clique no cliente.
6. Habilitar autorização de canais Supabase Realtime por política de acesso no servidor/banco, com limite de participantes e expiração de reunião; proteger também endpoints de IA e gravação.
7. Implementar limite de 30 minutos por sala Free com horário armazenado no servidor e desconexão verificável.
8. Testar login, cadastro, recuperação, Free vencido, compra, cancelamento, múltiplas abas, links compartilhados e acesso administrativo.
9. Só então implantar a barreira de produção. O endpoint `/api/access/status` é apenas o primeiro passo, NÃO protege sozinho o canal Realtime.

## Estado atual
O código de consulta de entitlements e a migration estão preparados, mas ainda dependem da aplicação no banco original. Não bloquear usuários de produção antes de confirmar o UUID do administrador.
