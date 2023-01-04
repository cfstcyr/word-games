import { registry } from 'tsyringe';
import { SYMBOLS } from '../constants/symbols';
import { LetterBoxedController, SpellingBeeController } from '../controllers';

@registry([
    { token: SYMBOLS.controller, useClass: SpellingBeeController },
    { token: SYMBOLS.controller, useClass: LetterBoxedController },
])
export class Registry {}
