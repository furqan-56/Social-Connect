import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';

type AuthScreenFrameProps = {
  children: React.ReactNode;
  notice?: string;
};

export default function AuthScreenFrame({
  children,
  notice,
}: AuthScreenFrameProps): React.JSX.Element {
  const {colors} = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {notice ? (
          <Text
            style={[
              styles.notice,
              {
                backgroundColor: colors.success + '18',
                borderColor: colors.success + '40',
                color: colors.success,
              },
            ]}>
            {notice}
          </Text>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  notice: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  safeArea: {
    flex: 1,
  },
});
