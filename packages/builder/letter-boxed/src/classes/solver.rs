use std::{ collections::HashMap };

use itertools::Itertools;
use queue::Queue;

use super::{
    dictionary::DictionaryNode,
    letter_boxed::{ LetterBoxed, WordsList },
};

type WordsMap = HashMap<char, HashMap<char, Vec<String>>>;

pub struct Solver {
    letters: Vec<Vec<char>>,
}

impl Solver {
    pub fn new(letters: &Vec<Vec<char>>) -> Solver {
        Solver { letters: letters.clone() }
    }

    pub fn from_letters(letters: [[char; 3]; 4]) -> Solver {
        Solver::new(&Solver::letters_from_iter(letters))
    }

    pub fn solve(&self, dict: &DictionaryNode) -> Option<usize> {
        let words_list = LetterBoxed::get_word_list(&self.letters, &dict);
        let words_map = self.get_words_map(&words_list);
        let significants_words = self.get_significants_words(&words_list);

        let mut stack: Queue<Vec<&String>> = Queue::from(
            significants_words
                .into_iter()
                .map(|w| vec![w])
                .collect_vec()
        );

        let mut i = 0;
        while let Some(current) = stack.dequeue() {
            let remaining_letters = self.get_remaning_letters(&current);

            // println!("Try {:?} (left: {}, {:?})", current, remaining_letters.len(), remaining_letters);

            if remaining_letters.len() == 0 {
                println!("\nSuccess ({}): {:?}", i, current);
                return Some(current.len());
            }

            let last_letter = self.get_last_letter(&current);

            if let Some(last_letter) = last_letter {
                for letter in remaining_letters {
                    if let Some(words) = words_map.get(&last_letter)?.get(&letter) {
                        for word in words {
                            let mut next = current.clone();
                            next.push(word);
                            stack.queue(next).unwrap();
                        }
                    }
                }
            }

            i += 1;
        }

        None
    }

    pub fn get_words_map(&self, words_list: &WordsList) -> WordsMap {
        let mut words_map: WordsMap = HashMap::new();

        for letter in words_list.keys() {
            let mut letter_map: HashMap<char, Vec<String>> = HashMap::new();

            if let Some(letter_words_list) = words_list.get(letter) {
                for word in letter_words_list {
                    let chars = word.chars().unique().collect::<Vec<char>>();

                    for c in chars {
                        if c == *letter {
                            continue;
                        }

                        let v = letter_map.get(&c);

                        letter_map.insert(c, match v {
                            Some(v) => {
                                let mut v = v.clone();
                                v.push(word.to_string());
                                v
                            }
                            None => vec![word.to_string()],
                        });
                    }
                }
            }

            words_map.insert(*letter, letter_map);
        }

        words_map
    }

    fn get_remaning_letters(&self, current: &Vec<&String>) -> Vec<char> {
        let a = current.clone().iter().map(|w| w.to_string()).join("");
        self.letters_iter().into_iter().filter(|b| !a.contains(*b)).collect::<Vec<char>>()
    }

    fn get_last_letter(&self, current: &Vec<&String>) -> Option<char> {
        current.last()?.chars().last()
    }

    fn letters_iter(&self) -> Vec<char> {
        self.letters.concat()
    }

    pub fn get_significants_words<'a>(
        &self,
        words_list: &'a WordsList
    ) -> Vec<&'a String> {
        let mut words = words_list.values().flatten().collect::<Vec<&String>>();

        words.sort_by(|a, b|
            b
                .chars()
                .unique()
                .collect::<Vec<char>>()
                .len()
                .cmp(&a.chars().unique().collect::<Vec<char>>().len())
        );

        words[0..words.len() / 3].to_vec()
    }

    pub fn letters_from_iter(letters: [[char; 3]; 4]) -> Vec<Vec<char>> {
        letters
            .into_iter()
            .map(|s| s.into_iter().collect::<Vec<char>>())
            .collect::<Vec<Vec<char>>>()
    }
}