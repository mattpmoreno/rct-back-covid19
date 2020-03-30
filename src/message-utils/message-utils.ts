import Twilio from "twilio/lib/rest/Twilio";
import {TrialDisplayData} from "../data-utils/TrialDisplayData";
import {RCTBackCOVID19PhoneNumber, stringFromList} from "../utils";


export class MessageUtils {
  
  constructor(private twilioClient: Twilio) {}
  /**
   * @method
   * @description
   * Sends a text message via Twilio
   * @param messageDetails {RequiredToSendMessage} the requisite info to send a message: to, from, msg text
   * @return {Promise<boolean>} whether the message was sent successfully or not
  **/
  public sendMessage(messageDetails: RequiredToSendMessage): Promise<boolean> {
    return this.twilioClient.messages.create(messageDetails).then(
      () => {return true;},
      (err) => {
        console.log(err);
        return false;
      }
    );
  }
  /**
   * @method
   * @description
   * Creates a text message based on trials we are sending and then sends it
   * @param phoneNumber {string} phone number of the user
   * @param trials {TrialDisplayData[]} trials that we are turning into a text message
   * @param zipCode {string} zip code of the user's search
   * @param keywords {string[]} keywords the user used in their search
   * @param hasNeverUsedKeywords {boolean} whether user has ever used keywords in a search or now
   * @return {void}
  **/
  public createMessageFromTrialsAndSend(
    phoneNumber: string,
    trials: TrialDisplayData[],
    zipCode: string, keywords: string[],
    hasNeverUsedKeywords: boolean = false
  ): void {
    this.sendMessage({
      to: phoneNumber,
      from: RCTBackCOVID19PhoneNumber,
      body: this.createMessageFromTrials(trials, zipCode, keywords, hasNeverUsedKeywords)
    }).then(/* intentionally suppressed */);
  }
  /**
   * @method
   * @description
   * Creates a message from trial data
   * @param trials {TrialDisplayData[]} trials that we are turning into a text message
   * @param zipCode {string} zip code of the user's search
   * @param keywords {string[]} keywords the user used in their search
   * @param hasNeverUsedKeywords {boolean} whether user has ever used keywords in a search or now
   * @return {string} the message we want to send to the user
   **/
  private createMessageFromTrials(
    trials: TrialDisplayData[],
    zipCode: string, keywords: string[],
    hasNeverUsedKeywords: boolean
  ): string {
    let returnText: string = '';
    // Need to add in the introductory text first
    returnText += `For ZIP code ${zipCode}`;
    returnText += keywords.length > 0? ' and keywords ' + stringFromList(keywords, ', ') : '';
    // If we have no trials, then we add a quick message and return
    if (trials.length === 0) {
      returnText += ' there are no COVID-19 trials matching your search. Try a different set of keywords.';
    } else {
      // Otherwise we add a quick message and keep going
      returnText += ' the closest COVID-19 clinical trials are:';
    }
    // Then we add on information about the closest trials (up to end of list or max number allowed)
    for (let i = 0; i < Math.min(trials.length, maxNumOfTrialsPerText); i++) {
      returnText += this.getMessageTextFromTrial(trials[i]);
    }
    // Then add some text in case they have never used keywords search before
    returnText += hasNeverUsedKeywords? '\n\nYou can narrow this search using keywords by typing "Keywords: " followed by a list of your desired keywords.': '';
    // then we return the text we put together
    return returnText;
  }
  /**
   * @method
   * @description
   * Creates the trial information text for one trial only
   * @param trial {TrialDisplayData} trial that we are turning into a text message
   * @return {string} trial information text
  **/
  private getMessageTextFromTrial(trial: TrialDisplayData): string {
    return `\n\n${trial.ShortName}\n${trial.closestTrialSite.distanceToSite} miles away in ${trial.closestTrialSite.city}, ${trial.closestTrialSite.state}\nFor more information, go to: https://rightct.us/ctdetails/${trial.StudyID}`;
  }
}

export interface RequiredToSendMessage {
  to: string,
  from: string,
  body: string
}

// Keeps track of how many trials we are sending in trial results
export const maxNumOfTrialsPerText: number = 5;