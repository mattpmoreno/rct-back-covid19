import {ZipCodesService} from "../zip-utils/zip-codes.service";
import {UserDataContainer} from "../manage-users";
import {MessageUtils} from "../message-utils";
import {processStringLikeBackend, RCTBackCOVID19PhoneNumber} from "../utils";
import {DataUtils} from "../data-utils";

export class MessageHandler {
  
  constructor(
    private zipCodesService: ZipCodesService,
    private messageUtils: MessageUtils,
    private userData: UserDataContainer,
    private dataUtils: DataUtils
  ) {}
  
  // todo need to add the ability to ask for additional trials (like, subsequent pages of results)
  
  /**
   * @method
   * @description
   * Handles a message request
   * @param fromPhone {string} the phone number that sent this message
   * @param toPhone {string} phone number it was sent to, presumably ours
   * @param bodyText {string} text message the user sent us
   * @return {Promise<string>}
  **/
  public handleMessageRequest(fromPhone: string, toPhone: string, bodyText: string): void {
    // First and foremost, we make sure that the phone number is ours
    if (this.thisIsOurPhoneNumber(toPhone)) {
      // then, we make sure to set up the user
      this.userData.checkIfUserFirstTime(fromPhone).then(
        () => {
          // If we got a zip code, then we need to handle it like a zip
          if (this.zipCodesService.thisIsZIPCode(bodyText)) {
            // We need to handle this text message as a zip code
            this.handleZIPCodeMessage(bodyText, fromPhone);
          } else if (this.theySentKeywords(bodyText)) {
            // We need to handle this text message as a list of keywords
            this.handleKeywordMessage(bodyText, fromPhone);
          } else {
            // otherwise we tell them the zip code is bad
            this.messageUtils.sendMessage({
              to: fromPhone, from: RCTBackCOVID19PhoneNumber,
              body: BadMessageInGeneral
            }).then(() => {
              this.userData.trackBadTexts(bodyText, fromPhone);
            });
          }
        }
      );
    }
  }
  /**
   * @method
   * @description
   * Checks that we received a text intended for our phone number
   * @param phoneNumber {string} phone number we received a text at
   * @return {boolean} whether its our phone number or not
  **/
  private thisIsOurPhoneNumber(phoneNumber: string): boolean {
    if (phoneNumber !== RCTBackCOVID19PhoneNumber) {
      console.log(
        `We received a text intended for: ${phoneNumber} instead of our phone number: ${RCTBackCOVID19PhoneNumber}. We should investigate why this happened.`
      );
      return false;
    }
    return true;
  }
  /**
   * @method
   * @description
   * Handles the sending of information in relation to a zip code received
   * @param zipText {string} zip code text, we need to extract the zip code from it
   * @param fromPhone {string} phone number we received this text from
   * @return {void}
  **/
  private handleZIPCodeMessage(zipText: string, fromPhone: string): void {
    // We need to get the zip code out of the text we were sent
    let zipCode: string = this.zipCodesService.pullZIPFromString(zipText);
    // First, we want to make sure we have it,
    if (this.zipCodesService.zipIsInZipDatafile(zipCode)) {
      // First we want to log that this user sent us this zip code, and to reset their keywords to blank
      this.userData.updateUserZIPAndKeywords(fromPhone, zipCode, []);
      // we want to get the trials based on zip and keywords, then pass it for message creation
      this.messageUtils.createMessageFromTrialsAndSend(
        fromPhone,
        this.dataUtils.getTrialsForZIPAndKeywords(zipCode, []),
        zipCode, [], this.userData.userHasNotUsedKeywordsFeature(fromPhone)
      );
    } else {
      // otherwise we tell them the zip code is bad
      this.messageUtils.sendMessage({
        to: fromPhone, from: RCTBackCOVID19PhoneNumber,
        body: BadZIPCodeMessage
      }).then(() => {
        this.userData.trackBadTexts(zipText, fromPhone);
      });
    }
  }
  /**
   * @method
   * @description
   * Handles our keyword messages
   * @param keywordText {string} SMS text containing keywords from the user
   * @param fromPhone {string} users phone number
   * @return {void}
  **/
  private handleKeywordMessage(keywordText: string, fromPhone: string): void {
    // We need to get the keywords out of the text we were sent
    let keywords: string[] = this.pullKeywordsFromText(keywordText);
    // First, if we dont have any keywords, then we send them a bad keywords message
    if (keywords.length === 0) {
      this.messageUtils.sendMessage({
        to: fromPhone, from: RCTBackCOVID19PhoneNumber,
        body: BadKeywordsMessage
      }).then(() => {
        this.userData.trackBadTexts(keywordText, fromPhone);
      });
    } else if (this.userData.userHasGivenUsAZIPCode(fromPhone)) {
      // if they have never sent us a zip code, then doing a search by zip is going to be tough...
      this.messageUtils.sendMessage({
        to: fromPhone, from: RCTBackCOVID19PhoneNumber,
        body: NoZIPCodesMessage
      }).then(() => {
        this.userData.trackBadTexts(keywordText, fromPhone);
      });
    } else {
      // Here we know we have keywords and that the zip code is good to go
      // We update user data with the keywords
      this.userData.updateUserZIPAndKeywords(fromPhone, undefined, keywords);
      // we want to get the trials based on zip and keywords, then pass it for message creation
      this.messageUtils.createMessageFromTrialsAndSend(
        fromPhone,
        this.dataUtils.getTrialsForZIPAndKeywords(this.userData.getUsersCurrentZIPCode(fromPhone), keywords),
        this.userData.getUsersCurrentZIPCode(fromPhone), keywords
      );
    }
  }
  
  /****************************************************************************************
  * Determines what kind of input we've received
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Tells us whether we were just sent a list of keywords
   * @param text {string} text we were messaged
   * @return {boolean} whether this is a keyword list or not
  **/
  private theySentKeywords(text: string): boolean {
    return KeywordRegex.test(text);
  }
  /**
   * @method
   * @description
   * Pulls the individual keywords out of a keyword text and puts them into a list
   * @param keywordText {string} texts with keywords in it
   * @return {string[]} the keyword text divided up into keywords
  **/
  private pullKeywordsFromText(keywordText: string): string[] {
    let colonIndex: number = keywordText.indexOf(':');
    // If we found a colon, then we give them the keywords processed like our backend
    if (colonIndex > -1) {
      return processStringLikeBackend(keywordText.slice(colonIndex + 1));
    } else {
      // Otherwise, we didnt find a colon and thats a problem
      return [];
    }
  }
}

// Look for a message starting with any amount of whitespace then keyword (regardless of capitalization)
export const KeywordRegex: RegExp = new RegExp('^\\s*keyword', 'i');

// Text used in the above class
const BadZIPCodeMessage: string = 'Sorry, we could not find that ZIP code in our database. Please provide another nearby ZIP code, and we will try again.';
const BadKeywordsMessage: string = 'Sorry, the keywords you provided were not in the right format. Please double check that your text begins with "Keywords: "';
const NoZIPCodesMessage: string = 'Sorry, you have not previously provided us with a ZIP code to use in your search. Please send us a five-digit ZIP code first. Thanks!';
const BadMessageInGeneral: string = 'Sorry, we did not understand that text. Please text either a five digit ZIP code (think: 90210) or a list of keywords if you want to narrow a previous search ("Keywords: ..."). Thanks!';