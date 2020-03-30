/* tslint:disable */

declare var Object: any;
export interface LocationInterface {
  "Country"?: string;
  "City"?: string;
  "State"?: string;
  "ZIP"?: string;
  "id"?: any;
}

export class Location implements LocationInterface {
  "Country": string;
  "City": string;
  "State": string;
  "ZIP": string;
  "id": any;
  constructor(data?: LocationInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Location`.
   */
  public static getModelName() {
    return "Location";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Location for dynamic purposes.
  **/
  public static factory(data: LocationInterface): Location{
    return new Location(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'Location',
      plural: 'Locations',
      path: 'Locations',
      idName: 'id',
      properties: {
        "Country": {
          name: 'Country',
          type: 'string'
        },
        "City": {
          name: 'City',
          type: 'string'
        },
        "State": {
          name: 'State',
          type: 'string'
        },
        "ZIP": {
          name: 'ZIP',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
