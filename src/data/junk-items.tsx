import WelcomeSprite from '../retro/components/welcome-sprite';

export interface JunkItem {
  id: string;
  Component: React.ComponentType;
}

export const JUNK_ITEMS: JunkItem[] = [
  { id: 'welcome-sprite', Component: WelcomeSprite },
];