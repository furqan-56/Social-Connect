import React, {useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Avatar from '../components/Avatar';
import {useTheme} from '../theme/ThemeContext';

const HASHTAGS = [
  '#reactnative',
  '#webdev',
  '#design',
  '#typescript',
  '#mobile',
  '#ux',
  '#coding',
  '#javascript',
];

const SUGGESTED_USERS = [
  {bio: 'UI/UX Designer',    id: '1', mutual: 3, name: 'Alex Morgan'},
  {bio: 'Full Stack Dev',    id: '2', mutual: 7, name: 'Jamie Chen'},
  {bio: 'Product Manager',   id: '3', mutual: 1, name: 'Sofia Reyes'},
  {bio: 'iOS Engineer',      id: '4', mutual: 5, name: 'Marcus Lee'},
  {bio: 'Data Scientist',    id: '5', mutual: 2, name: 'Priya Shah'},
];

const EXPLORE_POSTS = [
  {id: '1', text: 'Building beautiful UIs with React Native. The possibilities are endless when you combine great design with powerful code.'},
  {id: '2', text: 'TypeScript has completely changed how I think about JavaScript. Strongly typed everything.'},
  {id: '3', text: 'Just shipped a new feature! The team worked incredibly hard on this one.'},
  {id: '4', text: 'Design systems are the backbone of scalable product development.'},
];

type SearchTab = 'top' | 'people' | 'posts' | 'tags';

export default function DiscoverScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [query,      setQuery]      = useState('');
  const [focused,    setFocused]    = useState(false);
  const [searchTab,  setSearchTab]  = useState<SearchTab>('top');
  const [following,  setFollowing]  = useState<Record<string, boolean>>({});
  const [activeTag,  setActiveTag]  = useState<string | null>(null);

  const headingOpacity  = useRef(new Animated.Value(1)).current;
  const headingTranslate = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(headingOpacity,   {duration: 200, toValue: 0, useNativeDriver: true}),
      Animated.timing(headingTranslate, {duration: 200, toValue: -20, useNativeDriver: true}),
    ]).start();
  };

  const handleBlur = () => {
    if (!query) {
      setFocused(false);
      Animated.parallel([
        Animated.timing(headingOpacity,   {duration: 200, toValue: 1, useNativeDriver: true}),
        Animated.timing(headingTranslate, {duration: 200, toValue: 0, useNativeDriver: true}),
      ]).start();
    }
  };

  const handleCancel = () => {
    setQuery('');
    setFocused(false);
    Animated.parallel([
      Animated.timing(headingOpacity,   {duration: 200, toValue: 1, useNativeDriver: true}),
      Animated.timing(headingTranslate, {duration: 200, toValue: 0, useNativeDriver: true}),
    ]).start();
  };

  const SEARCH_TABS: {id: SearchTab; label: string}[] = [
    {id: 'top',    label: 'Top'},
    {id: 'people', label: 'People'},
    {id: 'posts',  label: 'Posts'},
    {id: 'tags',   label: 'Tags'},
  ];

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView edges={['top']}>
        {/* Animated heading */}
        {!focused && (
          <Animated.View
            style={{opacity: headingOpacity, transform: [{translateY: headingTranslate}]}}>
            <Text style={[styles.heading, {color: colors.textPrimary}]}>Discover</Text>
          </Animated.View>
        )}

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: focused ? colors.primary : 'transparent',
              },
            ]}>
            <Feather
              color={colors.textSecondary}
              name="search"
              size={18}
              style={styles.searchIcon}
            />
            <TextInput
              onBlur={handleBlur}
              onChangeText={setQuery}
              onFocus={handleFocus}
              placeholder="Search people, posts, hashtags…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={[styles.searchInput, {color: colors.textPrimary}]}
              value={query}
            />
            {query.length > 0 && (
              <Pressable hitSlop={8} onPress={() => setQuery('')}>
                <Feather color={colors.textMuted} name="x" size={16} />
              </Pressable>
            )}
          </View>
          {focused && (
            <Pressable onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, {color: colors.primary}]}>Cancel</Text>
            </Pressable>
          )}
        </View>

        {/* Trending tags horizontal scroll — always visible when not searching */}
        {!focused && (
          <View style={styles.trendingSection}>
            <Text style={[styles.trendingLabel, {color: colors.textSecondary}]}>
              TRENDING
            </Text>
            <ScrollView
              contentContainerStyle={styles.tagsList}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {HASHTAGS.map(tag => {
                const isActive = activeTag === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setActiveTag(isActive ? null : tag)}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: isActive ? colors.primary : 'transparent',
                        borderColor: colors.primary,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.tagPillText,
                        {color: isActive ? '#fff' : colors.primary},
                      ]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Search tabs when searching */}
        {focused && query.length > 0 && (
          <View style={[styles.tabRow, {borderBottomColor: colors.border}]}>
            {SEARCH_TABS.map(tab => (
              <Pressable
                key={tab.id}
                onPress={() => setSearchTab(tab.id)}
                style={[
                  styles.tabItem,
                  searchTab === tab.id
                    ? {borderBottomColor: colors.primary, borderBottomWidth: 2}
                    : null,
                ]}>
                <Text
                  style={[
                    styles.tabLabel,
                    {color: searchTab === tab.id ? colors.primary : colors.textMuted},
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </SafeAreaView>

      {focused && query.length > 0 ? (
        /* Search results */
        <FlatList
          contentContainerStyle={styles.scrollContent}
          data={SUGGESTED_USERS}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={[styles.userRow, {borderBottomColor: colors.divider}]}>
              <Avatar name={item.name} size={44} />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, {color: colors.textPrimary}]}>
                  {item.name}
                </Text>
                <Text style={[styles.userHandle, {color: colors.textMuted}]}>
                  {'@' + item.name.toLowerCase().replace(/\s+/g, '_')}
                </Text>
              </View>
              <Pressable
                onPress={() => setFollowing(f => ({...f, [item.id]: !f[item.id]}))}
                style={[
                  styles.followBtn,
                  {
                    backgroundColor: following[item.id] ? 'transparent' : colors.primary,
                    borderColor: colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.followBtnText,
                    {color: following[item.id] ? colors.primary : '#fff'},
                  ]}>
                  {following[item.id] ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* Default discover state */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Suggested people */}
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Suggested People
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleScroll}>
            {SUGGESTED_USERS.map(u => (
              <View
                key={u.id}
                style={[
                  styles.personCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.primary,
                  },
                ]}>
                <Avatar name={u.name} size={56} />
                <Text numberOfLines={1} style={[styles.personName, {color: colors.textPrimary}]}>
                  {u.name}
                </Text>
                <Text numberOfLines={1} style={[styles.personHandle, {color: colors.textMuted}]}>
                  {'@' + u.name.toLowerCase().replace(/\s+/g, '_')}
                </Text>
                <Text style={[styles.mutualCount, {color: colors.textMuted}]}>
                  {u.mutual} mutuals
                </Text>
                <Pressable
                  onPress={() => setFollowing(f => ({...f, [u.id]: !f[u.id]}))}
                  style={[
                    styles.followCardBtn,
                    {
                      backgroundColor: following[u.id] ? 'transparent' : colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.followCardBtnText,
                      {color: following[u.id] ? colors.primary : '#fff'},
                    ]}>
                    {following[u.id] ? 'Following' : 'Follow'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Explore posts */}
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Explore Posts
          </Text>
          <View style={styles.exploreGrid}>
            {EXPLORE_POSTS.map(post => (
              <View
                key={post.id}
                style={[
                  styles.exploreCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderLeftColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}>
                <Text
                  numberOfLines={4}
                  style={[styles.exploreText, {color: colors.textSecondary}]}>
                  {post.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cancelBtn: {marginLeft: 10, paddingHorizontal: 4},
  cancelText: {fontSize: 15, fontWeight: '500'},
  container: {flex: 1},
  exploreCard: {
    borderLeftWidth: 3,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    padding: 14,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  exploreGrid: {paddingHorizontal: 16},
  exploreText: {fontSize: 14, lineHeight: 20},
  followBtn: {
    borderRadius: 9,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  followBtnText: {fontSize: 13, fontWeight: '600'},
  followCardBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    marginTop: 10,
    paddingVertical: 8,
    width: '100%',
  },
  followCardBtnText: {fontSize: 13, fontWeight: '600'},
  heading: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mutualCount: {fontSize: 11, marginTop: 2},
  peopleScroll: {paddingLeft: 16},
  personCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 12,
    padding: 16,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    width: 140,
  },
  personHandle: {fontSize: 12, marginTop: 1},
  personName: {fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center'},
  scrollContent: {paddingBottom: 100},
  searchBar: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    paddingRight: 12,
  },
  searchIcon: {paddingLeft: 12, paddingRight: 4},
  searchInput: {flex: 1, fontSize: 15},
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  tabItem: {alignItems: 'center', flex: 1, paddingVertical: 12},
  tabLabel: {fontSize: 14, fontWeight: '500'},
  tabRow: {borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', marginBottom: 8},
  tagPill: {
    borderRadius: 9999,
    borderWidth: 1,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagPillText: {fontSize: 12, fontWeight: '700'},
  tagsList: {paddingRight: 16},
  trendingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  trendingSection: {marginTop: 0},
  userHandle: {fontSize: 13, marginTop: 1},
  userInfo: {flex: 1, marginHorizontal: 12},
  userName: {fontSize: 15, fontWeight: '600'},
  userRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
