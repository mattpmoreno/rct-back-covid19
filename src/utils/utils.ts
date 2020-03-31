/**
 * @method
 * @description
 * The phone number we are sending everything from
**/
import * as fs from "fs";

export const RCTBackCOVID19PhoneNumber: string = '+15407010519';
/**
 * @method
 * @description
 * Turns a given object into a promise of its own type and then returns it
 * @param thing {T} thing we want to return as a promise
 * @return {Promise<T>}
**/
export function turnIntoPromise<T>(thing: T): Promise<T> {
  return Promise.resolve(thing);
}
/**
 * @method
 * @description
 * To provide us with a usable rounding function
 * @param value {number} value we are rounding
 * @param decimals {number} number of places (sig figs) we are rounding to
 * @return {number}
**/
export function jsRoundSucks(value: number, decimals: number): number {
  return Number(value.toExponential(decimals));
}
/**
 * @method
 * @description
 * To process a given string like the way we do with the backend
 * @param inputStr {string} the string we want to process like RightCT backend
 * @return {string[]} list of words after being split up
**/
export function processStringLikeBackend(inputStr: string): string[] {
  const char_list=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w',
    'x','y','z','1','2','3','4','5','6','7','8','9','0',' '];
  const become_space_list=['`','~','!','@','#','$','%','^','&','*','(',')','=','+','[',']','{','}','/','<','>',
    '?',';',':','-'];
  let lowerStr = inputStr.toLowerCase();
  let trimmedStr = '';
  // Lower first, then remove certain characters, then replace certain characters with spaces
  for (let i = 0; i < lowerStr.length; i++) {
    if (char_list.indexOf(lowerStr.charAt(i)) > -1) {
      trimmedStr += lowerStr.charAt(i);
    } else if (become_space_list.indexOf(lowerStr.charAt(i))) {
      trimmedStr += ' ';
    }
  }
  // then split into a list, then remove empty parts of the list
  return trimmedStr.split(' ').filter(str => str != '');
}
/**
 * @method
 * @description
 * Gives us a typescript implemented hash table
**/
export interface HashTable<T> {
  [key: string]: T;
}
/**
 * @method
 * @description
 * Gives us a regex for whether a phone number if from the US or not
**/
export const USPhoneNumberRegex: RegExp = new RegExp('^\\+1[0-9]{10}$');
/**
 * @method
 * @description
 * Provides us a deep copy of a relatively simple object
 * @param object {T} object we want to copy
 * @return {T} a copy of that object
**/
export function deepCopySimpleObj<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
/**
 * @method
 * @description
 * Take a string list and string delimiter and create a string that concatenates everything
 * @param inputList {string[]} list of words we want to combine
 * @param delim {string} text we want to put in between every word we combine
 * @return {string} all the words combined with a delim between each one
**/
export function stringFromList(inputList: string[], delim: string): string {
  let returnString = '';
  for (let i = 0; i < inputList.length; i++) {
    if (i === 0) {
      returnString += inputList[i];
    } else {
      returnString += delim + inputList[i];
    }
  }
  return returnString;
}
/**
 * @method
 * @description
 * Saves an object locally as a json file
 * @param data {any} object we are saving
 * @param path {string} path we want to save the object to
 * @return {void}
**/
export function storeDataAsJSON(data: any, path: string): void {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}
/**
 * @method
 * @description
 * Loads data from json file, parses it into object
 * @param path {string} path we are pulling from
 * @return {any} object parsed from JSON file
**/
export function loadJSONData(path: string): any {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
