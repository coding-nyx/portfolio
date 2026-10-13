import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createRookHandler } from '../server/rook.mjs';
const deepseekKey=defineSecret('DEEPSEEK_API_KEY');
let handler;
export const rook=onRequest({region:'us-central1',secrets:[deepseekKey],timeoutSeconds:40,memory:'256MiB',minInstances:0,maxInstances:1,concurrency:4,invoker:'public',cors:false},(req,res)=>{
  handler??=createRookHandler({apiKey:deepseekKey.value(),maxConcurrent:4});
  return handler(req,res);
});
