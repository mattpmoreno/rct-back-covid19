import {HashTable, loadJSONData, RCTBackCOVID19PhoneNumber, storeDataAsJSON, turnIntoPromise} from '../utils';
import {MessageUtils} from "../message-utils";

export class UserDataContainer {
  
  // Objects that this class maintains
  private userData: HashTable<UserData> = {};
  private badTextData: TrackBadTexts[] = [];
  // Where we are saving our objects
  private userDataPath: string = process.env.USER_DATA_PATH;
  private badTextPath: string = process.env.BAD_TEXT_PATH;
  
  constructor(private messageUtils: MessageUtils) {
    // Try to load data
    let userDataTemp = loadJSONData(this.userDataPath);
    if (userDataTemp !== undefined) {
      for (let phoneNumber in userDataTemp) {
        if (Object.prototype.hasOwnProperty.call(userDataTemp, phoneNumber)) {
          this.userData[phoneNumber] = new UserData(phoneNumber, userDataTemp[phoneNumber]);
        }
      }
    }
    let badTextDataTemp = loadJSONData(this.badTextPath);
    if (badTextDataTemp !== undefined) {
      this.badTextData = userDataTemp;
    }
  }
  /**
   * @method
   * @description
   * Initializes a user data object, if we dont already have this user in our database
   * @param phoneNumber {string} phone number of the new user
   * @return {Promise<boolean>}
  **/
  public checkIfUserFirstTime(phoneNumber: string): Promise<boolean> {
    // If we find a new number, then we store it
    if (this.userData[phoneNumber] === undefined) {
      this.userData[phoneNumber] = new UserData(phoneNumber);
      // Then save the update
      storeDataAsJSON(this.userData, this.userDataPath);
      // and we send our welcome message
      return this.messageUtils.sendMessage({
        to: phoneNumber, from: RCTBackCOVID19PhoneNumber, body: WelcomeMessage
      });
    } else {
      return turnIntoPromise(true);
    }
  }
  /**
   * @method
   * @description
   * Updates a user data object based on new search parameters
   * @param phoneNumber {string} phone number of the user, used to ID them
   * @param zipCode {string} zip code used in the latest search
   * @param keywords {string[]} keywords used in the latest search
   * @return {void}
  **/
  public updateUserZIPAndKeywords(phoneNumber: string, zipCode: string, keywords: string[]): void {
    this.userData[phoneNumber].updateMyselfForNewSearch(zipCode, keywords);
    // Then save the update
    storeDataAsJSON(this.userData, this.userDataPath);
  }
  /**
   * @method
   * @description
   * Gets the current zip code for a given user
   * @param phoneNumber {string} phone number of the user
   * @return {string} the users current zip code
  **/
  public getUsersCurrentZIPCode(phoneNumber: string): string {
    return this.userData[phoneNumber].getZIPCode();
  }
  /**
   * @method
   * @description
   * Tells us whether the user has previously given us a zip code or not
  **/
  public userHasGivenUsAZIPCode(phoneNumber: string): boolean {
    return this.userData[phoneNumber].getZIPCode() === undefined;
  }
  /**
   * @method
   * @description
   * Tells us whether a user has used the keywords feature before
  **/
  public userHasNotUsedKeywordsFeature(phoneNumber: string): boolean {
    return this.userData[phoneNumber].hasNeverUsedKeywordSearch();
  }
  /**
   * @method
   * @description
   * Keeps track of bad texts we get
   * @param text {string} the text we received from the user
   * @param phoneNumber {string} phone number sending the bad text
   * @return {void}
  **/
  public trackBadTexts(text: string, phoneNumber: string): void {
    console.log(`We got a bad text from ${phoneNumber}: ${text}`);
    this.badTextData.push(new TrackBadTexts(text, phoneNumber));
    storeDataAsJSON(this.badTextData, this.badTextPath);
  }
}

export class UserData {
  // ZIP codes phone number has sent
  private zipCodeHistory: string[] = [];
  private currentZipCode: string;
  public getZIPCode(): string {return this.currentZipCode;}
  // Keywords asked for by the user
  private keywordHistory: string[][] = [];
  private currentKeywords: string[] = [];
  // Number of searches theyve done
  private numberOfSearches: number = 0;
  private incrementSearches(): void {this.numberOfSearches++;}
  
  // Initialize with the phone number we are getting requests from
  constructor(private phoneNumber: string, data?: any) {
    if (data !== undefined) {
      Object.assign(this, data);
    }
  }
  
  /****************************************************************************************
  * Methods for updating information on the user data object
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Updates a user object based on a new user search
   * @param zipCode {string} latest zip code from the user
   * @param keywords {string[]} latest keywords from the user
   * @return {void}
  **/
  public updateMyselfForNewSearch(zipCode: string, keywords: string[]): void {
    // Update all of the relevant user object values
    this.addZIPCode(zipCode);
    this.addKeywords(keywords);
    this.incrementSearches();
  }
  /**
   * @method
   * @description
   * Adds a new zip code (if different) to the users search history
   * @param zipCode {string} the zip code of the latest search
   * @return {void}
  **/
  private addZIPCode(zipCode: string): void {
    // Only update if its different than the current zip code AND its a defined value
    if (this.currentZipCode !== zipCode && zipCode !== undefined) {
      this.zipCodeHistory.push(zipCode);
      this.currentZipCode = zipCode;
    }
  }
  /**
   * @method
   * @description
   * Adds a new set of keywords to a users search history
   * @param keywords {string[]} the keywords for the latest search
   * @return {void}
   **/
  private addKeywords(keywords: string[]): void {
    // Only update if its different than the current keywords
    if (this.theseAreNotCurrentKeywords(keywords)) {
      this.keywordHistory.push(keywords);
      this.currentKeywords = keywords;
    }
  }
  /**
   * @method
   * @description
   * Determines whether a new set of keywords are equivalent to our current set of keywords
  **/
  private theseAreNotCurrentKeywords(newKeywords: string[]): boolean {
    // if they are not the same length, then they are trivially not the same
    if (newKeywords.length !== this.currentKeywords.length) {
      return true;
    }
    // Go through each of the new keywords -- if any of them are missing, then we return true
    for (let newKeyword of newKeywords) {
      if (this.currentKeywords.indexOf(newKeyword) === -1) {
        return true;
      }
    }
    // If we get here, then they are the same
    return false;
  }
  /**
   * @method
   * @description
   * Tells us whether this profile has ever used keywords before
  **/
  public hasNeverUsedKeywordSearch(): boolean {
    return this.keywordHistory.length === 0;
  }
}

export class TrackBadTexts {
  constructor(
    private text: string,
    private phoneNumber: string
  ) {}
}

/****************************************************************************************
* Text used in this document
****************************************************************************************/
const WelcomeMessage: string = 'This is COVID-19 Trials, providing you with the latest information on clinical trials for COVID-19 patients.\n\nSend your five-digit ZIP code (for example: 90210) to this number to receive information a list of trials closest to your home. You can repeat this search for any ZIP code you are interested in.';
