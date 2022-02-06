export default class Utils {
  static getRelatingParantheses(str: string, startingIndex: number, direction: IteratingDirection): number {
    const paranthese: string = str[startingIndex];
    if (paranthese !== '(' && paranthese !== ')') throw new Error('Starting index is not a parantheses');

    let paranthesesCounter = 0;

    for (
      let i = startingIndex;
      direction === IteratingDirection.FORWARDS ? i < str.length : i >= 0;
      direction === IteratingDirection.FORWARDS ? i++ : i--
    ) {
      if (str[i] === '(') paranthesesCounter++;
      if (str[i] === ')') paranthesesCounter--;

      if (paranthesesCounter === 0) return i;
    }
    return -1;
  }
}

export enum IteratingDirection {
  BACKWARDS,
  FORWARDS,
}
