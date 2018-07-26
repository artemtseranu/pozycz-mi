import { namespace, operation } from "Lib/events";

const ns = namespace("OFFERS");

export const CREATE_FORM_UPDATED = ns("CREATE_FORM_UPDATED");
export const CREATE_FORM_SUBMITTED = ns("CREATE_FORM_SUBMITTED");
export const sendCreateTransaction = operation(ns("SEND_CREATE_TRANSACTION"));
