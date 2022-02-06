import { IOperationNode, Node, NodeType, OperationType } from './types';

export default class OperationNode implements IOperationNode {
  type: NodeType.OPERATION;
  operation?: OperationType;
  inputs?: Node[];
  value: void;

  constructor(operationType: OperationType, inputs: Node[]) {
    this.operation = operationType;
    this.inputs = inputs;
  }
}
