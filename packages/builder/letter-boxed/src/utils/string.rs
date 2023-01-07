use std::collections::HashSet;

pub fn uniform(str: String) -> String {
    str
        .replace("â", "a")
        .replace("ä", "a")
        .replace("à", "a")
        .replace("ë", "e")
        .replace("ê", "e")
        .replace("è", "e")
        .replace("é", "e")
        .replace("û", "u")
        .replace("ü", "u")
        .replace("ù", "u")
        .replace("î", "i")
        .replace("ï", "i")
        .replace("ç", "c")
}

pub fn unique_sort(str: String) -> String {
    let mut vector = <HashSet<char> as IntoIterator>::into_iter(HashSet::from_iter(str.chars())).collect::<Vec<char>>();
    vector.sort();
    vector.into_iter().collect()
}