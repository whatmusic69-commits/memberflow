import Image from "next/image";

const socialPlatforms = ["instagram", "tiktok", "pinterest"] as const;

export function PlatformIcon({ index }: { index: number }) {
  if (index === 3) {
    return (
      <span className="wallet-platform-icons" aria-hidden="true">
        <span className="wallet-platform-frame">
          <Image
            src="/icons/apple-wallet.svg"
            width={20}
            height={16}
            alt=""
            className="wallet-platform-logo"
          />
        </span>
        <span className="wallet-platform-frame">
          <Image
            src="/icons/google-wallet.svg"
            width={20}
            height={17}
            alt=""
            className="wallet-platform-logo"
          />
        </span>
      </span>
    );
  }
  const platform = socialPlatforms[index];
  if (!platform) return null;
  return <SocialPlatformLogo platform={platform} />;
}
export function SocialPlatformLogo({
  platform,
  size = 20,
}: {
  platform: (typeof socialPlatforms)[number];
  size?: number;
}) {
  return (
    <Image
      className="platform-icon"
      src={`/icons/${platform}-color.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
