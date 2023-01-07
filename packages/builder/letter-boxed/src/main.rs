mod constants;
mod utils;
mod classes;

use std::{
    fs::{ self, OpenOptions },
    sync::{ Mutex, Arc },
    collections::HashSet,
    io::Write,
    time::Duration,
};

use itertools::Itertools;
use classes::{ dictionary::DictionaryNode, letter_boxed::LetterBoxed };
use threadpool::ThreadPool;
use colored::{ Colorize, ColoredString };
use utils::threads::{ timeout_thread, TimeoutThread };

const ALPHABET: &str = "abcdefghijklmnopqrstuvwxyz";
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

    let already_found = String::from_utf8_lossy(&fs::read(FILE_PATH).unwrap())
        .parse::<String>()
        .unwrap();

    let existing_values: HashSet<usize> = HashSet::from_iter(
        already_found
            .split_whitespace()
            .map(|line|
                line
                    .split(",")
                    .into_iter()
                    .collect::<Vec<&str>>()
                    .first()
                    .unwrap()
                    .parse::<usize>()
                    .unwrap()
            )
            .collect::<Vec<usize>>()
    );

    let dictionary = Arc::new(Mutex::new(dict));
    let file = Arc::new(
        Mutex::new(
            OpenOptions::new().write(true).append(true).open(FILE_PATH).unwrap()
        )
    );

    let pool = ThreadPool::new(CONCURRENCY);

    for (i, letters) in ALPHABET.chars()
        .into_iter()
        .combinations(12)
        .enumerate() {
        if existing_values.contains(&i) {
            continue;
        }

        let dictionary = dictionary.clone();
        let file = file.clone();

        pool.execute(move || {
            let letters_chunk: Arc<Mutex<Vec<Vec<char>>>> = Arc::new(
                Mutex::new(
                    letters
                        .chunks(3)
                        .collect::<Vec<&[char]>>()
                        .into_iter()
                        .map(|side| side.to_vec())
                        .collect()
                )
            );

            let f1 = file.clone();
            let l1 = letters_chunk.clone();

            let completion = timeout_thread(
                move || {
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

                    let a: i8 = match objective {
                        Some(o) => i8::try_from(o).unwrap(),
                        None => -1,
                    };

                    match objective {
                        Some(o) =>
                            println!(
                                "{}:\t{} {}",
                                color(&i),
                                "Success".bold().green(),
                                o
                            ),
                        None =>
                            println!(
                                "{}:\t{}",
                                color(&i),
                                "Impossible".bold().red()
                            ),
                    }

                    if
                        let Err(e) = writeln!(
                            f1.lock().unwrap(),
                            "{},\"{}\",{}",
                            &i,
                            l1.lock().unwrap().concat().into_iter().join(","),
                            a
                        )
                    {
                        eprintln!("Cannot write to file:{}", e);
                    }
                },
                TIMEOUT
            );

            match completion {
                TimeoutThread::Timeout => {
                    println!("{}:\t{}", color(&i), "Timeout".bold().red());

                    if
                        let Err(e) = writeln!(
                            file.lock().unwrap(),
                            "{},\"{}\",{}",
                            &i,
                            letters_chunk.lock().unwrap().concat().into_iter().join(","),
                            -2
                        )
                    {
                        eprintln!("Cannot write to file:{}", e);
                    }
                }
                _ => {}
            }

            println!("{}:\t{}", color(&i), "Completed".bold());
        });
    }

    while pool.active_count() > 0 {}
}