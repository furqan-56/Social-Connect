import React, {useState} from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import {useTheme} from '../theme/ThemeContext';

type NotifType = 'like' | 'comment' | 'follow' | 'mention';
type SegmentTab = 'all' | 'likes' | 'follows' | 'comments';

type Notification = {
  id: string;
  type: NotifType;
  name: string;
  action: string;
  time: string;
  read: boolean;
  hasThumb?: boolean;
  section: 'Today' | 'This Week' | 'Earlier';
};

const MOCK_NOTIFS: Notification[] = [
  {action: 'liked your post', hasThumb: true,  id: '1', name: 'Alex Morgan',  read: false, section: 'Today',     time: '2m',  type: 'like'},
  {action: 'started following you',             id: '2', name: 'Jamie Chen',   read: false, section: 'Today',     time: '15m', type: 'follow'},
  {action: 'commented: "Great work!"', hasThumb: true, id: '3', name: 'Sofia Reyes',  read: false, section: 'Today',     time: '1h',  type: 'comment'},
  {action: 'mentioned you in a comment',        id: '4', name: 'Marcus Lee',   read: true,  section: 'This Week', time: '2d',  type: 'mention'},
  {action: 'liked your post', hasThumb: true,  id: '5', name: 'Priya Shah',   read: true,  section: 'This Week', time: '3d',  type: 'like'},
  {action: 'started following you',             id: '6', name: 'Noah Kim',     read: true,  section: 'Earlier',   time: '1w',  type: 'follow'},
  {action: 'liked your post', hasThumb: true,  id: '7', name: 'Mia Patel',    read: true,  section: 'Earlier',   time: '2w',  type: 'like'},
];

const SEGMENT_TABS: {id: SegmentTab; label: string}[] = [
  {id: 'all',      label: 'All'},
  {id: 'likes',    label: 'Likes'},
  {id: 'follows',  label: 'Follows'},
  {id: 'comments', label: 'Comments'},
];

/** Per-type badge icon name (Feather) and background color token key */
const TYPE_BADGE: Record<NotifType, {icon: string; bg: string}> = {
  comment: {bg: '#6C63FF', icon: 'message-circle'},
  follow:  {bg: '#22C55E', icon: 'user-plus'},
  like:    {bg: '#FF6584', icon: 'heart'},
  mention: {bg: '#6C63FF', icon: 'at-sign'},
};

export default function NotificationsScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState<SegmentTab>('all');
  const [notifs,    setNotifs]    = useState(MOCK_NOTIFS);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({...n, read: true})));

  const filteredNotifs = notifs.filter(n => {
    if (activeTab === 'all')      return true;
    if (activeTab === 'likes')    return n.type === 'like';
    if (activeTab === 'follows')  return n.type === 'follow';
    if (activeTab === 'comments') return n.type === 'comment';
    return true;
  });

  const sections = ['Today', 'This Week', 'Earlier'] as const;

  type SectionOrItem =
    | {type: 'section'; title: string}
    | {type: 'item'; notif: Notification};

  const flatData: SectionOrItem[] = [];
  sections.forEach(section => {
    const items = filteredNotifs.filter(n => n.section === section);
    if (items.length > 0) {
      flatData.push({title: section, type: 'section'});
      items.forEach(notif => flatData.push({notif, type: 'item'}));
    }
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, {color: colors.textPrimary}]}>Activity</Text>
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markRead, {color: colors.primary}]}>Mark all read</Text>
          </Pressable>
        </View>

        {/* Segmented control */}
        <View
          style={[
            styles.segmentWrap,
            {backgroundColor: colors.surfaceAlt},
          ]}>
          {SEGMENT_TABS.map(tab => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.segmentTab,
                activeTab === tab.id ? {backgroundColor: colors.primary} : null,
              ]}>
              <Text
                style={[
                  styles.segmentTabText,
                  {color: activeTab === tab.id ? '#fff' : colors.textSecondary},
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <FlatList
        contentContainerStyle={styles.list}
        data={flatData}
        keyExtractor={(item, idx) =>
          item.type === 'section' ? item.title : item.notif.id
        }
        ListEmptyComponent={
          <EmptyState
            heading="You're all caught up!"
            illustration="🔔"
            subtext="Check back later for new activity."
          />
        }
        renderItem={({item}) => {
          if (item.type === 'section') {
            return (
              <Text
                style={[
                  styles.sectionLabel,
                  {color: colors.textSecondary},
                ]}>
                {item.title.toUpperCase()}
              </Text>
            );
          }

          const {notif}  = item;
          const badge    = TYPE_BADGE[notif.type];

          return (
            <Pressable
              style={({pressed}) => [
                styles.notifRow,
                {
                  backgroundColor: !notif.read
                    ? colors.unreadBg
                    : pressed
                    ? colors.surfaceAlt
                    : 'transparent',
                  borderRadius: !notif.read ? 14 : 0,
                  marginHorizontal: !notif.read ? 8 : 0,
                },
              ]}>
              {/* Avatar + badge */}
              <View style={styles.avatarWrap}>
                <Avatar name={notif.name} size={44} />
                <View
                  style={[styles.typeBadge, {backgroundColor: badge.bg}]}>
                  <Feather color="#fff" name={badge.icon as any} size={10} />
                </View>
              </View>

              {/* Text */}
              <View style={styles.notifText}>
                <Text style={[styles.notifBody, {color: colors.textSecondary}]}>
                  <Text style={[styles.notifName, {color: colors.textPrimary}]}>
                    {notif.name}{' '}
                  </Text>
                  {notif.action}
                </Text>
                <Text style={[styles.notifTime, {color: colors.textMuted}]}>
                  {notif.time} ago
                </Text>
              </View>

              {/* Thumbnail if post notification */}
              {notif.hasThumb ? (
                <View
                  style={[
                    styles.thumbnail,
                    {backgroundColor: colors.surfaceAlt, borderRadius: 8},
                  ]}
                />
              ) : null}
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    position: 'relative',
  },
  container: {flex: 1},
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
  },
  list: {paddingBottom: 100},
  markRead: {fontSize: 12, fontWeight: '500'},
  notifBody: {fontSize: 13, lineHeight: 18},
  notifName: {fontWeight: '700'},
  notifRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  notifText: {flex: 1},
  notifTime: {fontSize: 11, marginTop: 2},
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentTab: {
    alignItems: 'center',
    borderRadius: 9999,
    flex: 1,
    paddingVertical: 7,
  },
  segmentTabText: {fontSize: 12, fontWeight: '600'},
  segmentWrap: {
    borderRadius: 9999,
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 3,
  },
  thumbnail: {
    height: 36,
    width: 36,
  },
  typeBadge: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 9999,
    borderWidth: 1.5,
    bottom: -2,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 18,
  },
});
