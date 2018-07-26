// TODO: Lib/events -> Lib/event_utils
import { namespace, operation } from "Lib/events";

const ns = namespace("eth");

export const REQUIRED = ns("required");
// TODO: operation should create eth.init.started instead of eth.init.STARTED
export const Init = operation(ns("init"));
