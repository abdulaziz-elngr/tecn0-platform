import { ContactForm } from "@/components/public/contact-form";

export const metadata = {
  title: "Contact — Tecno Team",
  description: "Get in touch with Abdulaziz El-Nagar.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Contact</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        Let&apos;s build something together.
      </h1>
      <p className="mt-3 max-w-md text-[var(--slate)]">
        Have a project, a role, or an idea involving IoT, software, or AI? Send a message and
        I&apos;ll reply directly.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </main>
  );
}
