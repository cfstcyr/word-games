use classes::{ solver::Solver, dictionary::DictionaryNode };

use crate::classes::{
    letter_boxed::{LetterBoxed, Objective},
    existing_letters::{ self, ExistingLetters },
};
mod constants;
mod types;
mod utils;
mod classes;

const FILE_PATH: &str = "words.txt";

fn main() {
    // let letters = [
    //     ['a', 'b', 'c'],
    //     ['d', 'e', 'f'],
    //     ['g', 'h', 'i'],
    //     ['j', 'm', 'u'],
    // ];
    let letters= [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['m', 'n', 's']];
    let mut existing_letters = ExistingLetters::new(&FILE_PATH.into());
    existing_letters.get_existing_letters();

    // let letters = existing_letters.get_random();

    let dict = DictionaryNode::new_from_path(
        "assets/dictionaries/fr.txt".into()
    );

    // ========

    let solver = Solver::from_letters(letters);

    println!("Start {:?}", letters);

    match solver.solve(&dict) {
        Some(_) => println!("Success!"),
        None => println!("Impossible"),
    }

    // =========

    let words = LetterBoxed::get_word_list(
        &letters
            .map(|l| l.into_iter().collect::<Vec<char>>())
            .into_iter()
            .collect::<Vec<Vec<char>>>(),
        &dict
    );
    let objective = LetterBoxed::check_words(&words);

    match objective {
        Objective::Value(_) => println!("Success!"),
        Objective::Impossible => println!("Impossible"),
    }

    // =========
}