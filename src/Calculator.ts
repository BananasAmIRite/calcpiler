import OperationNode from './OperationNode';
import { Node, OperationType } from './types';
import Utils, { IteratingDirection } from './utils';
import ValueNode from './ValueNode';

export default class Calculator {
  calculate(eq: string) {
    console.log(this.addNecessaryParantheses(eq));
    // console.log(this.addPEMDASParantheses(eq));
    const baseNode = this.parseExpression(this.addNecessaryParantheses(eq));

    console.log(JSON.stringify(baseNode));
  }

  private padExpression(expr: string): string {
    // if (!expr.startsWith('(')) expr = '(' + expr + ')';
    // if (!expr.endsWith(')')) expr = expr + ')';
    return '(' + expr + ')';
  }

  private addPEMDASParantheses(expr: string, chars: string[]): string {
    outer: for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (!chars.includes(char)) continue;
      //   if (char !== '*' && char !== '/') continue;

      // plan is to go backwards until you hit a sign or hit nothing, then go forwards, repeat, then putting a parantheses everywhere there
      // crap that wont work
      // ill think of something tmr :)

      // phrase * phrase
      // where phrase = R or phrase = (sentence)
      // where sentence is a bunch of phrases with operators
      let stopCheckingStart = false;
      let startOfHighlight = i;
      for (let j = i - 1; j >= 0; j--) {
        if (expr[j] === ')' && stopCheckingStart)
          j = Utils.getRelatingParantheses(expr, j, IteratingDirection.BACKWARDS) + 1;
        if (expr[j] === '(') continue outer;
        if (stopCheckingStart) continue;
        if (expr[j] === ')') {
          // as in: 1 + 1 + (1 - 3) * 4
          //                *     ^ ^
          // find the parantheses associated with it and thats the start of our highlight!
          startOfHighlight = Utils.getRelatingParantheses(expr, j, IteratingDirection.BACKWARDS);
          j = startOfHighlight;
          stopCheckingStart = true;
        }
        // otherwise, as in: 1 + -2 * 4
        //                     ^ *  ^
        // detect if the sign is actually an operator

        // console.log('expr[j]: ' + expr[j]);
        // console.log('expr[j+1]: ' + expr[j + 1]);
        // console.log('expr[j-1]: ' + expr[j - 1]);
        if (
          (expr[j] === '*' || expr[j] === '/' || expr[j] === '+' || expr[j] === '-') &&
          expr[j + 1] === ' ' &&
          expr[j - 1] === ' '
        ) {
          //   console.log(`FOUND: startOfHighlight: ${j + 2}`);
          startOfHighlight = j + 2;
          stopCheckingStart = true;
        }

        // as in: -2 * 4 + 1
        //        ^  ^
        startOfHighlight = j;
      }

      let stopCheckingEnd = false;
      let endOfHighlight = i;
      for (let j = i + 1; j < expr.length; j++) {
        if (expr[j] === '(' && stopCheckingEnd)
          j = Utils.getRelatingParantheses(expr, j, IteratingDirection.FORWARDS) + 1;
        if (expr[j] === ')') continue outer;
        if (stopCheckingEnd) continue;
        if (expr[j] === '(') {
          // as in: 1 + 1 + 4 * (1 - 3)
          //                  ^ ^     *
          // find the parantheses associated with it and thats the end of our highlight!
          endOfHighlight = Utils.getRelatingParantheses(expr, j, IteratingDirection.FORWARDS);
          j = endOfHighlight;
          stopCheckingEnd = true;
        }
        // otherwise, as in: 1 + -2 * 4 + 8
        //                          ^ * ^
        if (
          (expr[j] === '*' || expr[j] === '/' || expr[j] === '+' || expr[j] === '-') &&
          expr[j + 1] === ' ' &&
          expr[j - 1] === ' '
        ) {
          endOfHighlight = j - 2;
          stopCheckingEnd = true;
        }

        // as in: 1 + -2 * 4
        //               ^ * <<< reached end of the detected portion
        endOfHighlight = j;
      }
      console.log(expr.substring(startOfHighlight, endOfHighlight + 1));
      console.log(i);
      console.log(expr.length);

      expr =
        expr.substring(0, startOfHighlight) +
        '(' +
        expr.substring(startOfHighlight, endOfHighlight + 1) +
        ')' +
        expr.substring(endOfHighlight + 1);
      console.log('full expr: ' + expr);

      if (expr[0] === '(' && Utils.getRelatingParantheses(expr, 0, IteratingDirection.FORWARDS) === expr.length - 1)
        return expr;
    }
    return expr;
  }

  private addNecessaryParantheses(expr: string): string {
    expr = this.addPEMDASParantheses(expr, ['*', '/']);
    expr = this.addPEMDASParantheses(expr, ['+', '-']);
    // expr = this.padExpression(expr);

    return expr;
  }
  //   private parse(eq: string): Node {
  //     // imma do it recursively for now
  //     const firstParantheses = eq.indexOf("(");
  //     const secondParantheses = eq.indexOf("(", firstParantheses);
  //     return
  //   }

  /*
  Given a vaid expression string, 
  let's say -1 + 2 * 3 - 4 / (12 + 8)
  add open and closing parantheses before and after whole phrase
  (-1 + 2 * 3 - 4 / (12 + 8))
  make parantheses between each multiplication/division
  -1 + (2 * 3) - (4 / (12 + 8))


  */
  private parseExpression(expr: string): Node {
    // if expr === "1" or "29" or "-56" or "1.2596" etc...
    if (!isNaN(Number(expr))) return new ValueNode(Number(expr));
    console.log('original expression: ' + expr);

    // start by removing the padded parentheses
    if (expr[0] === '(') expr = expr.substring(1);
    if (expr[expr.length - 1] === ')') expr = expr.substring(0, expr.length - 1);
    console.log('removed: ' + expr);

    // tricky part is getting the central operation, since there could be a ton of other operations
    // eg. (1 + 1 - (5 * 3)) + 8
    //                       ^ this is the central operation
    // to do this, we could loop through each sign, loop back and check if there is a presence of '(', skipping the ')'s
    // and then loop forward, check for presence of ')', skip the '('s
    // if there is, we know it is in a parentheses pair and therefore, inside a paraentheses pair

    let operationIndex = -1;

    outer: for (let i = 0; i < expr.length; i++) {
      let char = expr[i];
      if (expr[i - 1] !== ' ' || expr[i + 1] !== ' ' || (char !== '*' && char !== '/' && char !== '+' && char !== '-'))
        continue; // validation
      // loop backwards
      for (let j = i - 1; j >= 0; j--) {
        if (expr[j] === '(') continue outer;
        if (expr[j] === ')') j = Utils.getRelatingParantheses(expr, j, IteratingDirection.BACKWARDS);
      }
      for (let j = i + 1; j < expr.length; j++) {
        if (expr[j] === ')') continue outer;
        if (expr[j] === '(') j = Utils.getRelatingParantheses(expr, j, IteratingDirection.FORWARDS);
      }
      // if there have been no breaks, then this is the valid symbol!
      operationIndex = i;
    }
    console.log('operationIndex: ' + operationIndex);

    if (operationIndex === -1) throw new Error('you typed incorrectly or something idk');

    const clause1 = expr.substring(0, operationIndex - 1);
    const clause2 = expr.substring(operationIndex + 2);

    const operationType = OperationType.parseOperation(expr[operationIndex]);

    return new OperationNode(operationType, [this.parseExpression(clause1), this.parseExpression(clause2)]);
  }
}

/*
**CALCULATOR

idea: convert an eq into JSON that could be parsed into code
JSON idea is similar to how a compiler separates code into a tree
parsing: we could traverse the thing, if its an OPERATION, `operate` the operation based on the `operation value`


input: 1 + 1
JSON: {
    type: "OPERATION", 
    operation: "ADD", 
    inputs: [
        {
            type: "VALUE",
            value: 1 
        }, 
        {
            type: "VALUE", 
            value: 1
        }
    ]
}

input: 1 + (1 * 1) => (1 + (1 * 1))
JSON: {
    type: "OPERATION", 
    operation: "ADD", 
    inputs: [
        {
            type: "VALUE",
            value: 1 
        }, 
        {
            type: "OPERATION", 
            operation: "MULTIPLY", 
            inputs: [
                {
                    type: "VALUE", 
                    value: 1
                }, 
                {
                    type: "VALUE", 
                    value: 1
                }
            ]
        }
    ]
}






*/
