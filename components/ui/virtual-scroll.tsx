"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { FixedSizeGrid as Grid } from "react-window";

interface VirtualListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: any }) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualList({
  items,
  height,
  itemHeight,
  renderItem,
  className = "",
  overscanCount = 5,
}: VirtualListProps) {
  const itemData = useMemo(() => items, [items]);

  return (
    <div className={`virtual-list ${className}`}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
      >
        {({ index, style, data }) => renderItem({ index, style, item: data[index] })}
      </List>
    </div>
  );
}

interface VirtualGridProps {
  items: any[];
  height: number;
  width: number;
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  renderItem: (props: { 
    columnIndex: number; 
    rowIndex: number; 
    style: React.CSSProperties; 
    item: any;
  }) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualGrid({
  items,
  height,
  width,
  columnCount,
  rowHeight,
  columnWidth,
  renderItem,
  className = "",
  overscanCount = 5,
}: VirtualGridProps) {
  const itemData = useMemo(() => items, [items]);
  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <div className={`virtual-grid ${className}`}>
      <Grid
        height={height}
        width={width}
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        itemData={itemData}
        overscanCount={overscanCount}
      >
        {({ columnIndex, rowIndex, style }) => {
          const itemIndex = rowIndex * columnCount + columnIndex;
          const item = itemData[itemIndex];
          
          if (!item) {
            return <div style={style} />;
          }
          
          return renderItem({ columnIndex, rowIndex, style, item });
        }}
      </Grid>
    </div>
  );
}

// Hook for virtual scrolling with search/filter
export function useVirtualScroll<T>(
  items: T[],
  searchTerm: string = "",
  searchFields: (keyof T)[] = []
) {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      const filtered = items.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (typeof value === "number") {
            return value.toString().includes(searchTerm);
          }
          return false;
        });
      });
      
      setFilteredItems(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [items, searchTerm, searchFields]);

  return {
    filteredItems,
    isSearching,
    totalItems: items.length,
    filteredCount: filteredItems.length,
  };
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean = true,
  threshold: number = 100
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreItems && !loading) {
            loadMore();
          }
        },
        { threshold }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreItems, loading]);

  const loadMore = async () => {
    if (loading || !hasMoreItems) return;

    setLoading(true);
    try {
      const newItems = await fetchMore();
      setItems((prev) => [...prev, ...newItems]);
      
      if (newItems.length === 0) {
        setHasMoreItems(false);
      }
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setItems([]);
    setHasMoreItems(hasMore);
    setLoading(false);
  };

  return {
    items,
    loading,
    hasMoreItems,
    loadingRef,
    loadMore,
    reset,
  };
}

// Performance optimized list item component
export function OptimizedListItem({
  index,
  style,
  item,
  renderContent,
}: {
  index: number;
  style: React.CSSProperties;
  item: any;
  renderContent: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <div style={style} className="virtual-list-item">
      {renderContent(item, index)}
    </div>
  );
}

// Memoized list item for better performance
export const MemoizedListItem = React.memo(OptimizedListItem);

// Virtual scrolling with dynamic heights
export function DynamicVirtualList({
  items,
  height,
  getItemHeight,
  renderItem,
  className = "",
}: {
  items: any[];
  height: number;
  getItemHeight: (index: number) => number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: any }) => React.ReactNode;
  className?: string;
}) {
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  useEffect(() => {
    const heights = items.map((_, index) => getItemHeight(index));
    setItemHeights(heights);
  }, [items, getItemHeight]);

  const totalHeight = itemHeights.reduce((sum, height) => sum + height, 0);

  return (
    <div className={`dynamic-virtual-list ${className}`} style={{ height }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {items.map((item, index) => {
          const itemHeight = itemHeights[index] || 0;
          const offsetTop = itemHeights.slice(0, index).reduce((sum, h) => sum + h, 0);
          
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: offsetTop,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem({ index, style: {}, item })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
