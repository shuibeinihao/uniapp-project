import areas from '../assets/areas.json'

export const getAddress = (codeArr: Array<string> = []) => {
  let str = '';

  getTarget(areas, 0)
  function getTarget(arr, index) {
    const code = codeArr[index]
    if (!code) return;
    const target = arr.find(item => item.value === code);
    if (!target) return;

    str += target.label;
    if (target.children) {
      getTarget(target.children, index + 1)
    }
  }

  return str;
}

export const getTargetByName = (name: string) => {
  const targetList: Array<{ label: string; value: string; level: number }> = [];

  getListTarget(areas, 0)

  function getListTarget(list = [], level: number) {
    list.forEach(item => {
      if (item.label.includes(name)) {
        targetList.push({
          label: item.label, value: item.value, level
        })
      }
      if (item.children) {
        getListTarget(item.children, level + 1)
      }
    })

  }
  return targetList;
}

export const getLevelList = (level: number) => {
  const targetList: Array<{ label: string; value: string; }> = [];

  getListTarget(areas, 0)
  function getListTarget(list = [], curLevel: number) {
    list.forEach(item => {
      if (curLevel == level) {
        targetList.push({
          label: item.label, value: item.value
        })
        return;
      }
      if (item.children) {
        getListTarget(item.children, curLevel + 1)
      }
    })

  }
  return targetList;
}



