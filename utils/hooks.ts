import request from "./request";
import { resetParams } from './index'
import { ref } from 'vue'
import { onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";

/**
 * 普通请求
 * @example
 * ```
 * const { state, run, setLoading } = useRequest<Account.List>({
 *   url: getAccountListUrl,
 * })
 * ``` 
 */
export function useRequest<T>(data: {
  url: string;
  method?: string;
  params?: Record<string, any>;
  manual?: boolean;
  formatted?(data: T): any;
}) {
  const { url, method = 'POST', params = {}, manual, formatted } = data;

  const state = ref<{
    data?: T;
    loading: boolean;
    params: Record<string, any>;
  }>({
    loading: false,
    params: params
  })

  const run = (params: Record<string, any> = {}) => {
    const mergeParams = resetParams({ ...state.value.params, ...params });
    // state.value.loading = true;
    request({
      url, method, data: mergeParams
    }).then(res => {
      state.value = {
        data: formatted ? formatted(res.data || res) : (res.data || res),
        loading: false,
        params: mergeParams
      }
    }).catch((err) => {
      uni.showToast({
        icon: 'none',
        title: err?.message || '网络异常'
      })
    })
  }

  if (!manual) {
    run()
  }

  const setLoading = (loading: boolean) => state.value.loading = loading

  return {
    state,
    run,
    setLoading
  }
}

/**
 * 分页加载
 * @example
 * ```
 * const { state, loadStart, loadMore, setLoading } = useListRequest<Account.List>({
 *   url: getAccountListUrl,
 * })
 * ``` 
 */
export function useListRequest<T>(data: {
  url: string;
  method?: string;
  defaultParams?: Record<string, any>;
  /** 是否手动 */
  manual?: boolean;
  rowKey?: string;
}) {
  const { url, method = 'POST', defaultParams = {}, manual, rowKey = 'id' } = data;

  const state = ref<{
    rows: Array<T>;
    total: number;
    current: number;
    loading: boolean;
    params: Record<string, any>;
    hasMore: boolean;
  }>({
    rows: [],
    total: 0,
    current: 1,
    loading: false,
    params: defaultParams,
    hasMore: true,
  })

  const loadStart = (params: Record<string, any> = {}) => {
    const mergeParams = resetParams({ pageSize: 10, pageNum: 1, ...defaultParams, ...params });
    state.value.loading = true;
    request({
      url, method, data: mergeParams
    }).then(res => {
      const { rows = [], current, total, size, pages } = res;
      state.value = {
        ...state.value,
        loading: false,
        params: mergeParams,
        rows,
        current,
        total,
        hasMore: pages > current,
      }
      uni.stopPullDownRefresh()
    }).catch((err) => {
      state.value = {
        ...state.value,
        loading: false,
        rows: [],
        current: 1,
        total: 0,
        hasMore: true,
      }
      uni.showToast({
        icon: 'none',
        title: err?.message || '网络异常'
      })
      uni.stopPullDownRefresh()
    })
  }

  const loadMore = (params: Record<string, any> = {}) => {
    const current = state.value.current;
    const mergeParams = resetParams({ ...state.value.params, ...params, pageNum: current + 1 });
    state.value.loading = true;

    request({
      url, method, data: mergeParams
    }).then(res => {
      const { rows = [], current, total, size, pages } = res;
      const newRows = [...state.value.rows];
      rows.forEach(item => {
        if (newRows.every(ele => ele[rowKey] !== item[rowKey])) {
          newRows.push(item)
        }
      })
      state.value = {
        ...state.value,
        loading: false,
        params: mergeParams,
        rows: newRows,
        current,
        total,
        hasMore: pages > current,
      }
    }).catch((err) => {
      state.value.loading = false;
      uni.showToast({
        icon: 'none',
        title: err?.message || '网络异常'
      })
    })
  }

  if (!manual) {
    loadStart()
  }

  onReachBottom(() => {
    if (state.value.hasMore) {
      loadMore()
    }
  })

  onPullDownRefresh(() => {
    if (state.value.loading) return;
    loadStart(state.value.params)
  })

  const setLoading = (loading: boolean) => state.value.loading = loading

  return {
    state,
    loadStart,
    loadMore,
    setLoading
  }
}

export function useAuth(codes: string[]) {
  const menus = uni.getStorageSync('menus');

  return codes.map((code) => {
    if (!menus || !code) return false;

    return menus.some((item) => item.menuCode === code);
  });
}