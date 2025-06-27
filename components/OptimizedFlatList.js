import React from 'react';
import { FlatList, Platform } from 'react-native';

/**
 * Composant FlatList optimisé pour Android et iOS
 * Inclut des optimisations spécifiques à chaque plateforme
 */
export default function OptimizedFlatList({
  data,
  renderItem,
  keyExtractor,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  removeClippedSubviews = Platform.OS === 'android',
  maxToRenderPerBatch = Platform.OS === 'android' ? 10 : 10,
  windowSize = Platform.OS === 'android' ? 10 : 21,
  initialNumToRender = Platform.OS === 'android' ? 5 : 10,
  getItemLayout,
  onEndReachedThreshold = 0.5,
  onEndReached,
  refreshing,
  onRefresh,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ...props
}) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      getItemLayout={getItemLayout}
      onEndReachedThreshold={onEndReachedThreshold}
      onEndReached={onEndReached}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      // Optimisations spécifiques à Android
      {...(Platform.OS === 'android' && {
        overScrollMode: 'never',
        scrollEventThrottle: 16,
        decelerationRate: 'fast',
      })}
      // Optimisations spécifiques à iOS
      {...(Platform.OS === 'ios' && {
        bounces: true,
        alwaysBounceVertical: false,
        scrollIndicatorInsets: { right: 1 },
      })}
      {...props}
    />
  );
} 