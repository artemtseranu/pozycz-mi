import { namespace, operation } from "Lib/events";

const ns = namespace("create_offer");

export const MOUNTED = ns("mounted");

export const FIELD_UPDATED = ns("field_updated");
export const FORM_SUBMITTED = ns("form_submitted");

export const SendCreateOfferTransaction = operation(ns("send_create_offer_transaction"));
