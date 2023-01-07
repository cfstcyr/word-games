pub fn first<T>(vec: &mut Vec<T>) -> Option<T> {
    match vec.is_empty() {
        true => None,
        false => Some(vec.remove(0))
    }
}