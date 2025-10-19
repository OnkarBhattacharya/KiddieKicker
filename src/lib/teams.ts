import { LionCubsLogo, TigerStrikersLogo, EagleShootersLogo, PandaPowerLogo } from "@/components/game/TeamLogos";

export type Team = {
  id: string;
  name: string;
  logo: React.ComponentType<{ className?: string }>;
};

export const teams: Team[] = [
  {
    id: 'lions',
    name: 'Lion Cubs',
    logo: LionCubsLogo,
  },
  {
    id: 'tigers',
    name: 'Tiger Strikers',
    logo: TigerStrikersLogo,
  },
  {
    id: 'eagles',
    name: 'Eagle Shooters',
    logo: EagleShootersLogo,
  },
  {
    id: 'pandas',
    name: 'Panda Power',
    logo: PandaPowerLogo,
  },
];
