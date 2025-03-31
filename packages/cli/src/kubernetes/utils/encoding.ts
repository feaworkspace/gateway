export function dataValuesToBase64(data: Record<string, string>): Record<string, string> {
  return Object.entries(data).reduce((acc, [key, value]) => {
    // @ts-ignore
    acc[key] = btoa(value.toString());
    return acc;
  }, {});
}

export function dataValuesFromBase64(data: Record<string, string>): Record<string, string> {
  return Object.entries(data).reduce((acc, [key, value]) => {
    // @ts-ignore
    acc[key] = atob(value.toString());
    return acc;
  }, {});
}

export function valuesToString(data: Record<string, any>): Record<string, string> {
  return Object.entries(data).reduce((acc, [key, value]) => {
    // @ts-ignore
    acc[key] = value.toString();
    return acc;
  }, {});}