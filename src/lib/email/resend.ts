import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  try {
    const isTestMode = process.env.EMAIL_TEST_MODE === 'true'
    const recipient = isTestMode
      ? (process.env.EMAIL_TEST_RECIPIENT || to)
      : to

    if (isTestMode) {
      console.log(`[EMAIL TEST MODE] Redirecting email from ${to} → ${recipient}`)
    }

    const from = isTestMode
      ? 'Pure Peptides <onboarding@resend.dev>'
      : 'Pure Peptides <orders@purepeptides.ae>'

    console.log(`[EMAIL] Sending to=${recipient}, from=${from}, subject="${isTestMode ? `[TEST] ${subject}` : subject}"`)

    const { data, error } = await resend.emails.send({
      from,
      to: recipient,
      subject: isTestMode ? `[TEST] ${subject}` : subject,
      react,
    })

    console.log(`[EMAIL] Resend response:`, { data, error })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send failed:', err)
    return { success: false, error: err }
  }
}
