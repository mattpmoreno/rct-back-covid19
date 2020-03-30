/* tslint:disable */
import {
  Location
} from './Location';
import {ClosestTrialSite} from './data-utils';

declare var Object: any;
export interface TrialDisplayDataInterface {
  "StudyID": string;
  "Phase"?: Array<any>;
  "ShortName"?: string;
  "LongName"?: string;
  "DiseaseAreas"?: Array<any>;
  "Description": string;
  "RctUrl": string;
  "CtUrl": string;
  "ExpandedAccess"?: string;
  "Interventions"?: Array<any>;
  "Acronym"?: string;
  "KeyWords"?: Array<any>;
  "InterventionKeyWords"?: Array<any>;
  "DiseaseKeyWords"?: Array<any>;
  "AgeMin"?: number;
  "AgeMax"?: number;
  "HealthyVolunteers"?: string;
  "TrialStatus"?: string;
  "Gender"?: number;
  "StudyType"?: string;
  "ExclCrit"?: Array<any>;
  "InclCrit"?: Array<any>;
  "id"?: any;
  "_locations"?: Array<any>;
  locations?: Location[];
}

export class TrialDisplayData implements TrialDisplayDataInterface {
  "StudyID": string;
  "Phase": Array<any>;
  "ShortName": string;
  "LongName": string;
  "DiseaseAreas": Array<any>;
  "Description": string;
  "RctUrl": string;
  "CtUrl": string;
  "ExpandedAccess": string;
  "Interventions": Array<any>;
  "Acronym": string;
  "KeyWords": Array<any>;
  "InterventionKeyWords": Array<any>;
  "DiseaseKeyWords": Array<any>;
  "AgeMin": number;
  "AgeMax": number;
  "HealthyVolunteers": string;
  "TrialStatus": string;
  "Gender": number;
  "StudyType": string;
  "ExclCrit": Array<any>;
  "InclCrit": Array<any>;
  "id": any;
  "_locations": Array<any>;
  locations: Location[];
  closestTrialSite?: ClosestTrialSite;
  constructor(data?: TrialDisplayDataInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `TrialDisplayData`.
   */
  public static getModelName() {
    return "TrialDisplayData";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of TrialDisplayData for dynamic purposes.
  **/
  public static factory(data: TrialDisplayDataInterface): TrialDisplayData{
    return new TrialDisplayData(data);
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
      name: 'TrialDisplayData',
      plural: 'TrialDisplayData',
      path: 'TrialDisplayData',
      idName: 'id',
      properties: {
        "StudyID": {
          name: 'StudyID',
          type: 'string'
        },
        "Phase": {
          name: 'Phase',
          type: 'Array&lt;any&gt;'
        },
        "ShortName": {
          name: 'ShortName',
          type: 'string'
        },
        "LongName": {
          name: 'LongName',
          type: 'string'
        },
        "DiseaseAreas": {
          name: 'DiseaseAreas',
          type: 'Array&lt;any&gt;'
        },
        "Description": {
          name: 'Description',
          type: 'string'
        },
        "RctUrl": {
          name: 'RctUrl',
          type: 'string'
        },
        "CtUrl": {
          name: 'CtUrl',
          type: 'string'
        },
        "ExpandedAccess": {
          name: 'ExpandedAccess',
          type: 'string'
        },
        "Interventions": {
          name: 'Interventions',
          type: 'Array&lt;any&gt;'
        },
        "Acronym": {
          name: 'Acronym',
          type: 'string'
        },
        "KeyWords": {
          name: 'KeyWords',
          type: 'Array&lt;any&gt;'
        },
        "InterventionKeyWords": {
          name: 'InterventionKeyWords',
          type: 'Array&lt;any&gt;'
        },
        "DiseaseKeyWords": {
          name: 'DiseaseKeyWords',
          type: 'Array&lt;any&gt;'
        },
        "AgeMin": {
          name: 'AgeMin',
          type: 'number'
        },
        "AgeMax": {
          name: 'AgeMax',
          type: 'number'
        },
        "HealthyVolunteers": {
          name: 'HealthyVolunteers',
          type: 'string'
        },
        "TrialStatus": {
          name: 'TrialStatus',
          type: 'string'
        },
        "Gender": {
          name: 'Gender',
          type: 'number'
        },
        "StudyType": {
          name: 'StudyType',
          type: 'string'
        },
        "ExclCrit": {
          name: 'ExclCrit',
          type: 'Array&lt;any&gt;'
        },
        "InclCrit": {
          name: 'InclCrit',
          type: 'Array&lt;any&gt;'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "_locations": {
          name: '_locations',
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
      },
      relations: {
        locations: {
          name: 'locations',
          type: 'Location[]',
          model: 'Location',
          relationType: 'embedsMany',
                  keyFrom: '_locations',
          keyTo: 'id'
        },
      }
    }
  }
}
