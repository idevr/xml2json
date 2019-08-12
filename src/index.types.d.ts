import { QualifiedAttribute } from 'sax';

declare namespace Types.Xml {
  interface Node {
    [key: string]: Element
  }
  interface Element {
    _name: string;
    _attributes?: {
      [key: string]: string | QualifiedAttribute;
    };
    _text?: string;
    _child?: Node;
    _list?: Element[];
  }
}
