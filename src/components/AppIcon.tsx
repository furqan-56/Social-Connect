import React from 'react';
import {ICON_COMPONENTS, ICON_REGISTRY, ICON_SIZES} from './Icons';
import type {AppIconName} from './Icons';

type SizeKey = keyof typeof ICON_SIZES;

type AppIconProps = {
  active?: boolean;
  color: string;
  name: AppIconName;
  size?: number | SizeKey;
};

export default function AppIcon({
  active = false,
  color,
  name,
  size = 'action',
}: AppIconProps): React.JSX.Element {
  const resolvedSize = typeof size === 'number' ? size : ICON_SIZES[size];
  const config = ICON_REGISTRY[name];
  const [library, iconName] = active ? config.active : config.inactive;
  const IconComponent = ICON_COMPONENTS[library];

  return <IconComponent color={color} name={iconName} size={resolvedSize} />;
}
