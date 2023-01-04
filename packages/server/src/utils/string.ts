export function uniform(str: string) {
    return str
        .replace(/[âäà]/g, 'a')
        .replace(/[ëêèé]/g, 'e')
        .replace(/[öô]/g, 'o')
        .replace(/[ûüù]/, 'u')
        .replace(/[ïî]/g, 'i')
        .replace(/[ç]/g, 'c');
}

export function unique(str: string, { sort = false }: { sort?: boolean } = {}) {
    const res = [...new Set(str.split(''))];
    return sort ? res.sort().join('') : res.join('');
}
