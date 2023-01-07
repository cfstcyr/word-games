use std::{ collections::HashSet };

use itertools::Itertools;

use crate::constants::{file::{IMPOSSIBLE_LETTERS, TIMEOUT_LETTERS}, letter_boxed::SIDE_LENGHT};

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

    pub fn get_existing_letters(&mut self, ignore_impossible: bool, ignore_timeout: bool) {
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

            if ignore_impossible && *objective == IMPOSSIBLE_LETTERS { continue; }
            if ignore_timeout && *objective == TIMEOUT_LETTERS { continue; }

            self.set.insert(ExistingLetters::to_string(letters));
        }
    }

    pub fn letters_exists(&self, letters: &Vec<Vec<char>>) -> bool {
        self.set.contains(&ExistingLetters::to_string(letters))
    }

    pub fn add_letters(&mut self, letters: &Vec<Vec<char>>) {
        self.set.insert(ExistingLetters::to_string(letters));
    }

    fn to_string(letters: &Vec<Vec<char>>) -> String {
        letters.clone()
            .into_iter()
            .map(|mut side| {
                side.sort();
                side.into_iter().collect::<String>()
            })
            .collect::<String>()
    }
}