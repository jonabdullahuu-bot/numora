import React from "react";

type PageStudioBannerProps = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
};

export default function PageStudioBanner({
  image,
  alt,
  eyebrow,
  title,
  subtitle,
}: PageStudioBannerProps) {
  return (
    <div className="mb-10 rounded-3xl apple-card overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
      <div className="md:col-span-6 p-7 sm:p-9 lg:p-10 flex flex-col justify-center space-y-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8aa5d6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8aa5d6] shrink-0" />
          <span>{eyebrow}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          {title}
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">{subtitle}</p>
      </div>
      <div className="md:col-span-6 relative aspect-[16/9] md:aspect-auto md:min-h-[250px] w-full overflow-hidden bg-[#141519] border-t md:border-t-0 md:border-l border-white/[0.06]">
        <img
          src={image}
          alt={alt}
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
