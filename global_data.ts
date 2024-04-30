type GlobalData = Partial<{
  /** 推荐人id */
  referrerId: string;
  /** 推荐人信息 */
  referrerInfo: any;
}>;

const globalData: GlobalData = {};

export function setGlobalData<K extends keyof GlobalData>(
  key: K,
  val: GlobalData[K]
) {
  globalData[key] = val;
}

export function getGlobalData<K extends keyof GlobalData>(
  key: K
): GlobalData[K] {
  return globalData[key];
}
