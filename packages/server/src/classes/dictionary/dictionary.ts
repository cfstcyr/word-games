import { uniform } from '../../utils/string';

/* eslint-disable @typescript-eslint/no-this-alias */
export type DictionaryNodeWord = Omit<DictionaryNode, 'word'> & {
    word: string;
};

export class DictionaryNode {
    letter: string;
    depth: number;
    nodes: Map<string, DictionaryNode>;
    word?: string;

    constructor(letter: string, depth: number) {
        this.letter = letter;
        this.depth = depth;
        this.nodes = new Map();
    }

    exists(word: string): boolean {
        return this.getNode(word)?.word !== undefined;
    }

    getNode(word: string): DictionaryNode | undefined {
        let node: DictionaryNode | undefined = this;

        for (const letter of word.split('')) {
            node = node?.nodes.get(letter);
            if (!node) return undefined;
        }

        return node;
    }

    hasWord(): this is DictionaryNodeWord {
        return this.word !== undefined;
    }

    *[Symbol.iterator]() {
        let stack: DictionaryNode[] = [...this.nodes.values()];
        let node: DictionaryNode | undefined;

        while ((node = stack.shift()) !== undefined) {
            yield node;
            stack = stack.concat(...node.nodes.values());
        }
    }

    *getWords(): Generator<DictionaryNodeWord> {
        for (const node of this) {
            if (node.hasWord()) yield node;
        }
    }
}

export class Dictionary extends DictionaryNode {
    constructor() {
        super('', -1);
    }

    build(words: string[]) {
        for (const word of words) {
            this.addWord(uniform(word));
        }
    }

    private addWord(word: string) {
        let node: DictionaryNode = this;

        for (let i = 0; i < word.length; ++i) {
            const letter = word.charAt(i);

            let child: DictionaryNode | undefined = node.nodes.get(letter);

            if (!child) {
                child = new DictionaryNode(letter, node.depth + 1);
                node.nodes.set(letter, child);
            }

            if (i === word.length - 1) {
                child.word = word;
            }

            node = child;
        }
    }
}
