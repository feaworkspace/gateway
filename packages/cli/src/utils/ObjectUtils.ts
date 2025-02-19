export function get(object: any, property: string) {
    const parts = property.split('.');
    for (const part of parts) {
        if (!object) {
            return undefined;
        }
        object = object[part];
    }
    return object;
}

export function set(object: any, property: string, value: any) {
    const parts = property.split('.');
    const lastPart = parts.pop();
    for (const part of parts) {
        if (!object[part]) {
            object[part] = {};
        }
        object = object[part];
    }
    // @ts-ignore
    object[lastPart] = value;
}

export function map(object: any, callback: (key: string, value: any) => any) {
    const result: any = {};
    for (const key in object) {
        result[key] = callback(key, object[key]);
    }
    return result;
}

export function toArray(object: Record<string, any>, keyName: string = 'key') {
    if(!object || keyName !in object) {
        return [];
    }
    return Object.entries(object).map(([key, value]) => ({ [keyName]: key, ...value }));
}