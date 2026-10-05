import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Truck, Plane, Warehouse, MapPin, Shield, Clock, Globe, Star,
  Search, Menu, X, Phone, Mail, ArrowRight, CheckCircle, Package,
  Twitter, Linkedin, Instagram, Facebook,
} from 'lucide-react';

/* ── Reusable fade-up wrapper ── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Navbar ── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/98 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
            <Truck size={17} className="text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">CARGO<span className="text-orange-400"> DHL</span></span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-white/70 hover:text-white text-sm font-medium transition-colors">{l.label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/admin/login" className="text-white/50 text-xs font-medium hover:text-white/80 transition-colors">Admin</Link>
          <Link to="/track" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-orange-500/30">
            Track
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-slate-900 border-t border-white/10 px-6 py-4 space-y-1"
          >
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium">
                {l.label}
              </a>
            ))}
            <a href="#hero-track" onClick={() => setOpen(false)}
              className="block mt-2 bg-orange-500 text-white text-sm font-bold py-3 rounded-xl text-center">
              Track Package
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const id = tracking.trim();
    if (!id) return;
    navigate(`/track/${id}`);
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80"
          alt="Cargo port"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-orange-400 bg-orange-400/10 border border-orange-400/25 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Worldwide Express Delivery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.02] tracking-tight"
            >
              Real-time<br />
              <span className="text-orange-400">parcel tracking</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/60 mt-5 text-lg leading-relaxed max-w-lg"
            >
              Fast. Reliable. Trackable. We deliver your parcels safely across the globe. Track your shipment in real time with your unique tracking number.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-5 mt-7"
            >
              {[
                { icon: Shield, label: 'Fully Insured' },
                { icon: Clock, label: '24/7 Support' },
                { icon: Globe, label: '150+ Countries' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-white/50 text-xs font-medium">
                  <Icon size={13} className="text-orange-400" /> {label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <a href="#services" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:scale-105 shadow-xl shadow-orange-500/30">
                Our Services <ArrowRight size={15} className="inline ml-1.5" />
              </a>
              <a href="#about" className="border border-white/25 text-white font-semibold px-8 py-4 rounded-full text-sm hover:bg-white/10 transition-all backdrop-blur-sm">
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Tracking widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div id="hero-track" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
                  <Search size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-none">Track Shipment</h3>
                  <p className="text-white/40 text-xs mt-0.5">Enter your tracking number</p>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-3">
                <input
                  type="text"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="e.g. CDHL-0013-LG"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] text-sm shadow-lg shadow-orange-500/30">
                  <Search size={15} className="inline mr-2" /> Track Package
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-white/35">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  24,891 in transit
                </span>
                <span>Live · every 2 min</span>
              </div>
            </div>

            {/* Floating chips */}
            <div className="flex gap-4 mt-4">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="flex-1 bg-orange-500 text-white rounded-xl p-4 shadow-xl shadow-orange-500/20">
                <div className="text-2xl font-black">99%</div>
                <div className="text-white/70 text-xs mt-1">Success rate</div>
              </motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2.5, ease: 'easeInOut' }}
                className="flex-1 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl p-4">
                <div className="text-2xl font-black text-orange-400">150+</div>
                <div className="text-white/70 text-xs mt-1">Countries</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll nudge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

