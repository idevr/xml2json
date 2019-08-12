/** @module XML2JSON */
import fs from 'fs';
import request from 'request';
import sax from 'sax';
import { Types } from './index.types';

export default class XML2JSON {
  /**
   * Parses a XML file that is located on a remote server.
   *
   * @instance
   * @public
   * @param {string} url - URL of XML file.
   * @param {function} callback - Callback function that will be called after
   * it done processing XML file.
   * @param {boolean} [followRedirect=true] - Indicate whether we want to
   * follow HTTP redirects or not.
   * @param {number} [maxRedirects=10] - Maximum number of HTTP redirects we
   * want to follow.
   * @param {string} [encoding='UTF8'] - Response encoding.
   * @param {number} [timeout=10000] - Maximum time in milliseconds that we
   * want to wait for server response.
   */
  public parseFromUrl(
    url: string,
    callback: (error: Error | null, data: Types.Xml.Node | null) => void,
    followRedirect: boolean = true,
    maxRedirects: number = 10,
    encoding: string = 'UTF8',
    timeout: number = 10000,
  ) {
    request.get({
      uri: url,
      method: 'GET',
      followRedirect,
      maxRedirects,
      encoding,
      timeout,
    }).on('response', (response) => {
      if (response.statusCode === 200) {
        this.parseFromText(response.body, callback);
      } else {
        callback(new Error(`An HTTP error occurred with status code: ${response.statusCode}`), null);
      }
    }).on('error', (error) => {
      callback(new Error(`An error occurred: ${error}`), null);
    });
  }

  /**
   * Parses an XML file that is located on local file system.
   *
   * @instance
   * @public
   * @param {string} filePath - XML file absolute path.
   * @param {function} callback - Callback function that should be called after
   * it done processing XML file.
   */
  public parseFromFile(
    filePath: string,
    callback: (error: Error | null, data: Types.Xml.Node | null) => void,
  ) {
    fs.readFile(filePath, { encoding: 'utf-8' }, (error, data) => {
      if (!error) {
        this.parseFromText(data, callback);
      } else {
        callback(error, null);
      }
    });
  }

  /**
   * Parses a XML text string to a JSON object.
   *
   * @instance
   * @public
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

  /**
   * Returns the current property by the given path.
   *
   * @instance
   * @private
   * @param {object} object - The JSON object to search in.
   * @param {Array<string | number>} currentPropertyPath - Current property path.
   * @returns {object} - Current property.
   */
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
   * @instance
   * @private
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
   * @instance
   * @private
   * @param {Array<string | number>} currentPropertyPath - Current property path.
   */
  private pathBackward(currentPropertyPath: Array<string | number>): void {
    if (typeof currentPropertyPath[currentPropertyPath.length - 1] === 'number') {
      currentPropertyPath.pop();
    }
    currentPropertyPath.pop();
  }
}
