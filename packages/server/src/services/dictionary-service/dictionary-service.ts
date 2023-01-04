import { Dictionary } from '../../classes/dictionary/dictionary';
import { readFileSync } from 'fs';
import { singleton } from 'tsyringe';

@singleton()
export class DictionaryService {
    private dictionaries: Map<string, Dictionary>;

    constructor() {
        this.dictionaries = new Map();
    }

    add(name: string, dictionary: Dictionary) {
        this.dictionaries.set(name, dictionary);
    }

    addFromWords(name: string, words: string[]) {
        const dictionary = new Dictionary();
        dictionary.build(words);
        this.add(name, dictionary);
    }

    addFromPath(name: string, path: string) {
        const words = readFileSync(path, 'utf-8').split('\n');
        this.addFromWords(name, words);
    }

    get(name: string): Dictionary {
        const dicitonary = this.dictionaries.get(name);
        if (!dicitonary)
            throw new Error(`Dictionary not found for name "${name}"`);
        return dicitonary;
    }
}
