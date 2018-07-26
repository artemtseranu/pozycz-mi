// TODO: Rename to global
import { namespace, operation } from "Lib/events";

const ns = namespace("APP");

// TODO: Remove
export const MOUNTED = ns("MOUNTED");
export const init = operation(ns("INIT"));

export const STARTED_BLOCKING_OPERATION = ns("STARTED_BLOCKING_OPERATION");
export const ENDED_BLOCKING_OPERATION = ns("ENDED_BLOCKING_OPERATION");
