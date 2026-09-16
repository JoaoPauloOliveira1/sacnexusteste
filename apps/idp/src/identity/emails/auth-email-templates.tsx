import { type ReactNode } from 'react'
import { Body, Button, Container, Head, Hr, Html, Preview, Text } from 'react-email'

type AuthEmailLayoutProps = {
  children: ReactNode
  preview: string
}

type ActionEmailProps = {
  actionUrl: string
  firstName?: string | undefined
}

export function EmailVerificationEmail(props: ActionEmailProps): ReactNode {
  return (
    <AuthEmailLayout preview="Confirme seu email no SAC Nexus">
      <Text style={headingStyle}>Confirme seu email</Text>
      <Text style={textStyle}>{getGreeting(props.firstName)}</Text>
      <Text style={textStyle}>
        Para concluir seu cadastro no SAC Nexus, confirme que este email pertence a você.
      </Text>
      <Button href={props.actionUrl} style={buttonStyle}>
        Confirmar email
      </Button>
      <Text style={textStyle}>Este link expira em 24 horas.</Text>
      <FallbackUrl url={props.actionUrl} />
      <SecurityNotice />
    </AuthEmailLayout>
  )
}

export function PasswordResetEmail(props: ActionEmailProps): ReactNode {
  return (
    <AuthEmailLayout preview="Redefina sua senha no SAC Nexus">
      <Text style={headingStyle}>Redefina sua senha</Text>
      <Text style={textStyle}>{getGreeting(props.firstName)}</Text>
      <Text style={textStyle}>
        Recebemos uma solicitação para redefinir a senha da sua conta no SAC Nexus.
      </Text>
      <Button href={props.actionUrl} style={buttonStyle}>
        Redefinir senha
      </Button>
      <Text style={textStyle}>Este link expira em 30 minutos.</Text>
      <FallbackUrl url={props.actionUrl} />
      <SecurityNotice />
    </AuthEmailLayout>
  )
}

function AuthEmailLayout(props: AuthEmailLayoutProps): ReactNode {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{props.preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={brandStyle}>SAC Nexus</Text>
          {props.children}
          <Hr style={hrStyle} />
          <Text style={footerStyle}>Mensagem automática. Não responda este email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

function FallbackUrl(props: { url: string }): ReactNode {
  return (
    <Text style={fallbackStyle}>
      Se o botão não funcionar, copie e cole este endereço no navegador: {props.url}
    </Text>
  )
}

function SecurityNotice(): ReactNode {
  return (
    <Text style={footerStyle}>
      Se você não solicitou esta ação, ignore este email. Nenhuma alteração será concluída sem
      acessar o link acima.
    </Text>
  )
}

function getGreeting(firstName: string | undefined): string {
  return firstName ? `Olá, ${firstName}.` : 'Olá.'
}

const bodyStyle = {
  backgroundColor: '#f6f7f9',
  color: '#1f2937',
  fontFamily: 'Arial, sans-serif',
  margin: '0',
}

const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  margin: '32px auto',
  maxWidth: '560px',
  padding: '32px',
}

const brandStyle = {
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
}

const headingStyle = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
}

const textStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
}

const buttonStyle = {
  backgroundColor: '#991b1b',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: '700',
  margin: '24px 0',
  padding: '14px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
}

const fallbackStyle = {
  color: '#4b5563',
  fontSize: '13px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const,
}

const footerStyle = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
}

const hrStyle = {
  borderColor: '#e5e7eb',
  margin: '28px 0 16px',
}
