import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, LineChart, CalendarClock, Leaf, ArrowRight, ChevronDown, Sun, Battery, BarChart3, Shield } from 'lucide-react';
import '../styles/landing.css';

function useScrollFadeUp() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.fade-up');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function LandingPage() {
  const scrollRef = useScrollFadeUp();

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.landing-nav');
      if (nav) {
        if (window.scrollY > 40) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page" ref={scrollRef}>
      {/* ───── Navbar ───── */}
      <nav className="landing-nav" id="landing-navbar">
        <Link to="/" className="landing-nav__brand">
          <div className="landing-nav__brand-icon">
            <Zap size={20} />
          </div>
          <span className="landing-nav__brand-text">RE-FLOW AI</span>
        </Link>

        <ul className="landing-nav__links">
          <li><a href="#features" className="landing-nav__link">Features</a></li>
          <li><a href="#how-it-works" className="landing-nav__link">How It Works</a></li>
          <li><a href="#stats" className="landing-nav__link">Impact</a></li>
        </ul>

        <Link to="/login" className="landing-nav__cta">
          Admin Login
        </Link>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="landing-hero" id="hero">
        {/* Floating gradient blobs */}
        <div className="landing-blob landing-blob--teal" />
        <div className="landing-blob landing-blob--green" />
        <div className="landing-blob landing-blob--amber" />

        <div className="landing-hero__content">
          <div className="landing-hero__badge fade-up">
            <span className="landing-hero__badge-dot" />
            AI-Powered Energy Platform
          </div>

          <h1 className="landing-hero__title fade-up fade-up-delay-1">
            Take Control of Your{' '}
            <span className="landing-hero__title-accent">Energy</span>
          </h1>

          <p className="landing-hero__subtitle fade-up fade-up-delay-2">
            RE-FLOW AI optimises renewable energy generation, predicts demand patterns,
            and delivers intelligent scheduling — reducing costs and carbon footprint
            for your facility.
          </p>

          <div className="landing-hero__actions fade-up fade-up-delay-3">
            <Link to="/login" className="landing-btn-primary">
              Admin Login <ArrowRight size={16} />
            </Link>
            <button onClick={scrollToFeatures} className="landing-btn-secondary">
              Explore Features <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="landing-hero__scroll">
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ───── Features Section ───── */}
      <section className="landing-features" id="features">
        <div className="landing-section-label fade-up">
          <Zap size={14} /> Platform Capabilities
        </div>
        <h2 className="landing-section-title fade-up">
          Intelligent energy management,<br />designed for real impact.
        </h2>
        <p className="landing-section-desc fade-up">
          Every module works together to forecast, optimise, and reduce your
          facility's energy consumption and environmental footprint.
        </p>

        <div className="landing-features__grid">
          {/* Card 1 — ML Forecasting */}
          <div className="landing-feature-card fade-up">
            <div className="landing-feature-card__tags">
              <span className="landing-tag landing-tag--teal">AI-Powered</span>
              <span className="landing-tag landing-tag--gray">Real-time</span>
            </div>
            <div className="landing-feature-card__icon landing-feature-card__icon--teal">
              <LineChart size={24} />
            </div>
            <h3 className="landing-feature-card__title">ML Forecasting</h3>
            <p className="landing-feature-card__desc">
              Predict solar irradiance, wind yield, and facility demand with
              satellite-trained machine learning models updated in real-time
              from Open-Meteo weather feeds.
            </p>
          </div>

          {/* Card 2 — Smart Scheduling */}
          <div className="landing-feature-card fade-up fade-up-delay-1">
            <div className="landing-feature-card__tags">
              <span className="landing-tag landing-tag--green">Optimiser</span>
              <span className="landing-tag landing-tag--gray">OR-Tools</span>
            </div>
            <div className="landing-feature-card__icon landing-feature-card__icon--green">
              <CalendarClock size={24} />
            </div>
            <h3 className="landing-feature-card__title">Smart Scheduling</h3>
            <p className="landing-feature-card__desc">
              Google OR-Tools MILP solver shifts flexible loads to off-peak
              windows, balancing cost, grid stability, and renewable
              availability across your entire schedule.
            </p>
          </div>

          {/* Card 3 — Impact Analytics */}
          <div className="landing-feature-card fade-up fade-up-delay-2">
            <div className="landing-feature-card__tags">
              <span className="landing-tag landing-tag--amber">Sustainable</span>
              <span className="landing-tag landing-tag--green">CO₂ Tracking</span>
            </div>
            <div className="landing-feature-card__icon landing-feature-card__icon--amber">
              <Leaf size={24} />
            </div>
            <h3 className="landing-feature-card__title">Impact Analytics</h3>
            <p className="landing-feature-card__desc">
              Track carbon offset, cost savings, and sustainability metrics.
              Visualise your environmental impact with detailed reports
              and actionable recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-how__inner">
          <div className="landing-section-label fade-up">
            <BarChart3 size={14} /> Process
          </div>
          <h2 className="landing-section-title fade-up">
            From data to decisions<br />in four steps.
          </h2>

          <div className="landing-how__timeline">
            <div className="landing-step fade-up">
              <div className="landing-step__number">1</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><Sun size={22} /></div>
              <h4 className="landing-step__title">Collect</h4>
              <p className="landing-step__desc">
                Live weather, solar irradiance, and facility telemetry are ingested every 15 minutes.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-1">
              <div className="landing-step__number">2</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><LineChart size={22} /></div>
              <h4 className="landing-step__title">Predict</h4>
              <p className="landing-step__desc">
                ML models forecast 24 h of renewable generation and demand with high confidence.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-2">
              <div className="landing-step__number">3</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><Battery size={22} /></div>
              <h4 className="landing-step__title">Optimise</h4>
              <p className="landing-step__desc">
                MILP solver shifts flexible loads to clean-energy windows, minimising cost and CO₂.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-3">
              <div className="landing-step__number">4</div>
              <div className="landing-step__icon"><Shield size={22} /></div>
              <h4 className="landing-step__title">Act</h4>
              <p className="landing-step__desc">
                Actionable schedules and recommendations are delivered to your dashboard in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Stats Section ───── */}
      <section className="landing-stats" id="stats">
        <div className="landing-section-label fade-up">
          <Zap size={14} /> Impact Metrics
        </div>
        <h2 className="landing-section-title fade-up">
          Measurable results,<br />every single day.
        </h2>

        <div className="landing-stats__grid">
          <div className="landing-stat-card fade-up">
            <div className="landing-stat-card__value">₹2.4L+</div>
            <div className="landing-stat-card__label">Annual Cost Savings</div>
          </div>
          <div className="landing-stat-card fade-up fade-up-delay-1">
            <div className="landing-stat-card__value">35%</div>
            <div className="landing-stat-card__label">CO₂ Reduction</div>
          </div>
          <div className="landing-stat-card fade-up fade-up-delay-2">
            <div className="landing-stat-card__value">99.8%</div>
            <div className="landing-stat-card__label">System Uptime</div>
          </div>
          <div className="landing-stat-card fade-up fade-up-delay-3">
            <div className="landing-stat-card__value">24/7</div>
            <div className="landing-stat-card__label">Autonomous Monitoring</div>
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="landing-cta">
        <div className="landing-blob landing-blob--teal" style={{ top: '-20%', right: '-10%' }} />
        <div className="landing-cta__inner">
          <h2 className="landing-cta__title fade-up">
            Ready to optimise your energy?
          </h2>
          <p className="landing-cta__subtitle fade-up fade-up-delay-1">
            Log in to access the full suite of AI-powered energy intelligence tools.
          </p>
          <Link to="/login" className="landing-btn-primary fade-up fade-up-delay-2">
            Admin Login <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="landing-footer">
        <div className="landing-footer__copy">
          © {new Date().getFullYear()} RE-FLOW AI • Autonomous Renewable Energy Intelligence Platform
        </div>
        <div className="landing-footer__links">
          <span className="landing-footer__link">National CleanTech Hackathon</span>
        </div>
      </footer>
    </div>
  );
}
