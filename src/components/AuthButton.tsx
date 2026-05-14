import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type AuthButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  title: string;
  variant?: 'primary' | 'outlined' | 'ghost';
};

export default function AuthButton({
  disabled,
  loading,
  onPress,
  style,
  title,
  variant = 'primary',
}: AuthButtonProps): React.JSX.Element {
  const {colors} = useTheme();
  const isDisabled = disabled || loading;

  const bgColor =
    variant === 'primary'
      ? colors.primary
      : 'transparent';

  const borderColor =
    variant === 'outlined' ? colors.primary : 'transparent';

  const textColor =
    variant === 'primary'
      ? '#fff'
      : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'outlined' ? 1.5 : 0,
          opacity: pressed || isDisabled ? 0.75 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.title, {color: textColor}]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
