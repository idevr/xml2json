import sax from 'sax';
import { Types } from './index.types';

export default class XML2JSON {

  /**
   * Parses a XML text string to a JSON object.
   *
   * @param {string} xmlSource - XML text string.
   * @param {function} callback - Callback function that will be called after
   * it done processing XML.
   */
  public parseFromText(
    xmlSource: string,
    callback: (error: Error | null, data: Types.Xml.Node | null) => void,
  ) {
    const parser = sax.parser(false, {
      lowercase: true,
      position: false,
      trim: true,
    });
    const currentPropertyPath: Array<string | number> = [];
    const jsonObject: Types.Xml.Node = {};
    let cData: string = '';
    parser.onopentag = (tag) => {
      const tagName: string = tag.name;
      const tagAttributes = tag.attributes;
      if (Object.getOwnPropertyNames(jsonObject).length !== 0) {
        let currentNode = this.getObjectPropertyByPath(jsonObject, currentPropertyPath);
        if (currentNode._child === undefined) {
          currentNode._child = {};
        }
        if (tagName in currentNode._child) {
          this.pathForward(tagName, currentPropertyPath);
          currentNode = currentNode._child[tagName];
          if (currentNode._list === undefined) {
            currentNode._list = [];
            currentNode._list.push({
              _name: currentNode._name,
              _attributes: currentNode._attributes,
              _child: currentNode._child,
            });
            delete currentNode._child;
            delete currentNode._attributes;
          }
          if (Array.isArray(currentNode._list)) {
            currentNode._list.push({
              _name: tagName,
              _attributes: tagAttributes,
            });
          }
          this.pathForward(currentNode._list.length - 1, currentPropertyPath);
        } else {
          currentNode._child[tagName] = {
            _name: tagName,
            _attributes: tagAttributes,
          };
          this.pathForward(tagName, currentPropertyPath);
        }
      } else {
        jsonObject[tagName] = {
          _name: tagName,
          _attributes: tagAttributes,
        };
        this.pathForward(tagName, currentPropertyPath);
      }
    };
    parser.ontext = (text) => {
      const currentNode = this.getObjectPropertyByPath(jsonObject, currentPropertyPath);
      currentNode._text = text;
    };
    parser.onopencdata = () => {
      cData = '';
    };
    parser.oncdata = (text) => {
      cData += text;
    };
    parser.onclosecdata = () => {
      const currentNode = this.getObjectPropertyByPath(jsonObject, currentPropertyPath);
      currentNode._text = cData;
      cData = '';
    };
    parser.onclosetag = () => {
      this.pathBackward(currentPropertyPath);
    };
    parser.onerror = (error) => {
      callback(error, null);
    };
    parser.onend = () => {
      callback(null, jsonObject);
    };
    parser.write(xmlSource).close();
  }

  private getObjectPropertyByPath(
    object: Types.Xml.Node,
    currentPropertyPath: Array<string | number>,
  ): Types.Xml.Element {
    let propertyIndex: string | number = currentPropertyPath[0];
    let property: Types.Xml.Element = object[propertyIndex];
    for (let index = 1; index !== currentPropertyPath.length; index++) {
      propertyIndex = currentPropertyPath[index];
      if (typeof propertyIndex === 'string') {
        if (property._child !== undefined) {
          property = property._child[propertyIndex];
        }
      } else if (typeof propertyIndex === 'number') {
        if (property._list !== undefined) {
          property = property._list[propertyIndex];
        }
      }
    }
    return property;
  }

  /**
   * Adds the current node as last segment of the current path.
   *
   * @param {string | number} pathName - Node's tag name.
   * @param {Array<string | number>} currentPropertyPath - Current property path.
   */
  private pathForward(
    pathName: string | number,
    currentPropertyPath: Array<string | number>,
  ): void {
    currentPropertyPath.push(pathName);
  }

  /**
   * Removes the last segment of the current path.
   *
   * @param {Array<string | number>} currentPropertyPath - Current property path.
   */
  private pathBackward(currentPropertyPath: Array<string | number>): void {
    if (typeof currentPropertyPath[currentPropertyPath.length - 1] === 'number') {
      currentPropertyPath.pop();
    }
    currentPropertyPath.pop();
  }
}
