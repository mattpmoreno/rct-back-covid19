import {ZipCodesService} from "./zip-codes.service";
import {jsRoundSucks} from "../utils";


/***********************************************************
***************** WHAT IS MY PURPOSE? **********************
 - I can do just basic geo-distance calculations
************************************************************
 **********************************************************/
export class DistanceProcessingService {
  
  constructor(
    private zips: ZipCodesService
  ) {}

  /****************************************************************************************
  * Distance Calculation
  ****************************************************************************************/
  /**
   * @method deg2rad
   * @description
   * Converts degrees to radians
  **/
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  /**
   * @method latLongDistance
   * @description
   * Calculates the distance between two latitude / longitude points (in miles)
   * @param lat1 {number} latitude of the first location
   * @param long1 {number} longitude of the first location
   * @param lat2 {number} latitude of the second location
   * @param long2 {number} longitude of the second location
   * @param decimalPlaces {number} number of decimal places if written in scientific notation (i.e. sig figs - 1)
   * @return {number} distance between the two locations (using lat/long)
  **/
  private latLongDistance(
    lat1: number, long1: number,
    lat2: number, long2: number,
    decimalPlaces: number = 1
  ): number {
    const dLat = this.deg2rad(lat2-lat1);
    const dLon = this.deg2rad(long2-long1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    return jsRoundSucks(3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)), decimalPlaces);
  }
  /**
   * @method latLongDistanceFromObjs
   * @description
   * Uses profile and location objects to determine distance
   * @param profileZIP {string} zip from the relevant user profile
   * @param otherZIP {string} zip we are comparing to profileZip
   * @return {number} distance between the two zip codes
  **/
  public distanceBetweenZIPs(profileZIP: string, otherZIP: string): number {
    // if either one of these zips is missing, then we send a default very high value
    if (!this.zips.zipIsInZipDatafile(profileZIP) || !this.zips.zipIsInZipDatafile(otherZIP)) {
      return 100000;
    }
    // otherwise we process as appropriate
    let profileZipObj = this.zips.getZIPCoordinates(profileZIP);
    let locationZipObj = this.zips.getZIPCoordinates(otherZIP);
    return this.latLongDistance(
      profileZipObj['Lat'], profileZipObj['Long'],
      locationZipObj['Lat'], locationZipObj['Long']
    );
  }
}
