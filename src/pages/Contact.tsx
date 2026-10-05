import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Truck, ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle,
  Twitter, Linkedin, Instagram, Facebook, ChevronDown,
} from 'lucide-react';

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

const OFFICES = [
  {
    city: 'New York',
    flag: '🇺🇸',
    address: '350 Fifth Avenue, Suite 4100\nNew York, NY 10118',
    phone: '+1 (212) 555-0188',
    email: 'nyc@cargodhl.com',
    hours: 'Mon–Fri 08:00–18:00 EST',
  },
  {
    city: 'London',
    flag: '🇬🇧',
    address: '30 St Mary Axe (The Gherkin)\nLondon, EC3A 8BF',
    phone: '+44 (20) 7555 0172',
    email: 'london@cargodhl.com',
    hours: 'Mon–Fri 08:00–18:00 GMT',
  },
  {
    city: 'Dubai',
    flag: '🇦🇪',
    address: 'Dubai Airport Free Zone\nBuilding 6W, Gate 5, Dubai',
    phone: '+971 4 555 0133',
    email: 'dubai@cargodhl.com',
    hours: 'Sun–Thu 08:00–17:00 GST',
  },
  {
    city: 'Lagos',
    flag: '🇳🇬',
    address: 'FAAN Complex, MMA2 Terminal\nIkeja, Lagos State',
    phone: '+234 (1) 555 0177',
    email: 'lagos@cargodhl.com',
    hours: 'Mon–Fri 08:00–17:00 WAT',
  },
];

const SUBJECTS = [
  'General Enquiry',
  'Shipment Tracking Support',
  'Customs & Clearance',
  'Charge Dispute',
  'Quote Request',
  'Partnership / Business',
  'Other',
];

type FormState = 'idle' | 'submitting' | 'sent';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<FormState>('idle');

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setState('submitting');
    // Simulate async send
    setTimeout(() => setState('sent'), 1200);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
              <Truck size={17} className="text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              CARGO<span className="text-orange-400"> DHL</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
              <Link to="/track" className="text-white/60 hover:text-white transition-colors">Track</Link>
              <span className="text-orange-400 font-semibold">Contact</span>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors md:hidden">
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        </div>

        {/* Hero banner */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              <Mail size={12} /> Get in touch
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              We're here to help<br />
              <span className="text-orange-400">every step of the way.</span>
            </h1>
            <p className="text-white/60 text-base max-w-lg leading-relaxed">
              Have a question about your shipment, a customs charge, or want a freight quote?
              Our team across four global hubs is ready to respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-14 space-y-16">

        {/* ── Quick contact strip ── */}
        <FadeUp>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Phone,  label: 'Call us',       value: '+1 (212) 555-0188',      sub: 'New York HQ · Mon–Fri 08–18 EST', href: 'tel:+12125550188' },
              { icon: Mail,   label: 'Email us',       value: 'support@cargodhl.com',   sub: 'We reply within 24 hours',        href: 'mailto:support@cargodhl.com' },
              { icon: Clock,  label: '24/7 Tracking',  value: 'Always available',        sub: 'Use the Track page for live updates', href: '/track' },
            ].map(({ icon: Icon, label, value, sub, href }) => (
              <a key={label} href={href}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-100 transition-all flex items-start gap-4">
                <div className="w-11 h-11 bg-orange-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              </a>
            ))}
          </div>
        </FadeUp>

        {/* ── Main grid: form + offices ── */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Contact form */}
          <FadeUp className="lg:col-span-3">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-black text-slate-900 mb-1">Send us a message</h2>
              <p className="text-slate-400 text-sm mb-7">Fill in the form and one of our logistics specialists will get back to you.</p>

              {state === 'sent' ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mb-5">
                    <CheckCircle size={28} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Message sent!</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Thanks, <span className="font-semibold text-slate-700">{form.name}</span>. We'll reply to <span className="font-semibold text-slate-700">{form.email}</span> within 24 hours.
                  </p>
                  <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setState('idle'); }}
                    className="mt-6 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                      <input value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="John Smith"
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="john@company.com"
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
                    <div className="relative">
                      <select value={form.subject} onChange={e => set('subject', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 appearance-none bg-white">
                        <option value="">— Select a subject —</option>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message *</label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)}
                      placeholder="Describe your enquiry, include your tracking number if relevant…"
                      rows={5}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 placeholder-slate-400 resize-none" />
                  </div>

                  <button type="submit" disabled={state === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
                    {state === 'submitting' ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Sending…
                      </>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeUp>

          {/* Office list */}
          <FadeUp delay={0.1} className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-2">Our global offices</h2>
            {OFFICES.map(o => (
              <div key={o.city} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl leading-none">{o.flag}</span>
                  <h3 className="font-bold text-slate-900 text-base">{o.city}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-500">
                    <MapPin size={13} className="text-slate-300 mt-0.5 shrink-0" />
                    <span className="whitespace-pre-line leading-snug">{o.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={13} className="text-slate-300 shrink-0" />
                    <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="text-slate-500 hover:text-orange-500 transition-colors">{o.phone}</a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={13} className="text-slate-300 shrink-0" />
                    <a href={`mailto:${o.email}`} className="text-slate-500 hover:text-orange-500 transition-colors">{o.email}</a>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400 text-xs mt-1 pt-2 border-t border-slate-50">
                    <Clock size={11} className="shrink-0" />
                    {o.hours}
                  </div>
                </div>
              </div>
            ))}
          </FadeUp>
        </div>

        {/* ── FAQ strip ── */}
        <FadeUp>
          <div className="bg-slate-900 rounded-2xl p-8 md:p-10">
            <h2 className="text-xl font-black text-white mb-2">Frequently asked questions</h2>
            <p className="text-white/50 text-sm mb-8">Quick answers before you reach out.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How do I pay a customs or warehousing charge?',
                  a: "We don't collect payments online. Email support@cargodhl.com with your tracking number and our team will send you a secure payment link or bank details.",
                },
                {
                  q: 'My shipment shows "Exception" — what does that mean?',
                  a: 'An exception means a delivery attempt failed or further action is needed. Check your tracking page for the specific reason, then contact us to reschedule.',
                },
                {
                  q: 'How long does customs clearance take?',
                  a: 'Typically 1–3 business days for standard shipments, though it varies by destination country and commodity type. Our team can expedite if needed.',
                },
                {
                  q: 'Can I change the delivery address after shipment?',
                  a: "Address changes are possible before the last-mile stage. An address correction fee may apply. Contact us as soon as possible with your tracking number.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-t border-white/10 pt-5">
                  <h4 className="text-white text-sm font-bold mb-2">{q}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* ── Social / footer strip ── */}
        <FadeUp>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-t border-slate-200">
            <div className="text-sm text-slate-400">
              © 2026 Cargo DHL. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href}
                  className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </FadeUp>

      </div>
    </div>
  );
}
