import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type LoadOptions = {
  silent?: boolean;
};

export function useResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options: LoadOptions = {}) => {
      if (options.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const result = await loader();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loader],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    reload: load,
    refresh: () => load({ silent: true }),
  };
}
