import dotenv from 'dotenv';
import {COVID19SMSApp} from "./app";

// Need to set up the environment variables
dotenv.config();

// Then we init the app and launch it
const app = new COVID19SMSApp();
app.listen();