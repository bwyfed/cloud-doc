export const flattenArr = arr => {
  return arr.reduce((map, item) => {
    // 归并
    map[item.id] = item;
    return map;
  }, {});
};

export const objToArr = obj => {
  return Object.keys(obj).map(key => obj[key]);
};
