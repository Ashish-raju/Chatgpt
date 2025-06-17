import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = spacing.medium;
        baseStyle.paddingVertical = spacing.small;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = spacing.large;
        baseStyle.paddingVertical = spacing.medium + 4;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = spacing.large;
        baseStyle.paddingVertical = spacing.medium;
        baseStyle.minHeight = 48;
        break;
    }

    // Width style
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    if (disabled) {
      baseStyle.backgroundColor = colors.buttonDisabled;
      baseStyle.borderColor = colors.buttonDisabled;
      baseStyle.borderWidth = 1;
    } else {
      switch (variant) {
        case 'secondary':
          baseStyle.backgroundColor = colors.buttonSecondary;
          baseStyle.borderColor = colors.border;
          baseStyle.borderWidth = 1;
          break;
        case 'outline':
          baseStyle.backgroundColor = 'transparent';
          baseStyle.borderColor = colors.primary;
          baseStyle.borderWidth = 2;
          break;
        case 'danger':
          baseStyle.backgroundColor = colors.error;
          baseStyle.borderColor = colors.error;
          baseStyle.borderWidth = 1;
          break;
        default: // primary
          baseStyle.backgroundColor = colors.buttonPrimary;
          baseStyle.borderColor = colors.buttonPrimary;
          baseStyle.borderWidth = 1;
          break;
      }
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 14;
        break;
      case 'large':
        baseTextStyle.fontSize = 18;
        break;
      default: // medium
        baseTextStyle.fontSize = 16;
        break;
    }

    // Color styles
    if (disabled) {
      baseTextStyle.color = colors.buttonDisabledText;
    } else {
      switch (variant) {
        case 'secondary':
          baseTextStyle.color = colors.buttonSecondaryText;
          break;
        case 'outline':
          baseTextStyle.color = colors.primary;
          break;
        case 'danger':
          baseTextStyle.color = colors.buttonPrimaryText;
          break;
        default: // primary
          baseTextStyle.color = colors.buttonPrimaryText;
          break;
      }
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? colors.primary : colors.buttonPrimaryText}
          style={{ marginRight: spacing.small }}
        />
      ) : null}
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
