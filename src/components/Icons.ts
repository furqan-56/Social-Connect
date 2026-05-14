/**
 * Central icon registry.
 *
 * Libraries:
 *  - Feather          — clean outline strokes, used for inactive/default states
 *  - MaterialCommunityIcons — filled variants, used for active/selected states
 *
 * Size conventions (enforced at call sites):
 *  - Navigation tab icons   : 22 px
 *  - Settings / list rows   : 20 px
 *  - Post action buttons    : 18 px
 *  - Input field prefixes   : 18 px
 *  - Inline badges / counts : 14 px
 */

import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Library = 'Feather' | 'MaterialCommunityIcons';
type IconDef = [Library, string];

/** Two-state icon config (inactive / active). */
type TwoStateIcon = {inactive: IconDef; active: IconDef};
/** Single-state icon config (same in both states). */
type SingleIcon = IconDef;

export const ICON_REGISTRY = {
  // ── Navigation ───────────────────────────────────────────────────────────
  home:          {inactive: ['Feather', 'home'],         active: ['MaterialCommunityIcons', 'home']},
  discover:      {inactive: ['Feather', 'search'],        active: ['MaterialCommunityIcons', 'magnify']},
  create:        {inactive: ['Feather', 'plus-circle'],   active: ['MaterialCommunityIcons', 'plus-circle']},
  bell:          {inactive: ['Feather', 'bell'],          active: ['MaterialCommunityIcons', 'bell']},
  person:        {inactive: ['Feather', 'user'],          active: ['MaterialCommunityIcons', 'account']},

  // ── Feed actions ─────────────────────────────────────────────────────────
  heart:         {inactive: ['Feather', 'heart'],         active: ['MaterialCommunityIcons', 'heart']},
  comment:       {inactive: ['Feather', 'message-circle'],active: ['MaterialCommunityIcons', 'comment']},
  share:         {inactive: ['Feather', 'share-2'],       active: ['Feather', 'share-2']},
  bookmark:      {inactive: ['Feather', 'bookmark'],      active: ['MaterialCommunityIcons', 'bookmark']},
  moreVertical:  {inactive: ['Feather', 'more-vertical'], active: ['Feather', 'more-vertical']},

  // ── Auth / form fields ────────────────────────────────────────────────────
  mail:          {inactive: ['Feather', 'mail'],          active: ['Feather', 'mail']},
  lock:          {inactive: ['Feather', 'lock'],          active: ['Feather', 'lock']},
  eye:           {inactive: ['Feather', 'eye'],           active: ['Feather', 'eye']},
  eyeOff:        {inactive: ['Feather', 'eye-off'],       active: ['Feather', 'eye-off']},
  atSign:        {inactive: ['Feather', 'at-sign'],       active: ['Feather', 'at-sign']},
  userPlus:      {inactive: ['Feather', 'user-plus'],     active: ['MaterialCommunityIcons', 'account-plus']},
  shield:        {inactive: ['Feather', 'shield'],        active: ['MaterialCommunityIcons', 'shield-check']},

  // ── Navigation / chrome ───────────────────────────────────────────────────
  back:          {inactive: ['Feather', 'arrow-left'],    active: ['Feather', 'arrow-left']},
  close:         {inactive: ['Feather', 'x'],             active: ['Feather', 'x']},
  chevronRight:  {inactive: ['Feather', 'chevron-right'], active: ['Feather', 'chevron-right']},
  chevronDown:   {inactive: ['Feather', 'chevron-down'],  active: ['Feather', 'chevron-down']},
  settings:      {inactive: ['Feather', 'settings'],      active: ['MaterialCommunityIcons', 'cog']},
  edit:          {inactive: ['Feather', 'edit-2'],        active: ['Feather', 'edit-2']},
  trash:         {inactive: ['Feather', 'trash-2'],       active: ['Feather', 'trash-2']},
  send:          {inactive: ['Feather', 'send'],          active: ['Feather', 'send']},
  check:         {inactive: ['Feather', 'check'],         active: ['Feather', 'check']},
  link:          {inactive: ['Feather', 'link'],          active: ['Feather', 'link']},
  flag:          {inactive: ['Feather', 'flag'],          active: ['MaterialCommunityIcons', 'flag']},
  logOut:        {inactive: ['Feather', 'log-out'],       active: ['Feather', 'log-out']},

  // ── Media / content ───────────────────────────────────────────────────────
  camera:        {inactive: ['Feather', 'camera'],        active: ['MaterialCommunityIcons', 'camera']},
  image:         {inactive: ['Feather', 'image'],         active: ['MaterialCommunityIcons', 'image']},
  video:         {inactive: ['Feather', 'video'],         active: ['MaterialCommunityIcons', 'video']},
  smile:         {inactive: ['Feather', 'smile'],         active: ['MaterialCommunityIcons', 'emoticon']},
  mapPin:        {inactive: ['Feather', 'map-pin'],       active: ['MaterialCommunityIcons', 'map-marker']},
  globe:         {inactive: ['Feather', 'globe'],         active: ['Feather', 'globe']},
  moon:          {inactive: ['Feather', 'moon'],          active: ['MaterialCommunityIcons', 'moon-waning-crescent']},
  hash:          {inactive: ['Feather', 'hash'],          active: ['Feather', 'hash']},
  grid:          {inactive: ['Feather', 'grid'],          active: ['Feather', 'grid']},

  // ── DMs / comms ───────────────────────────────────────────────────────────
  messageDm:     {inactive: ['Feather', 'message-square'],active: ['MaterialCommunityIcons', 'message']},
  phone:         {inactive: ['Feather', 'phone'],         active: ['Feather', 'phone']},
} as const satisfies Record<string, TwoStateIcon>;

export type AppIconName = keyof typeof ICON_REGISTRY;

/** Resolves the correct React Native Vector Icons component for a given library. */
export const ICON_COMPONENTS: Record<Library, typeof Feather> = {
  Feather,
  MaterialCommunityIcons,
};

/** Size standards by usage context. */
export const ICON_SIZES = {
  nav:    22,
  row:    20,
  action: 18,
  input:  18,
  inline: 14,
} as const;
