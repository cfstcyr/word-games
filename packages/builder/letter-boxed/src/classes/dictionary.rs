use std::{ collections::HashMap, fs };

use crate::utils::string::uniform;

#[derive(Debug)]
pub struct DictionaryNode {
    pub letter: char,
    pub nodes: HashMap<char, DictionaryNode>,
    pub word: Option<String>,
}

impl DictionaryNode {
    pub fn new(letter: char) -> DictionaryNode {
        DictionaryNode {
            letter,
            nodes: HashMap::new(),
            word: Option::None,
        }
    }

    pub fn new_from_words<T>(words: T) -> DictionaryNode where T: Iterator<Item = String> {
        let mut dict = DictionaryNode::new(' ');

        for word in words {
            dict.add_word(uniform(word.into()));
        }

        dict
    }

    pub fn new_from_path(path: String) -> DictionaryNode {
        let content = fs
            ::read_to_string(path)
            .expect("Dictionary file not found");

        DictionaryNode::new_from_words(
            content.split('\n').map(str::to_string)
        )
    }

    pub fn get_node(&self, word: String) -> Option<&DictionaryNode> {
        let mut node = Option::Some(self);

        for c in word.chars() {
            node = match node {
                Some(n) => n.nodes.get(&c),
                None => Option::None,
            };

            if node.is_none() {
                return Option::None;
            }
        }

        node
    }

    pub fn add_word(&mut self, word: String) {
        let mut node: &mut DictionaryNode = self;

        for c in word.chars() {
            node = node.nodes.entry(c).or_insert(DictionaryNode::new(c));
        }

        node.word = word.into();
    }
}