# Experiência Free — 7 dias (implantação gradual)

A NOZA já possui WebRTC P2P em `app/space/useSpaceRoom.tsx`, com sinalização Supabase Realtime e STUN público. Este PR cria a base persistente da experiência gratuita e a consulta autenticada de elegibilidade, sem alterar os planos pagos nem o layout atual.

## Configuração
1. Executar `supabase/migrations/20261117_free_experience.sql` no projeto Supabase da NOZA.
2. Testar um cadastro novo; chamar `GET /api/free-experience` com a sessão autenticada. Deve retornar `active: true`, `daysRemaining: 7` e `endsAt`.
3. Verificar que login posterior não reinicia os 7 dias; contas antigas não ganham trial retroativo.
4. Antes de disponibilizar ao público, integrar a elegibilidade no servidor que autoriza salas e impor limite de 2 participantes e 30 minutos usando relógio do servidor. O endpoint de consulta sozinho NÃO restringe chamadas.
5. Impedir que usuários Free acessem gravação, transcrição e IA por rotas de API, não apenas ocultando botões.
6. Configurar TURN com credenciais temporárias e testar conexões móveis, NAT e redes corporativas. STUN sozinho não garante conectividade.
7. Definir políticas contra abuso por múltiplos cadastros e regras de migração para assinatura paga.

**Importante:** não liberar a oferta comercial antes de concluir os controles dos passos 4 a 7. O código atual de Space permite conexões P2P autenticadas sem cotas de assinatura, e não deve ser tratado como sistema de trial pronto para produção.
