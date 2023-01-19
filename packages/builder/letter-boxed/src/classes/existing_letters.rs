use std::{ collections::HashSet };

use itertools::Itertools;
use rand::random;

use crate::constants::{
    file::{ IMPOSSIBLE_LETTERS, TIMEOUT_LETTERS },
    letter_boxed::SIDE_LENGHT,
};

pub struct ExistingLetters {
    path: String,
    set: HashSet<String>,
}

impl ExistingLetters {
    pub fn new(path: &String) -> ExistingLetters {
        ExistingLetters {
            path: path.clone(),
            set: HashSet::new(),
        }
    }

    fn get_existing_letters_predicate(
        &mut self,
        predicate: impl Fn(&Vec<Vec<char>>, &i16) -> bool,
    ) {
        let mut rdr = csv::Reader::from_path(&self.path).unwrap();

        for result in rdr.records() {
            let record = result.unwrap();

            let letters = &record[0]
                .split(",")
                .collect::<String>()
                .chars()
                .chunks(SIDE_LENGHT)
                .into_iter()
                .map(|s| s.collect_vec())
                .collect::<Vec<Vec<char>>>();
            let objective = &record[1].parse::<i16>().unwrap();

            if predicate(letters, objective) {
                self.set.insert(ExistingLetters::to_string(letters));
            }
        }
    }

    pub fn get_existing_letters(&mut self) {
        self.get_existing_letters_predicate(|_, objective| *objective != TIMEOUT_LETTERS && *objective != IMPOSSIBLE_LETTERS)
    }

    pub fn get_existing_letters_only_timeout(&mut self) {
        self.get_existing_letters_predicate(|_, objective| *objective == TIMEOUT_LETTERS)
    }

    pub fn get_existing_letters_only_impossible(&mut self) {
        self.get_existing_letters_predicate(|_, objective| *objective == IMPOSSIBLE_LETTERS)
    }

    pub fn letters_exists(&self, letters: &Vec<Vec<char>>) -> bool {
        self.set.contains(&ExistingLetters::to_string(letters))
    }

    pub fn add_letters(&mut self, letters: &Vec<Vec<char>>) {
        self.set.insert(ExistingLetters::to_string(letters));
    }

    pub fn get_random(&self) -> Vec<Vec<char>> {
        let index = random::<usize>() % self.set.len();
        self.set
            .clone()
            .into_iter()
            .collect::<Vec<String>>()
            .get(index)
            .unwrap()
            .chars()
            .chunks(3)
            .into_iter()
            .map(|l| l.into_iter().collect::<Vec<char>>())
            .collect::<Vec<Vec<char>>>()
    }

    fn to_string(letters: &Vec<Vec<char>>) -> String {
        letters
            .clone()
            .into_iter()
            .map(|mut side| {
                side.sort();
                side.into_iter().collect::<String>()
            })
            .collect::<String>()
    }
}