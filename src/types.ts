export enum NodeType {
  OPERATION = 'OPERATION',
  VALUE = 'VALUE',
}

export enum OperationType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
}

export namespace OperationType {
  export function parseOperation(operation: string): OperationType {
    switch (operation) {
      case 'ADD':
      case '+':
        return OperationType.ADD;
      case 'SUBTRACT':
      case '-':
        return OperationType.SUBTRACT;
      case 'MULTIPLY':
      case '*':
        return OperationType.MULTIPLY;
      case 'DIVIDE':
      case '/':
        return OperationType.DIVIDE;
    }
  }
}

export interface IBaseNode<N extends NodeType> {
  type: N;
  // these are reserved for if the type is an Operation
  operation?: N extends NodeType.OPERATION ? OperationType : void;
  inputs?: N extends NodeType.OPERATION ? Node[] : void;
  // these are reserved for if the type is a value
  value: N extends NodeType.VALUE ? number : void;
}

export interface IOperationNode extends IBaseNode<NodeType.OPERATION> {}
export interface IValueNode extends IBaseNode<NodeType.VALUE> {}

export type Node = IOperationNode | IValueNode;

export function isOperationNode(n: Node): n is IOperationNode {
  return 'operation' in n;
}

export function isValueNode(n: Node): n is IValueNode {
  return !isOperationNode(n);
}
