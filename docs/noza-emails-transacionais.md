# E-mails transacionais da NOZA

Modelos para configurar em **Supabase Dashboard > Authentication > Email Templates**. O serviço de autenticação continua no Supabase, mas o remetente e os textos são da NOZA.

## Confirm signup — Assunto
Confirme seu cadastro na NOZA

```html
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body style="margin:0;background:#0b0c0e;padding:36px 16px;font-family:Arial,sans-serif;color:#f3f3f3">
<table role="presentation" style="max-width:560px;margin:auto;width:100%;background:#17191c;border:1px solid #34363a;border-radius:16px;padding:32px"><tr><td>
<h1 style="font-size:24px;letter-spacing:4px;margin:0 0 32px">NOZA</h1>
<h2 style="font-size:22px;font-weight:500">Confirme seu cadastro</h2>
<p style="color:#c6c7c9;line-height:1.7">Sua conta está quase pronta. Confirme seu e-mail para acessar a NOZA e conhecer a experiência gratuita de 7 dias, conforme as condições do plano.</p>
<p style="margin:32px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 26px;background:#f5f5f5;color:#121315;border-radius:9px;text-decoration:none;font-weight:bold">Confirmar meu e-mail</a></p>
<p style="color:#a3a5a9;font-size:12px;line-height:1.6">Se você não criou uma conta, ignore esta mensagem.</p>
<p style="color:#8e9297;font-size:12px;border-top:1px solid #34363a;padding-top:22px">NOZA · Reuniões inteligentes</p>
</td></tr></table></body></html>
```

## Reset password — Assunto
Recupere seu acesso à NOZA

```html
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body style="margin:0;background:#0b0c0e;padding:36px 16px;font-family:Arial,sans-serif;color:#f3f3f3">
<table role="presentation" style="max-width:560px;margin:auto;width:100%;background:#17191c;border:1px solid #34363a;border-radius:16px;padding:32px"><tr><td>
<h1 style="font-size:24px;letter-spacing:4px;margin:0 0 32px">NOZA</h1>
<h2 style="font-size:22px;font-weight:500">Recupere seu acesso</h2>
<p style="color:#c6c7c9;line-height:1.7">Recebemos uma solicitação para redefinir sua senha. Use o botão abaixo para escolher uma nova senha e voltar à NOZA.</p>
<p style="margin:32px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 26px;background:#f5f5f5;color:#121315;border-radius:9px;text-decoration:none;font-weight:bold">Redefinir minha senha</a></p>
<p style="color:#a3a5a9;font-size:12px;line-height:1.6">Se você não solicitou a recuperação, ignore esta mensagem.</p>
<p style="color:#8e9297;font-size:12px;border-top:1px solid #34363a;padding-top:22px">NOZA · Reuniões inteligentes</p>
</td></tr></table></body></html>
```

## Alteração de e-mail — Assunto
Confirme a alteração do seu e-mail na NOZA

Use o mesmo layout e o link `{{ .ConfirmationURL }}`, com o texto: "Confirme a alteração do seu endereço de e-mail".

## Configuração necessária quando o domínio estiver disponível

1. Escolha um serviço de envio SMTP transacional (ex.: Resend, Brevo ou Amazon SES).
2. Valide o domínio de envio no serviço (SPF/DKIM/DMARC conforme instruções do provedor).
3. Em Supabase > Authentication > SMTP Settings, ative Custom SMTP e informe credenciais **somente no painel**, nunca neste repositório.
4. Configure Sender name: **NOZA** e Sender email: **contato@DOMINIO-DA-NOZA** (substitua pelo domínio real).
5. Cole os modelos acima nos respectivos Email Templates e atualize os assuntos.
6. Em Authentication > URL Configuration, configure o Site URL e os Redirect URLs oficiais (incluindo `https://app.DOMINIO-DA-NOZA/auth/callback` e URLs de pré-produção necessárias).
7. Teste cadastro, confirmação, redefinição de senha, expiração de links, remetente, entregabilidade e URLs.
8. Para ocultar também o domínio técnico dos links de autenticação, configure um domínio personalizado para Auth no Supabase, se disponível no plano contratado. O SMTP sozinho não substitui URLs técnicas.

**Não anunciar a ativação do Free até as regras de 7 dias, limite de reunião e convidados serem aplicadas e testadas no servidor.**
