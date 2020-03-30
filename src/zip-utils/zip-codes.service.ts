import {AllZips} from "./ZipCodes.datafile";

export class ZipCodesService {

  private allZips = AllZips;

  constructor() {}
  /**
   * @method
   * @description
   * gives the zip coordinates for a given zip code
   * @param zip {string} five digit zip code
   * @return {ZIPCoordinates} latitude and longitude of the zip code given
  **/
  public getZIPCoordinates(zip: string): ZIPCoordinates {
    // @ts-ignore
    return this.allZips[zip];
  }
  /**
   * @method
   * @description
   * tells us whether a zip is in our comprehensive dictionary of zip codes
   * @param zip {string} zip code as a five digit string
   * @return {boolean} whether the given zip code is in our zip datafile
  **/
  public zipIsInZipDatafile(zip: string): boolean {
    return this.allZips.hasOwnProperty(zip);
  }
  /**
   * @method
   * @description
   * Whether or not the given input is a zip code
   * @param text {string} the text we want to evaluate
   * @return {boolean}
  **/
  public thisIsZIPCode(text: string): boolean {
    // We make sure its a normal zip code
    return ZIPRegex.test(text);
  }
  /**
   * @method
   * @description
   * Gives us the first zip code type object from a string we know has a zip like thing in it
   * @param {}
   * @param {}
   * @return {}
  **/
  public pullZIPFromString(text: string): string {
    return text.match(ZIPOnlyRegex)[0];
  }
}

// Five digit zip code only, but can have any amount of white space in front or behind
export const ZIPRegex: RegExp = new RegExp('^\\s*\\d{5}\\s*$');
// Five digit zip code only, no whitespace -- for using str.match
export const ZIPOnlyRegex: RegExp = new RegExp('\\d{5}');
export interface ZIPCoordinates {
  Lat: number,
  Long: number
}