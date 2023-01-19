mod constants;
mod utils;
mod classes;

use std::{
    fs::{  OpenOptions },
    sync::{ Mutex, Arc },
    io::Write,
    time::Duration,
};

use itertools::Itertools;
use classes::{
    dictionary::DictionaryNode,
    letter_boxed::LetterBoxed,
    existing_letters::ExistingLetters,
};
use threadpool::ThreadPool;
use colored::{ Colorize, ColoredString };
use utils::threads::{ timeout_thread, TimeoutThread };

use crate::{constants::file::TIMEOUT_LETTERS, classes::letter_boxed::Objective};

const CONCURRENCY: usize = 20;
const FILE_PATH: &str = "words.txt";
const TIMEOUT: Duration = Duration::from_secs(300);

fn color(i: &usize) -> ColoredString {
    match i % 5 {
        0 => format!("{}", i).yellow(),
        1 => format!("{}", i).magenta(),
        2 => format!("{}", i).purple(),
        3 => format!("{}", i).cyan(),
        4 => format!("{}", i).bright_green(),
        _ => format!("{}", i).bold(),
    }
}

fn main() {
    let dict = DictionaryNode::new_from_path(
        "assets/dictionaries/fr.txt".into()
    );

    let mut existing_letters = ExistingLetters::new(&FILE_PATH.into());

    existing_letters.get_existing_letters(false, false);

    let dictionary = Arc::new(Mutex::new(dict));
    let file = Arc::new(
        Mutex::new(
            OpenOptions::new().write(true).append(true).open(FILE_PATH).unwrap()
        )
    );

    let pool = ThreadPool::new(CONCURRENCY);
    let mut i = 0;

    loop {
        let letters = LetterBoxed::random_letters();

        if existing_letters.letters_exists(&letters) {
            continue;
        }
        existing_letters.add_letters(&letters);

        let dictionary = dictionary.clone();
        let file = file.clone();

        pool.execute(move || {
            let letters_chunk: Arc<Mutex<Vec<Vec<char>>>> = Arc::new(
                Mutex::new(letters)
            );

            let f1 = file.clone();
            let l1 = letters_chunk.clone();

            let completion = timeout_thread(move || {
                let dict = dictionary.lock().unwrap();
                let letters_chunk_lock = l1.lock().unwrap();

                println!(
                    "{}:\t{} for {:?}",
                    color(&i),
                    "Start".bold().blue(),
                    letters_chunk_lock
                );

                let words = LetterBoxed::get_word_list(
                    &letters_chunk_lock,
                    &dict
                );

                drop(dict);
                drop(letters_chunk_lock);

                let objective = LetterBoxed::check_words(&words);

                match objective {
                    Objective::Value(value) =>
                        println!(
                            "{}:\t{} {}",
                            color(&i),
                            "Success".bold().green(),
                            value
                        ),
                    Objective::Impossible =>
                        println!(
                            "{}:\t{}",
                            color(&i),
                            "Impossible".bold().red()
                        ),
                }

                if
                    let Err(e) = writeln!(
                        f1.lock().unwrap(),
                        "\"{}\",{}",
                        l1.lock().unwrap().concat().into_iter().join(","),
                        i16::from(objective),
                    )
                {
                    eprintln!("Cannot write to file:{}", e);
                }
            }, TIMEOUT);

            match completion {
                TimeoutThread::Timeout => {
                    println!("{}:\t{}", color(&i), "Timeout".bold().red());

                    if
                        let Err(e) = writeln!(
                            file.lock().unwrap(),
                            "\"{}\",{}",
                            letters_chunk
                                .lock()
                                .unwrap()
                                .concat()
                                .into_iter()
                                .join(","),
                            TIMEOUT_LETTERS
                        )
                    {
                        eprintln!("Cannot write to file:{}", e);
                    }
                }
                _ => {}
            }

            println!("{}:\t{}", color(&i), "Completed".bold());
        });

        while pool.active_count() > CONCURRENCY {}

        i += 1;
    }
}