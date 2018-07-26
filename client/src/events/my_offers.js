import { namespace } from "Lib/events";

const ns = namespace("my_offers");

export const OFFER_CREATED = ns("offer_created");
export const OFFER_ADDED = ns("offer_added");
