import {TrialDisplayData, TrialDisplayDataInterface} from "./TrialDisplayData";
import {deepCopySimpleObj, HashTable} from "../utils";
import request from 'request';
import {DistanceProcessingService} from "../zip-utils/distance-processing.service";

export class DataUtils {

  // storing data locally for use
  private trialData: TrialDisplayData[] = [];
  private trialIDToListIndex: HashTable<number> = {};
  private zipToTrialIDs: HashTable<TrialIDAndClosestTrialSite[]> = {};
  
  constructor(
    private distanceProcessing: DistanceProcessingService
  ) {
    this.initMyData();
  }
  /**
   * @method
   * @description
   * Gets our data from the backend server, then processes it locally
  **/
  private initMyData(): void {
    request(this.getHTTPSRequestForCOVID19(),{ json: true }, (err, res, body) => {
      // if we have an error, we stop everything to handle it, bc otherwise app does not work
      if (err) {
        throw 'We had an error pulling data from the backend server';
      }
      // If no error, then we process the backend data
      this.trialData = this.processTrialData(body);
    });
  }
  /**
   * @method
   * @description
   * Gives us the URL we need to request data from backend server
   * @return {string} url for backend server
  **/
  private getHTTPSRequestForCOVID19(): string {
    return 'https://www.backend.rightct.us/api/TrialDisplayData?filter={"where":{"and":[{"or":[{"TrialStatus":"Recruiting"}]},{"DiseaseAreas":{"inq":["Coronavirus","Coronavirus Infections","COVID-19"]}},{"_locations.0":{"exists":true}}]}}';
  }
  
  /****************************************************************************************
  * Processing Trial Data
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Processes the body of our HTTPS response to make it into the right format
   * @param bodyOfHTTPSResponse {TrialDisplayDataInterface[]} JSON response from backend server
   * @return {TrialDisplayData[]} trial data for this request
  **/
  private processTrialData(bodyOfHTTPSResponse: TrialDisplayDataInterface[]): TrialDisplayData[] {
    // First we need to init the ID to index mapping
    this.trialIDToListIndex = {};
    // Then we need to create the ID to index mapping
    for (let i = 0; i < bodyOfHTTPSResponse.length; i++) {
      this.trialIDToListIndex[bodyOfHTTPSResponse[i].id] = i;
    }
    // Then we return the new trial display data objects
    return bodyOfHTTPSResponse.map(bodyObject => new TrialDisplayData(bodyObject));
  }
  /**
   * @method
   * @description
   * Gives us the trials we are looking for based on user given zip code and keywords
   * @param zipCode {string} zip code given by user, already vetted as input
   * @param keywords {string[]} keywords given by user, could be empty list
   * @return {}
  **/
  public getTrialsForZIPAndKeywords(zipCode: string, keywords: string[]): TrialDisplayData[] {
    // If we dont have the data available, we need to set it now
    if (this.zipToTrialIDs[zipCode] === undefined) {
      this.zipToTrialIDs[zipCode] = this.createTrialIDListForZIPCode(zipCode);
    }
    // Once we know we have the data they are looking for, we pass it on
    return this.getTrialsForOneZIPCode(zipCode, keywords);
  }
  /**
   * @method
   * @description
   * Gives us a list of all of the trial ids and information on the closest trial site, sorted by distance
   * from the given zip code (closest first, furthest last)
   * @param zipCode {string} zip code
   * @return {TrialIDAndClosestTrialSite[]}
  **/
  private createTrialIDListForZIPCode(zipCode: string): TrialIDAndClosestTrialSite[] {
    let returnList: TrialIDAndClosestTrialSite[] = [];
    // Get the trial id and closest trial site information first
    for (let trialData of this.trialData) {
      returnList.push({
        trialID: trialData.id,
        closestTrialSite: this.getClosestTrialSiteForZIP(trialData, zipCode)
      });
    }
    // Then sort this list based on distance from the site
    return returnList.sort(function(a, b) {
      return a.closestTrialSite.distanceToSite - b.closestTrialSite.distanceToSite
    });
  }
  /**
   * @method
   * @description
   * Gives us the closest trial site for a given zip code
   * @param trialData {TrialDisplayData} the trial we are comparing to the zip code
   * @param zipCode {string} the zip code we are comparing to trial sites
   * @return {ClosestTrialSite}
  **/
  private getClosestTrialSiteForZIP(trialData: TrialDisplayData, zipCode: string): ClosestTrialSite {
    // Set up a default value -- we know there's at least one location, so we will get something
    let closestSite: ClosestTrialSite = {distanceToSite: 100000, city: '', state: ''};
    // Go through each trial location
    for (let location of trialData['_locations']) {
      // Get distance to user zip code
      let distanceToSite: number = this.distanceProcessing.distanceBetweenZIPs(zipCode, location.ZIP);
      // If its lower than the current minimum, then we set it as the new minimum
      if (distanceToSite < closestSite.distanceToSite) {
        closestSite = {distanceToSite: distanceToSite, city: location.City, state: location.State};
      }
    }
    return closestSite;
  }
  /**
   * @method
   * @description
   * Gives us the trials in the correct order (distance from zip code) and filtered for keywords
   * @param zipCode {string} zip code from the user
   * @param keywords {string[]} keywords from the user
   * @return {TrialDisplayData[]} trial data in order closest to user zip code, filtered for keywords
  **/
  private getTrialsForOneZIPCode(zipCode: string, keywords: string[]): TrialDisplayData[] {
    let returnList: TrialDisplayData[] = [];
    // First, we need to get the trials in the correct order (closest to farthest) then add some info to them
    for (let trialIDAndClosestSite of this.zipToTrialIDs[zipCode]) {
      // Get copy of the object, since we will be altering it
      let localTrialObject = deepCopySimpleObj(
        this.trialData[this.trialIDToListIndex[trialIDAndClosestSite.trialID]]
      );
      // Add closest trial site information
      localTrialObject.closestTrialSite = trialIDAndClosestSite.closestTrialSite;
      // Push to our return list
      returnList.push(localTrialObject);
    }
    // Then we need to filter for the keywords we were given
    return this.filterTrialsForKeywords(returnList, keywords);
  }
  /**
   * @method
   * @description
   * Filters our list of trials based on whether a keyword is present
   * @param trialsToFilter {TrialDisplayData[]} list of trials we want to filter
   * @param keywords {string[]} keywords we are looking for
   * @return {TrialDisplayData[]} trials filtered by keyword
  **/
  private filterTrialsForKeywords(trialsToFilter: TrialDisplayData[], keywords: string[]): TrialDisplayData[] {
    // if we have no keywords, then we dont need to do any filtering
    if (keywords.length === 0) {
      return trialsToFilter;
    }
    return trialsToFilter.filter(trialData => {
      // Go through each keyword -- if we can find it for this trial, then we return that trial
      for (let keyword of keywords) {
        if (trialData.KeyWords.indexOf(keyword) > -1) {
          return true;
        }
      }
      // If we get through the whole list of keywords without finding it, then we return false
      return false;
    });
  }
}

interface TrialIDAndClosestTrialSite {
  trialID: string,
  closestTrialSite: ClosestTrialSite
}

export interface ClosestTrialSite {
  distanceToSite: number,
  city: string,
  state: string
}