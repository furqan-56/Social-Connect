import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type AuthTextInputProps = TextInputProps & {
  error?: string;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  touched?: boolean;
};

export default function AuthTextInput({
  error,
  label,
  prefix,
  suffix,
  touched,
  secureTextEntry,
  ...textInputProps
}: AuthTextInputProps): React.JSX.Element {
  const {colors} = useTheme();
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const showError = Boolean(touched && error);
  const isSec = secureTextEntry;

  return (
    <View style={styles.field}>
      {label ? (
        <Text style={[styles.label, {color: colors.textSecondary}]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.inputBackground,
            borderColor: showError ? colors.error : colors.border,
          },
        ]}>
        {prefix ? <View style={styles.prefixWrap}>{prefix}</View> : null}
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          style={[styles.input, {color: colors.textPrimary}]}
          {...textInputProps}
        />
        {isSec ? (
          <Pressable
            onPress={() => setSecure(s => !s)}
            style={styles.suffixWrap}>
            <Text style={[styles.eyeIcon, {color: colors.textMuted}]}>
              {secure ? '◎' : '⊘'}
            </Text>
          </Pressable>
        ) : suffix ? (
          <View style={styles.suffixWrap}>{suffix}</View>
        ) : null}
      </View>
      {showError ? (
        <Text style={[styles.error, {color: colors.error}]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 12,
    marginTop: 5,
  },
  eyeIcon: {
    fontSize: 16,
  },
  field: {
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  inputRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 7,
  },
  prefixWrap: {
    marginRight: 8,
  },
  suffixWrap: {
    marginLeft: 8,
    padding: 4,
  },
});
