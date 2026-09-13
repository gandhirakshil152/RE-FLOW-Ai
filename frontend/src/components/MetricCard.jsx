import {
  SunMedium,
  Zap,
  TrendingDown,
  TrendingUp,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
  Clock,
  IndianRupee,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const iconMap = {
  SunMedium: { component: SunMedium, colorClass: 'amber' },
  Zap: { component: Zap, colorClass: 'blue' },
  TrendingDown: { component: TrendingDown, colorClass: 'green' },
  TrendingUp: { component: TrendingUp, colorClass: 'green' },
  Leaf: { component: Leaf, colorClass: 'green' },
  Activity: { component: Activity, colorClass: 'green' },
  Award: { component: Award, colorClass: 'amber' },
  Clock: { component: Clock, colorClass: 'amber' },
  IndianRupee: { component: IndianRupee, colorClass: 'green' },
  DollarSign: { component: IndianRupee, colorClass: 'green' },
  ShieldCheck: { component: ShieldCheck, colorClass: 'blue' },
};

export default function MetricCard({
  title,
  label,
  value,
  change,
  delta,
  description,
  caption,
  subtitle,
  icon,
  iconName,
  colorClass,
  trend,
  trendType,
  badge,
  className = '',
  onClick,
}) {
  // Resolve title
  const displayTitle = title || label;
  // Resolve delta text
  const displayDelta = delta || change;
  // Resolve caption
  const displayCaption = caption || description || subtitle;

  // Resolve icon component and color
  let IconComponent = Zap;
  let resolvedColorClass = colorClass || 'green';

  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    IconComponent = icon;
  } else if (iconName && iconMap[iconName]) {
    IconComponent = iconMap[iconName].component;
    if (!colorClass) resolvedColorClass = iconMap[iconName].colorClass;
  }

  // Resolve trend direction
  const resolvedTrend = trend || trendType || 'up';

  return (
    <div
      className={`metric-card ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="metric-card-top">
        <span className="metric-label-eyebrow">{displayTitle}</span>
        <div className={`metric-icon-box ${resolvedColorClass}`}>
          <IconComponent size={20} />
        </div>
      </div>

      <div className="metric-value-lg tabular-nums">
        <AnimatedNumber value={value} />
      </div>

      <div className="metric-footer-row">
        {displayDelta && (
          <div
            className={`metric-delta ${
              resolvedTrend === 'down'
                ? 'neutral'
                : resolvedTrend === 'neutral'
                ? 'neutral'
                : 'positive'
            }`}
          >
            {resolvedTrend === 'up' && <ArrowUpRight size={14} />}
            {resolvedTrend === 'down' && <ArrowDownRight size={14} />}
            <span>{displayDelta}</span>
          </div>
        )}
        {displayCaption && <span className="metric-caption">{displayCaption}</span>}
        {badge && (
          <span className="badge badge-pill" style={{ width: 'fit-content', marginTop: '0.25rem', fontSize: '0.65rem' }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
