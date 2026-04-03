import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Heart, Music, Sparkles,
  ChevronDown, Volume2, VolumeX, PartyPopper, Wine, Disc3
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';


/* ─────── Festive Icon Component ─────── */
const FestiveIconButton = ({ icon: Icon, label, color, delay }: { icon: any; label: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', delay }}
    whileHover={{ scale: 1.2, rotate: -8 }}
    whileTap={{ scale: 0.9 }}
    className="festive-icon glass"
    title={label}
  >
    <Icon color={color} size={32} />
  </motion.div>
);

/* ─────── Countdown Component ─────── */
const CountdownTimer = ({ targetDate }: { targetDate: number }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const labels: Record<string, string> = { days: 'يوم', hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية' };

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    if (diff <= 0) return null;
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="countdown-grid">
      {Object.entries(timeLeft).map(([unit, val], i) => (
        <motion.div
          key={unit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * .1 }}
          className="countdown-item glass"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={val}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="countdown-num"
            >
              {val}
            </motion.span>
          </AnimatePresence>
          <span className="countdown-label">{labels[unit]}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ─────── Main App ─────── */
const App = () => {
  const targetDate = new Date('2026-04-09T20:00:00').getTime();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  // Sync audio element with isPlaying state
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.play().catch(() => {
        // If system blocks it, we might need to set isPlaying back to false 
        // OR just leave it as true so it starts on next interaction
      });
    } else {
      a.pause();
    }
  }, [isPlaying]);

  // Global first-interaction listener to handle autoplay block
  useEffect(() => {
    const handleFirstInteraction = () => {
      // If we are in "playing" state but the audio is actually paused (blocked by browser),
      // this interaction will finally allow it to play.
      if (isPlaying && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isPlaying]);

  const toggleMusic = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(prev => !prev);
  };

  const boom = () => {
    const end = Date.now() + 2500; // Shorter duration
    (function f() {
      // Fewer particles per frame for better performance
      if (Date.now() < end) requestAnimationFrame(f);
    })();
  };

  const handleOpen = () => {
    setIsPlaying(true);
    setShowSplash(false);
    // Delay confetti slightly for better visual impact relative to fade-out
    setTimeout(boom, 400);

    // If a hash exists (e.g., #map), scroll to it after splash is gone
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 800); // After splash fade-out
    }
  };

  useEffect(() => {
    if (showSplash) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [showSplash]);


  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              className="splash-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="splash-card">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <Sparkles size={60} color="#d4af37" style={{ margin: '0 auto' }} />
                </motion.div>

                <h2 style={{ fontSize: '1.5rem', color: '#f3d498', fontFamily: 'Amiri', marginBottom: '2rem' }}>
                  بسم الله الرحمٰن الرحيم
                </h2>

                <h1 className="gold-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', lineHeight: 1.2 }}>
                  دعوة زفاف<br/>المهندس محمود
                </h1>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpen}
                  className="btn-open"
                >
                  فتح الدعوة ✨
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles */}
      <div className="particles-bg" />

      {/* Audio */}
      <audio ref={audioRef} loop src="/song.mp3" preload="auto" />

      {/* Music toggle */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        onClick={toggleMusic}
        className={`music-toggle glass ${isPlaying ? 'playing' : ''}`}
        aria-label="Toggle music"
      >
        {isPlaying ? <Volume2 color="#d4af37" size={20}/> : <VolumeX color="#556" size={20}/>}
      </motion.button>

      {/* ═══════ HERO ═══════ */}
      <section className="hero">
        <motion.div style={{ y: heroParallax }} className="hero-overlay"/>
        <img src="/1.jpeg" alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'top',zIndex:0}}/>
        <div className="hero-overlay" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4 }}
          className="hero-content"
        >
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }}>
            <Sparkles size={40} color="#d4af37" style={{ margin: '0 auto 1.5rem' }} />
          </motion.div>

          <h4 style={{ fontSize: '1rem', letterSpacing: '.6em', color: '#f3d498', fontFamily: 'Amiri', marginBottom: '1rem' }}>
            دعوة لحضور حفل زفاف
          </h4>

          <h1 className="gold-text" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            المهندس محمود
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 40, height: 1, background: '#d4af37' }} />
            <Heart size={18} color="#d4af37" />
            <span style={{ width: 40, height: 1, background: '#d4af37' }} />
          </div>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.6rem)', color: '#c8cfe0', fontFamily: 'Amiri', fontStyle: 'italic', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 2 }}>
            "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا"
          </p>

          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={boom} className="btn-gold">
            ✨ ننتظركم بكل حب
          </motion.button>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', bottom: 40, zIndex: 2 }}>
          <ChevronDown size={28} color="#d4af37" opacity={.5} />
        </motion.div>
      </section>

      {/* ═══════ GROOM GALLERY (4 images) ═══════ */}
      <section className="section-pad">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="gold-text"
          style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '3rem' }}
        >
          عريسنا الغالي
        </motion.h3>

        <div className="gallery-grid">
          {['/1.jpeg', '/2.jpeg', '/3.jpeg', '/4.jpeg'].map((src, i) => (
            <motion.div
              key={i}
              className="gallery-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7, type: 'spring' }}
              whileHover={{ scale: 1.04 }}
            >
              <img src={src} alt={`العريس ${i + 1}`} />
              <div className="img-overlay" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ FRIENDS SECTION (2 images) ═══════ */}
      <section className="section-pad" style={{ background: 'var(--bg-section)' }}>
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: '1rem', color: '#93c5fd' }}
        >
          أنا والعريس
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#8b9cc0', fontFamily: 'Amiri', fontSize: '1.1rem', marginBottom: '3rem' }}
        >
          صادق & محمود — أخوة قبل ما نكون أصحاب
        </motion.p>

        <div className="friends-grid">
          {['/5.jpeg', '/6.jpeg'].map((src, i) => (
            <motion.div
              key={i}
              className="friends-card"
              initial={{ opacity: 0, x: i === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8, type: 'spring' }}
              whileHover={{ scale: 1.04 }}
            >
              <img src={src} alt={`صادق ومحمود ${i + 1}`} />
              <div className="img-overlay" />
              <div className="img-label">صادق & محمود ❤️</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ FORMAL TEXT ═══════ */}
      <section className="section-pad" style={{ background: 'var(--bg-section)' }}>
        <motion.div
          initial={{ opacity: 0, scale: .96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}
          className="glass"
        >
          <div style={{ padding: 'clamp(2rem, 5vw, 4rem)', borderRadius: '3rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'linear-gradient(to right, transparent, #d4af37, transparent)', opacity: .4 }} />
            <h4 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#f3d498', fontFamily: 'Amiri', marginBottom: '1.5rem' }}>
              بسم الله الرحمٰن الرحيم
            </h4>
            <p style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)', color: '#c8cfe0', fontFamily: 'Amiri', lineHeight: 2.2, marginBottom: '2rem' }}>
              يتشرف أبناء الحاج طيب الله ثراه بدعوتكم لمشاركتنا فرحة عمرنا في زفاف ابنهم البار
            </p>
            <h2 className="gold-text" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '2rem' }}>
              المهندس محمود
            </h2>
            <p style={{ color: '#8b9cc0', fontFamily: 'Amiri', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '1.5rem', fontSize: '1.1rem' }}>
              يتم الفرح بقدومكم.. ودامت بيوتكم عامرة بالأفراح
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════ COUNTDOWN ═══════ */}
      <section className="section-pad">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#f3d498', fontFamily: 'Amiri', fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '3rem' }}
        >
          العد التنازلي لليلة العمر
        </motion.h3>
        <CountdownTimer targetDate={targetDate} />
      </section>

      {/* ═══════ EVENT CARDS ═══════ */}
      <section className="section-pad" style={{ background: 'var(--bg-section)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Wedding */}
          <motion.div whileInView={{ x: 0, opacity: 1 }} initial={{ x: 40, opacity: 0 }} className="event-card">
            <div className="accent-bar" style={{ background: 'linear-gradient(var(--gold), transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div className="glass" style={{ width: 56, height: 56, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar color="#d4af37" size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.6rem', fontWeight: 700 }}>حفل الزفاف</h4>
                <span style={{ color: 'rgba(212,175,55,.7)', fontFamily: 'Amiri', fontSize: '.9rem' }}>ليلة العمر المنتظرة</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#c8cfe0', fontSize: '1.1rem' }}>
                <Clock color="#d4af37" size={20} /> الجمعة، 10/04/2026 - 5:00 مساءً
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#c8cfe0', fontSize: '1.1rem' }}>
                <MapPin color="#d4af37" size={20} style={{ flexShrink: 0, marginTop: 4 }} />
                النصيرات - صالة المارينا - جنوب تبة النويري
              </li>
            </ul>
          </motion.div>

          {/* Youth Party */}
          <motion.div whileInView={{ x: 0, opacity: 1 }} initial={{ x: -40, opacity: 0 }} className="event-card">
            <div className="accent-bar" style={{ background: 'linear-gradient(#3b82f6, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div className="glass" style={{ width: 56, height: 56, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music color="#3b82f6" size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.6rem', fontWeight: 700 }}>سهرة الشباب</h4>
                <span style={{ color: 'rgba(59,130,246,.7)', fontFamily: 'Amiri', fontSize: '.9rem' }}>ليلة الطرب والسمر</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#c8cfe0', fontSize: '1.1rem' }}>
                <Clock color="#3b82f6" size={20} /> الخميس، 09/04/2026 - 8:00 مساءً
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#c8cfe0', fontSize: '1.1rem' }}>
                <MapPin color="#3b82f6" size={20} style={{ flexShrink: 0, marginTop: 4 }} />
                الزوايدة - ترنس البابا - مقابل مصنع فنونة
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ═══════ ANIMATED MAP ═══════ */}
      <section id="map" className="section-pad">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="gold-text"
          style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: '3rem' }}
        >
          خريطة الوصول
        </motion.h3>
        <InteractiveMap />
      </section>

      {/* ═══════ FESTIVE ICONS ═══════ */}
      <section className="section-pad" style={{ background: 'var(--bg-section)' }}>
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#f3d498', fontFamily: 'Amiri', fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '3rem' }}
        >
          ليلة فرح لا تُنسى
        </motion.h3>
        <div className="festive-icons">
          <FestiveIconButton icon={Music}       label="موسيقى"  color="#d4af37" delay={0}   />
          <FestiveIconButton icon={Wine}        label="ضيافة"   color="#f43f5e" delay={0.1} />
          <FestiveIconButton icon={Disc3}       label="رقص"     color="#8b5cf6" delay={0.2} />
          <FestiveIconButton icon={PartyPopper} label="احتفال"  color="#3b82f6" delay={0.3} />
          <FestiveIconButton icon={Heart}       label="حب"      color="#ec4899" delay={0.4} />
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="footer">
        <Heart size={36} color="#d4af37" style={{ margin: '0 auto 1.5rem', opacity: .35 }} />
        <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontFamily: 'Amiri', color: '#f3d498', maxWidth: 700, margin: '0 auto 2rem', lineHeight: 2 }}>
          "بوجودكم يتم لنا الفرح والسرور.. والعاقبة لديكم بالمسرات"
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.8rem', background: 'rgba(255,255,255,.04)', padding: '.6rem 1.5rem', borderRadius: '2rem' }}>
          <Sparkles size={14} color="#d4af37" />
          <span style={{ fontSize: '.8rem', color: '#556', letterSpacing: '.15em' }}>ملاحظة: يمنع التصوير بالجوال</span>
          <Sparkles size={14} color="#d4af37" />
        </div>
      </footer>
    </>
  );
};

export default App;