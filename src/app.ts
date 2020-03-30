import {MessageHandler} from "./handle-message";
import twilio from "twilio";
import express from "express";
import bodyParser from "body-parser";
import {ZipCodesService} from "./zip-utils/zip-codes.service";
import {DistanceProcessingService} from "./zip-utils/distance-processing.service";
import Twilio from "twilio/lib/rest/Twilio";
import {USPhoneNumberRegex} from "./utils";
import {UserDataContainer} from "./manage-users";
import {MessageUtils} from "./message-utils";
import {DataUtils} from "./data-utils";

export class COVID19SMSApp {
  
  private msgHandler: MessageHandler;
  private dataUtils: DataUtils;
  private zipCodesService: ZipCodesService;
  private distanceProcessing: DistanceProcessingService;
  private twil: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  private messageUtils: MessageUtils;
  private userData: UserDataContainer;
  private express = express();
  private appPort = 3000;
  
  constructor() {
    this.initDependenciesAndInjections();
    this.otherSetup();
  }
  /**
   * @method
   * @description
   * Implementing our own little dependency injection here -- we do it here and not in the property declaration
   * area because injection requires us to have this. instances of the objects
  **/
  private initDependenciesAndInjections(): void {
    // init zip codes stuff
    this.zipCodesService = new ZipCodesService();
    this.distanceProcessing = new DistanceProcessingService(this.zipCodesService);
    // Creating data utils
    this.dataUtils = new DataUtils(this.distanceProcessing);
    // Wrapping twilio client
    this.messageUtils = new MessageUtils(this.twil);
    // init user data stuff
    this.userData = new UserDataContainer(this.messageUtils);
    // Init our message handler
    this.msgHandler = new MessageHandler(
      this.zipCodesService, this.messageUtils, this.userData, this.dataUtils
    );
  }
  /**
   * @method
   * @description
   * Implements any misc. setup we have that wasnt addressed in dependencies and injections
  **/
  private otherSetup(): void {
    // Need to set up appropriate parsing approach
    this.express.use(bodyParser.urlencoded({extended: false}));
    // Set up the express server to receive stuff from ngrok
    this.express.post("/message", (req, res) => {
      // Need to ensure that this is a US phone number, or else we don't want to be texting it
      if (USPhoneNumberRegex.test(req.body.From)) {
        // Gives the request to our message handler, it will generate our new message
        this.msgHandler.handleMessageRequest(req.body.From, req.body.To, req.body.Body);
      }
      // Regardless, tell ngrok that we can close the connection
      res.send('');
    });
  }
  /**
   * @method
   * @description
   * Launches the app, begins listening on the port
  **/
  public listen(): void {
    // Start listening for text messages
    this.express.listen(this.appPort, () => {
      console.log(`Server listening on port: ${this.appPort}`);
    });
  }
}