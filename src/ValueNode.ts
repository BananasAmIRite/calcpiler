import { IValueNode, NodeType } from './types';

export default class ValueNode implements IValueNode {
  type: NodeType.VALUE;
  operation?: void;
  inputs?: void;
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}
