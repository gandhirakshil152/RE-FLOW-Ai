import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  LineChart,
  CalendarClock,
  Leaf,
  ArrowRight,
  ChevronDown,
  Sun,
  Battery,
  BarChart3,
  Shield,
  Satellite,
  Wind,
  Activity,
} from 'lucide-react';
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
      <nav className="landing-nav" id="landing-navbar">
        <Link to="/" className="landing-nav__brand">
          <div className="landing-nav__brand-icon">
            <Zap size={20} />
          </div>
          <span className="landing-nav__brand-text">RE-FLOW AI</span>
        </Link>

        <ul className="landing-nav__links">
          <li><a href="#features" className="landing-nav__link">Features</a></li>
          <li><a href="#signal-room" className="landing-nav__link">Signal Room</a></li>
          <li><a href="#how-it-works" className="landing-nav__link">How It Works</a></li>
          <li><a href="#stats" className="landing-nav__link">Impact</a></li>
        </ul>

        <Link to="/login" className="landing-nav__cta">
          Admin Login
        </Link>
      </nav>

      <section className="landing-hero" id="hero">
        <div className="landing-hero__atmosphere" aria-hidden="true">
          <div className="landing-hero__grid" />
          <div className="landing-blob landing-blob--teal" />
          <div className="landing-blob landing-blob--green" />
          <div className="landing-blob landing-blob--amber" />
          <svg className="landing-hero__wave" viewBox="0 0 1200 220" preserveAspectRatio="none">
            <path
              className="landing-hero__wave-path landing-hero__wave-path--a"
              d="M0 140 C 160 40, 320 200, 480 120 S 800 40, 960 130 S 1120 180, 1200 90"
            />
            <path
              className="landing-hero__wave-path landing-hero__wave-path--b"
              d="M0 160 C 180 90, 340 210, 520 150 S 820 70, 980 150 S 1140 190, 1200 120"
            />
          </svg>
        </div>

        <div className="landing-hero__content">
          <p className="landing-hero__brand fade-up">RE-FLOW AI</p>

          <h1 className="landing-hero__title fade-up fade-up-delay-1">
            Orchestrate power when the{' '}
            <span className="landing-hero__title-accent">grid is cleanest</span>
          </h1>

          <p className="landing-hero__subtitle fade-up fade-up-delay-2">
            Satellite weather, demand forecasts, and MILP scheduling — fused into one
            control room that shifts flexible loads onto renewable peaks.
          </p>

          <div className="landing-hero__actions fade-up fade-up-delay-3">
            <Link to="/login" className="landing-btn-primary">
              Admin Login <ArrowRight size={16} />
            </Link>
            <button type="button" onClick={scrollToFeatures} className="landing-btn-secondary">
              Explore Features <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="landing-hero__scroll">
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </div>
      </section>

      <section className="landing-signal" id="signal-room">
        <div className="landing-signal__inner">
          <div className="landing-section-label fade-up">
            <Activity size={14} /> Signal Room
          </div>
          <h2 className="landing-section-title fade-up">
            Live edges that decide<br />when your facility should move.
          </h2>
          <p className="landing-section-desc fade-up">
            RE-FLOW listens to weather, renewables, and flexible demand — then opens a
            clean-energy window before peak tariffs hit.
          </p>

          <div className="landing-signal__board fade-up fade-up-delay-1">
            <article className="landing-signal__lane">
              <div className="landing-signal__lane-icon">
                <Satellite size={20} />
              </div>
              <div>
                <h3>Orbit Feed</h3>
                <p>Open-Meteo irradiance + wind ingested every 15 minutes for the ISO-N zone.</p>
              </div>
              <span className="landing-signal__pulse">SYNCED</span>
            </article>

            <article className="landing-signal__lane">
              <div className="landing-signal__lane-icon landing-signal__lane-icon--amber">
                <Wind size={20} />
              </div>
              <div>
                <h3>Clean Window 14:00–17:30</h3>
                <p>Projected surplus from solar + wind. Ideal for EV fleets and HVAC pre-cool.</p>
              </div>
              <span className="landing-signal__pulse landing-signal__pulse--amber">OPEN</span>
            </article>

            <article className="landing-signal__lane">
              <div className="landing-signal__lane-icon landing-signal__lane-icon--green">
                <Zap size={20} />
              </div>
              <div>
                <h3>Flexible Load Queue</h3>
                <p>Chargers, chillers, and batch processes lined up for renewable-first dispatch.</p>
              </div>
              <span className="landing-signal__pulse landing-signal__pulse--green">READY</span>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-label fade-up">
          <Zap size={14} /> Platform Capabilities
        </div>
        <h2 className="landing-section-title fade-up">
          Intelligence stacked for<br />renewable-first operations.
        </h2>
        <p className="landing-section-desc fade-up">
          Forecast, optimise, and prove impact — without stitching five tools together.
        </p>

        <div className="landing-features__grid">
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
              satellite-trained models refreshed from live weather feeds.
            </p>
          </div>

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
              MILP solver shifts flexible loads into clean windows, balancing cost,
              grid stability, and renewable availability.
            </p>
          </div>

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
              Track carbon offset and cost savings with reports your facility team
              can act on the same day.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="landing-how__inner">
          <div className="landing-section-label fade-up">
            <BarChart3 size={14} /> Process
          </div>
          <h2 className="landing-section-title fade-up">
            From orbit data to load<br />moves in four steps.
          </h2>

          <div className="landing-how__timeline">
            <div className="landing-step fade-up">
              <div className="landing-step__number">1</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><Sun size={22} /></div>
              <h4 className="landing-step__title">Collect</h4>
              <p className="landing-step__desc">
                Live weather, solar irradiance, and facility telemetry arrive every 15 minutes.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-1">
              <div className="landing-step__number">2</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><LineChart size={22} /></div>
              <h4 className="landing-step__title">Predict</h4>
              <p className="landing-step__desc">
                ML models forecast 24h of renewable generation and demand with confidence bands.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-2">
              <div className="landing-step__number">3</div>
              <div className="landing-step__connector" />
              <div className="landing-step__icon"><Battery size={22} /></div>
              <h4 className="landing-step__title">Optimise</h4>
              <p className="landing-step__desc">
                MILP shifts flexible loads onto clean-energy windows to cut cost and CO₂.
              </p>
            </div>

            <div className="landing-step fade-up fade-up-delay-3">
              <div className="landing-step__number">4</div>
              <div className="landing-step__icon"><Shield size={22} /></div>
              <h4 className="landing-step__title">Act</h4>
              <p className="landing-step__desc">
                Schedules and recommendations land on your dashboard for operators to execute.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats" id="stats">
        <div className="landing-section-label fade-up">
          <Zap size={14} /> Impact Metrics
        </div>
        <h2 className="landing-section-title fade-up">
          Numbers your grid ops<br />team can defend.
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

      <section className="landing-cta">
        <div className="landing-blob landing-blob--teal" style={{ top: '-20%', right: '-10%' }} />
        <div className="landing-cta__inner">
          <h2 className="landing-cta__title fade-up">
            Open the control room.
          </h2>
          <p className="landing-cta__subtitle fade-up fade-up-delay-1">
            Sign in to forecast, schedule, and prove clean-energy impact in one place.
          </p>
          <Link to="/login" className="landing-btn-primary fade-up fade-up-delay-2">
            Admin Login <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer__copy">
          © {new Date().getFullYear()} RE-FLOW AI • Autonomous Renewable Energy Intelligence
        </div>
        <div className="landing-footer__links">
          <span className="landing-footer__link">National CleanTech Hackathon</span>
        </div>
      </footer>
    </div>
  );
}