/* ── Stats ── */
function Stats() {
  const stats = [
    { value: '10k+', label: 'Parcels delivered' },
    { value: '150+', label: 'Countries covered' },
    { value: '24/7', label: 'Live tracking' },
    { value: '99%', label: 'Success rate' },
  ];
  return (
    <section className="bg-slate-900 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="text-4xl md:text-5xl font-black font-mono text-orange-400">{s.value}</div>
              <div className="text-white/45 text-[11px] uppercase tracking-[.2em] mt-2">{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Services ── */
function Services() {
  const services = [
    { icon: Truck, color: 'orange', label: 'Road Freight', desc: 'Fast road delivery across major cities and cross-border routes.', transit: '2–6 days' },
    { icon: Plane, color: 'blue', label: 'Air Freight', desc: 'Express air for urgent, high-value goods with priority handling.', transit: '1–3 days' },
    { icon: Warehouse, color: 'green', label: 'Warehousing', desc: 'Secure bonded storage at major hubs worldwide.', transit: 'Flexible' },
    { icon: MapPin, color: 'purple', label: 'Last Mile', desc: 'Doorstep delivery to any address, tracked to the door.', transit: 'Same day' },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    orange: { bg: 'bg-orange-50 group-hover:bg-orange-500', icon: 'text-orange-500 group-hover:text-white', badge: 'text-orange-600' },
    blue:   { bg: 'bg-blue-50 group-hover:bg-blue-600', icon: 'text-blue-600 group-hover:text-white', badge: 'text-blue-600' },
    green:  { bg: 'bg-green-50 group-hover:bg-green-600', icon: 'text-green-600 group-hover:text-white', badge: 'text-green-600' },
    purple: { bg: 'bg-purple-50 group-hover:bg-purple-600', icon: 'text-purple-600 group-hover:text-white', badge: 'text-purple-600' },
  };

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-orange-500 bg-orange-50 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            What We Offer
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Shipping for <span className="text-orange-500">every need</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto text-[15px]">
            One platform, one tracking number — complete end-to-end visibility from pickup to doorstep.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const c = colorMap[s.color];
            return (
              <FadeUp key={s.label} delay={i * 0.08}>
                <div className="group bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className={`w-13 h-13 ${c.bg} rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 w-[52px] h-[52px]`}>
                    <s.icon size={24} className={`${c.icon} transition-colors duration-300`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-[17px] mb-2">{s.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${c.badge}`}>{s.transit}</span>
                    <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp className="text-center mt-10">
          <a href="#contact" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            View all services <ArrowRight size={15} />
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── About ── */
function About() {
  const values = [
    { icon: CheckCircle, title: 'Reliable delivery', desc: 'Every shipment handled with care and professionalism.' },
    { icon: Search, title: 'Real-time tracking', desc: 'Follow every stage of the journey, live.' },
    { icon: Star, title: 'Customer first', desc: 'Support always available to help, 24/7.' },
  ];
  return (
    <section id="about" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <FadeUp>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80"
                  alt="CargoDHL warehouse"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -bottom-5 -right-4 bg-orange-500 text-white rounded-2xl px-6 py-4 shadow-2xl shadow-orange-500/30"
              >
                <div className="text-3xl font-black">15+</div>
                <div className="text-white/70 text-xs mt-1">Years Experience</div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2.5, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 bg-white text-slate-900 rounded-2xl px-5 py-4 shadow-xl"
              >
                <Package size={22} className="text-orange-500" />
                <div className="text-xs font-bold mt-1.5">ISO 9001</div>
              </motion.div>
            </div>
          </FadeUp>

          {/* Copy */}
          <FadeUp delay={0.15}>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-orange-500 bg-orange-50 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              About Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
              Your trusted<br /><span className="text-orange-500">logistics partner</span>
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-8">
              A modern logistics company built on speed, reliability and transparency — end-to-end delivery with real-time tracking across 150+ countries.
            </p>
            <div className="space-y-5">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
                    <p className="text-slate-400 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ── Gallery ── */
function Gallery() {
  const items = [
    { src: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80', label: 'Ocean Freight', sub: 'Container & LCL' },
    { src: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&q=80', label: 'Air Freight', sub: 'Priority & Economy' },
    { src: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80', label: 'Road Freight', sub: 'Cross-Border' },
    { src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', label: 'Terminals', sub: '9 Bonded Hubs' },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Moving cargo <span className="text-orange-500">worldwide</span>
          </h2>
          <p className="text-slate-400 mt-3 text-sm">Air · Sea · Road · Rail — complete multimodal coverage</p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.label} className="group relative overflow-hidden rounded-2xl cursor-pointer h-52">
                <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-400">{item.label}</div>
                    <div className="text-white font-bold text-sm mt-0.5">{item.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const reviews = [
    { name: 'Sarah K.', role: 'Operations Director, TechFlow Inc.', text: 'CargoDHL handled our entire product launch across 12 countries. Zero customs delays and real-time tracking. Genuinely exceptional.', initials: 'SK', color: 'bg-orange-500' },
    { name: 'Marcus B.', role: 'Logistics Manager, NordRetail', text: "We've moved 3,000+ units with CargoDHL. The warehousing service saved us weeks on our Q4 distribution. Highly recommend.", initials: 'MB', color: 'bg-blue-600' },
    { name: 'Aiko L.', role: 'Supply Chain VP, MediSource', text: 'The customs brokerage team is phenomenal. Our pharmaceutical imports cleared without a single delay. Best-in-class portal.', initials: 'AL', color: 'bg-green-600' },
  ];
  return (
    <section id="testimonials" className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Client Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Trusted by <span className="text-orange-400">thousands</span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <FadeUp key={r.name} delay={i * 0.08}>
              <div className="bg-white/5 border border-white/8 rounded-2xl p-7 hover:border-white/20 transition-colors h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="text-orange-400 fill-orange-400" />)}
                </div>
                <p className="text-white/65 text-sm leading-relaxed flex-1 mb-6">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${r.color} rounded-full flex items-center justify-center text-white font-black text-xs`}>{r.initials}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{r.name}</div>
                    <div className="text-white/35 text-xs">{r.role}</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-orange-600/90" />
      </div>
      <FadeUp className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.02] mb-5">
          Ship worldwide.<br /><span className="text-orange-200">Start today.</span>
        </h2>
        <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
          Get an instant quote in under 60 seconds. No account needed to start.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#hero-track" className="bg-white text-orange-600 font-black px-10 py-5 rounded-full text-base hover:bg-orange-50 transition-all hover:scale-105 shadow-2xl">
            Track a Package
          </a>
          <a href="tel:+18001234567" className="border-2 border-white/40 text-white font-bold px-10 py-5 rounded-full text-base hover:bg-white/10 transition-all backdrop-blur-sm">
            <Phone size={16} className="inline mr-2" /> Call Us
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-14 border-t border-white/15 text-white/55 text-sm">
          {['Secure Payments', 'Money-Back Guarantee', '24/7 Expert Support', 'ISO 9001 Certified'].map(t => (
            <span key={t} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-white/40" /> {t}
            </span>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const hubs = ['New York', 'London', 'Dubai', 'Lagos'];
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span className="font-black text-lg">CARGO<span className="text-orange-400"> DHL</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Fast, reliable and trackable parcel delivery across 150+ countries.
            </p>
            <div className="flex gap-2">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Icon size={14} className="text-white/50" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[.22em] text-white/30 mb-5">Services</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              {['Air Freight', 'Road Freight', 'Warehousing', 'Last Mile', 'Customs Brokerage'].map(s => (
                <li key={s}><a href="#services" className="hover:text-white transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[.22em] text-white/30 mb-5">Global Hubs</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              {hubs.map(h => (
                <li key={h} className="flex items-center gap-2"><MapPin size={12} className="text-orange-400 shrink-0" />{h}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[.22em] text-white/30 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-2.5"><Phone size={13} className="text-orange-400 mt-0.5 shrink-0" />+1 800 123 4567</li>
              <li className="flex items-start gap-2.5"><Mail size={13} className="text-orange-400 mt-0.5 shrink-0" />support@cargodhl.com</li>
              <li className="flex items-start gap-2.5"><MapPin size={13} className="text-orange-400 mt-0.5 shrink-0" />53 Logistics Way, Frankfurt DE</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-7 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <span>© 2026 CargoDHL. All rights reserved.</span>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function Home() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <About />
      <Gallery />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
