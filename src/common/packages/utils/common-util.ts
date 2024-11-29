export const capitalInit = (input: string) => {
  const cleanedInput = input.replace(/\s+/g, " ").trim();
  const words = cleanedInput.split(" ");
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      return word;
    }
  });
  return capitalizedWords.join(" ");
};

export const changedFields = (newData: any, oldData: any = {}) => {
  const changedFields: { name: string; old: string; new: string }[] = [];
  // if (!oldData || !newData) return changedFields;
  for (const key in newData) {
    if (key === "updated" || key === "created" || key.startsWith("_") || key.includes("$")) continue;
    if (Array.isArray(newData[key])) {
      if (!compareArrays(newData[key], oldData[key] ?? [])) {
        changedFields.push(getChangeLog(newData, oldData, key));
      }
    } else if (typeof newData[key] === "object") {
      if (!compareObjects(newData[key], oldData[key] ?? {})) {
        changedFields.push(getChangeLog(newData, oldData, key));
      }
    } else if (newData[key] !== (oldData[key] ?? "")) {
      changedFields.push(getChangeLog(newData, oldData, key));
    }
  }
  return changedFields;
};

const getChangeLog = (newData: any, oldData: any, key: string) => {
  const changeLog = {
    name: key,
    old: oldData[key] ?? "",
    new: newData[key],
  };
  return changeLog;
};

const compareArrays = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const aItem = a[i];
    const bItem = b[i];
    if (Array.isArray(aItem) && Array.isArray(bItem)) {
      if (!compareArrays(aItem, bItem)) return false;
    } else if (typeof aItem === "object" && typeof bItem === "object") {
      if (!compareObjects(aItem, bItem)) return false;
    } else if (aItem !== bItem) return false;
  }
  return true;
};

const compareObjects = (a: any, b: any) => {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
