import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type ToastVariant = 'success' | 'error' | 'info';

type ToastMessage = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => undefined,
});

export function useToast(): ToastContextType {
  return useContext(ToastContext);
}

const VARIANT_COLORS: Record<ToastVariant, {bg: string; text: string}> = {
  error: {bg: '#EF4444', text: '#fff'},
  info: {bg: '#6C63FF', text: '#fff'},
  success: {bg: '#22C55E', text: '#fff'},
};

function ToastItem({
  message,
  variant,
  onHide,
}: {
  message: string;
  onHide: () => void;
  variant: ToastVariant;
}): React.JSX.Element {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        bounciness: 6,
        speed: 14,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 200,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 250,
          toValue: -80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 250,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 3000);

    return () => clearTimeout(timer);
  }, [opacity, translateY, onHide]);

  const {bg, text} = VARIANT_COLORS[variant];

  return (
    <Animated.View
      style={[
        styles.toast,
        {backgroundColor: bg, opacity, transform: [{translateY}]},
      ]}>
      <Text style={[styles.toastText, {color: text}]}>{message}</Text>
    </Animated.View>
  );
}

export function ToastProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = String(Date.now());
    setToasts(prev => [...prev, {id, message, variant}]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <View
        style={[styles.container, {top: insets.top + 8}]}
        pointerEvents="none">
        {toasts.map(t => (
          <ToastItem
            key={t.id}
            message={t.message}
            onHide={() => removeToast(t.id)}
            variant={t.variant}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 16,
    position: 'absolute',
    right: 16,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 14,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
