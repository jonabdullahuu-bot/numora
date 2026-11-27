import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;
export type LucideIcon = React.FC<IconProps>;

const base = (props: IconProps, children: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const Activity = (p: IconProps) => base(p, <><path d="M3 12h4l2.5-6.5 4.5 13L16.5 12H21" /></>);
export const AlertCircle = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5" /><path d="M12 16h.01" /></>);
export const AlertTriangle = (p: IconProps) => base(p, <><path d="M12 3.5 21 19.5H3L12 3.5Z" /><path d="M12 9.5v4.25" /><path d="M12 16.75h.01" /></>);
export const ArrowLeft = (p: IconProps) => base(p, <><path d="M19.5 12h-15" /><path d="M10.5 6 4.5 12l6 6" /></>);
export const ArrowRight = (p: IconProps) => base(p, <><path d="M4.5 12h15" /><path d="M13.5 6 19.5 12l-6 6" /></>);
export const ArrowUpRight = (p: IconProps) => base(p, <><path d="M6.5 17.5 17.5 6.5" /><path d="M9 6.5h8.5V15" /></>);
export const BadgeCheck = (p: IconProps) => base(p, <><path d="M12 3 15 5h3.5v3.5L21 12l-2.5 3.5V19H15l-3 2-3-2H5.5v-3.5L3 12l2.5-3.5V5H9l3-2Z" /><path d="M9 12.2 11 14.2 15.2 10" /></>);
export const BookOpen = (p: IconProps) => base(p, <><path d="M3.5 5.5h6a3 3 0 0 1 2.5 1.5 3 3 0 0 1 2.5-1.5h6v13h-6a3 3 0 0 0-2.5 1.5 3 3 0 0 0-2.5-1.5h-6v-13Z" /></>);
export const Calendar = (p: IconProps) => base(p, <><rect x="3.5" y="5" width="17" height="15.5" rx="1.5" /><path d="M3.5 9.5h17" /><path d="M8 3v4M16 3v4" /></>);
export const Check = (p: IconProps) => base(p, <><path d="M5 12.5 10 17.5 19 7" /></>);
export const CheckCircle = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2 10.8 14.5 15.8 9.5" /></>);
export const CheckCircle2 = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2 10.8 14.5 15.8 9.5" /></>);
export const ChevronDown = (p: IconProps) => base(p, <><path d="M6.5 9.5 12 15l5.5-5.5" /></>);
export const ChevronRight = (p: IconProps) => base(p, <><path d="M9.5 6.5 15 12l-5.5 5.5" /></>);
export const Clock = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>);
export const Coins = (p: IconProps) => base(p, <><ellipse cx="9.5" cy="9.5" rx="5.5" ry="3.5" /><path d="M4 9.5v4c0 1.9 2.5 3.5 5.5 3.5s5.5-1.6 5.5-3.5v-4" /><path d="M15 11.2c2.8.3 5 1.7 5 3.3 0 1.9-2.5 3.5-5.5 3.5-1.7 0-3.2-.5-4.2-1.2" /></>);
export const Copy = (p: IconProps) => base(p, <><rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M5.5 15.5h-1v-11h11v1" /></>);
export const Cpu = (p: IconProps) => base(p, <><rect x="6.5" y="6.5" width="11" height="11" rx="1" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" /></>);
export const CreditCard = (p: IconProps) => base(p, <><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3 10h18" /><path d="M7 14.5h4" /></>);
export const ExternalLink = (p: IconProps) => base(p, <><path d="M14 4.5h5.5V10" /><path d="M10.5 13.5 19.5 4.5" /><path d="M18 14v5.5H4.5V6H10" /></>);
export const Eye = (p: IconProps) => base(p, <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>);
export const EyeOff = (p: IconProps) => base(p, <><path d="M3 3l18 18" /><path d="M10.5 6.2A9.8 9.8 0 0 1 21 12a10.4 10.4 0 0 1-3.1 3.7" /><path d="M6.4 8.3A10.4 10.4 0 0 0 3 12a9.8 9.8 0 0 0 11.4 5.6" /></>);
export const FileText = (p: IconProps) => base(p, <><path d="M6 3.5h8.5L19 8v12.5H6V3.5Z" /><path d="M14 3.5V8h5" /><path d="M9 12.5h6M9 16h4" /></>);
export const Fingerprint = (p: IconProps) => base(p, <><path d="M7 11a5 5 0 0 1 10 0v3.5" /><path d="M10 11a2 2 0 0 1 4 0v5.5" /><path d="M4.5 12.5A7.5 7.5 0 0 1 19.5 11v2" /><path d="M7.5 16.5v2" /></>);
export const Globe = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17" /><ellipse cx="12" cy="12" rx="4.2" ry="9" /></>);
export const Globe2 = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M4.2 8.5h15.6" /><path d="M4.2 15.5h15.6" /><path d="M12 3v18" /></>);
export const HeartHandshake = (p: IconProps) => base(p, <><path d="M12 20 4.5 12.7a4.7 4.7 0 0 1 6.7-6.6L12 7l.8-.9a4.7 4.7 0 0 1 6.7 6.6L12 20Z" /><path d="M9 12h6" /></>);
export const Info = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 8h.01" /></>);
export const Key = (p: IconProps) => base(p, <><circle cx="8" cy="14.5" r="4" /><path d="M11 11.5 19.5 3" /><path d="M16.5 6 19 8.5" /></>);
export const KeyRound = (p: IconProps) => base(p, <><circle cx="8" cy="14.5" r="4" /><path d="M11 11.5 19.5 3" /><path d="M16.5 6 19 8.5" /><path d="M14 8.5 16.5 11" /></>);
export const Loader2 = (p: IconProps) => base(p, <><path d="M12 3a9 9 0 1 0 9 9" /></>);
export const Lock = (p: IconProps) => base(p, <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2" /></>);
export const LogOut = (p: IconProps) => base(p, <><path d="M10 4.5H5v15h5" /><path d="M15 8.5 19.5 12 15 15.5" /><path d="M9.5 12h10" /></>);
export const Mail = (p: IconProps) => base(p, <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M4 6.5 12 12.5 20 6.5" /></>);
export const MapPin = (p: IconProps) => base(p, <><path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 1 0 5.5 10c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.2" /></>);
export const Menu = (p: IconProps) => base(p, <><path d="M4 7h16M4 12h16M4 17h16" /></>);
export const MessageSquareWarning = (p: IconProps) => base(p, <><path d="M4 5h16v11H8.5L4 20V5Z" /><path d="M12 8.25v3.5" /><path d="M12 14h.01" /></>);
export const Phone = (p: IconProps) => base(p, <><path d="M5.5 4.5h3.2l1.4 3.6-2 1.5a11.5 11.5 0 0 0 6.3 6.3l1.5-2 3.6 1.4v3.2a1.5 1.5 0 0 1-1.6 1.5C9.7 19.6 4.4 14.3 4 6.1A1.5 1.5 0 0 1 5.5 4.5Z" /></>);
export const PhoneCall = (p: IconProps) => base(p, <><path d="M5.5 4.5h3.2l1.4 3.6-2 1.5a11.5 11.5 0 0 0 6.3 6.3l1.5-2 3.6 1.4v3.2a1.5 1.5 0 0 1-1.6 1.5C9.7 19.6 4.4 14.3 4 6.1A1.5 1.5 0 0 1 5.5 4.5Z" /><path d="M14.5 4.5a5 5 0 0 1 5 5" /></>);
export const PhoneForwarded = (p: IconProps) => base(p, <><path d="M5.5 5h3l1.3 3.4-1.8 1.4a10.5 10.5 0 0 0 6.2 6.2l1.4-1.8 3.4 1.3v3a1.4 1.4 0 0 1-1.5 1.5C9.8 19.6 4.5 14.3 4 6.5A1.4 1.4 0 0 1 5.5 5Z" /><path d="M14.5 7h5.5" /><path d="M17.5 4.5 20 7l-2.5 2.5" /></>);
export const Radar = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 12 18.2 5.8" /></>);
export const Radio = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="2" /><path d="M8.5 8.5a5 5 0 0 0 0 7" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M5.5 5.5a9.2 9.2 0 0 0 0 13" /><path d="M18.5 5.5a9.2 9.2 0 0 1 0 13" /></>);
export const RefreshCcw = (p: IconProps) => base(p, <><path d="M4 5v5h5" /><path d="M20 19v-5h-5" /><path d="M4.8 10A7.5 7.5 0 0 1 17.5 7.2L20 9.5" /><path d="M19.2 14a7.5 7.5 0 0 1-12.7 2.8L4 14.5" /></>);
export const RefreshCw = (p: IconProps) => base(p, <><path d="M20 5v5h-5" /><path d="M4 19v-5h5" /><path d="M19.2 10A7.5 7.5 0 0 0 6.5 7.2L4 9.5" /><path d="M4.8 14a7.5 7.5 0 0 0 12.7 2.8L20 14.5" /></>);
export const Scale = (p: IconProps) => base(p, <><path d="M12 4v16" /><path d="M5 7h14" /><path d="M8 20h8" /><path d="M5 7 3 13h4L5 7Z" /><path d="M19 7l-2 6h4l-2-6Z" /></>);
export const Search = (p: IconProps) => base(p, <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 20.5 20.5" /></>);
export const Share2 = (p: IconProps) => base(p, <><circle cx="17.5" cy="5.5" r="2.5" /><circle cx="6.5" cy="12" r="2.5" /><circle cx="17.5" cy="18.5" r="2.5" /><path d="M8.7 10.7 15.3 6.8" /><path d="M8.7 13.3 15.3 17.2" /></>);
export const Shield = (p: IconProps) => base(p, <><path d="M12 2.5 4.5 5.5v6c0 4.8 3.2 8.4 7.5 10 4.3-1.6 7.5-5.2 7.5-10v-6L12 2.5Z" /></>);
export const ShieldAlert = (p: IconProps) => base(p, <><path d="M12 2.5 4.5 5.5v6c0 4.8 3.2 8.4 7.5 10 4.3-1.6 7.5-5.2 7.5-10v-6L12 2.5Z" /><path d="M12 8.25v4.25" /><path d="M12 15.75h.01" /></>);
export const ShieldCheck = (p: IconProps) => base(p, <><path d="M12 2.5 4.5 5.5v6c0 4.8 3.2 8.4 7.5 10 4.3-1.6 7.5-5.2 7.5-10v-6L12 2.5Z" /><path d="M8.75 12.25 11 14.5l4.5-4.75" /></>);
export const ShoppingBag = (p: IconProps) => base(p, <><path d="M5.5 8h13l1 12H4.5l1-12Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>);
export const Smartphone = (p: IconProps) => base(p, <><rect x="6.5" y="3" width="11" height="18" rx="2" /><path d="M10.5 17.5h3" /></>);
export const Sparkles = (p: IconProps) => base(p, <><path d="M12 3v18" /><path d="M3 12h18" /><path d="M6.5 6.5 17.5 17.5" /><path d="M17.5 6.5 6.5 17.5" /></>);
export const Trash2 = (p: IconProps) => base(p, <><path d="M4.5 7h15" /><path d="M9.5 4h5v3h-5V4Z" /><path d="M6.5 7l1 13h9l1-13" /><path d="M10 11v5M14 11v5" /></>);
export const Unlock = (p: IconProps) => base(p, <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7" /><path d="M12 14.5v2" /></>);
export const UserSearch = (p: IconProps) => base(p, <><circle cx="9.5" cy="7.5" r="3.5" /><path d="M3.5 19.5a6 6 0 0 1 9-5.2" /><circle cx="16.5" cy="16.5" r="3" /><path d="M18.8 18.8 21 21" /></>);
export const Users = (p: IconProps) => base(p, <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9" r="2.4" /><path d="M16.5 14a4.5 4.5 0 0 1 4 4.8" /></>);
export const Wallet = (p: IconProps) => base(p, <><rect x="3.5" y="6" width="17" height="13" rx="1.5" /><path d="M15 12.5h5.5" /><circle cx="16.5" cy="12.5" r="0.8" /></>);
export const Wifi = (p: IconProps) => base(p, <><path d="M4 9.2a11.5 11.5 0 0 1 16 0" /><path d="M7.2 12.8a7 7 0 0 1 9.6 0" /><path d="M10.4 16.4a2.5 2.5 0 0 1 3.2 0" /><path d="M12 19.5h.01" /></>);
export const X = (p: IconProps) => base(p, <><path d="M6 6l12 12M18 6 6 18" /></>);
export const Zap = (p: IconProps) => base(p, <><path d="M13.2 2.5 4.8 13h6.2l-.8 8.5L19.2 11H13l.2-8.5Z" /></>);

export const SimCard = (p: IconProps) => base(p, <><path d="M6.5 3.5h7.5L18.5 8v12.5h-12V3.5Z" /><rect x="9" y="11" width="6" height="6" rx="1" /><path d="M12 11v6M9 14h6" /></>);
export const SignalTower = (p: IconProps) => base(p, <><path d="M12 20V9" /><path d="M8.5 20h7" /><circle cx="12" cy="7.5" r="1.5" /><path d="M8.5 5a5 5 0 0 0 0 5" /><path d="M15.5 5a5 5 0 0 1 0 5" /><path d="M5.8 3a8.2 8.2 0 0 0 0 9" /><path d="M18.2 3a8.2 8.2 0 0 1 0 9" /></>);
export const CloudVoip = (p: IconProps) => base(p, <><path d="M7 18h10.5a3.5 3.5 0 0 0 .6-6.95A5.5 5.5 0 0 0 7.4 9.2 4 4 0 0 0 7 18Z" /><path d="M10 14.5h4" /></>);
export const PortSwitch = (p: IconProps) => base(p, <><path d="M4.5 8h15" /><path d="M15.5 4.5 19.5 8l-4 3.5" /><path d="M19.5 16h-15" /><path d="M8.5 12.5 4.5 16l4 3.5" /></>);
export const MessageRelay = (p: IconProps) => base(p, <><path d="M4 5.5h16v10.5H8.5L4 20V5.5Z" /><path d="M8.5 10.5h7" /><path d="M8.5 13.5h4.5" /></>);