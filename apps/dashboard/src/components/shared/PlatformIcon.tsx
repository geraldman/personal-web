import * as SimpleIcons from "react-icons/si";
import type { IconType } from "react-icons";
import type { IconKind } from "@/lib/types";

type SimpleIconsModule = Record<string, IconType>;

interface PlatformIconProps {
  iconKind: IconKind | string;
  iconRef: string;
  name: string;
  brandColor?: string;
  className?: string;
}

// Static, DB-driven lookup only — icon_ref never becomes executable code, it only ever
// selects a component reference that already exists in this map or the react-icons package.
const LOCAL_ICONS: Record<string, string> = {
  // populated as local-image platforms are added, e.g. "ctftime": "/icons/ctftime.svg"
};

export function PlatformIcon({ iconKind, iconRef, name, brandColor, className }: PlatformIconProps) {
  if (iconKind === "react-icons") {
    const Icon = (SimpleIcons as SimpleIconsModule)[iconRef];
    if (Icon) {
      return (
        <Icon
          className={className ?? "h-4 w-4"}
          style={brandColor ? { color: brandColor } : undefined}
          aria-hidden
        />
      );
    }
  }

  if (iconKind === "local-image") {
    const src = LOCAL_ICONS[iconRef];
    if (src) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt="" className={className ?? "h-4 w-4"} />;
    }
  }

  return (
    <span
      className={className ?? "flex h-4 w-4 items-center justify-center rounded-full text-[8px]"}
      style={{
        backgroundColor: "var(--color-surface-hover)",
        color: brandColor ?? "var(--color-text-secondary)",
      }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
