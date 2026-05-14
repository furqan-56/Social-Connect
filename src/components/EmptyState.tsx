import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type EmptyStateProps = {
  ctaLabel?: string;
  heading: string;
  illustration?: string;
  onCta?: () => void;
  subtext?: string;
};

export default function EmptyState({
  ctaLabel,
  heading,
  illustration = '◯',
  onCta,
  subtext,
}: EmptyStateProps): React.JSX.Element {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.illustrationWrap, {backgroundColor: colors.surface}]}>
        <Text style={[styles.illustration, {color: colors.primary}]}>
          {illustration}
        </Text>
      </View>
      <Text style={[styles.heading, {color: colors.textPrimary}]}>{heading}</Text>
      {subtext ? (
        <Text style={[styles.subtext, {color: colors.textSecondary}]}>{subtext}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <Pressable
          onPress={onCta}
          style={({pressed}) => [
            styles.cta,
            {backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1},
          ]}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
  },
  cta: {
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  illustration: {
    fontSize: 56,
    lineHeight: 64,
  },
  illustrationWrap: {
    alignItems: 'center',
    borderRadius: 9999,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
});
