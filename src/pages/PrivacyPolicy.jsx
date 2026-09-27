import { PageHeader, Card } from '../components/ui'
import { Icon } from '../components/icons'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <PageHeader
        title="Privacy Policy & Data Security"
        subtitle="Last Updated: September 2026 • Effective for all Gym Manager users"
        breadcrumb="Legal"
        icon="shield"
      />

      <Card className="p-8 space-y-8 text-foreground leading-relaxed text-sm border-border bg-surface shadow-card">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            1. Commitment to Data Privacy
          </h2>
          <p className="text-xs text-muted-foreground leading-6">
            At <strong>Gym Manager</strong>, your privacy and the security of your gym business data are our highest priorities. This Privacy Policy details how we collect, process, encrypt, and protect the information of gym owners and their registered gym members. We adhere strictly to data protection principles and never monetize, sell, or rent your gym&apos;s data.
          </p>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            2. Information We Collect
          </h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-6">
            <p><strong>A. Gym Owner Account Data:</strong> Full name, verified email address, hashed passwords (salted via bcrypt), gym name, business contact details, location, and GSTIN/PAN for official invoice generation.</p>
            <p><strong>B. Member Records:</strong> Full name, phone number, email (optional), age, gender, assigned membership package, validity dates, payment records, and optional profile photos.</p>
            <p><strong>C. Invoicing & Billing Snapshots:</strong> Immutable JSON snapshots stored in our secure database (~1KB footprint) containing historical receipt details.</p>
          </div>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            3. Zero Cloudinary Financial Storage Guarantee
          </h2>
          <p className="text-xs text-muted-foreground leading-6">
            Unlike legacy software that uploads members&apos; financial PDFs to public third-party storage, <strong>Gym Manager utilizes dynamic on-the-fly binary PDF generation</strong>. All invoice documents are generated dynamically in-memory when requested and streamed securely. Financial documents are never permanently stored as unencrypted files on third-party cloud hosting.
          </p>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            4. WhatsApp Multi-Device Gateway Security
          </h2>
          <p className="text-xs text-muted-foreground leading-6">
            When you link your gym phone via the WhatsApp Multi-Device QR Gateway, cryptographic session keys are stored strictly within your isolated server directory. Communication between your gym WhatsApp and your members utilizes WhatsApp&apos;s official end-to-end encryption protocols. Gym Manager never intercepts or stores private chat messages unrelated to official gym receipts.
          </p>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            5. Data Protection & Encryption
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground leading-6">
            <li><strong>Transport Security:</strong> All data in transit is encrypted using TLS 1.3 / HTTPS.</li>
            <li><strong>Authentication Tokens:</strong> Stateless JSON Web Tokens (JWT) signed with high-entropy cryptographic keys and strict expiration.</li>
            <li><strong>Brute-Force & Rate Limiting:</strong> Redis-backed distributed rate limiters prevent unauthorized password guessing or endpoint abuse.</li>
            <li><strong>Password Hashing:</strong> Passwords are never stored in plain text; they are one-way hashed using industry-standard bcrypt algorithms.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            6. Gym Owner Rights & Data Deletion
          </h2>
          <p className="text-xs text-muted-foreground leading-6">
            You retain 100% ownership of your gym data. At any time, you can export your members and payments to CSV format. Upon account closure, all member records, authentication tokens, and session keys are permanently purged from active production databases in accordance with regulatory requirements.
          </p>
        </section>

        <section className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-bold text-foreground">
            7. Contact Data Protection Officer
          </h2>
          <p className="text-xs text-muted-foreground leading-6">
            For privacy inquiries, audit requests, or data deletion requests, contact our privacy team at: <span className="font-mono text-foreground font-semibold">developer.greeetech@gmail.com</span>.
          </p>
        </section>
      </Card>
    </div>
  )
}
