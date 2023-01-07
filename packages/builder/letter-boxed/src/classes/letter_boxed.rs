use std::collections::HashMap;
use itertools::Itertools;
use queue::Queue;
use rand::random;
use substring::Substring;

use super::dictionary::DictionaryNode;
use crate::constants::file::IMPOSSIBLE_LETTERS;
use crate::constants::letter_boxed::{
    MIN_WORD_LENGTH,
    MAX_WORD_COUNT,
    ALPHABET,
    SIDE_LENGHT,
};
use crate::utils::array::first;
use crate::utils::string::unique_sort;

pub enum Objective {
    Value(usize),
    Impossible,
}

impl From<Objective> for i16 {
    fn from(obj: Objective) -> Self {
        match obj {
            Objective::Value(v) => i16::try_from(v).unwrap(),
            Objective::Impossible => IMPOSSIBLE_LETTERS,
        }
    }
}

pub struct LetterBoxed {}

impl LetterBoxed {
    pub fn check_words(words: &HashMap<char, Vec<String>>) -> Objective {
        let mut words_list: Vec<Vec<String>> = words
            .values()
            .cloned()
            .collect::<Vec<Vec<String>>>()
            .concat()
            .into_iter()
            .map(|w| vec![w])
            .collect();

        words_list.sort_by(|a, b|
            b.first().unwrap().len().cmp(&a.first().unwrap().len())
        );

        let mut stack: Queue<Vec<String>> = Queue::from(words_list);
        let mut current = stack.dequeue();

        while let Some(c) = current {
            if LetterBoxed::is_using_all_letters(&c) {
                return Objective::Value(c.len());
            } else if c.len() < MAX_WORD_COUNT {
                for next in words
                    .get(&c.concat().chars().last().unwrap())
                    .unwrap() {
                    if !LetterBoxed::is_word_redundant(&c, &next) {
                        let mut next_item = c.clone();
                        next_item.append(vec![next.clone()].as_mut());
                        stack.queue(next_item).unwrap();
                    }
                }
            }

            current = stack.dequeue();
        }

        Objective::Impossible
    }

    fn is_using_all_letters(words: &Vec<String>) -> bool {
        unique_sort(words.concat()).len() == 12
    }

    fn is_word_redundant(current: &Vec<String>, next: &String) -> bool {
        current.contains(next) ||
            (unique_sort(current.concat()) == unique_sort(next.clone()) &&
                current.concat().chars().last().unwrap() ==
                    next.chars().last().unwrap())
    }

    pub fn get_word_list(
        letters: &Vec<Vec<char>>,
        dict: &DictionaryNode
    ) -> HashMap<char, Vec<String>> {
        let mut map = HashMap::new();

        for letter in letters.concat() {
            map.insert(
                letter,
                LetterBoxed::get_word_list_for_letter(letters, letter, &dict)
            );
        }

        map
    }

    fn get_word_list_for_letter(
        letters: &Vec<Vec<char>>,
        letter: char,
        dict: &DictionaryNode
    ) -> Vec<String> {
        let start = dict.get_node(letter.into());

        let available_map = LetterBoxed::get_available_letters_map(letters);

        match start {
            Some(start) => {
                let mut words_map: HashMap<String, String> = HashMap::new();

                let mut stack: Vec<&DictionaryNode> = vec![];
                let mut current: Option<&DictionaryNode> = Some(start);

                while let Some(c) = current {
                    match &c.word {
                        Some(word) => {
                            if word.len() >= MIN_WORD_LENGTH {
                                words_map.insert(
                                    unique_sort(
                                        format!(
                                            "{}{}",
                                            word
                                                .to_string()
                                                .substring(0, word.len() - 1),
                                            word
                                                .to_string()
                                                .substring(
                                                    word.len() - 2,
                                                    word.len()
                                                )
                                        )
                                    ),
                                    word.into()
                                );
                            }
                        }
                        None => {}
                    }

                    for letter in available_map.get(&c.letter).unwrap() {
                        match c.get_node(letter.to_string()) {
                            Some(next) => stack.push(next),
                            None => {}
                        }
                    }

                    current = first(&mut stack);
                }

                let mut a = words_map
                    .into_iter()
                    .collect::<Vec<(String, String)>>();
                a.sort_by(|(k0, _), (k1, _)| k0.len().cmp(&k1.len()));

                a.into_iter()
                    .map(|(_, value)| value)
                    .collect()
            }
            None => Vec::new(),
        }
    }

    fn get_available_letters_map(
        letters: &Vec<Vec<char>>
    ) -> HashMap<char, Vec<char>> {
        let mut map = HashMap::new();

        for (i, side) in letters.iter().enumerate() {
            let available: Vec<char> = [&letters[0..i], &letters[i + 1..]]
                .concat()
                .concat();

            for letter in side {
                map.insert(*letter, available.clone());
            }
        }

        map
    }

    pub fn random_letters() -> Vec<Vec<char>> {
        let mut alphabet = ALPHABET.chars().collect_vec();
        let mut letters: Vec<char> = Vec::new();

        for _ in 0..12 {
            let index = random::<usize>() % alphabet.len();
            letters.push(alphabet[index]);
            alphabet.remove(index);
        }

        letters
            .chunks(SIDE_LENGHT)
            .map(|side|
                side
                    .into_iter()
                    .map(|c| *c)
                    .collect_vec()
            )
            .collect_vec()
    }
}