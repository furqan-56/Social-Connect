import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

export const wp = (percent: number): number => (width * percent) / 100;
export const hp = (percent: number): number => (height * percent) / 100;

export const isSmallDevice = width < 375;
export const isLargeDevice = width >= 414;
